<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<section class="category-shell">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<ol>
			<li><a href="/">首页</a></li>
			<li><a href="/blog">文章</a></li>
			<li aria-current="page">{data.category.name}</li>
		</ol>
	</nav>

	<header class="category-header">
		<h1>{data.category.name} 分类文章</h1>
		<p class="intro">{data.intro}</p>
	</header>

	<ul class="post-list">
		{#each data.posts as post (post.slug)}
			<li class="post-item">
				<time class="post-item-date" datetime={post.iso}>{post.date}</time>
				<a class="post-link" data-sveltekit-prefetch href={`/blog/${post.slug}`}>
					<span class="title">{post.title}</span>
					{#if post.description}
						<span class="description">{post.description}</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>

	<p class="back"><a href="/blog">← 返回全部文章</a></p>
</section>

<style>
	.category-shell {
		display: grid;
		gap: 1.4rem;
	}

	.breadcrumb {
		font-size: var(--text-xs);
	}

	.breadcrumb ol {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.breadcrumb li {
		margin: 0;
	}

	.breadcrumb li + li::before {
		color: var(--color-muted);
		content: '/ ';
	}

	.breadcrumb a {
		color: var(--color-muted);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--color-primary-dark);
	}

	.category-header h1 {
		margin-bottom: 0.4rem;
	}

	.intro {
		color: var(--color-muted);
		margin: 0;
	}

	.post-list {
		border-top: 1px solid var(--color-border);
		display: grid;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.post-item {
		align-items: center;
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 1rem;
		grid-template-columns: 8rem minmax(0, 1fr);
		padding: 1.05rem 0;
	}

	.post-item-date {
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.post-link {
		display: grid;
		gap: 0.25rem;
		text-decoration: none;
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

	.back {
		margin: 0;
	}

	.back a {
		color: var(--color-primary-dark);
		font-weight: 700;
		text-decoration: none;
	}

	@media (max-width: 640px) {
		.post-item {
			align-items: flex-start;
			grid-template-columns: 1fr;
			padding: 1rem 0;
		}
	}
</style>
