import dayjs from 'dayjs';

export const SITE_URL = 'https://brandonxiang.top';
export const SITE_NAME = 'BrandonXIANG Blog';
export const SITE_AUTHOR = 'Brandon Xiang';
export const SITE_IMAGE = `${SITE_URL}/icon/logo-512.png`;
export const SITE_KEYWORDS =
	'Brandon Xiang,BrandonXIANG Blog,frontend engineering,Svelte,React,PWA,AI tools,Python,前端工程化,前端技术,技术博客';
export const SITE_DESCRIPTION =
	'BrandonXIANG Blog 记录前端工程化、Svelte、React、PWA、AI 工具与 Python 实践，分享可复用的技术思考和项目经验。';

/**
 * @typedef {Object} Seo
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} url
 * @property {string} type
 * @property {string} image
 * @property {unknown} jsonLd
 */

/** @type {Seo} */
export const defaultSeo = {
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	url: SITE_URL,
	type: 'website',
	image: SITE_IMAGE,
	jsonLd: {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		inLanguage: ['zh-CN', 'en'],
		publisher: {
			'@type': 'Person',
			name: SITE_AUTHOR,
			url: SITE_URL,
			sameAs: ['https://github.com/brandonxiang']
		}
	}
};

/**
 * @param {Partial<Seo>} seo
 */
export function createSeo(seo = {}) {
	return {
		...defaultSeo,
		...seo
	};
}

/**
 * @param {string} date
 */
export function toSitemapDate(date) {
	return `${dayjs(date).format('YYYY-MM-DD')}T00:00:00.000Z`;
}

/**
 * @param {{title: string; description?: string; date: string}} metadata
 * @param {string | undefined} slug
 * @param {string | undefined} category
 */
export function createArticleSeo(metadata, slug, category) {
	const url = `${SITE_URL}/blog/${slug}`;
	const title = `${metadata.title} - ${SITE_NAME}`;
	const description = metadata.description || SITE_DESCRIPTION;
	const publishedDate = toSitemapDate(metadata.date);

	return createSeo({
		title,
		description,
		url,
		type: 'article',
		keywords: [metadata.title, category, SITE_KEYWORDS].filter(Boolean).join(','),
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: metadata.title,
			description,
			url,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': url
			},
			image: SITE_IMAGE,
			datePublished: publishedDate,
			dateModified: publishedDate,
			articleSection: category || 'Blog',
			inLanguage: ['zh-CN', 'en'],
			author: {
				'@type': 'Person',
				name: SITE_AUTHOR,
				url: SITE_URL,
				sameAs: ['https://github.com/brandonxiang']
			},
			publisher: {
				'@type': 'Person',
				name: SITE_AUTHOR,
				url: SITE_URL,
				sameAs: ['https://github.com/brandonxiang']
			}
		}
	});
}
