import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import dayjs from 'dayjs';
import { process as renderPost } from '#lib/markdown.js';

const POSTS_DIR = 'posts';

/**
 * Lists every markdown post as a project-relative path.
 *
 * This replaces the previous `fast-glob` call. The pattern was fixed and
 * shallow (every markdown file exactly one directory below `posts`), so a
 * two-level directory scan does the same job without pulling in a glob engine
 * and its `braces` / `micromatch` chain, which carries an unpatched
 * denial-of-service advisory.
 *
 * @returns {string[]}
 */
function findPostFiles() {
	/** @type {string[]} */
	const files = [];

	/** @type {import('node:fs').Dirent[]} */
	let categories;

	try {
		categories = readdirSync(POSTS_DIR, { withFileTypes: true });
	} catch {
		return files;
	}

	for (const category of categories) {
		if (!category.isDirectory()) continue;

		for (const entry of readdirSync(join(POSTS_DIR, category.name), { withFileTypes: true })) {
			if (entry.isFile() && entry.name.endsWith('.md')) {
				files.push(`${POSTS_DIR}/${category.name}/${entry.name}`);
			}
		}
	}

	return files;
}

export const getPosts = () => {
	/** @type {{metadata: {date: string; title: string; description?: string;}, category?: string, slug?: string, redirect?: string}[]} */
	let posts = findPostFiles().map((pathname) => {
		const { metadata, category } = renderPost(pathname);

		const slug = pathname.replace('posts/', '').replace('.md', '').replace('/', '-');
		return {
			metadata,
			category,
			slug
		};
	});
	return posts;
};

/**
 * Retrieves the content of a post based on the provided slug.
 *
 * @param {string} slug - The slug of the post.
 * @return {import('../interface/post.js').PostType} - A promise that resolves to the post content.
 */
export const getPostContent = (slug) => {
	const pathname = slug.replace('-', '/');

	const post = renderPost(`posts/${pathname}.md`);
	return post;
};

/**
 * @typedef {Object} PostSummary
 * @property {string} [slug]
 * @property {string} title
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} date
 */

/**
 * The CV lives under a category directory but is a profile page, not an
 * article, so the article-feed helpers below leave it out.
 */
const PROFILE_SLUG = 'other-cv';

/** A category needs at least this many articles before it earns a hub page. */
const MIN_CATEGORY_POSTS = 3;

/** @type {TypeOfGetPosts | undefined} */
let postIndex;
/** @type {string | undefined} */
let postIndexCwd;

/**
 * @typedef {ReturnType<typeof getPosts>} TypeOfGetPosts
 */

/**
 * `getPosts()` re-reads and re-renders all 36 posts on every call. That is fine
 * once, but the 36 post pages each ask for their related posts, which would
 * multiply into ~1300 full re-renders (~2 minutes). The index is read-only, so
 * it is built once per working directory.
 *
 * Keying on `process.cwd()` is what lets the tests stay honest: they build a
 * throwaway `posts` tree and `chdir` into it, which invalidates the cache.
 *
 * @returns {TypeOfGetPosts}
 */
function getPostIndex() {
	const cwd = process.cwd();

	if (!postIndex || postIndexCwd !== cwd) {
		postIndex = getPosts();
		postIndexCwd = cwd;
	}

	return postIndex;
}

/**
 * @param {TypeOfGetPosts[number]} post
 * @returns {PostSummary}
 */
function toSummary(post) {
	return {
		slug: post.slug,
		title: post.metadata.title,
		description: post.metadata.description,
		category: post.category,
		date: post.metadata.date
	};
}

/**
 * @param {TypeOfGetPosts[number]} post
 */
const byNewest = (post) => +dayjs(post.metadata.date, 'MMM D, YYYY');

/**
 * The newest posts, for the home page feed.
 *
 * @param {number} [limit]
 * @returns {PostSummary[]}
 */
export function getRecentPosts(limit = 5) {
	return getPostIndex()
		.filter((post) => post.slug && post.slug !== PROFILE_SLUG)
		.sort((a, b) => byNewest(b) - byNewest(a))
		.slice(0, limit)
		.map(toSummary);
}

/**
 * Posts to surface under an article: the same category first, then the newest
 * of everything else. Excludes the article itself and the profile page.
 *
 * @param {string} slug
 * @param {number} [limit]
 * @returns {PostSummary[]}
 */
export function getRelatedPosts(slug, limit = 4) {
	const posts = getPostIndex();
	const category = posts.find((post) => post.slug === slug)?.category;

	return posts
		.filter((post) => post.slug && post.slug !== slug && post.slug !== PROFILE_SLUG)
		.sort((a, b) => {
			const sameA = a.category === category ? 1 : 0;
			const sameB = b.category === category ? 1 : 0;

			if (sameA !== sameB) return sameB - sameA;

			return byNewest(b) - byNewest(a);
		})
		.slice(0, limit)
		.map(toSummary);
}

/**
 * @typedef {Object} Category
 * @property {string} name Display name, e.g. `Framework`
 * @property {string} slug URL segment, e.g. `framework`
 * @property {number} count
 * @property {PostSummary[]} posts
 */

/**
 * Categories that have enough articles to justify an indexable hub page.
 * Thin hubs (one or two posts) hurt more than they help, so they are left out.
 *
 * @returns {Category[]}
 */
export function getCategories() {
	/** @type {Map<string, {name: string; posts: PostSummary[]}>} */
	const groups = new Map();

	for (const post of getPostIndex()) {
		if (!post.slug || post.slug === PROFILE_SLUG || !post.category) continue;

		const group = groups.get(post.category) ?? { name: post.category, posts: [] };
		group.posts.push(toSummary(post));
		groups.set(post.category, group);
	}

	return [...groups.values()]
		.filter((group) => group.posts.length >= MIN_CATEGORY_POSTS)
		.map((group) => ({
			name: group.name,
			slug: group.name.toLowerCase(),
			count: group.posts.length,
			posts: group.posts.sort(
				(a, b) => +dayjs(b.date, 'MMM D, YYYY') - +dayjs(a.date, 'MMM D, YYYY')
			)
		}))
		.sort((a, b) => b.count - a.count);
}
