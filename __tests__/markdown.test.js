import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { getPostLanguage, parseImageSize, process } from '../src/lib/markdown.js';

const STATIC_DIR = fileURLToPath(new URL('../static/', import.meta.url));

/** @type {string[]} */
let tempDirs = [];

afterEach(() => {
	for (const dir of tempDirs) {
		rmSync(dir, { recursive: true, force: true });
	}
	tempDirs = [];
});

/**
 * @param {string} content
 */
function writeMarkdown(content) {
	const dir = mkdtempSync(join(tmpdir(), 'blog-markdown-test-'));
	const filename = join(dir, 'sample.md');
	tempDirs.push(dir);
	writeFileSync(filename, content);
	return filename;
}

describe('process', () => {
	it('extracts YAML metadata, formats the date, and renders markdown content', () => {
		const filename = writeMarkdown(`---
title: Test Post
date: 2026-05-13
description: Short [description](https://example.com) with \`code\` and **bold** text
---
# Hello Markdown

This is **bold** text.

## Section One

### Details with \`code\`

## Section One

- [x] shipped
`);

		const post = process(filename);

		expect(post.metadata).toEqual({
			title: 'Test Post',
			date: 'May 13, 2026',
			description: 'Short description with code and bold text'
		});
		expect(post.slug).toBe(filename.split('.')[0]);
		expect(post.content).toContain('<h1>Hello Markdown</h1>');
		expect(post.content).toContain('<h2 id="section-one">Section One</h2>');
		expect(post.content).toContain(
			'<h3 id="details-with-code">Details with <code>code</code></h3>'
		);
		expect(post.content).toContain('<h2 id="section-one-2">Section One</h2>');
		expect(post.content).toContain('<strong>bold</strong>');
		expect(post.content).not.toContain('title: Test Post');
		expect(post.toc).toEqual([
			{ depth: 2, text: 'Section One', id: 'section-one' },
			{ depth: 3, text: 'Details with code', id: 'details-with-code' },
			{ depth: 2, text: 'Section One', id: 'section-one-2' }
		]);
	});

	it('returns empty metadata defaults when a post has no frontmatter', () => {
		const filename = writeMarkdown(`## Plain post

No metadata here.
`);

		const post = process(filename);

		expect(post.metadata).toEqual({ date: '', title: '' });
		expect(post.toc).toEqual([{ depth: 2, text: 'Plain post', id: 'plain-post' }]);
		expect(post.content).toContain('<h2 id="plain-post">Plain post</h2>');
		expect(post.content).toContain('<p>No metadata here.</p>');
	});

	it('derives the category from the directory holding the post', () => {
		const root = join(mkdtempSync(join(tmpdir(), 'blog-markdown-test-')), 'posts');
		tempDirs.push(join(root, '..'));

		for (const [category, expected] of [
			['framework', 'Framework'],
			['ai', 'AI'],
			['pwa', 'PWA'],
			['unknown-dir', 'Blog']
		]) {
			const nested = join(root, category);
			mkdirSync(nested, { recursive: true });
			const filename = join(nested, 'post.md');
			writeFileSync(filename, '---\ntitle: Post\ndate: 2026-05-13\n---\n');

			expect(process(filename).category).toBe(expected);
		}
	});

	it('keeps h1 headings out of the table of contents and slugs non-latin headings', () => {
		const filename = writeMarkdown(`# 前言

## 你好 World!

### 100% Done

#### Too deep
`);

		const post = process(filename);

		expect(post.toc).toEqual([
			{ depth: 2, text: '你好 World!', id: '你好-world' },
			{ depth: 3, text: '100% Done', id: '100-done' }
		]);
	});

	describe('images', () => {
		it('rewrites absolute site URLs to root-relative paths', () => {
			const filename = writeMarkdown(
				'![shot](https://brandonxiang.top/img/does-not-exist.png)\n' +
					'![other](https://www.brandonxiang.top/img/also-missing.jpg)\n' +
					'![external](https://example.com/keep-me.png)\n'
			);

			const { content } = process(filename);

			expect(content).toContain('src="/img/does-not-exist.png"');
			expect(content).toContain('src="/img/also-missing.jpg"');
			expect(content).toContain('src="https://example.com/keep-me.png"');
		});

		it('lazy loads and async decodes every post image', () => {
			const filename = writeMarkdown(
				'![one](https://brandonxiang.top/img/a.png)\n![two](https://brandonxiang.top/img/b.png)\n'
			);

			const { content } = process(filename);
			const images = content.match(/<img[^>]*>/g) ?? [];

			expect(images).toHaveLength(2);
			for (const image of images) {
				expect(image).toContain('loading="lazy"');
				expect(image).toContain('decoding="async"');
			}
		});

		it('emits intrinsic dimensions for local images so space is reserved', () => {
			const filename = writeMarkdown('![shot](https://brandonxiang.top/img/twitter-yyx.jpeg)\n');

			const { content } = process(filename);
			const image = /<img[^>]*>/.exec(content)?.[0] ?? '';

			// Read from the asset itself so the test fails loudly if the file is
			// replaced with different dimensions.
			const size = parseImageSize(readFileSync(STATIC_DIR + '/img/twitter-yyx.jpeg'));

			expect(size).not.toBeNull();
			expect(image).toContain(`width="${size?.width}"`);
			expect(image).toContain(`height="${size?.height}"`);
		});

		it('leaves unknown and remote images without dimensions', () => {
			const filename = writeMarkdown(
				'![missing](https://brandonxiang.top/img/definitely-missing.png)\n' +
					'![remote](https://example.com/remote.png)\n'
			);

			const { content } = process(filename);

			expect(content).not.toContain('width=');
		});

		it('wraps images that have WebP variants in a picture element', () => {
			const filename = writeMarkdown('![shot](https://brandonxiang.top/img/twitter-yyx.jpeg)\n');

			const { content } = process(filename);

			expect(content).toContain('<picture>');
			expect(content).toContain('<source type="image/webp"');
			expect(content).toContain('/img/twitter-yyx.880.webp 880w');
			expect(content).toContain('sizes="(min-width: 60rem) 55rem, calc(100vw - 2.4rem)"');
		});

		it('backfills generic alt text with the post title, numbering each repeat', () => {
			const filename = writeMarkdown(`---
title: 如何找到想要的 agent skill
date: 2026-05-13
---
![1](https://brandonxiang.top/img/a.png)

![2](https://brandonxiang.top/img/b.png)

![3](https://brandonxiang.top/img/c.png)
`);

			const alts = [...process(filename).content.matchAll(/alt="([^"]*)"/g)].map(
				(match) => match[1]
			);

			expect(alts).toEqual([
				'如何找到想要的 agent skill',
				'如何找到想要的 agent skill (2)',
				'如何找到想要的 agent skill (3)'
			]);
		});

		it('counts images across sibling paragraphs instead of restarting per block', () => {
			const filename = writeMarkdown(`---
title: Post
date: 2026-05-13
---
![](https://brandonxiang.top/img/a.png)

Text between the images.

![](https://brandonxiang.top/img/b.png)
`);

			const alts = [...process(filename).content.matchAll(/alt="([^"]*)"/g)].map(
				(match) => match[1]
			);

			expect(alts).toEqual(['Post', 'Post (2)']);
		});

		it('leaves authored alt text alone and only numbers the generic ones', () => {
			const filename = writeMarkdown(`---
title: Post
date: 2026-05-13
---
![A real description](https://brandonxiang.top/img/a.png)

![](https://brandonxiang.top/img/b.png)
`);

			const alts = [...process(filename).content.matchAll(/alt="([^"]*)"/g)].map(
				(match) => match[1]
			);

			expect(alts).toEqual(['A real description', 'Post (2)']);
		});

		it('surfaces the first image as the cover with its intrinsic size', () => {
			const filename = writeMarkdown(
				'![first](https://brandonxiang.top/img/twitter-yyx.jpeg)\n' +
					'![second](https://brandonxiang.top/img/a.png)\n'
			);

			const { cover } = process(filename);
			const size = parseImageSize(readFileSync(STATIC_DIR + '/img/twitter-yyx.jpeg'));

			expect(cover?.url).toBe('/img/twitter-yyx.jpeg');
			expect(cover?.width).toBe(size?.width);
			expect(cover?.height).toBe(size?.height);
		});
	});

	describe('headings', () => {
		it('drops a duplicated title heading even when a cover image precedes it', () => {
			const filename = writeMarkdown(`---
title: Duplicated Title
date: 2026-05-13
---
![cover](https://brandonxiang.top/img/a.png)

# Duplicated Title

Body text.
`);

			const { content } = process(filename);

			expect(content).not.toContain('<h1');
			expect(content).toContain('<p>Body text.</p>');
		});

		it('keeps a top-level heading that differs from the post title', () => {
			const filename = writeMarkdown(`---
title: Duplicated Title
date: 2026-05-13
---
# A Different Heading

Body text.
`);

			const { content } = process(filename);

			expect(content).toContain('<h1>A Different Heading</h1>');
		});

		it('leaves a title heading alone when real prose comes first', () => {
			const filename = writeMarkdown(`---
title: Duplicated Title
date: 2026-05-13
---
Some opening prose.

# Duplicated Title
`);

			const { content } = process(filename);

			expect(content).toContain('<h1>Duplicated Title</h1>');
		});
	});

	describe('language', () => {
		it('reports English for a post written entirely in English', () => {
			const filename = writeMarkdown(`---
title: Hello
date: 2026-05-13
---
This post is written entirely in English so that the html lang attribute is set to en.
`);

			expect(process(filename).lang).toBe('en');
		});

		it('reports Chinese when the body contains CJK characters', () => {
			const filename = writeMarkdown(`---
title: 你好
date: 2026-05-13
---
这是一篇完全用中文写的文章，正文包含汉字。
`);

			expect(process(filename).lang).toBe('zh-CN');
		});
	});
});

