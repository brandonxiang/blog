import type { PageLoad } from '../../../.svelte-kit/types/src/routes/blog/$types';
import { process } from '$lib/markdown';
import fg from 'fast-glob';
import dayjs from 'dayjs';

export const prerender = true;

export const load: PageLoad = async () => {
	const posts = fg.sync('posts/*/*.md').map((pathname) => {
		const { metadata } = process(pathname);

		const slug = pathname.replace('posts/', '').replace('.md', '').replace('/', '-');
		return {
			metadata,
			slug
		};
	});
	// sort the posts by create date.
	// @ts-ignore
	posts.sort(
		(a, b) => dayjs(b.metadata.date, 'MMM D, YYYY') - dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	return { posts };
};
