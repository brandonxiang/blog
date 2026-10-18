import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { process } from '#lib/markdown.js';

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
		const { metadata, category } = process(pathname);

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

	const post = process(`posts/${pathname}.md`);
	return post;
};
