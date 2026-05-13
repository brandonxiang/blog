import { readSync } from 'to-vfile';
import { unified } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import frontmatter from 'remark-frontmatter';
import highlight from 'rehype-highlight';
import yaml from 'js-yaml';
import dayjs from 'dayjs';

const parser = unified().use(parse).use(gfm).use(frontmatter, ['yaml']);

const runner = unified().use(remark2rehype).use(highlight).use(rehypeStringify);

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
		metadata = yaml.load(tree.children[0].value);
		tree.children = tree.children.slice(1, tree.children.length);
		metadata.date = dayjs(metadata.date).format('MMM D, YYYY');
		metadata.description = cleanDescription(metadata.description);
	}
	const toc = addHeadingIds(tree);
	const content = runner.stringify(runner.runSync(tree));
	return { metadata, content, slug, toc, category };
}
