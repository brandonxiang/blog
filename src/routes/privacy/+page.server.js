import { createPageSeo } from '#lib/seo.js';

export const prerender = true;

export const load = async () => ({
	// The page is bilingual, so the language is declared as both `zh-CN` and
	// `en` rather than guessing from the `<html lang>` fallback.
	seo: createPageSeo({
		title: 'Privacy Policy / 隐私政策',
		description:
			'little-learner 隐私政策 / Privacy Policy for little-learner — 说明这款婴幼儿闪卡学习应用如何处理数据：不收集、不上传、不分享个人数据，也不使用广告与统计 SDK。',
		path: '/privacy',
		lang: 'zh-CN'
	})
});
