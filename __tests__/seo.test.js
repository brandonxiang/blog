import { describe, expect, it } from 'vite-plus/test';
import {
	createArticleSeo,
	createBreadcrumbJsonLd,
	createPageSeo,
	createProfileSeo,
	createSeo,
	defaultSeo,
	imageMimeType,
	SITE_AUTHOR_URL,
	SITE_DESCRIPTION,
	SITE_IMAGE,
	SITE_IMAGE_ALT,
	SITE_KEYWORDS,
	SITE_NAME,
	SITE_TWITTER,
	SITE_URL,
	toIsoDate,
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

	it('advertises a single language and locale', () => {
		expect(defaultSeo.lang).toBe('zh-CN');
		expect(defaultSeo.locale).toBe('zh_CN');
		expect(defaultSeo.imageAlt).toBe(SITE_IMAGE_ALT);
		expect(defaultSeo.imageWidth).toBe(512);
		expect(defaultSeo.imageHeight).toBe(512);
	});

	it('exposes the author identity used by the head tags', () => {
		expect(SITE_TWITTER).toBe('@xwpisme');
		expect(SITE_AUTHOR_URL).toBe(`${SITE_URL}/blog/other-cv`);
	});
});

describe('imageMimeType', () => {
	it('maps known extensions to their MIME type', () => {
		expect(imageMimeType(`${SITE_URL}/img/a.png`)).toBe('image/png');
		expect(imageMimeType(`${SITE_URL}/img/a.jpeg`)).toBe('image/jpeg');
		expect(imageMimeType(`${SITE_URL}/img/a.JPG`)).toBe('image/jpeg');
		expect(imageMimeType(`${SITE_URL}/img/a.webp`)).toBe('image/webp');
	});

	it('ignores a query string and returns undefined for unknown types', () => {
		expect(imageMimeType('/img/a.gif?v=2')).toBe('image/gif');
		expect(imageMimeType(`${SITE_URL}/img/a.bmp`)).toBeUndefined();
		expect(imageMimeType(`${SITE_URL}/img/no-extension`)).toBeUndefined();
	});
});

describe('toIsoDate', () => {
	it('formats both ISO and human readable dates as a calendar date', () => {
		expect(toIsoDate('May 13, 2026')).toBe('2026-05-13');
		expect(toIsoDate('2026-05-13')).toBe('2026-05-13');
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
		expect(jsonLd.image).toEqual({
			'@type': 'ImageObject',
			url: SITE_IMAGE,
			caption: 'Svelte 3'
		});
		expect(jsonLd.datePublished).toBe('2026-05-13T00:00:00.000Z');
		expect(jsonLd.dateModified).toBe(jsonLd.datePublished);
	});

	it('serialises to valid JSON-LD', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');

		expect(() => JSON.parse(JSON.stringify(seo.jsonLd))).not.toThrow();
	});

	it('prefers the post cover image and records its dimensions and word count', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework', {
			cover: `${SITE_URL}/img/cover.png`,
			coverWidth: 880,
			coverHeight: 440,
			wordCount: 1234,
			modified: 'May 20, 2026'
		});
		const jsonLd = /** @type {any} */ (seo.jsonLd);

		expect(seo.image).toBe(`${SITE_URL}/img/cover.png`);
		expect(seo.imageWidth).toBe(880);
		expect(seo.imageHeight).toBe(440);
		expect(seo.imageAlt).toBe('Svelte 3');
		expect(jsonLd.image).toEqual({
			'@type': 'ImageObject',
			url: `${SITE_URL}/img/cover.png`,
			width: 880,
			height: 440,
			caption: 'Svelte 3'
		});
		expect(jsonLd.wordCount).toBe(1234);
		expect(seo.modifiedTime).toBe('2026-05-20T00:00:00.000Z');
		expect(jsonLd.dateModified).toBe('2026-05-20T00:00:00.000Z');
	});

	it('omits wordCount and keeps dateModified at datePublished without an update', () => {
		const jsonLd = /** @type {any} */ (
			createArticleSeo(metadata, 'framework-svelte3', 'Framework').jsonLd
		);

		expect(jsonLd).not.toHaveProperty('wordCount');
		expect(jsonLd.dateModified).toBe(jsonLd.datePublished);
	});

	it('attaches the blog breadcrumb trail', () => {
		const seo = createArticleSeo(metadata, 'framework-svelte3', 'Framework');
		const breadcrumb = /** @type {any} */ (seo.breadcrumbJsonLd);

		expect(breadcrumb['@type']).toBe('BreadcrumbList');
		expect(breadcrumb.itemListElement.map((/** @type {any} */ item) => item.name)).toEqual([
			'首页',
			'文章',
			'Svelte 3'
		]);
	});
});

describe('createBreadcrumbJsonLd', () => {
	it('numbers the trail from one, preserving order and urls', () => {
		const jsonLd = /** @type {any} */ (
			createBreadcrumbJsonLd([
				{ name: '首页', url: `${SITE_URL}/` },
				{ name: '文章', url: `${SITE_URL}/blog` }
			])
		);

		expect(jsonLd['@context']).toBe('https://schema.org');
		expect(jsonLd['@type']).toBe('BreadcrumbList');
		expect(jsonLd.itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: '首页', item: `${SITE_URL}/` },
			{ '@type': 'ListItem', position: 2, name: '文章', item: `${SITE_URL}/blog` }
		]);
	});

	it('handles an empty trail', () => {
		const jsonLd = /** @type {any} */ (createBreadcrumbJsonLd([]));

		expect(jsonLd.itemListElement).toEqual([]);
	});
});

