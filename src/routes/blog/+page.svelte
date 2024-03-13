<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1>最近博客</h1>

<div>
	{#each data.posts as post, index}
		<p data-sveltekit-prefetch>
			{#if post.redirect}
				<a href="{post.redirect}" target="_blank">
					<span class="title">{post.metadata.title}</span>
				</a>
			{:else}
				<a href="blog/{post.slug}">
					<span class="title" style:--name="post-title-{post.slug}">{post.metadata.title}</span>
				</a>
			{/if}
		</p>
		<div class="post-item-footer">
			<span class="post-item-date">— {post.metadata.date}</span>
		</div>
	{/each}
</div>

<style>
	.post-item-footer {
		font-family: Rubik, sans-serif;
		font-weight: 700;
	}

	.post-item-date {
		color: #aaa;
		text-align: left;
		text-transform: uppercase;
		margin-right: 16px;
	}

	@media (prefers-reduced-motion: no-preference) {
		span.title {
			view-transition-name: var(--name);
		}
	}
</style>
