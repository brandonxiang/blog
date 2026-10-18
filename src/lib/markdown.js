import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSync } from 'to-vfile';
import { unified } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import frontmatter from 'remark-frontmatter';
import highlight from 'rehype-highlight';
import { load } from 'js-yaml';
import dayjs from 'dayjs';
import { SITE_URL } from '#lib/seo.js';

const parser = unified().use(parse).use(gfm).use(frontmatter, ['yaml']);

/**
 * Absolute URLs to the canonical site are rewritten to root-relative paths so
 * posts render correctly on localhost, on preview deployments and behind a
 * custom domain.
 *
 * @param {string} url
 * @returns {string}
 */
function normalizeImageUrl(url) {
	const canonical = new URL(SITE_URL);

	for (const origin of [canonical.origin, `https://www.${canonical.hostname}`]) {
		if (url.startsWith(`${origin}/`)) {
			return url.slice(origin.length);
		}
	}

	return url;
}

/**
 * @typedef {Object} ImageSize
 * @property {number} width
 * @property {number} height
 */

/** @type {Map<string, ImageSize | null>} */
const sizeCache = new Map();

/** @type {string | null} */
let staticDir = null;

/**
 * Locates the project's `static` directory by walking up from this module.
 *
 * `process.cwd()` is not available inside the worker SvelteKit forks for
 * prerendering, and `import.meta.url` points either at the source file or at the
 * bundled output depending on the phase, so the directory is probed instead.
 *
 * @returns {string | null}
 */
function findStaticDir() {
	if (staticDir) return staticDir;

	let dir = fileURLToPath(new URL('.', import.meta.url));

	for (let depth = 0; depth < 10; depth += 1) {
		if (existsSync(join(dir, 'static'))) {
			staticDir = join(dir, 'static');
			return staticDir;
		}

		const parent = dirname(dir);
		if (parent === dir) break;

		dir = parent;
	}

	return null;
}

/**
 * @param {string} pathname Root-relative path, e.g. `/img/foo.png`
 * @returns {string} Path below `static/`
 */
function toStaticRelative(pathname) {
	return decodeURIComponent(pathname).replace(/^\/+/, '');
}

/**
 * Reads the intrinsic size of an image so the rendered markup can reserve
 * space for it before the bytes arrive.
 *
 * @param {string} pathname Root-relative path, e.g. `/img/foo.png`
 * @returns {ImageSize | null}
 */
function readImageSize(pathname) {
	if (sizeCache.has(pathname)) {
		return /** @type {ImageSize | null} */ (sizeCache.get(pathname));
	}

	/** @type {ImageSize | null} */
	let size = null;

	try {
		const root = findStaticDir();
		if (root) {
			size = parseImageSize(readFileSync(join(root, toStaticRelative(pathname))));
		}
	} catch {
		size = null;
	}

	sizeCache.set(pathname, size);

	return size;
}

/**
 * Extracts the intrinsic dimensions from the header of a PNG, GIF, JPEG or
 * WebP file. Only the first few kilobytes are needed, so the file is read in
 * small chunks rather than in full.
 *
 * @param {Buffer} buffer
 * @returns {ImageSize | null}
 */
export function parseImageSize(buffer) {
	if (isPng(buffer)) {
		return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
	}

	if (isGif(buffer)) {
		return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
	}

	if (isWebp(buffer)) {
		return parseWebpSize(buffer);
	}

	if (isJpeg(buffer)) {
		return parseJpegSize(buffer);
	}

	return null;
}

/**
 * @param {Buffer} buffer
 */
function isPng(buffer) {
	return (
		buffer.length > 24 &&
		buffer.toString('latin1', 1, 4) === 'PNG' &&
		buffer.toString('latin1', 12, 16) === 'IHDR'
	);
}

/**
 * @param {Buffer} buffer
 */
function isGif(buffer) {
	return buffer.length > 10 && ['GIF87a', 'GIF89a'].includes(buffer.toString('latin1', 0, 6));
}

/**
 * @param {Buffer} buffer
 */
function isJpeg(buffer) {
	return buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8;
}

/**
 * @param {Buffer} buffer
 */
function isWebp(buffer) {
	return (
		buffer.length > 30 &&
		buffer.toString('latin1', 0, 4) === 'RIFF' &&
		buffer.toString('latin1', 8, 12) === 'WEBP'
	);
}

