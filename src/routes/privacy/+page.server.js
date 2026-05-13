import { createSeo, SITE_NAME, SITE_URL } from '$lib/seo';

export const prerender = true;

export const load = async () => ({
	seo: createSeo({
		title: `Privacy Policy - ${SITE_NAME}`,
		description: 'Little Learner 隐私政策，说明应用如何处理儿童学习场景中的数据和隐私保护。',
		url: `${SITE_URL}/privacy`,
		type: 'website'
	})
});
