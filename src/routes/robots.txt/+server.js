export const prerender = true;

export async function GET() {
	return new Response(
		`
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: *
Allow: /

Sitemap: https://brandonxiang.top/sitemap.xml
		`.trim()
	);
}