/**
 * @param {Buffer} buffer
 * @returns {ImageSize | null}
 */
function parseWebpSize(buffer) {
	const format = buffer.toString('latin1', 12, 16);

	if (format === 'VP8X') {
		const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
		const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
		return { width, height };
	}

	if (format === 'VP8 ') {
		return {
			width: buffer.readUInt16LE(26) & 0x3fff,
			height: buffer.readUInt16LE(28) & 0x3fff
		};
	}

	if (format === 'VP8L') {
		const bits = buffer.readUInt32LE(21);
		return {
			width: (bits & 0x3fff) + 1,
			height: ((bits >> 14) & 0x3fff) + 1
		};
	}

	return null;
}

/**
 * Walks the JPEG segment chain looking for a start-of-frame marker, which is
 * the first segment that carries the frame dimensions.
 *
 * @param {Buffer} buffer
 * @returns {ImageSize | null}
 */
function parseJpegSize(buffer) {
	let offset = 2;

	/** @type {Set<number>} */
	const frameMarkers = new Set([
		0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
	]);

	while (offset + 9 < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}

		const marker = buffer[offset + 1];

		if (frameMarkers.has(marker)) {
			return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
		}

		const length = buffer.readUInt16BE(offset + 2);
		if (length < 2) return null;

		offset += 2 + length;
	}

	return null;
}

/**
 * The article column is `minmax(0, 1fr)` inside a `72rem` grid with a `13rem`
 * aside, so content images are capped at roughly `55rem`. Below `60rem` the
 * layout collapses and the image simply fills the padded viewport.
 */
const IMAGE_SIZES = '(min-width: 60rem) 55rem, calc(100vw - 2.4rem)';

/** @type {Map<string, {src: string; width: number}[]>} */
const variantCache = new Map();

/**
 * Finds the WebP variants written by `scripts/optimize-images.mjs`.
 *
 * @param {string} pathname Root-relative path, e.g. `/img/foo.png`
 * @returns {{src: string; width: number}[]}
 */
function findWebpVariants(pathname) {
	const cached = variantCache.get(pathname);
	if (cached) return cached;

	/** @type {{src: string; width: number}[]} */
	const variants = [];

	try {
		const root = findStaticDir();
		const relativePath = toStaticRelative(pathname).replace(/\.[^./]+$/, '');
		const urlPrefix = pathname.slice(0, pathname.length - posix.basename(pathname).length);

		if (!root) throw new Error('static directory not found');

		// The generated files are named `<stem>.<width>.webp`, so the width is
		// recovered from the filename rather than from the image header.
		const listing = readdirSync(join(root, posix.dirname(relativePath)));
		const prefix = `${posix.basename(relativePath)}.`;

		for (const entry of listing) {
			if (!entry.startsWith(prefix) || !entry.endsWith('.webp')) continue;

			const match = /^(\d+)\.webp$/.exec(entry.slice(prefix.length));
			if (!match) continue;

			variants.push({ src: `${urlPrefix}${prefix}${match[1]}.webp`, width: Number(match[1]) });
		}

		variants.sort((a, b) => a.width - b.width);
	} catch {
		// No directory to scan — fall back to the original image.
	}

	variantCache.set(pathname, variants);

	return variants;
}

/**
 * Rehype plugin that makes post images cheaper and more stable to render:
 *
 * - absolute site URLs become root-relative, so posts also work on localhost
 *   and on preview deployments
 * - intrinsic `width`/`height` are emitted from the file on disk so the browser
 *   can reserve space and avoid layout shift
 * - images are lazy loaded so a long post does not pull megabytes of GIFs up
 *   front; images already inside the viewport are still fetched immediately
 */
function rehypeOptimizeImages() {
	return (/** @type {import('hast').Root} */ tree) => {
		rewriteImages(tree);
	};
}

/**
 * Applies the image optimisations and wraps optimised images in a `<picture>`
 * element so the browser can pick a WebP variant.
 *
 * @param {import('hast').Parent} parent
 */
function rewriteImages(parent) {
	if (!('children' in parent) || !Array.isArray(parent.children)) return;

	for (let index = 0; index < parent.children.length; index += 1) {
		const child = parent.children[index];

		if (child.type === 'element') {
			if (child.tagName === 'img') {
				const picture = optimizeImage(child);

				if (picture) {
					parent.children[index] = picture;
				}

				continue;
			}

			rewriteImages(child);
		}
	}
}

