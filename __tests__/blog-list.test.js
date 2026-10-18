import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { load, prerender } from '../src/routes/blog/+page.server.js';

const mocks = vi.hoisted(() => ({
	getPosts: vi.fn(),
	getCategories: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getPosts: mocks.getPosts,
	getCategories: mocks.getCategories
}));

/**
 * @param {string} title
 * @param {string} date
 */
function makePost(title, date) {
	return {
		metadata: { title, date },
		slug: title.toLowerCase().replace(/\s+/g, '-'),
		category: 'Blog'
	};
}

/**
 * @typedef {Object} TestPost
 * @property {{title: string; date: string}} metadata
 * @property {string} [slug]
 * @property {string} [redirect]
 * @property {string} [iso]
 * @property {string} [categorySlug]
 */

/**
 * @returns {Promise<{posts: TestPost[]; seo: {title: string; url: string; description: string}}>}
 */
async function loadPage() {
	return /** @type {any} */ (await load(/** @type {any} */ ({})));
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getPosts.mockReturnValue([]);
	mocks.getCategories.mockReturnValue([]);
});

describe('load', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('merges markdown posts with the Notion posts', async () => {
		mocks.getPosts.mockReturnValue([makePost('Local', 'May 13, 2026')]);

		const { posts } = await loadPage();
		const notion = posts.filter((post) => post.redirect !== undefined);

		expect(posts).toHaveLength(5);
		expect(notion).toHaveLength(4);
		expect(posts.some((post) => post.slug === 'local')).toBe(true);
	});

	it('sorts every post by date, newest first', async () => {
		mocks.getPosts.mockReturnValue([makePost('Local', 'May 13, 2026')]);

		const { posts } = await loadPage();
		const timestamps = posts.map((post) => +new Date(post.metadata.date));

		expect([...timestamps].sort((a, b) => b - a)).toEqual(timestamps);
		expect(posts[0].metadata.date).toBe('May 13, 2026');
	});

	it('returns SEO metadata for the listing page', async () => {
		const { seo } = await loadPage();

		expect(seo.title).toBe('技术文章 - BrandonXIANG Blog');
		expect(seo.url).toBe('https://brandonxiang.top/blog');
		expect(seo.description.length).toBeGreaterThan(0);
	});

	it('adds an ISO date and a category link to each post', async () => {
		mocks.getPosts.mockReturnValue([makePost('Local', 'May 13, 2026')]);
		mocks.getCategories.mockReturnValue([{ name: 'Blog', slug: 'blog' }]);

		const { posts } = await loadPage();
		const local = posts.find((post) => post.slug === 'local');

		expect(local?.iso).toBe('2026-05-13');
		expect(local?.categorySlug).toBe('blog');
	});

	it('leaves posts in categories without a hub page unlinked', async () => {
		mocks.getPosts.mockReturnValue([makePost('Local', 'May 13, 2026')]);

		const { posts } = await loadPage();
		const local = posts.find((post) => post.slug === 'local');

		expect(local?.categorySlug).toBeUndefined();
	});
});
