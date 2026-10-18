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

		for (const agent of [
			'GPTBot',
			'ChatGPT-User',
			'OAI-SearchBot',
			'ClaudeBot',
			'anthropic-ai',
			'PerplexityBot',
			'Google-Extended',
			'Applebot-Extended',
			'CCBot'
		]) {
			expect(body).toContain(`User-agent: ${agent}`);
		}
	});

	it('advertises the sitemap location', async () => {
		const body = await (await GET()).text();

		expect(body).toContain('Sitemap: https://brandonxiang.top/sitemap.xml');
	});

	it('points answer engines at the llms.txt index', async () => {
		const body = await (await GET()).text();

		expect(body).toContain('Llms-Txt: https://brandonxiang.top/llms.txt');
	});
});