/**
 * @param {import('hast').Element} node
 * @returns {import('hast').Element | null} A `<picture>` wrapper, or `null`
 *   when no optimised variant exists and the node can stay as it is
 */
function optimizeImage(node) {
	const properties = node.properties ?? (node.properties = {});
	const src = properties.src;

	if (typeof src !== 'string') return null;

	const normalized = normalizeImageUrl(src);
	properties.src = normalized;

	if (normalized.startsWith('/')) {
		if (!properties.width && !properties.height) {
			const size = readImageSize(normalized);
			if (size) {
				properties.width = size.width;
				properties.height = size.height;
			}
		}

		// Every post image is lazy loaded. Chrome fetches lazy images that are
		// already inside the viewport right away, but it defers the ones far
		// below the fold — which matters because several posts embed multi
		// megabyte GIFs halfway down the article.
		properties.loading = 'lazy';
		properties.decoding = 'async';
	}

	const variants = findWebpVariants(normalized);

	if (variants.length === 0) return null;

	// The `img` becomes the fallback inside the picture, so it keeps carrying
	// the intrinsic size and the lazy loading hints.
	properties.sizes = IMAGE_SIZES;

	return {
		type: 'element',
		tagName: 'picture',
		properties: {},
		children: [
			{
				type: 'element',
				tagName: 'source',
				properties: {
					type: 'image/webp',
					srcset: variants.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
					sizes: IMAGE_SIZES
				},
				children: []
			},
			node
		]
	};
}

const runner = unified()
	.use(remark2rehype)
	.use(highlight)
	.use(rehypeOptimizeImages)
	.use(rehypeStringify);

/** @type {Record<string, string>} */
const CATEGORY_LABELS = {
	ai: 'AI',
	framework: 'Framework',
	frontend: 'Frontend',
	other: 'Other',
	pwa: 'PWA',
	python: 'Python',
	tool: 'Tool'
};

/**
 * @typedef {Object} TocItem
 * @property {number} depth
 * @property {string} text
 * @property {string} id
 */

/**
 * @param {unknown} node
 * @returns {string}
 */
function extractText(node) {
	if (!node || typeof node !== 'object') return '';

	if ('value' in node && typeof node.value === 'string') {
		return node.value;
	}

	if (!('children' in node) || !Array.isArray(node.children)) {
		return '';
	}

	return node.children.map(extractText).join(' ');
}

/**
 * @param {string | undefined} description
 * @returns {string | undefined}
 */
function cleanDescription(description) {
	if (!description) return description;

	return extractText(parser.parse(description)).replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} filename
 */
function getCategory(filename) {
	const parts = filename.split(/[\\/]/);
	const postsIndex = parts.lastIndexOf('posts');
	const category = postsIndex >= 0 ? parts[postsIndex + 1] : undefined;

	return (category && CATEGORY_LABELS[category]) || 'Blog';
}

/**
 * @param {string} text
 * @param {Map<string, number>} usedSlugs
 */
function createHeadingId(text, usedSlugs) {
	const base =
		text
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
			.trim()
			.replace(/\s+/g, '-') || 'section';
	const count = usedSlugs.get(base) ?? 0;
	usedSlugs.set(base, count + 1);

	return count === 0 ? base : `${base}-${count + 1}`;
}

/**
 * @param {{children: any[]}} tree
 * @returns {TocItem[]}
 */
function addHeadingIds(tree) {
	/** @type {TocItem[]} */
	const toc = [];
	const usedSlugs = new Map();

	for (const node of tree.children) {
		const depth = Number(node.depth);
		if (node.type !== 'heading' || depth < 2 || depth > 3) continue;

		const text = extractText(node).replace(/\s+/g, ' ').trim();
		if (!text) continue;

		const id = createHeadingId(text, usedSlugs);
		node.data = {
			...node.data,
			hProperties: {
				...node.data?.hProperties,
				id
			}
		};
		toc.push({ depth, text, id });
	}

	return toc;
}

/**
 * Alt text that carries no information for a crawler or a screen reader.
 * Thirty of the eighty-five post images were written as `![](url)`,
 * `![cover]`, `![image.png]` or a bare number.
 */
