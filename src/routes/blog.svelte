<script context="module">
  export const prerender = true;
  
  import { base } from '$app/paths';

  export async function load({ fetch }) {
    const posts = await fetch(`${base}/blog.json`)
        .then((r) => r.json());
    return {
      props: { posts }
    }
  }
</script>

<script>
  export let posts;
</script>

<style>
  .post-item-footer {
    font-family: Rubik, sans-serif;
    font-weight: 700;
  }

  .post-item-date {
    color: #AAA;
    text-align: left;
    text-transform: uppercase;
    margin-right: 16px;
  }
</style>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1>最近博客</h1>

<div>
	{#each posts as post, index}
		<p><a sveltekit:prefetch href='blog/{post.slug}'>{post.metadata.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {post.metadata.date}</span>
		</div>
	{/each}
</div>
