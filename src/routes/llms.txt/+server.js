import { getPosts } from '#lib/getPosts.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#lib/seo.js';
import dayjs from 'dayjs';

export const prerender = true;

/** @type {Record<string, string>} */
const CATEGORY_TITLES = {
	ai: 'AI 工具与实践',
	framework: '前端框架',
	frontend: '前端工程化',
	other: '其他',
	pwa: 'PWA',
	python: 'Python',
	tool: '开发工具'
};

/**
 * Builds `llms.txt` as described by https://llmstxt.org.
 *
 * `robots.txt` already welcomes GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot
 * and friends, so the site has opted into being read by answer engines. That
 * file is the index those crawlers can read first: a flat, category-grouped list
 * of every post with a one-line summary, each pointing at both the rendered page
 * and its markdown source.
 *
 * @type {import('./$types').RequestHandler}
 */
export function GET() {
	const posts = getPosts().sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	/** @type {Map<string, {slug?: string; metadata: {title: string; description?: string}}[]>} */
	const byCategory = new Map();

	for (const post of posts) {
		const category = post.category || 'other';
		const group = byCategory.get(category) ?? [];

		group.push(post);
		byCategory.set(category, group);
	}

	const sections = [...byCategory.entries()]
		.sort(([a], [b]) =>
			// A post can carry a category that has no title mapping yet.
			(CATEGORY_TITLES[a] ?? a).localeCompare(CATEGORY_TITLES[b] ?? b, 'zh')
		)
		.map(([category, group]) => {
			const items = group
				.filter((post) => post.slug)
				.map((post) => {
					const summary = post.metadata.description?.replace(/\s+/g, ' ').trim();

					return `- [${post.metadata.title}](${SITE_URL}/blog/${post.slug}.md)${summary ? `: ${summary}` : ''}`;
				})
				.join('\n');

			return `## ${CATEGORY_TITLES[category] ?? category}\n\n${items}`;
		});

	const body = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'> 每篇文章都提供两种格式：网页版 `/blog/<slug>` 与 Markdown 原文 `/blog/<slug>.md`。',
		'',
		'## 站点入口',
		'',
		`- [文章索引](${SITE_URL}/blog): 全部技术文章，按时间倒序`,
		`- [RSS](${SITE_URL}/rss.xml): 订阅更新`,
		`- [关于作者](${SITE_URL}/blog/other-cv): Brandon Xiang 的简历与联系方式`,
		`- [技术分享](${SITE_URL}/keynote): 公开演讲与幻灯片`,
		`- [开源项目](${SITE_URL}/app): 自研工具与开源项目推荐`,
		...sections
	].join('\n');

	return new Response(`${body}\n`, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=0, s-maxage=3600'
		}
	});
}