describe('createPageSeo', () => {
	it('builds a typed page entity with the site suffix, image and breadcrumb', () => {
		const seo = createPageSeo({
			title: '技术文章',
			description: '全部技术文章',
			path: '/blog',
			type: 'Blog'
		});
		const jsonLd = /** @type {any} */ (seo.jsonLd);

		expect(seo.title).toBe(`技术文章 - ${SITE_NAME}`);
		expect(seo.url).toBe(`${SITE_URL}/blog`);
		expect(seo.description).toBe('全部技术文章');
		expect(seo.lang).toBe('zh-CN');
		expect(jsonLd['@type']).toBe('Blog');
		expect(jsonLd['@id']).toBe(`${SITE_URL}/blog#blog`);
		expect(jsonLd.headline).toBe('技术文章');
		expect(jsonLd.isPartOf).toEqual({ '@id': `${SITE_URL}/#website` });
		expect(jsonLd.image).toEqual({
			'@type': 'ImageObject',
			url: SITE_IMAGE,
			width: 512,
			height: 512,
			caption: SITE_IMAGE_ALT
		});
		expect(/** @type {any} */ (seo.breadcrumbJsonLd).itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: '技术文章', item: `${SITE_URL}/blog` }
		]);
	});

	it('defaults the entity type to WebPage', () => {
		const jsonLd = /** @type {any} */ (
			createPageSeo({ title: 'X', description: 'Y', path: '/x' }).jsonLd
		);

		expect(jsonLd['@type']).toBe('WebPage');
		expect(jsonLd['@id']).toBe(`${SITE_URL}/x#webpage`);
	});
});

describe('createProfileSeo', () => {
	it('describes the author page as a ProfilePage tied to the person node', () => {
		const seo = createProfileSeo();
		const jsonLd = /** @type {any} */ (seo.jsonLd);

		expect(seo.url).toBe(`${SITE_URL}/blog/other-cv`);
		expect(seo.type).toBe('article');
		expect(seo.title).toContain('Brandon Xiang');
		expect(jsonLd['@type']).toBe('ProfilePage');
		expect(jsonLd['@id']).toBe(`${SITE_URL}/blog/other-cv#profilepage`);
		expect(jsonLd.mainEntity).toEqual({ '@id': `${SITE_URL}/#person` });
		expect(/** @type {any} */ (seo.breadcrumbJsonLd).itemListElement).toHaveLength(3);
	});

	it('accepts a custom author path', () => {
		const seo = createProfileSeo('/blog/cv');

		expect(seo.url).toBe(`${SITE_URL}/blog/cv`);
	});

	it('reports the CV language, which differs from its Chinese snippet', () => {
		const seo = createProfileSeo(undefined, 'en');

		expect(seo.lang).toBe('en');
		expect(seo.locale).toBe('en_US');
		expect(/** @type {any} */ (seo.jsonLd).inLanguage).toBe('en');
	});
});

describe('createArticleSeo language and image type', () => {
	const metadata = { title: 'Hello', description: 'd', date: 'May 13, 2026' };

	it('reports the post language in og:locale and the JSON-LD graph', () => {
		const english = createArticleSeo(metadata, 'en-post', 'Blog', { lang: 'en' });
		const chinese = createArticleSeo(metadata, 'zh-post', 'Blog');

		expect(english.lang).toBe('en');
		expect(english.locale).toBe('en_US');
		expect(/** @type {any} */ (english.jsonLd).inLanguage).toBe('en');
		expect(chinese.locale).toBe('zh_CN');
	});

	it('derives og:image:type from the cover extension', () => {
		const png = createArticleSeo(metadata, 'a', 'Blog', { cover: `${SITE_URL}/img/a.png` });
		const jpeg = createArticleSeo(metadata, 'b', 'Blog', { cover: `${SITE_URL}/img/a.jpeg` });

		expect(png.imageType).toBe('image/png');
		expect(jpeg.imageType).toBe('image/jpeg');
	});
});

describe('createPageSeo trail', () => {
	it('uses a custom breadcrumb trail when one is given', () => {
		const seo = createPageSeo({
			title: 'Framework 分类文章',
			description: 'd',
			path: '/blog/category/framework',
			type: 'CollectionPage',
			trail: [
				{ name: '首页', url: `${SITE_URL}/` },
				{ name: '文章', url: `${SITE_URL}/blog` },
				{ name: 'Framework 分类文章', url: `${SITE_URL}/blog/category/framework` }
			]
		});
		const breadcrumb = /** @type {any} */ (seo.breadcrumbJsonLd);

		expect(breadcrumb.itemListElement).toHaveLength(3);
		expect(breadcrumb.itemListElement[1]).toMatchObject({ name: '文章', position: 2 });
		expect(/** @type {any} */ (seo.jsonLd)['@id']).toBe(
			`${SITE_URL}/blog/category/framework#collectionpage`
		);
	});
});
