import dayjs from 'dayjs';

export const SITE_URL = 'https://brandonxiang.top';
export const SITE_NAME = 'BrandonXIANG Blog';
export const SITE_AUTHOR = 'Brandon Xiang';
export const SITE_IMAGE = `${SITE_URL}/icon/logo-512.png`;
export const SITE_IMAGE_WIDTH = 512;
export const SITE_IMAGE_HEIGHT = 512;
export const SITE_IMAGE_ALT = 'BrandonXIANG Blog';

export const SITE_KEYWORDS =
	'Brandon Xiang,BrandonXIANG Blog,frontend engineering,Svelte,React,PWA,AI tools,Python,前端工程化,前端技术,技术博客';
export const SITE_DESCRIPTION =
	'BrandonXIANG Blog 记录前端工程化、Svelte、React、PWA、AI 工具与 Python 实践，分享可复用的技术思考和项目经验。';

/**
 * The site is Chinese-first, but individual posts are written in English too.
 * `lang` travels with every page so the crawler is told which language it is
 * actually looking at instead of inheriting a single site-wide guess.
 */
export const SITE_LANG = 'zh-CN';
export const SITE_LOCALE = 'zh_CN';

/** The `og:locale` each page language maps to, for the `og:locale` tag. */
const LOCALE_BY_LANG = {
	'zh-CN': SITE_LOCALE,
	en: 'en_US'
};

/**
 * @param {string} lang
 * @returns {string}
 */
function toLocale(lang) {
	return LOCALE_BY_LANG[/** @type {keyof typeof LOCALE_BY_LANG} */ (lang)] ?? SITE_LOCALE;
}

/** The author's X handle, used for `twitter:site` / `twitter:creator`. */
export const SITE_TWITTER = '@xwpisme';

/** The on-site author page. Posts point here instead of sending link equity to GitHub. */
export const SITE_AUTHOR_URL = `${SITE_URL}/blog/other-cv`;

/**
 * Profiles that establish the author as the same entity everywhere. Both are
 * self-declared from `github.com/brandonxiang`, which lists the X handle in its
 * profile README.
 */
const AUTHOR_PROFILES = ['https://github.com/brandonxiang', 'https://x.com/xwpisme'];

/** Stable `@id` so the author and publisher nodes dedupe across pages. */
const PERSON_ID = `${SITE_URL}/#person`;

const PERSON = {
	'@type': 'Person',
	'@id': PERSON_ID,
	name: SITE_AUTHOR,
	url: SITE_AUTHOR_URL,
	sameAs: AUTHOR_PROFILES
};

/** MIME type per image extension, so `og:image:type` stops claiming everything is a PNG. */
/** @type {Record<string, string>} */
const IMAGE_MIME_TYPES = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp',
	avif: 'image/avif',
	svg: 'image/svg+xml'
};

/**
 * @param {string} url
 * @returns {string | undefined}
 */
export function imageMimeType(url) {
	const match = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(url);

	return match ? IMAGE_MIME_TYPES[match[1].toLowerCase()] : undefined;
}

/**
 * schema.org image object. Written as a type literal because `@property`
 * cannot express a quoted key such as `@type`.
 *
 * @typedef {{
 *   '@type'?: string,
 *   url: string,
 *   width?: number,
 *   height?: number,
 *   alt?: string,
 *   caption?: string
 * }} ImageMeta
 */

/**
 * @param {string} url
 * @param {number | undefined} width
 * @param {number | undefined} height
 * @param {string | undefined} alt
 * @returns {ImageMeta}
 */
function toImageMeta(url, width, height, alt) {
	/** @type {ImageMeta} */
	const image = { '@type': 'ImageObject', url };

	if (width) image.width = width;
	if (height) image.height = height;
	if (alt) image.caption = alt;

	return image;
}

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} name
 * @property {string} url
 */

/**
 * Breadcrumbs are emitted as their own JSON-LD block rather than being merged
 * into the page graph: `BlogPosting` and `BreadcrumbList` are unrelated types
 * and sibling top-level keys are not valid JSON-LD.
 *
 * @param {BreadcrumbItem[]} trail
 * @returns {unknown}
 */
export function createBreadcrumbJsonLd(trail) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

/** Trail shared by every page that lives under the blog index. */
const BLOG_TRAIL = [
	{ name: '首页', url: `${SITE_URL}/` },
	{ name: '文章', url: `${SITE_URL}/blog` }
];

/**
 * @typedef {Object} Seo
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} url
 * @property {string} type
 * @property {string} image
 * @property {string} [imageAlt]
 * @property {string} [imageType]
 * @property {number} [imageWidth]
 * @property {number} [imageHeight]
 * @property {string} lang
 * @property {string} locale
 * @property {string} [publishedTime]
 * @property {string} [modifiedTime]
 * @property {string} [section]
 * @property {unknown} jsonLd
 * @property {unknown} [breadcrumbJsonLd]
 */

