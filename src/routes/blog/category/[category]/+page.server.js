import { error } from '@sveltejs/kit';
import { getCategories } from '#lib/getPosts.js';
import { createPageSeo, SITE_URL, toIsoDate } from '#lib/seo.js';

export const prerender = true;

/**
 * Per-category prose. Without it each hub would be a near-duplicate of `/blog`
 * showing a subset of the same rows, which is the thin-content pattern search
 * engines discount. A handful of sentences tied to the topic keeps them useful.
 *
 * @type {Record<string, string>}
 */
const CATEGORY_INTROS = {
	ai: 'AI 工具、智能编码与 Agent 的落地实践。',
	framework: 'React、Svelte、Vue 等前端框架的渲染机制、源码分析与工程实践。',
	frontend: '前端工程化、构建优化、性能与团队协作的实践经验。',
	other: '其他技术主题与日常实践杂记。',
	pwa: 'PWA、离线缓存、Service Worker 与 Web 应用体验优化。',
	python: 'Python 脚本、数据处理与自动化的实践笔记。',
	tool: '开发工具、CLI 与效率工具的使用记录与选型思考。'
};

/**
 * @param {string} slug
 */
function introFor(slug) {
	return CATEGORY_INTROS[slug] ?? '按主题整理的技术文章。';
}

/** Prerenders one hub per qualifying category. */
export function entries() {
	return getCategories().map((category) => ({ category: category.slug }));
}

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const category = getCategories().find((entry) => entry.slug === params.category);

	if (!category) error(404, 'category not found');

	const intro = introFor(category.slug);
	const path = `/blog/category/${category.slug}`;
	const title = `${category.name} 分类文章`;
	const posts = category.posts.map((post) => ({ ...post, iso: toIsoDate(post.date) }));

	return {
		category: { name: category.name, slug: category.slug, count: category.count },
		intro,
		posts,
		seo: createPageSeo({
			title,
			description: `${category.name} 分类共收录 ${category.count} 篇文章。${intro}`,
			path,
			type: 'CollectionPage',
			// The hub only counts as a hub if the graph names the posts it holds,
			// instead of just claiming a count in the description.
			items: posts
				.filter((post) => post.slug)
				.map((post) => ({ name: post.title, url: `${SITE_URL}/blog/${post.slug}` })),
			trail: [
				{ name: '首页', url: `${SITE_URL}/` },
				{ name: '文章', url: `${SITE_URL}/blog` },
				{ name: title, url: `${SITE_URL}${path}` }
			]
		})
	};
};
