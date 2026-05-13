import { createSeo, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '$lib/seo';

export const prerender = true;

export const load = async () => ({
	seo: createSeo({
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		type: 'website'
	})
});
