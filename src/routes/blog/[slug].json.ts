import { process } from '$lib/markdown';

export function get({ params }): {body: string} {
  const { slug } = params;

  const pathname = slug.replace('-', '/')

  const res = process(`posts/${pathname}.md`);
  const body = JSON.stringify(res);

  return {
    body
  }
}