describe('getPostLanguage', () => {
	it('matches the language reported by the full pipeline', () => {
		const english = writeMarkdown('A post written entirely in English.\n');

		expect(getPostLanguage(english)).toBe('en');
	});

	it('falls back to Chinese when the file cannot be read', () => {
		expect(getPostLanguage('posts/definitely/missing.md')).toBe('zh-CN');
	});
});

describe('parseImageSize', () => {
	it('reads PNG dimensions from the IHDR chunk', () => {
		const png = Buffer.alloc(32);
		png.write('\x89PNG\r\n\x1a\n', 'latin1');
		png.write('IHDR', 12, 'latin1');
		png.writeUInt32BE(1024, 16);
		png.writeUInt32BE(768, 20);

		expect(parseImageSize(png)).toEqual({ width: 1024, height: 768 });
	});

	it('reads GIF dimensions from the logical screen descriptor', () => {
		const gif = Buffer.alloc(16);
		gif.write('GIF89a', 'latin1');
		gif.writeUInt16LE(399, 6);
		gif.writeUInt16LE(260, 8);

		expect(parseImageSize(gif)).toEqual({ width: 399, height: 260 });
	});

	it('reads JPEG dimensions by walking to the first frame marker', () => {
		const jpeg = Buffer.alloc(64);
		jpeg[0] = 0xff;
		jpeg[1] = 0xd8;
		// APP0 segment that must be skipped
		jpeg[2] = 0xff;
		jpeg[3] = 0xe0;
		jpeg.writeUInt16BE(16, 4);
		// SOF0 frame header
		jpeg[22] = 0xff;
		jpeg[23] = 0xc0;
		jpeg.writeUInt16BE(17, 24);
		jpeg.writeUInt16BE(3072, 27);
		jpeg.writeUInt16BE(4096, 29);

		expect(parseImageSize(jpeg)).toEqual({ width: 4096, height: 3072 });
	});

	it('reads WebP dimensions', () => {
		const webp = Buffer.alloc(40);
		webp.write('RIFF', 'latin1');
		webp.write('WEBP', 8, 'latin1');
		webp.write('VP8X', 12, 'latin1');
		// VP8X stores 24-bit little-endian dimensions, offset by one
		webp[24] = 0x87;
		webp[25] = 0x13;
		webp[27] = 0x4f;

		expect(parseImageSize(webp)).toEqual({ width: 5000, height: 80 });
	});

	it('returns null for unsupported or truncated data', () => {
		expect(parseImageSize(Buffer.alloc(0))).toBeNull();
		expect(parseImageSize(Buffer.from('not an image at all'))).toBeNull();
		expect(parseImageSize(Buffer.from('\x89PNG\r\n\x1a\n'))).toBeNull();
	});
});
