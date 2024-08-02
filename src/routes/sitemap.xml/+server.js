import { getPosts } from "$lib/getPosts";
import dayjs from "dayjs";

export async function GET() {

	const articles = getPosts();

	articles.sort(
		(a, b) => +dayjs(b.metadata.date, 'MMM D, YYYY') - +dayjs(a.metadata.date, 'MMM D, YYYY')
	)


	return new Response(
		`
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			<url>
			  <loc>https://brandonxiang.top</loc>
				<lastmod>2024-05-20T12:00:00+00:00</lastmod>
				<priority>1.0</priority>
			</url>
			<url>
			  <loc>https://brandonxiang.top/blog</loc>
				<lastmod>2024-05-20T12:00:00+00:00</lastmod>
				<priority>0.8</priority>
			</url>
			<url>
			  <loc>https://brandonxiang.top/keynote</loc>
				<lastmod>2024-05-20T12:00:00+00:00</lastmod>
				<priority>0.8</priority>
			</url>
			${articles.map(article => {
				return `<url>
			  <loc>${`https://brandonxiang.top/blog/${article.slug}`}</loc>
				<lastmod>${new Date(article.metadata.date)}</lastmod>
				<priority>0.8</priority>
			</url>`;
			}).join('')}
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}