/** @type {Seo} */
export const defaultSeo = {
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	url: SITE_URL,
	type: 'website',
	image: SITE_IMAGE,
	imageAlt: SITE_IMAGE_ALT,
	imageType: 'image/png',
	imageWidth: SITE_IMAGE_WIDTH,
	imageHeight: SITE_IMAGE_HEIGHT,
	lang: SITE_LANG,
	locale: SITE_LOCALE,
	jsonLd: {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		name: SITE_NAME,
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		inLanguage: SITE_LANG,
		publisher: PERSON
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
 * The value for a `<time datetime="...">` attribute: a bare calendar date.
 *
 * @param {string} date
 */
export function toIsoDate(date) {
	return dayjs(date).format('YYYY-MM-DD');
}

/**
 * SEO for a standalone section page (`/keynote`, `/app`, `/privacy`, `/blog`, a
 * category listing).
 *
 * @param {{title: string; description: string; path: string; type?: string; lang?: string; trail?: BreadcrumbItem[]}} options
 * @returns {Seo}
 */
export function createPageSeo({
	title,
	description,
	path,
	type = 'WebPage',
	lang = SITE_LANG,
	trail
}) {
	const url = `${SITE_URL}${path}`;

	return createSeo({
		title: `${title} - ${SITE_NAME}`,
		description,
		url,
		lang,
		locale: toLocale(lang),
		breadcrumbJsonLd: createBreadcrumbJsonLd(trail ?? [{ name: title, url }]),
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': type,
			'@id': `${url}#${type.toLowerCase()}`,
			name: title,
			headline: title,
			description,
			url,
			inLanguage: lang,
			isPartOf: { '@id': `${SITE_URL}/#website` },
			image: toImageMeta(SITE_IMAGE, SITE_IMAGE_WIDTH, SITE_IMAGE_HEIGHT, SITE_IMAGE_ALT),
			breadcrumb: { '@id': `${url}#breadcrumb` }
		}
	});
}

/**
 * SEO for the author page. The post itself carries a placeholder description
 * ("Brandonxiang's CV, Weiping.xiang's CV") that is useless in a SERP, so the
 * summary is written here instead and the page is typed as a `ProfilePage` to
 * hand the crawler a proper author entity to attach to every post.
 *
 * @param {string} path
 * @param {string} [lang] The language of the CV body. The CV is written in
 *   English while the snippet above is Chinese, so the body language has to be
 *   passed in rather than assumed, or `og:locale` contradicts `<html lang>`.
 * @returns {Seo}
 */
export function createProfileSeo(path = '/blog/other-cv', lang = SITE_LANG) {
	const url = `${SITE_URL}${path}`;
	const title = `${SITE_AUTHOR} 的简历与联系方式`;
	const description =
		'Brandon Xiang（项伟平）的前端工程师简历：工作经历、技术栈与开源项目，联系方式与社交账号。';

	return createSeo({
		title: `${title} - ${SITE_NAME}`,
		description,
		url,
		type: 'article',
		imageAlt: `${SITE_AUTHOR} 的头像`,
		lang,
		locale: toLocale(lang),
		breadcrumbJsonLd: createBreadcrumbJsonLd([...BLOG_TRAIL, { name: title, url }]),
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			'@id': `${url}#profilepage`,
			name: title,
			description,
			url,
			inLanguage: lang,
			isPartOf: { '@id': `${SITE_URL}/#website` },
			mainEntity: { '@id': PERSON_ID },
			breadcrumb: { '@id': `${url}#breadcrumb` }
		}
	});
}

/**
 * @typedef {Object} ArticleExtras
 * @property {string} [cover] Absolute URL of the post cover image
 * @property {number} [coverWidth]
 * @property {number} [coverHeight]
 * @property {string} [modified] Frontmatter `updated` date, when the post has one
 * @property {number} [wordCount]
 * @property {string} [lang] The language the post body is actually written in
 */

/**
 * @param {{title: string; description?: string; date: string}} metadata
 * @param {string | undefined} slug
 * @param {string | undefined} category
 * @param {ArticleExtras} [extras]
 * @returns {Seo}
 */
export function createArticleSeo(metadata, slug, category, extras = {}) {
	const url = `${SITE_URL}/blog/${slug}`;
	const title = `${metadata.title} - ${SITE_NAME}`;
	const description = metadata.description || SITE_DESCRIPTION;
	const publishedDate = toSitemapDate(metadata.date);
	const modifiedDate = extras.modified ? toSitemapDate(extras.modified) : publishedDate;
	const section = category || 'Blog';
	const cover = extras.cover || SITE_IMAGE;
	const coverAlt = metadata.title;
	// The body language travels with the post, so an English article does not
	// advertise itself as `zh-CN` in `og:locale` or the JSON-LD graph.
	const lang = extras.lang || SITE_LANG;

	return createSeo({
		title,
		description,
		url,
		type: 'article',
		keywords: [metadata.title, category, SITE_KEYWORDS].filter(Boolean).join(','),
		image: cover,
		imageAlt: coverAlt,
		imageType: imageMimeType(cover) ?? 'image/png',
		imageWidth: extras.coverWidth || SITE_IMAGE_WIDTH,
		imageHeight: extras.coverHeight || SITE_IMAGE_HEIGHT,
		lang,
		locale: toLocale(lang),
		publishedTime: publishedDate,
		modifiedTime: modifiedDate,
		section,
		breadcrumbJsonLd: createBreadcrumbJsonLd([...BLOG_TRAIL, { name: metadata.title, url }]),
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			'@id': `${url}#post`,
			headline: metadata.title,
			description,
			url,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': url
			},
			image: toImageMeta(cover, extras.coverWidth, extras.coverHeight, coverAlt),
			datePublished: publishedDate,
			dateModified: modifiedDate,
			articleSection: section,
			inLanguage: lang,
			keywords: [metadata.title, category].filter(Boolean),
			...(extras.wordCount ? { wordCount: extras.wordCount } : {}),
			isAccessibleForFree: true,
			isPartOf: { '@id': `${SITE_URL}/#website` },
			author: PERSON,
			publisher: PERSON
		}
	});
}
