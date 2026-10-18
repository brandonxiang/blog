<script>
	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<div class="home-container">
	<div class="home-copy">
		<h1>
			BrandonXIANG Blog
			<span class="h1-tagline">前端工程化技术博客</span>
		</h1>
		<span class="accent-line"></span>
		<p>记录技术思考，分享学习笔记与实战经验。</p>
		<p>
			<a class="button-link" href="https://github.com/brandonxiang" target="_blank" rel="noopener noreferrer"
				>GitHub ↗</a
			>
		</p>
	</div>

	<figure>
		<img
			alt="Person typing on laptop"
			src="icon/undraw_usability_testing_2xs4.svg"
			width="1008"
			height="780"
			fetchpriority="high"
			decoding="async"
		/>
		<figcaption>
			Illustration thanks to <a href="https://undraw.co" target="_blank" rel="noopener noreferrer"
				>Undraw</a
			>
		</figcaption>
	</figure>

	<div class="home-features" aria-label="Blog topics">
		<div>
			<span class="feature-icon">⌘</span>
			<strong>技术笔记</strong>
			<p>系统化的学习与实践记录。</p>
		</div>
		<div>
			<span class="feature-icon">▣</span>
			<strong>开源实践</strong>
			<p>分享开源项目与工具的使用思考。</p>
		</div>
		<div>
			<span class="feature-icon">◇</span>
			<strong>持续成长</strong>
			<p>伴随时代、持续学习、不断迭代与进步。</p>
		</div>
	</div>

	<section class="home-recent" aria-labelledby="recent-posts-heading">
		<h2 id="recent-posts-heading">最新文章</h2>
		<ul>
			{#each data.recentPosts as post}
				<li>
					<a href={`/blog/${post.slug}`}>
						<span class="recent-title">{post.title}</span>
						{#if post.description}
							<span class="recent-desc">{post.description}</span>
						{/if}
						<time class="recent-date" datetime={post.iso}>{post.date}</time>
					</a>
				</li>
			{/each}
		</ul>
		<p class="recent-more"><a href="/blog">浏览全部文章 →</a></p>
	</section>
</div>

<style>
	.home-container {
		align-items: center;
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		gap: clamp(2rem, 6vw, 6rem);
		justify-content: space-between;
		margin: 0;
		min-height: 0;
		width: min(70rem, 100%);
		margin-inline: auto;
	}
	.home-copy {
		flex: 0 1 28rem;
	}

	h1 {
		animation: home-rise 520ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
		font-size: clamp(2.45rem, 5vw, 3.85rem);
		letter-spacing: -0.035em;
		line-height: 1.08;
		margin-bottom: 0.34em;
	}

	.accent-line {
		animation: line-reveal 420ms cubic-bezier(0.2, 0.7, 0.2, 1) 160ms both;
		background: var(--color-primary);
		display: block;
		height: 3px;
		margin-bottom: 1.5rem;
		width: 2.5rem;
	}

	.home-copy > p {
		animation: home-rise 520ms cubic-bezier(0.2, 0.7, 0.2, 1) 220ms both;
		color: var(--color-muted);
		font-size: var(--text-base);
		line-height: 1.72;
	}

	.button-link {
		animation: home-rise 520ms cubic-bezier(0.2, 0.7, 0.2, 1) 320ms both;
		border: 1px solid var(--color-primary);
		border-radius: 4px;
		box-shadow: none;
		color: var(--color-text);
		display: inline-flex;
		font-size: var(--text-md);
		font-weight: 700;
		padding: 0.65rem 1.1rem;
		text-decoration: none;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
	}

	.button-link:hover {
		background: var(--color-primary);
		box-shadow: none;
		color: var(--color-on-primary);
		transform: translateY(-1px);
	}

	figure {
		animation: figure-float-in 720ms cubic-bezier(0.2, 0.7, 0.2, 1) 260ms both;
		flex: 0 1 28rem;
		margin: 0;
		text-align: center;
	}

	figcaption {
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-style: italic;
		margin-top: 1rem;
	}
	img {
		display: block;
		/* Both axes stay `auto` so the max-width/max-height pair below scales the
		   illustration proportionally. A fixed `width: 100%` next to
		   `max-height` clamps only the height and stretches the image. */
		height: auto;
		margin-inline: auto;
		max-height: 20rem;
		max-width: 430px;
		transition: transform 220ms ease;
		width: auto;
	}

	img:hover {
		transform: translateY(-3px);
	}

	.home-features {
		animation: home-rise 560ms cubic-bezier(0.2, 0.7, 0.2, 1) 440ms both;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		display: grid;
		flex-basis: 100%;
		gap: 0;
		grid-template-columns: repeat(3, 1fr);
		margin-top: clamp(1rem, 3vw, 3rem);
		padding: 1.35rem 1.5rem;
	}

	.home-features div {
		display: grid;
		gap: 0.4rem;
		grid-template-columns: 2.8rem 1fr;
		padding: 0.4rem 1rem;
		transition: transform 180ms ease;
	}

	.home-features div:hover {
		transform: translateY(-2px);
	}

	.feature-icon {
		align-items: center;
		background: var(--color-feature-icon-bg);
		border-radius: 50%;
		color: var(--color-primary);
		display: flex;
		grid-row: span 2;
		height: 2.2rem;
		justify-content: center;
		transition:
			background 180ms ease,
			color 180ms ease,
			transform 180ms ease;
		width: 2.2rem;
	}

	.home-features div:hover .feature-icon {
		background: var(--color-primary);
		color: var(--color-on-primary);
		transform: rotate(-6deg);
	}

	.home-features strong {
		font-size: var(--text-md);
		line-height: 1.35;
	}

	.home-features p {
		font-size: var(--text-sm);
		line-height: 1.6;
		margin: 0;
	}

	.h1-tagline {
		color: var(--color-muted);
		display: block;
		font-size: clamp(1.15rem, 2.2vw, 1.6rem);
		font-weight: 700;
		letter-spacing: 0;
		margin-top: 0.55rem;
	}

	.home-recent {
		animation: home-rise 560ms cubic-bezier(0.2, 0.7, 0.2, 1) 520ms both;
		border-top: 1px solid var(--color-border);
		flex-basis: 100%;
		margin-top: clamp(0.5rem, 2vw, 1.5rem);
		padding-top: clamp(1.2rem, 3vw, 2rem);
	}

	.home-recent h2 {
		font-size: var(--text-lg);
		margin: 0 0 1rem;
	}

	.home-recent ul {
		display: grid;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.home-recent li {
		margin: 0;
	}

	.home-recent a {
		display: grid;
		gap: 0.15rem;
		padding: 0.7rem 0;
		text-decoration: none;
	}

	.recent-title {
		font-size: var(--text-md);
		font-weight: 700;
	}

	.home-recent a:hover .recent-title {
		color: var(--color-primary-dark);
	}

	.recent-desc {
		color: var(--color-muted);
		font-size: var(--text-sm);
		line-height: 1.55;
	}

	.recent-date {
		color: var(--color-muted);
		font-size: var(--text-xs);
	}

	.recent-more {
		margin: 1.1rem 0 0;
	}

	.recent-more a {
		color: var(--color-primary-dark);
		font-weight: 700;
		text-decoration: none;
	}

	@keyframes home-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes line-reveal {
		from {
			opacity: 0;
			transform: scaleX(0);
			transform-origin: left;
		}

		to {
			opacity: 1;
			transform: scaleX(1);
			transform-origin: left;
		}
	}

	@keyframes figure-float-in {
		from {
			opacity: 0;
			transform: translateX(28px) translateY(10px);
		}

		to {
			opacity: 1;
			transform: translateX(0) translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		h1,
		p,
		.accent-line,
		.button-link,
		figure,
		.home-features {
			animation: none;
		}

		.button-link,
		.home-features div,
		.feature-icon,
		img {
			transition: none;
		}

		.button-link:hover,
		.home-features div:hover,
		.home-features div:hover .feature-icon,
		img:hover {
			transform: none;
		}
	}

	@media (max-width: 1020px) {
		.home-copy > p {
			font-size: var(--text-base);
		}
	}
	@media (max-width: 800px) {
		.home-container {
			flex-direction: column;
			justify-content: center;
		}
		.home-copy {
			flex: 0;
			padding-bottom: 2em;
			text-align: left;
		}

		figure {
			margin-inline: 0;
		}

		.home-features {
			grid-template-columns: 1fr;
		}
	}
</style>
