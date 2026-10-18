import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { parseImageSize, process } from '../src/lib/markdown.js';

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
