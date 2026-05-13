import { process } from '$lib/markdown';
import { createArticleSeo } from '$lib/seo';

export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const { slug } = params;

	const pathname = slug.replace('-', '/');

	const post = process(`posts/${pathname}.md`);
	post.slug = slug;

	return {
		post,
		seo: createArticleSeo(post.metadata, slug, post.category)
	};
};
