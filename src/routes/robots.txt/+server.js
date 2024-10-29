export const prerender = true;

export async function GET() {

	return new Response(
		`
User-agent: Googlebot
Disallow: /keynote/

User-agent: Googlebot
Disallow: /app/

User-agent: *
Allow: /

Sitemap: https://brandonxiang.top/sitemap.xml
		`.trim()
	);
}