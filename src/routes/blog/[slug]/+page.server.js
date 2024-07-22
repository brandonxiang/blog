import { process } from '$lib/markdown';
import pageInfoStore from '../../../store/head';

export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const { slug } = params;

	const pathname = slug.replace('-', '/');

	const post = process(`posts/${pathname}.md`);

	pageInfoStore.set({
		title: post.metadata.title,
		description: post.metadata.description,
		url: `https://brandonxiang.top/blog/${post.slug}`,
		keywords: 'brandon,blog,frontend,ai,web3,web,develop,code,study,keynote,大前端从入门到跑路,大前端,前端技术,学习'
	})


	return { post };
};
