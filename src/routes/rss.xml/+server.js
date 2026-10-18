import { getPostContent, getPosts } from '#lib/getPosts.js';
import { SITE_DESCRIPTION, SITE_LANG, SITE_NAME, SITE_URL } from '#lib/seo.js';
import dayjs from 'dayjs';
import { Feed } from 'feed';

export const prerender = true;

const author = {
	name: SITE_NAME.replace(' Blog', ''),
	email: 'brandon.xiang@gmail.com',
	link: `${SITE_URL}/blog/other-cv`
};

export async function GET() {
	const feed = new Feed({
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		id: `${SITE_URL}/`,
		link: `${SITE_URL}/`,
		// The feed declared `en` while every post is Chinese-first, which made
		// readers sort and filter it against the wrong language.
		language: SITE_LANG,
		favicon: `${SITE_URL}/favicon.ico`,
		image: `${SITE_URL}/icon/logo-512.png`,
		copyright: `Copyright ${new Date().getFullYear().toString()}, ${SITE_NAME}`,
		generator: '🍉', // optional, default = 'Feed for Node.js'
		feedLinks: {
			rss: `${SITE_URL}/rss.xml`
		},
		author,
		ttl: 60
	});
	const articles = getPosts();

	articles.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	for (const article of articles) {
		feed.addItem({
			title: article.metadata.title,
			description: article.metadata.description,
			content: getPostContent(article?.slug || '').content,
			link: `${SITE_URL}/blog/${article.slug}`,
			author: [author],
			date: new Date(article.metadata.date)
		});
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	});
}
