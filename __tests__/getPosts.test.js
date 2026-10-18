import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { getPostContent, getPosts } from '../src/lib/getPosts.js';
import { apps, keynotes } from '../src/lib/showcaseData.js';

const mocks = vi.hoisted(() => ({
	processPost: vi.fn()
}));

vi.mock('#lib/markdown.js', () => ({
	process: mocks.processPost
}));

/**
 * `getPosts` scans the real filesystem, so the test builds a throwaway `posts`
 * tree inside a temporary directory and runs from there.
 *
 * @param {Record<string, string[]>} tree Category directory to markdown files
 */
function withPostsTree(tree) {
	const root = mkdtempSync(join(tmpdir(), 'blog-posts-test-'));
	const cwd = process.cwd();

	for (const [category, files] of Object.entries(tree)) {
		const dir = join(root, 'posts', category);
		mkdirSync(dir, { recursive: true });

		for (const file of files) {
			writeFileSync(join(dir, file), `---\ntitle: ${file}\ndate: 2026-05-13\n---\n`);
		}
	}

	// A stray file that must not be picked up.
	writeFileSync(join(root, 'posts', 'README.md'), '# not a post');

	process.chdir(root);

	return () => {
		process.chdir(cwd);
		rmSync(root, { recursive: true, force: true });
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	// Mirrors the real `process()`, which derives the category from the
	// directory the post lives in.
	mocks.processPost.mockImplementation((pathname) => {
		const category = pathname.split('/')[1];

		return {
			metadata: { title: pathname, date: 'May 13, 2026' },
			content: '<p>content</p>',
			category: category.charAt(0).toUpperCase() + category.slice(1)
		};
	});
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('getPosts', () => {
	it('reads markdown posts and derives URL slugs from their paths', () => {
		const restore = withPostsTree({
			framework: ['svelte3.md'],
			python: ['python1.md']
		});

		try {
			expect(getPosts()).toEqual([
				{
					metadata: {
						title: expect.any(String),
						date: 'May 13, 2026'
					},
					category: 'Framework',
					slug: 'framework-svelte3'
				},
				{
					metadata: {
						title: expect.any(String),
						date: 'May 13, 2026'
					},
					category: 'Python',
					slug: 'python-python1'
				}
			]);

			expect(mocks.processPost).toHaveBeenCalledWith('posts/framework/svelte3.md');
			expect(mocks.processPost).toHaveBeenCalledWith('posts/python/python1.md');
		} finally {
			restore();
		}
	});

	it('ignores markdown files that sit outside a category directory', () => {
		const restore = withPostsTree({ framework: ['svelte3.md'] });

		try {
			expect(getPosts().map((post) => post.slug)).toEqual(['framework-svelte3']);
		} finally {
			restore();
		}
	});

	it('returns an empty list when the posts directory is missing', () => {
		const cwd = process.cwd();
		const root = mkdtempSync(join(tmpdir(), 'blog-posts-test-'));
		process.chdir(root);

		try {
			expect(getPosts()).toEqual([]);
		} finally {
			process.chdir(cwd);
			rmSync(root, { recursive: true, force: true });
		}
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

describe('showcaseData', () => {
	it('keeps slide and app resources available for the shared showcase tabs', () => {
		expect(keynotes.length).toBeGreaterThan(0);
		expect(apps.length).toBeGreaterThan(0);

		expect(keynotes[0]).toEqual(
			expect.objectContaining({
				title: expect.any(String),
				url: expect.stringMatching(/^https:\/\//),
				date: expect.any(String)
			})
		);

		expect(apps[0]).toEqual(
			expect.objectContaining({
				title: expect.any(String),
				url: expect.stringMatching(/^https:\/\//),
				description: expect.any(String)
			})
		);
	});
});
