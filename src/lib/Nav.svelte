<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} segment
	 */

	/** @type {Props} */
	let { segment } = $props();

	/** @typedef {'page' | undefined } AriaCurrent */

	/** @type {AriaCurrent} */
	let isBlog = $derived(
		segment.includes('/blog') && !segment.includes('about') ? 'page' : undefined
	);
	/** @type {AriaCurrent} */
	let isProject = $derived(
		segment.includes('/keynote') || segment.includes('/app') ? 'page' : undefined
	);
	/** @type {AriaCurrent} */
	let isAbout = $derived(segment.includes('about') ? 'page' : undefined);
</script>

<nav data-sveltekit-prefetch>
	<div class="traffic" aria-hidden="true">
		<span></span>
		<span></span>
		<span></span>
	</div>
	<ul>
		<li>
			<a aria-current={segment === '/' ? 'page' : undefined} href="/">Home</a>
		</li>
		<li>
			<a aria-current={isBlog} href="/blog">Post</a>
		</li>
		<li>
			<a aria-current={isProject} href="/keynote">Project</a>
		</li>
		<li>
			<a aria-current={isAbout} href="/blog/other-cv">About</a>
		</li>
	</ul>
	<a class="brand" href="/">BrandonXIANG Blog</a>
	<button
		class="theme-toggle"
		type="button"
		data-theme-toggle
		aria-label="Switch to dark mode"
		aria-pressed="false">Dark</button
	>
</nav>

<style>
	nav {
		align-items: center;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		font-weight: 600;
		gap: 1.25rem;
		min-height: 3.25rem;
		padding: 0 1.25rem;
		position: sticky;
		top: 0;
		z-index: 10;
		view-transition-name: header;
	}

	.traffic {
		display: flex;
		gap: 0.35rem;
	}

	.traffic span {
		background: var(--color-primary);
		border-radius: 50%;
		display: block;
		height: 0.42rem;
		width: 0.42rem;
	}

	.traffic span:nth-child(2) {
		background: #22c55e;
	}

	.traffic span:nth-child(3) {
		background: #facc15;
	}

	ul {
		display: flex;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
	}

	li {
		display: block;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1.8rem);
		height: 2px;
		background: var(--color-primary);
		border-radius: 999px;
		display: block;
		bottom: -0.02rem;
		left: 0.9rem;
	}

	a {
		color: var(--color-text);
		text-decoration: none;
		padding: 1rem 0.9rem;
		display: block;
		font-size: var(--text-sm);
		font-weight: 600;
		transition: color 0.2s ease;
	}

	a:hover,
	[aria-current] {
		color: var(--color-text);
	}

	.brand {
		font-size: var(--text-sm);
		font-weight: 800;
		margin-left: auto;
		padding-inline: 0;
	}

	.theme-toggle {
		background: var(--color-surface-soft);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		color: var(--color-text);
		cursor: pointer;
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 800;
		line-height: 1;
		padding: 0.48rem 0.72rem;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.theme-toggle:hover {
		border-color: var(--color-primary);
		color: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	@media (max-width: 640px) {
		nav {
			overflow-x: auto;
			padding: 0 0.75rem;
		}

		.traffic,
		.brand {
			display: none;
		}

		a {
			padding-inline: 0.75rem;
			white-space: nowrap;
		}

		.theme-toggle {
			flex: 0 0 auto;
		}
	}
</style>
