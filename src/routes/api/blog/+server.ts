import { process } from '$lib/markdown';
import fg from 'fast-glob';
import dayjs from 'dayjs';

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = () => {
  const posts = fg.sync('posts/*/*.md')
      .map(pathname => {
        const { metadata } = process(pathname);
        
        const slug =  pathname.replace('posts/', '').replace('.md', '').replace('/', '-')
        return {
          metadata,
          slug
        };
      });
  // sort the posts by create date.
  // @ts-ignore
  posts.sort((a, b) => (dayjs(b.metadata.date, "MMM D, YYYY") - (dayjs(a.metadata.date, "MMM D, YYYY"))));
  const body = JSON.stringify(posts);

  return new Response(body);
}