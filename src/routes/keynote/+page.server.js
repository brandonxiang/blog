import { createPageSeo } from '#lib/seo.js';

export const prerender = true;

export const load = async () => ({
	seo: createPageSeo({
		title: '技术演讲与分享幻灯片',
		description:
			'BrandonXIANG 的技术分享幻灯片合集，覆盖 BFF 架构、前端工程化、Node.js 服务运维、Web 开发与团队实践，可在线阅读或下载演示文稿。',
		path: '/keynote'
	})
});
