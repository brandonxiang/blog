import { error } from '@sveltejs/kit';
import { getPosts } from '#lib/getPosts.js';
import { getPostSource } from '#lib/markdown.js';
import { SITE_LANG, SITE_URL } from '#lib/seo.js';

export const prerender = true;

/**
 * The prerenderer only follows `<a>` elements, and these sources are referenced
 * from the plain-text body of `/llms.txt` rather than from a page, so without
 * this the route is marked prerenderable but never generated.
 *
 * @type {import('./$types').EntryGenerator}
 */
export function entries() {
	return getPosts()
		.map((post) => post.slug)
		.filter((slug) => typeof slug === 'string')
		.map((slug) => ({ slug }));
}

/**
 * Serves the authored markdown for a post.
 *
 * `robots.txt` already welcomes GPTBot, ClaudeBot and PerplexityBot, but those
 * crawlers only ever see rendered HTML, where headings, code blocks and callouts
 * lose their structure. Pointing them at the source lets them quote the post
 * verbatim instead of summarising a lossy representation of it.
 *
 * @type {import('./$types').RequestHandler}
 */
export function GET({ params }) {
	const { slug } = params;

	// Slugs are `<category>-<name>`, so only the first dash separates them.
	/** @type {string} */
	let source;

	try {
		source = getPostSource(`posts/${slug.replace('-', '/')}.md`);
	} catch {
		error(404, 'post not found');
	}

	return new Response(`> ${SITE_URL}/blog/${slug}\n\n${source}`, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Language': SITE_LANG,
			'Cache-Control': 'public, max-age=0, s-maxage=31536000, immutable'
		}
	});
}
