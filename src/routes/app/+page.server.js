import { createPageSeo } from '#lib/seo.js';

export const prerender = true;

export const load = async () => ({
	seo: createPageSeo({
		title: '开源项目与应用推荐',
		description:
			'BrandonXIANG 的开源项目与工具推荐清单，收录 pb、svelteup、geojson-python-utils 等自研工具，以及前端开发必备的开源库与脚手架模板。',
		path: '/app'
	})
});
