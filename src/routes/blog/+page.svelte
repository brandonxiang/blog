<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

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
	{#each data.posts as post, index}
		<p data-sveltekit-prefetch><a href='blog/{post.slug}'>{post.metadata.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {post.metadata.date}</span>
		</div>
	{/each}
</div>
