import { createSeo, SITE_NAME, SITE_URL } from '$lib/seo';

export const prerender = true;

export const load = async () => ({
	seo: createSeo({
		title: `Project - ${SITE_NAME}`,
		description:
			'BrandonXIANG Blog 的 Project 页面，整理应用推荐、开源工具、演示项目和技术演讲幻灯片。',
		url: `${SITE_URL}/app`,
		type: 'website'
	})
});
