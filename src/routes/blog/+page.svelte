<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1>Recent Posts <a class="rss" href="https://brandonxiang.top/rss.xml" target="_blank" aria-label="RSS Feed">RSS</a></h1>

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

	h1 {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.rss {
		font-size: 0.5em;
		font-weight: normal;
		color: #666;
		padding: 0.25em 0.5em;
		border: 1px solid #ddd;
		border-radius: 4px;
		text-decoration: none;
	}

	.rss:hover {
		background-color: #f5f5f5;
	}
</style>
