import { process } from '$lib/markdown';
import type { PageServerLoad } from './$types';
import { base } from '$app/paths';
import { variables } from '$lib/variables';

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;

  const pathname = slug.replace('-', '/')

  const post = process(`posts/${pathname}.md`);
  return { post };
}