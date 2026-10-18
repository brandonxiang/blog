<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<section class="posts-shell">
	<div class="posts-hero">
		<h1>技术文章</h1>
		<a
			class="rss"
			href="https://brandonxiang.top/rss.xml"
			target="_blank"
			rel="noopener"
			aria-label="RSS Feed">RSS</a
		>
	</div>

	<div class="post-list">
		{#each data.posts as post, index (post.slug || `${post.metadata.title}-${post.metadata.date}-${index}`)}
			<div class="post-item">
				<time class="post-item-date" datetime={post.iso}>{post.metadata.date}</time>
				<a
					class="post-link"
					data-sveltekit-prefetch
					href={post.redirect || `/blog/${post.slug}`}
					target={post.redirect ? '_blank' : undefined}
					rel={post.redirect ? 'noopener noreferrer' : undefined}
				>
					<span class="title" style:--name={post.slug ? `post-title-${post.slug}` : 'none'}>
						{post.metadata.title}
					</span>
					{#if post.metadata.description}
						<span class="description">{post.metadata.description}</span>
					{/if}
				</a>
				{#if post.category}
					{#if post.categorySlug}
						<a class="tag" href={`/blog/category/${post.categorySlug}`}>#{post.category}</a>
					{:else}
						<span class="tag">#{post.category}</span>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.posts-shell {
		display: grid;
		gap: 1.4rem;
	}

	.posts-hero {
		align-items: center;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		max-width: none;
	}

	.posts-hero h1 {
		margin: 0;
	}

	.post-list {
		display: grid;
		border-top: 1px solid var(--color-border);
	}

	@media (prefers-reduced-motion: no-preference) {
		span.title {
			view-transition-name: var(--name);
		}
	}

	.rss {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-primary-dark);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 0.55em 0.85em;
		text-decoration: none;
	}

	.rss:hover {
		background-color: var(--color-surface-soft);
	}

	.post-item {
		align-items: center;
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 1rem;
		grid-template-columns: 8rem minmax(0, 1fr) auto;
		padding: 1.05rem 0;
		position: relative;
		transition:
			color 0.2s ease,
			background 0.2s ease;
	}

	.post-item:hover {
		background: color-mix(in srgb, var(--color-primary) 3%, transparent);
	}

	.post-link {
		display: grid;
		gap: 0.25rem;
		text-decoration: none;
	}

	/* Keeps the whole row clickable without nesting the category link. */
	.post-link::after {
		content: '';
		inset: 0;
		position: absolute;
	}

	.title {
		font-size: var(--text-md);
		font-weight: 800;
		line-height: 1.48;
	}

	.post-item:hover .title {
		color: var(--color-primary-dark);
	}

	.description {
		color: var(--color-muted);
		font-size: var(--text-sm);
		line-height: 1.58;
	}

	.post-item-date {
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.tag {
		color: var(--color-primary);
		font-size: var(--text-xs);
		font-weight: 700;
		position: relative;
		text-decoration: none;
		white-space: nowrap;
		z-index: 1;
	}

	a.tag:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.posts-hero {
			align-items: flex-start;
			flex-direction: column;
		}

		.post-item {
			align-items: flex-start;
			grid-template-columns: 1fr;
			padding: 1rem 0;
		}

		.tag {
			display: none;
		}
	}
</style>
