import { getCategories, getRelatedPosts } from '#lib/getPosts.js';
import { process } from '#lib/markdown.js';
import { createArticleSeo, createProfileSeo, SITE_URL, toIsoDate } from '#lib/seo.js';

export const prerender = true;

/** The author page is a profile, not a blog post, so it gets its own schema. */
const PROFILE_SLUG = 'other-cv';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
	const { slug } = params;

	const pathname = slug.replace('-', '/');

	const post = process(`posts/${pathname}.md`);
	post.slug = slug;

	const cover = post.cover?.url
		? post.cover.url.startsWith('/')
			? `${SITE_URL}${post.cover.url}`
			: post.cover.url
		: undefined;

	const isProfile = slug === PROFILE_SLUG;
	const categorySlug = post.category
		? getCategories().find((category) => category.name === post.category)?.slug
		: undefined;

	return {
		post,
		iso: toIsoDate(post.metadata.date),
		categorySlug,
		relatedPosts: isProfile ? [] : getRelatedPosts(slug),
		seo: isProfile
			? createProfileSeo('/blog/other-cv', post.lang)
			: createArticleSeo(post.metadata, slug, post.category, {
					cover,
					coverWidth: post.cover?.width,
					coverHeight: post.cover?.height,
					wordCount: post.wordCount,
					lang: post.lang
				})
	};
};
