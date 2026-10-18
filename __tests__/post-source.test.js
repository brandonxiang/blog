import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { entries, GET, prerender } from '../src/routes/blog/[slug].md/+server.js';
import { SITE_URL } from '../src/lib/seo.js';

const mocks = vi.hoisted(() => ({
	getPosts: vi.fn(),
	getPostSource: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getPosts: mocks.getPosts
}));

vi.mock('#lib/markdown.js', () => ({
	getPostSource: mocks.getPostSource
}));

/**
 * @param {string} slug
 */
function callGet(slug) {
	return GET(/** @type {any} */ ({ params: { slug } }));
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getPosts.mockReturnValue([]);
});

describe('GET /blog/[slug].md', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('lists a source entry for every slugged post', () => {
		mocks.getPosts.mockReturnValue([
			{ slug: 'framework-svelte3' },
			{ slug: 'ai-skill' },
			{ metadata: { title: 'No slug' } }
		]);

		expect(entries()).toEqual([{ slug: 'framework-svelte3' }, { slug: 'ai-skill' }]);
	});

	it('maps the route slug back to the markdown file and serves it verbatim', async () => {
		mocks.getPostSource.mockReturnValue('---\ntitle: Svelte 3\n---\n\nBody\n');

		const response = await callGet('framework-svelte3');

		expect(mocks.getPostSource).toHaveBeenCalledWith('posts/framework/svelte3.md');
		expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
		expect(response.headers.get('Content-Language')).toBe('zh-CN');
		expect(await response.text()).toBe(
			`> ${SITE_URL}/blog/framework-svelte3\n\n---\ntitle: Svelte 3\n---\n\nBody\n`
		);
	});

	it('only splits on the first dash so multi-dash slugs resolve', async () => {
		mocks.getPostSource.mockReturnValue('body');

		await callGet('framework-svelte3-and-more');

		expect(mocks.getPostSource).toHaveBeenCalledWith('posts/framework/svelte3-and-more.md');
	});

	it('throws a 404 when the post has no source', () => {
		mocks.getPostSource.mockImplementation(() => {
			throw new Error('ENOENT');
		});

		expect(() => callGet('missing-post')).toThrow();
	});
});
