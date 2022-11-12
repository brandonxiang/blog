import { process } from '$lib/markdown';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;

  const pathname = slug.replace('-', '/')

  const post = process(`posts/${pathname}.md`);
  return { post };
}