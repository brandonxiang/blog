import { getRecentPosts } from '#lib/getPosts.js';
import { createSeo, SITE_DESCRIPTION, SITE_NAME, SITE_URL, toIsoDate } from '#lib/seo.js';

export const prerender = true;

export const load = async () => ({
	seo: createSeo({
		// Brand first so brand queries still match, keyword second so the
		// homepage is not ranking on "BrandonXIANG Blog" alone.
		title: `${SITE_NAME} - 前端工程化技术博客`,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		type: 'website'
	}),
	recentPosts: getRecentPosts(5).map((post) => ({ ...post, iso: toIsoDate(post.date) }))
});
