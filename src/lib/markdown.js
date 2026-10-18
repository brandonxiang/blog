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
	const toc = addHeadingIds(tree);
	const content = runner.stringify(runner.runSync(tree));
	return { metadata, content, slug, toc, category };
}
