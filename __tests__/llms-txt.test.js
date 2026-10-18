import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { GET, prerender } from '../src/routes/llms.txt/+server.js';
import { SITE_DESCRIPTION, SITE_NAME } from '../src/lib/seo.js';

const mocks = vi.hoisted(() => ({
	getPosts: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getPosts: mocks.getPosts
}));

/**
 * @param {string} title
 * @param {string} date
 * @param {string} slug
 * @param {string} category
 * @param {string} [description]
 */
function makePost(title, date, slug, category, description) {
	return { metadata: { title, date, description }, slug, category };
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getPosts.mockReturnValue([]);
});

/** The handler is typed as a SvelteKit `RequestHandler`, so it needs an event. */
function get() {
	return GET(/** @type {any} */ ({}));
}

describe('GET /llms.txt', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('is served as markdown and opens with the site identity', async () => {
		const response = await get();
		const body = await response.text();

		expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
		expect(body.startsWith(`# ${SITE_NAME}`)).toBe(true);
		expect(body).toContain(`> ${SITE_DESCRIPTION}`);
	});

	it('lists the site entry points', async () => {
		const body = await (await get()).text();

		expect(body).toContain('[文章索引](https://brandonxiang.top/blog)');
		expect(body).toContain('[RSS](https://brandonxiang.top/rss.xml)');
		expect(body).toContain('[关于作者](https://brandonxiang.top/blog/other-cv)');
	});

	it('groups posts under a Chinese category heading and links the markdown source', async () => {
		mocks.getPosts.mockReturnValue([
			makePost('Svelte 3', 'May 13, 2026', 'framework-svelte3', 'framework', 'A summary')
		]);

		const body = await (await get()).text();

		expect(body).toContain('## 前端框架');
		expect(body).toContain(
			'- [Svelte 3](https://brandonxiang.top/blog/framework-svelte3.md): A summary'
		);
	});

	it('orders posts newest first', async () => {
		mocks.getPosts.mockReturnValue([
			makePost('Old', 'May 1, 2026', 'ai-old', 'ai', 'old'),
			makePost('New', 'May 13, 2026', 'ai-new', 'ai', 'new')
		]);

		const body = await (await get()).text();

		expect(body.indexOf('/blog/ai-new.md')).toBeLessThan(body.indexOf('/blog/ai-old.md'));
		expect(body).toContain('## AI 工具与实践');
	});

	it('skips posts that have no slug', async () => {
		mocks.getPosts.mockReturnValue([
			{ metadata: { title: 'No slug', date: 'May 13, 2026' }, category: 'ai' }
		]);

		const body = await (await get()).text();

		expect(body).not.toContain('No slug');
	});

	it('falls back to the raw category when there is no title mapping', async () => {
		mocks.getPosts.mockReturnValue([
			makePost('Misc', 'May 13, 2026', 'misc-thing', 'unknown-category', 'x')
		]);

		const body = await (await get()).text();

		expect(body).toContain('## unknown-category');
	});
});
