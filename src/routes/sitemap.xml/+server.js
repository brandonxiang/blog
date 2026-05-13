import { getPosts } from '$lib/getPosts';
import { SITE_URL, toSitemapDate } from '$lib/seo';
import dayjs from 'dayjs';

export const prerender = true;

export async function GET() {
	const articles = getPosts();
	const staticLastmod = toSitemapDate('2026-05-14');

	articles.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	);

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
		<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
			<url>
				<loc>${SITE_URL}</loc>
				<lastmod>${staticLastmod}</lastmod>
				<priority>1.0</priority>
			</url>
			<url>
				<loc>${SITE_URL}/blog</loc>
				<lastmod>${staticLastmod}</lastmod>
				<priority>0.8</priority>
			</url>
			<url>
				<loc>${SITE_URL}/app</loc>
				<lastmod>${staticLastmod}</lastmod>
				<priority>0.7</priority>
			</url>
			<url>
				<loc>${SITE_URL}/keynote</loc>
				<lastmod>${staticLastmod}</lastmod>
				<priority>0.7</priority>
			</url>
			<url>
				<loc>${SITE_URL}/privacy</loc>
				<lastmod>${staticLastmod}</lastmod>
				<priority>0.8</priority>
			</url>
			${articles
				.map((article) => {
					return `<url>
				<loc>${`${SITE_URL}/blog/${article.slug}`}</loc>
				<lastmod>${toSitemapDate(article.metadata.date)}</lastmod>
				<priority>0.8</priority>
			</url>`;
				})
				.join('')}
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}
