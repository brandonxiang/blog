export const prerender = true;

// Answer engines index and cite this site, so they are welcome explicitly
// rather than via the catch-all below: a named `Allow` survives the tightening
// of the default rule if the site ever starts disallowing crawlers.
const ALLOWED_BOTS = [
	'Googlebot',
	'Google-Extended',
	'Bingbot',
	'GPTBot',
	'ChatGPT-User',
	'OAI-SearchBot',
	'ClaudeBot',
	'anthropic-ai',
	'PerplexityBot',
	'Applebot-Extended',
	'CCBot'
];

export async function GET() {
	const rules = ALLOWED_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');

	return new Response(
		`
${rules}

User-agent: *
Allow: /

Sitemap: https://brandonxiang.top/sitemap.xml

# Answer-engine index, see https://llmstxt.org
Llms-Txt: https://brandonxiang.top/llms.txt
		`.trim(),
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		}
	);
}
