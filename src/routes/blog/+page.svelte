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
		<h1>
			Recent Posts <a
				class="rss"
				href="https://brandonxiang.top/rss.xml"
				target="_blank"
				aria-label="RSS Feed">RSS</a
			>
		</h1>
	</div>

	<div class="post-list">
		{#each data.posts as post, index (post.slug || `${post.metadata.title}-${post.metadata.date}-${index}`)}
			<a
				class="post-item"
				data-sveltekit-prefetch
				href={post.redirect || `/blog/${post.slug}`}
				target={post.redirect ? '_blank' : undefined}
				rel={post.redirect ? 'noopener noreferrer' : undefined}
			>
				<span class="post-item-date">{post.metadata.date}</span>
				<span class="post-content">
					<span class="title" style:--name={post.slug ? `post-title-${post.slug}` : 'none'}>
						{post.metadata.title}
					</span>
					{#if post.metadata.description}
						<span class="description">{post.metadata.description}</span>
					{/if}
				</span>
				<span class="tag">#{post.category}</span>
			</a>
		{/each}
	</div>
</section>

<style>
	.posts-shell {
		display: grid;
		gap: 1.4rem;
	}

	.posts-hero {
		max-width: none;
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

	h1 {
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: space-between;
		margin-bottom: 0;
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
		text-decoration: none;
		transition:
			color 0.2s ease,
			background 0.2s ease;
	}

	.post-item:hover {
		background: color-mix(in srgb, var(--color-primary) 3%, transparent);
		color: var(--color-text);
	}

	.post-content {
		display: grid;
		gap: 0.25rem;
	}

	.title {
		font-size: var(--text-md);
		font-weight: 800;
		line-height: 1.48;
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
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		h1 {
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
