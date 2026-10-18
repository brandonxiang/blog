import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { load, prerender } from '../src/routes/blog/[slug]/+page.server.js';

const mocks = vi.hoisted(() => ({
	process: vi.fn(),
	getRelatedPosts: vi.fn(),
	getCategories: vi.fn()
}));

vi.mock('#lib/markdown.js', () => ({
	process: mocks.process
}));

vi.mock('#lib/getPosts.js', () => ({
	getRelatedPosts: mocks.getRelatedPosts,
	getCategories: mocks.getCategories
}));

beforeEach(() => {
	vi.clearAllMocks();
	mocks.process.mockReturnValue({
		metadata: { title: 'Svelte 3', date: 'May 13, 2026', description: 'd' },
		content: '<p>body</p>',
		category: 'Framework',
		lang: 'zh-CN',
		cover: undefined
	});
	mocks.getRelatedPosts.mockReturnValue([]);
	mocks.getCategories.mockReturnValue([]);
});

describe('load', () => {
	it('is marked as prerenderable', () => {
		expect(prerender).toBe(true);
	});

	it('exposes an ISO date and the resolved category slug', async () => {
		mocks.getCategories.mockReturnValue([{ name: 'Framework', slug: 'framework' }]);

		const data = /** @type {any} */ (
			await load(/** @type {any} */ ({ params: { slug: 'framework-svelte3' } }))
		);

		expect(data.iso).toBe('2026-05-13');
		expect(data.categorySlug).toBe('framework');
		expect(mocks.getRelatedPosts).toHaveBeenCalledWith('framework-svelte3');
	});

	it('carries the post language into the SEO model', async () => {
		mocks.process.mockReturnValue({
			metadata: { title: 'An English post', date: 'May 13, 2026' },
			content: '',
			category: 'Blog',
			lang: 'en'
		});

		const data = /** @type {any} */ (
			await load(/** @type {any} */ ({ params: { slug: 'other-x' } }))
		);

		expect(data.seo.lang).toBe('en');
		expect(data.seo.locale).toBe('en_US');
	});

	it('omits related posts on the author profile page', async () => {
		const data = /** @type {any} */ (
			await load(/** @type {any} */ ({ params: { slug: 'other-cv' } }))
		);

		expect(data.relatedPosts).toEqual([]);
		expect(mocks.getRelatedPosts).not.toHaveBeenCalled();
	});

	it('gives the profile page the language of its English CV body', async () => {
		mocks.process.mockReturnValue({
			metadata: { title: 'About Brandon Xiang', date: 'Dec 16, 2023' },
			content: '',
			category: 'Other',
			lang: 'en'
		});

		const data = /** @type {any} */ (
			await load(/** @type {any} */ ({ params: { slug: 'other-cv' } }))
		);

		expect(data.seo.lang).toBe('en');
		expect(data.seo.locale).toBe('en_US');
		expect(data.seo.url).toBe('https://brandonxiang.top/blog/other-cv');
	});
});
