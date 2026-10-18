import { getCategories, getPosts } from '#lib/getPosts.js';
import { SITE_URL, toSitemapDate } from '#lib/seo.js';
import dayjs from 'dayjs';

export const prerender = true;

/**
 * @param {string} loc
 * @param {string} priority
 * @param {string} [lastmod]
 */
function toUrl(loc, priority, lastmod) {
	return `<url>
				<loc>${loc}</loc>${lastmod ? `\n\t\t\t\t<lastmod>${lastmod}</lastmod>` : ''}
				<priority>${priority}</priority>
			</url>`;
}

export async function GET() {
	const articles = getPosts();

	articles.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	// The home page and the listing both surface recent posts, so they change
	// whenever content lands. Deriving their `lastmod` from the newest article
	// keeps it honest; a hardcoded date would rot as soon as the next post ships.
	const staticLastmod = articles.length > 0 ? toSitemapDate(articles[0].metadata.date) : undefined;

	const urls = [
		toUrl(SITE_URL, '1.0', staticLastmod),
		toUrl(`${SITE_URL}/blog`, '0.8', staticLastmod),
		// These pages change independently of the article feed, so any date taken
		// from the posts would be a guess. Omitting `lastmod` is honest; Google
		// treats a missing hint better than a wrong one.
		toUrl(`${SITE_URL}/app`, '0.7'),
		toUrl(`${SITE_URL}/keynote`, '0.7'),
		toUrl(`${SITE_URL}/privacy`, '0.8'),
		...getCategories().map((category) =>
			toUrl(`${SITE_URL}/blog/category/${category.slug}`, '0.6', staticLastmod)
		),
		...articles.map((article) =>
			toUrl(`${SITE_URL}/blog/${article.slug}`, '0.8', toSitemapDate(article.metadata.date))
		)
	];

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			${urls.join('\n\t\t\t')}
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}
