import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { GET } from '../src/routes/sitemap.xml/+server.js';

const mocks = vi.hoisted(() => ({
	getPosts: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getPosts: mocks.getPosts
}));

/**
 * @param {string} title
 * @param {string} date
 * @param {string} [slug]
 */
function makePost(title, date, slug = title.toLowerCase().replace(/\s+/g, '-')) {
	return {
		metadata: { title, date },
		slug,
		category: 'Blog'
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getPosts.mockReturnValue([]);
});

describe('GET /sitemap.xml', () => {
	it('is marked as prerenderable', async () => {
		const { prerender } = await import('../src/routes/sitemap.xml/+server.js');
		expect(prerender).toBe(true);
	});

	it('returns an XML sitemap with the sitemap content type', async () => {
		const response = await GET();

		expect(response.headers.get('Content-Type')).toBe('application/xml');
		expect(await response.text()).toContain('<urlset');
	});

	it('lists every static route', async () => {
		const body = await (await GET()).text();

		for (const path of ['', '/blog', '/app', '/keynote', '/privacy']) {
			expect(body).toContain(`<loc>https://brandonxiang.top${path}</loc>`);
		}
	});

	it('lists posts newest first', async () => {
		mocks.getPosts.mockReturnValue([
			makePost('Old', 'May 1, 2026', 'old'),
			makePost('New', 'May 13, 2026', 'new')
		]);

		const body = await (await GET()).text();

		expect(body).toContain('<loc>https://brandonxiang.top/blog/new</loc>');
		expect(body).toContain('<lastmod>2026-05-13T00:00:00.000Z</lastmod>');
		expect(body.indexOf('/blog/new')).toBeLessThan(body.indexOf('/blog/old'));
	});
});
