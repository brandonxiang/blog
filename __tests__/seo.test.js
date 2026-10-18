import { describe, expect, it } from 'vite-plus/test';
import {
	createArticleSeo,
	createSeo,
	defaultSeo,
	SITE_DESCRIPTION,
	SITE_IMAGE,
	SITE_KEYWORDS,
	SITE_NAME,
	SITE_URL,
	toSitemapDate
} from '../src/lib/seo.js';

describe('site constants', () => {
	it('derives the share image from the site url', () => {
		expect(SITE_URL).toBe('https://brandonxiang.top');
		expect(SITE_IMAGE).toBe(`${SITE_URL}/icon/logo-512.png`);
	});

	it('exposes non-empty metadata used by the default tags', () => {
		expect(SITE_NAME.length).toBeGreaterThan(0);
		expect(SITE_DESCRIPTION.length).toBeGreaterThan(0);
		expect(SITE_KEYWORDS.length).toBeGreaterThan(0);
	});
});

describe('defaultSeo', () => {
	it('describes the site as a WebSite schema.org entity', () => {
		expect(defaultSeo).toMatchObject({
			title: SITE_NAME,
			description: SITE_DESCRIPTION,
			keywords: SITE_KEYWORDS,
			url: SITE_URL,
			type: 'website',
			image: SITE_IMAGE
		});

		expect(defaultSeo.jsonLd).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: SITE_NAME,
			url: SITE_URL
		});
	});
});

describe('createSeo', () => {
	it('falls back to the defaults when nothing is overridden', () => {
		expect(createSeo()).toEqual(defaultSeo);
		expect(createSeo({})).toEqual(defaultSeo);
	});

	it('overrides only the provided fields', () => {
		const seo = createSeo({ title: 'Recent Posts', url: `${SITE_URL}/blog` });

		expect(seo.title).toBe('Recent Posts');
		expect(seo.url).toBe(`${SITE_URL}/blog`);
		expect(seo.description).toBe(defaultSeo.description);
		expect(seo.image).toBe(defaultSeo.image);
	});

	it('never mutates the shared default object', () => {
		const seo = createSeo({ title: 'Mutated' });

		expect(seo).not.toBe(defaultSeo);
		expect(defaultSeo.title).toBe(SITE_NAME);
	});
});

describe('toSitemapDate', () => {
	it('normalises a date to a midnight UTC timestamp', () => {
		expect(toSitemapDate('2026-05-13')).toBe('2026-05-13T00:00:00.000Z');
	});

	it('accepts the human readable dates stored in post frontmatter', () => {
		expect(toSitemapDate('May 13, 2026')).toBe('2026-05-13T00:00:00.000Z');
	});
});

describe('createArticleSeo', () => {
	const metadata = {
		title: 'Svelte 3',
		description: 'A short description',
		date: 'May 13, 2026'
	};

	it('builds article metadata pointing at the permalink', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');

		expect(seo.title).toBe(`Svelte 3 - ${SITE_NAME}`);
		expect(seo.description).toBe('A short description');
		expect(seo.url).toBe(`${SITE_URL}/blog/framework-svelte3`);
		expect(seo.type).toBe('article');
	});

	it('merges the post title, category and site keywords', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');

		expect(seo.keywords.split(',')).toEqual(['Svelte 3', 'Framework', ...SITE_KEYWORDS.split(',')]);
	});

	it('omits an empty category from the keywords and defaults the article section', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', undefined);

		expect(seo.keywords.split(',')).toEqual(['Svelte 3', ...SITE_KEYWORDS.split(',')]);
		expect(/** @type {any} */ (seo.jsonLd).articleSection).toBe('Blog');
	});

	it('falls back to the site description when the post has none', () => {
		const seo = createArticleSeo({ title: 'No description', date: 'May 13, 2026' }, 'x', 'Blog');

		expect(seo.description).toBe(SITE_DESCRIPTION);
	});

	it('describes the post as a BlogPosting schema.org entity', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');
		const jsonLd = /** @type {any} */ (seo.jsonLd);

		expect(jsonLd['@type']).toBe('BlogPosting');
		expect(jsonLd.headline).toBe('Svelte 3');
		expect(jsonLd.mainEntityOfPage).toEqual({
			'@type': 'WebPage',
			'@id': `${SITE_URL}/blog/framework-svelte3`
		});
		expect(jsonLd.image).toBe(SITE_IMAGE);
		expect(jsonLd.datePublished).toBe('2026-05-13T00:00:00.000Z');
		expect(jsonLd.dateModified).toBe(jsonLd.datePublished);
	});

	it('serialises to valid JSON-LD', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');

		expect(() => JSON.parse(JSON.stringify(seo.jsonLd))).not.toThrow();
	});
});
