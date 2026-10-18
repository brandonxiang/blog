import { getPostLanguage } from '#lib/markdown.js';
import { SITE_LANG } from '#lib/seo.js';

/**
 * The site is Chinese-first, but a handful of posts are written in English.
 * Every page used to inherit `<html lang="zh-CN">` from `app.html`, so those
 * posts were advertised to the crawler as Chinese.
 *
 * `<html lang>` lives in the static shell, which is rendered before the page
 * load function runs, so the language is resolved here from the post body and
 * patched into the HTML on the way out.
 */

/** @type {Map<string, string>} */
const langCache = new Map();

/**
 * @param {string} pathname
 * @returns {string}
 */
function resolveLang(pathname) {
	const match = /^\/blog\/([\w-]+)$/.exec(pathname);

	if (!match) return SITE_LANG;

	const slug = match[1];
	const cached = langCache.get(slug);

	if (cached) return cached;

	// Slugs are `<category>-<name>`, so only the first dash separates them.
	const lang = getPostLanguage(`posts/${slug.replace('-', '/')}.md`);

	langCache.set(slug, lang);

	return lang;
}

/** @type {import('@sveltejs/kit/hooks').Handle} */
export const handle = async ({ event, resolve }) => {
	const lang = resolveLang(event.url.pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			lang === SITE_LANG ? html : html.replace('<html lang="zh-CN"', `<html lang="${lang}"`)
	});
};