const GENERIC_ALTS = new Set([
	'',
	'cover',
	'covers',
	'image',
	'image.png',
	'img',
	'pic',
	'photo',
	'picture',
	'screenshot',
	'untitled',
	'未命名',
	'图片',
	'封面'
]);

/**
 * @param {unknown} alt
 * @returns {boolean}
 */
function isGenericAlt(alt) {
	if (typeof alt !== 'string') return true;

	const value = alt.trim();

	if (GENERIC_ALTS.has(value.toLowerCase())) return true;
	// Bare counters such as `![1]`, and alt text that is just the filename.
	if (/^\d+$/.test(value)) return true;
	if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value)) return true;

	return false;
}

/**
 * Replaces uninformative alt text with the post title, which is what the image
 * illustrates. Later images get an ordinal so the set stays distinguishable.
 *
 * @param {import('hast').Parent} parent
 * @param {string} title
 * @returns {number} How many images were seen
 */
function fillImageAlt(parent, title) {
	if (!('children' in parent) || !Array.isArray(parent.children)) return 0;

	/**
	 * @param {import('hast').Parent} node
	 * @param {number} seen How many images preceded this subtree
	 * @returns {number} How many images were seen in total
	 */
	const walk = (node, seen) => {
		if (!('children' in node) || !Array.isArray(node.children)) return seen;

		/** @type {number} */
		let count = seen;

		for (const child of node.children) {
			if (child.type === 'element' && child.tagName === 'img') {
				const properties = child.properties ?? (child.properties = {});

				count += 1;

				if (isGenericAlt(properties.alt)) {
					properties.alt = count === 1 ? title : `${title} (${count})`;
				}
			}

			if (child.type === 'element') {
				count = walk(child, count);
			}
		}

		return count;
	};

	return walk(parent, 0);
}

/**
 * The article template already renders the post title as its `<h1>`. Posts that
 * repeat that title as their own markdown heading produced two identical `<h1>`
 * elements, so the redundant one is dropped rather than demoted.
 *
 * The heading is rarely the first node — posts usually open with a cover image
 * — so leading nodes are skipped for as long as they carry no prose.
 *
 * @param {{children: any[]}} tree
 * @param {string} title
 */
function dropDuplicateTitleHeading(tree, title) {
	/** @type {number} */
	let dropIndex = -1;

	for (const [index, node] of tree.children.entries()) {
		if (node.type === 'heading' && Number(node.depth) === 1) {
			const text = extractText(node).replace(/\s+/g, ' ').trim();

			if (text === title) dropIndex = index;
			break;
		}

		// Keep walking over anything that is only decoration.
		if (node.type === 'thematicBreak' || node.type === 'html') continue;
		if (node.type === 'image') continue;

		if (node.type === 'paragraph' && !extractText(node).replace(/\s+/g, ' ').trim()) continue;

		// Real prose started before any top-level heading was found.
		break;
	}

	if (dropIndex < 0) return;

	tree.children = tree.children.filter((_, index) => index !== dropIndex);
}

/**
 * Counts the prose a reader actually sees, skipping code blocks and headings so
 * the number matches what a crawler would treat as body copy.
 *
 * @param {import('mdast').Root} tree
 * @returns {number}
 */
