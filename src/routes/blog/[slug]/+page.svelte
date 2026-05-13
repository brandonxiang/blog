<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { variables } from '$lib/variables';
	import { browser } from '$app/environment';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
	// @ts-ignore
	let date = $derived(data.post.metadata.date.toUpperCase());
	let category = $derived(data.post.category ?? 'Blog');
	let toc = $derived(data.post.toc ?? []);
	let encodedShareUrl = $derived(encodeURIComponent($page.url.href));
	let encodedShareTitle = $derived(encodeURIComponent(data.post.metadata.title));
	let twitterShareUrl = $derived(
		`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`
	);
	let copied = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let copyTimer;

	async function copyPostLink() {
		if (!browser) return;

		const url = window.location.href;

		try {
			await navigator.clipboard.writeText(url);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = url;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}

		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copied = false;
		}, 1600);
	}

	// oxlint-disable-next-line no-unused-vars
	async function gitalkAction() {
		if (browser) {
			const container = document.querySelector('#gitalk-container');
			//@ts-ignore
			if (container && window.Gitalk) {
				if (container.children[0]) {
					container.removeChild(container.children[0]);
				}
				await tick();

				//@ts-ignore
				const gitalk = new window.Gitalk({
					clientID: variables.CLIENT_ID,
					clientSecret: variables.CLIENT_SECRET,
					repo: 'blog',
					owner: 'brandonxiang',
					admin: ['brandonxiang'],
					id: location.pathname,
					distractionFreeMode: false,
					createIssueManually: false
				});

				gitalk.render(container);
			}
		}
	}

	// page.subscribe(gitalkAction);
	onMount(async () => {
		// await gitalkAction();
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/style/github.css" />
</svelte:head>

<div class="post-shell">
	<aside class="post-aside">
		<p>On this page</p>
		<nav class="toc" aria-label="Article table of contents">
			{#each toc as item}
				<a class:depth-3={item.depth === 3} href={`#${item.id}`}>{item.text}</a>
			{/each}
		</nav>
		<div class="share">
			<span>Share</span>
			<div class="share-actions">
				<a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share to X">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M17.53 3h3.2l-7 8.01L22.16 21h-6.61l-5.18-6.78L4.45 21H1.23l7.49-8.56L.64 3h6.78l4.68 6.19L17.53 3Zm-1.12 16.24h1.77L6.46 4.67h-1.9l11.85 14.57Z"
						/>
					</svg>
				</a>
				<button
					class:copied
					type="button"
					aria-label={copied ? 'Link copied' : 'Copy article link'}
					title={copied ? 'Copied' : 'Copy link'}
					onclick={copyPostLink}
				>
					<svg class="stroke-icon" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="8" y="8" width="11" height="11" rx="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
					</svg>
				</button>
				<a
					href="https://github.com/brandonxiang"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58l-.02-2.23c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.82 2.8 1.29 3.48.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.44 11.44 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.38.82 1.11.82 2.24l-.01 3.31c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z"
						/>
					</svg>
				</a>
			</div>
		</div>
	</aside>

	<div class="post-content">
		<header class="post-header">
			<p class="eyebrow">#{category}</p>
			<h1 class="title" style:--name="post-title-{$page.params.slug}">{data.post.metadata.title}</h1>
			<p class="info"><a href="https://github.com/brandonxiang">Brandonxiang</a> · {date}</p>
		</header>

		<article id="content">
			{@html data.post.content}
		</article>
	</div>
	<div id="gitalk-container"></div>
</div>

<style>
	.post-shell {
		display: grid;
		gap: 2rem;
		grid-template-columns: 13rem minmax(0, 1fr);
		margin-inline: auto;
		max-width: 72rem;
	}

	.post-aside {
		border-right: 1px solid var(--color-border);
		color: var(--color-muted);
		display: flex;
		flex-direction: column;
		font-size: var(--text-xs);
		gap: 0.75rem;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		padding-right: 1.5rem;
		position: sticky;
		top: 5rem;
		height: fit-content;
	}

	.post-aside p,
	.post-aside a,
	.share span {
		font-size: var(--text-xs);
		margin: 0;
	}

	.post-aside p,
	.share span {
		color: var(--color-text);
		font-weight: 700;
	}

	.post-aside a {
		color: var(--color-muted);
		text-decoration: none;
	}

	.toc {
		display: grid;
		gap: 0.58rem;
	}

	.toc a {
		border-left: 2px solid transparent;
		line-height: 1.45;
		padding-left: 0.55rem;
		transition:
			border-color 160ms ease,
			color 160ms ease;
	}

	.toc a:hover {
		border-color: var(--color-primary);
		color: var(--color-primary-dark);
	}

	.toc a.depth-3 {
		font-size: 0.7rem;
		padding-left: 1.2rem;
	}

	.share {
		border-top: 1px solid var(--color-border);
		display: grid;
		gap: 0.75rem;
		margin-top: 3rem;
		padding-top: 1rem;
	}

	.share-actions {
		display: flex;
		gap: 0.55rem;
	}

	.share-actions a,
	.share-actions button {
		align-items: center;
		appearance: none;
		background: var(--color-surface-soft);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		color: var(--color-muted);
		cursor: pointer;
		display: inline-flex;
		height: 2rem;
		justify-content: center;
		padding: 0;
		transition:
			background 160ms ease,
			border-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
		width: 2rem;
	}

	.share-actions a:hover,
	.share-actions button:hover,
	.share-actions button.copied {
		border-color: var(--color-primary);
		color: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	.share-actions svg {
		fill: currentColor;
		height: 1rem;
		width: 1rem;
	}

	.share-actions svg.stroke-icon {
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2;
	}

	.post-content {
		min-width: 0;
	}

	.post-header {
		padding-bottom: 1.25rem;
	}

	.eyebrow {
		color: var(--color-primary);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0;
		margin: 0 0 0.75rem;
	}

	h1.title {
		font-size: clamp(1.8rem, 3.5vw, 2.45rem);
		margin-bottom: 0.35em;
	}

	.info {
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
		margin: 0;
	}

	.info a {
		color: var(--color-primary-dark);
		text-decoration: none;
	}

	article {
		background: transparent;
		border: 0;
		box-shadow: none;
		padding: 0;
	}

	article :global(h2) {
		margin: 2.15em 0 1.25rem;
	}

	article :global(h3) {
		margin: 1.45em 0 0.75rem;
	}

	article :global(h2 + h3) {
		margin-top: 1.25rem;
	}

	article :global(h2),
	article :global(h3) {
		scroll-margin-top: 5rem;
	}

	#gitalk-container {
		grid-column: 2;
	}

	@media (prefers-reduced-motion: no-preference) {
		h1,
		.title {
			view-transition-name: var(--name);
		}
	}

	@media (max-width: 860px) {
		.post-shell {
			grid-template-columns: 1fr;
		}

		.post-aside,
		#gitalk-container {
			display: none;
		}
	}
</style>
