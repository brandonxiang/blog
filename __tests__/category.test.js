import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { entries, load, prerender } from '../src/routes/blog/category/[category]/+page.server.js';

const mocks = vi.hoisted(() => ({
	getCategories: vi.fn()
}));

vi.mock('#lib/getPosts.js', () => ({
	getCategories: mocks.getCategories
}));

const framework = {
	name: 'Framework',
	slug: 'framework',
	count: 3,
	posts: [
		{ slug: 'framework-b', title: 'B', description: 'db', date: 'May 5, 2026' },
		{ slug: 'framework-a', title: 'A', description: 'da', date: 'May 1, 2026' }
	]
};

beforeEach(() => {
	vi.clearAllMocks();
	mocks.getCategories.mockReturnValue([]);
});

describe('entries', () => {
	it('lists one prerender entry per qualifying category', () => {
		mocks.getCategories.mockReturnValue([{ slug: 'framework' }, { slug: 'tool' }]);

		expect(entries()).toEqual([{ category: 'framework' }, { category: 'tool' }]);
	});
});

describe('load', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('builds a CollectionPage with an ISO date on every post', async () => {
		mocks.getCategories.mockReturnValue([framework]);

		const data = /** @type {any} */ (
			await load(/** @type {any} */ ({ params: { category: 'framework' } }))
		);
		const jsonLd = /** @type {any} */ (data.seo.jsonLd);

		expect(data.category).toEqual({ name: 'Framework', slug: 'framework', count: 3 });
		expect(data.posts[0]).toMatchObject({ slug: 'framework-b', iso: '2026-05-05' });
		expect(data.intro.length).toBeGreaterThan(0);
		expect(jsonLd['@type']).toBe('CollectionPage');
		expect(jsonLd['@id']).toBe('https://brandonxiang.top/blog/category/framework#collectionpage');
		expect(/** @type {any} */ (data.seo.breadcrumbJsonLd).itemListElement).toHaveLength(3);
	});

	it('throws a 404 for a category that has no hub page', async () => {
		mocks.getCategories.mockReturnValue([framework]);

		await expect(load(/** @type {any} */ ({ params: { category: 'ai' } }))).rejects.toThrow();
	});
});
