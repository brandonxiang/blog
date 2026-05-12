import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPostContent, getPosts } from './getPosts.js';

const mocks = vi.hoisted(() => ({
	globSync: vi.fn(),
	processPost: vi.fn()
}));

vi.mock('fast-glob', () => ({
	default: {
		sync: mocks.globSync
	}
}));

vi.mock('$lib/markdown', () => ({
	process: mocks.processPost
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe('getPosts', () => {
	it('reads markdown posts and derives URL slugs from their paths', () => {
		mocks.globSync.mockReturnValue(['posts/framework/svelte3.md', 'posts/python/python1.md']);
		mocks.processPost.mockImplementation((pathname) => ({
			metadata: {
				title: pathname,
				date: 'May 13, 2026'
			},
			content: '<p>content</p>',
			slug: 'ignored'
		}));

		expect(getPosts()).toEqual([
			{
				metadata: {
					title: 'posts/framework/svelte3.md',
					date: 'May 13, 2026'
				},
				slug: 'framework-svelte3'
			},
			{
				metadata: {
					title: 'posts/python/python1.md',
					date: 'May 13, 2026'
				},
				slug: 'python-python1'
			}
		]);
		expect(mocks.globSync).toHaveBeenCalledWith('posts/*/*.md');
		expect(mocks.processPost).toHaveBeenNthCalledWith(1, 'posts/framework/svelte3.md');
		expect(mocks.processPost).toHaveBeenNthCalledWith(2, 'posts/python/python1.md');
	});
});

describe('getPostContent', () => {
	it('maps a route slug back to the markdown file path', () => {
		const post = {
			metadata: {
				title: 'Svelte 3',
				date: 'May 13, 2026'
			},
			content: '<p>post</p>',
			slug: 'posts/framework/svelte3'
		};
		mocks.processPost.mockReturnValue(post);

		expect(getPostContent('framework-svelte3')).toBe(post);
		expect(mocks.processPost).toHaveBeenCalledWith('posts/framework/svelte3.md');
	});
});
