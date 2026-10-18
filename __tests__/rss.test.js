import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { GET } from '../src/routes/rss.xml/+server.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../src/lib/seo.js';

const mocks = vi.hoisted(() => ({
	getPosts: vi.fn(),
	getPostContent: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getPosts: mocks.getPosts,
	getPostContent: mocks.getPostContent
}));

/**
 * @param {string} title
 * @param {string} date
 * @param {string} [slug]
 */
function makePost(title, date, slug = title.toLowerCase().replace(/\s+/g, '-')) {
	return {
		metadata: { title, date, description: `${title} description` },
		slug,
		category: 'Blog'
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getPosts.mockReturnValue([]);
	mocks.getPostContent.mockReturnValue({ content: '<p>body</p>' });
});

describe('GET /rss.xml', () => {
	it('is marked as prerenderable', async () => {
		const { prerender } = await import('../src/routes/rss.xml/+server.js');
		expect(prerender).toBe(true);
	});

	it('returns an RSS document', async () => {
		const response = await GET();
		const body = await response.text();

		expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8');
		expect(body).toContain('<rss version="2.0"');
		expect(body).toContain(`<title>${SITE_NAME}</title>`);
		expect(body).toContain(`<link>${SITE_URL}/</link>`);
		expect(body).toContain(SITE_DESCRIPTION);
	});

	it('emits one item per post, newest first', async () => {
		mocks.getPosts.mockReturnValue([
			makePost('Old', 'May 1, 2026', 'old'),
			makePost('New', 'May 13, 2026', 'new')
		]);

		const body = await (await GET()).text();

		expect(mocks.getPostContent).toHaveBeenCalledWith('new');
		expect(body).toContain('<link>https://brandonxiang.top/blog/new</link>');
		expect(body.indexOf('/blog/new')).toBeLessThan(body.indexOf('/blog/old'));
	});

	it('embeds the rendered post content in the item body', async () => {
		mocks.getPosts.mockReturnValue([makePost('New', 'May 13, 2026', 'new')]);
		mocks.getPostContent.mockReturnValue({ content: '<p>hello <strong>world</strong></p>' });

		const body = await (await GET()).text();

		expect(body).toContain('hello');
		expect(body).toContain('world');
	});
});
