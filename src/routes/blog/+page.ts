import type { PageLoad } from './$types';
import { base } from '$app/paths'; 

export const load: PageLoad = async ({ fetch }) => {
  const posts = await fetch(`${base}/api/blog`)
        .then((r) => r.json());
    return {posts}

}
