import { process } from '$lib/markdown';
import fg from 'fast-glob';

export const getPosts = () => {
  /** @type {{metadata: {date: string; title: string; description?: string;}, slug?: string, redirect?: string}[]} */
	let posts = fg.sync('posts/*/*.md').map((pathname) => {
		const { metadata } = process(pathname);

		const slug = pathname.replace('posts/', '').replace('.md', '').replace('/', '-');
		return {
			metadata,
			slug
		};
	});
  return posts
}

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
}