function countWords(tree) {
	/**
	 * @param {unknown} node
	 * @returns {number}
	 */
	const walk = (node) => {
		if (!node || typeof node !== 'object') return 0;
		if (!('type' in node) || typeof node.type !== 'string') return 0;

		// Code is not body copy, so it is left out of the count entirely.
		if (node.type === 'code' || node.type === 'inlineCode') return 0;

		if (node.type === 'text' && 'value' in node && typeof node.value === 'string') {
			const value = node.value;
			// Each CJK ideograph counts as one word; runs of latin characters
			// count as one word per whitespace-separated token.
			const cjk = value.match(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
			const latin =
				value
					.replace(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g, ' ')
					.match(/[A-Za-z0-9][A-Za-z0-9'’._-]*/g)?.length ?? 0;

			return cjk + latin;
		}

		if ('children' in node && Array.isArray(node.children)) {
			let words = 0;

			for (const child of node.children) words += walk(child);

			return words;
		}

		return 0;
	};

	return walk(tree);
}

/**
 * Picks the page language from the prose so English posts stop being advertised
 * as `zh-CN`. Only the first slice of the body is inspected, which is plenty to
 * tell the two apart and keeps the per-page cost negligible.
 *
 * @param {import('mdast').Root} tree
 * @returns {'zh-CN' | 'en'}
 */
function detectLanguage(tree) {
	/** @type {string} */
	let sample = '';

	for (const node of tree.children) {
		if (node.type === 'heading' || node.type === 'code' || node.type === 'paragraph') {
			sample += extractText(node);
		}

		if (sample.length >= 400) break;
	}

	const cjk = sample.match(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
	const latin = sample.match(/[A-Za-z]/g)?.length ?? 0;

	if (cjk === 0 && latin > 0) return 'en';

	return 'zh-CN';
}

/**
 * @typedef {Object} ImageMeta
 * @property {string} url
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * The first image in a post doubles as its social card, so it is surfaced
 * separately from the rendered HTML.
 *
 * @param {import('hast').Root} tree
 * @returns {ImageMeta | undefined}
 */
function findCover(tree) {
	/**
	 * The recursion returns the match instead of assigning to an outer
	 * variable, because TypeScript cannot see through the closure and would
	 * narrow the outer variable away to `never`.
	 *
	 * @param {import('hast').Parent} parent
	 * @returns {import('hast').Element | undefined}
	 */
	const walk = (parent) => {
		if (!('children' in parent) || !Array.isArray(parent.children)) return undefined;

		for (const child of parent.children) {
			if (child.type !== 'element') continue;

			if (child.tagName === 'img') return child;

			const nested = walk(child);
			if (nested) return nested;
		}

		return undefined;
	};

	const found = walk(tree);

	if (!found) return undefined;

	const src = found.properties?.src;

	if (typeof src !== 'string') return undefined;

	/** @type {ImageMeta} */
	const cover = { url: normalizeImageUrl(src) };

	if (cover.url.startsWith('/')) {
		const size = readImageSize(cover.url);

		if (size) {
			cover.width = size.width;
			cover.height = size.height;
		}
	}

	return cover;
}

/**
 * Reads the language of a post without running the full render pipeline.
 *
 * `hooks.server.js` needs this to rewrite `<html lang>` before the page load
 * runs, and re-parsing the whole document twice per prerendered page is not
 * worth it.
 *
 * @param {string} filename
 * @returns {'zh-CN' | 'en'}
 */
export function getPostLanguage(filename) {
	try {
		const tree = parser.parse(readSync(filename));

		if (tree.children.length > 0 && tree.children[0].type === 'yaml') {
			tree.children = tree.children.slice(1);
		}

		return detectLanguage(tree);
	} catch {
		return 'zh-CN';
	}
}

/**
 * Returns the post exactly as authored, frontmatter included. This backs the
 * `/blog/<slug>.md` endpoint, which lets AI crawlers and feed readers consume
 * the source instead of reverse-engineering the rendered HTML.
 *
 * @param {string} filename
 * @returns {string}
 */
export function getPostSource(filename) {
	return readFileSync(filename, 'utf8');
}

/**
 *
 * @param {string} filename
 * @returns {import('../interface/post.js').PostType}
 */
export function process(filename) {
	const slug = filename.split('.')[0];
	const category = getCategory(filename);
	const tree = parser.parse(readSync(filename));
	/** @type {{date: string; title: string; description?: string}} */
	let metadata = { date: '', title: '' };

	if (tree.children.length > 0 && tree.children[0].type == 'yaml') {
		//@ts-ignore
		metadata = load(tree.children[0].value);
		tree.children = tree.children.slice(1, tree.children.length);
		metadata.date = dayjs(metadata.date).format('MMM D, YYYY');
		metadata.description = cleanDescription(metadata.description);
	}

	dropDuplicateTitleHeading(tree, metadata.title);

	const toc = addHeadingIds(tree);
	const wordCount = countWords(tree);
	const lang = detectLanguage(tree);
	const hast = runner.runSync(tree);

	fillImageAlt(/** @type {import('hast').Root} */ (hast), metadata.title);

	const content = runner.stringify(hast);
	return { metadata, content, slug, toc, category, wordCount, lang, cover: findCover(hast) };
}
