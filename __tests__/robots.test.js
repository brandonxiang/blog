import { describe, expect, it } from 'vite-plus/test';
import { GET, prerender } from '../src/routes/robots.txt/+server.js';

describe('GET /robots.txt', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('allows every crawler', async () => {
		const body = await (await GET()).text();

		expect(body).toContain('User-agent: *');
		expect(body).toContain('Allow: /');
	});

	it('allows the AI crawlers explicitly', async () => {
		const body = await (await GET()).text();

		for (const agent of ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot']) {
			expect(body).toContain(`User-agent: ${agent}`);
		}
	});

	it('advertises the sitemap location', async () => {
		const body = await (await GET()).text();

		expect(body).toContain('Sitemap: https://brandonxiang.top/sitemap.xml');
	});
});
