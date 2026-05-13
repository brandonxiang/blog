import { createSeo, SITE_NAME, SITE_URL } from '$lib/seo';

export const prerender = true;

export const load = async () => ({
	seo: createSeo({
		title: `Slides - ${SITE_NAME}`,
		description:
			'BrandonXIANG 的技术演讲和分享幻灯片，覆盖前端工程化、Node.js、BFF、Web 开发与团队实践。',
		url: `${SITE_URL}/keynote`,
		type: 'website'
	})
});
