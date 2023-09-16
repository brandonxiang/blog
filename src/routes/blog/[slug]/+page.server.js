import { process } from '$lib/markdown';

export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const { slug } = params;

	const pathname = slug.replace('-', '/');

	const post = process(`posts/${pathname}.md`);
	return { post };
};
