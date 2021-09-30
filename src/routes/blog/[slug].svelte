<script context="module">
  export const prerender = true;
  import { base } from '$app/paths';

  export async function load({ page, fetch }) {
    const slug = page.params.slug;
    const post = await fetch(`${base}/blog/${slug}.json`)
        .then((r) => r.json());
    return {
      props: { post }
    };
  }
</script>

<script>
  export let post;
  // @ts-ignore
  let date = post.metadata.date.toUpperCase();
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
  <meta property="og:url" content="https://brandonxiang.vercel.app/blog/{post.slug}">
	<meta property="og:type" content="article">
	<meta property="og:title" content={post.metadata.title}>
	<!-- <meta property="og:description" content={post.metadata.description}> -->
</svelte:head>

<h1 class="title">{post.metadata.title}</h1>
<p class="info"><a href="https://github.com/brandonxiang">Brandonxiang</a> {date}</p>
{@html post.content}

<style lang="less">
  h1.title {
    margin-bottom: 0;
  }
</style>