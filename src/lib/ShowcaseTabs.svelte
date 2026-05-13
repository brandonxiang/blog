<script>
	import { apps, keynotes } from '$lib/showcaseData';

	/**
	 * @typedef {Object} Props
	 * @property {'slides' | 'apps'} activeTab
	 */

	/** @type {Props} */
	let { activeTab = 'slides' } = $props();

const tabs = [
	{
		id: 'slides',
		label: 'Slides',
		href: '/keynote',
		heading: 'Recent Slides',
		kicker: '分享 BFF 架构、前端工程与技术方案的实战经验。',
		items: keynotes.map((item) => ({ title: item.title, url: item.url, meta: item.date }))
	},
	{
		id: 'apps',
		label: 'Apps',
		href: '/app',
		heading: 'App Recommend',
		kicker: '整理常用工具、开源项目和个人实验。',
		items: apps.map((item) => ({ title: item.title, url: item.url, meta: item.description }))
	}
];

	let current = $derived(tabs.find((tab) => tab.id === activeTab) ?? tabs[0]);
</script>

<svelte:head>
	<title>{current.heading}</title>
</svelte:head>

<section class="showcase-shell">
	<div class="showcase-hero">
		<h1>{current.heading}</h1>
		<p class="intro">{current.kicker}</p>
	</div>

	<div class="tabs" role="tablist" aria-label="Showcase content">
		{#each tabs as tab (tab.id)}
			<a
				role="tab"
				aria-selected={tab.id === activeTab}
				aria-current={tab.id === activeTab ? 'page' : undefined}
				href={tab.href}
			>
				{tab.label}
			</a>
		{/each}
	</div>

	<div class="resource-list">
		{#each current.items as item, index (`${current.id}-${item.url}-${index}`)}
			<a class="resource-item" href={item.url} target="_blank" rel="noopener noreferrer">
				<span class="resource-index">{String(index + 1).padStart(2, '0')}</span>
				<span class="resource-body">
					<span class="resource-title">{item.title}</span>
					<span class="resource-meta">{item.meta}</span>
				</span>
				<span class="resource-tag">#{current.id === 'slides' ? '分享' : '工具'}</span>
			</a>
		{/each}
	</div>
</section>

<style>
	.showcase-shell {
		display: grid;
		gap: 1.3rem;
	}

	.showcase-hero {
		max-width: 38rem;
	}

	h1 {
		margin-bottom: 0.65rem;
	}

	.intro {
		color: var(--color-muted);
		font-size: var(--text-md);
		line-height: 1.68;
		margin: 0;
	}

	.tabs {
		align-items: center;
		background: transparent;
		border-bottom: 1px solid var(--color-border);
		border-radius: 0;
		display: flex;
		gap: 1.5rem;
		padding: 0;
		width: 100%;
	}

	.tabs a {
		border-bottom: 2px solid transparent;
		color: var(--color-text);
		font-size: var(--text-base);
		font-weight: 800;
		line-height: 1.25;
		margin-bottom: -1px;
		padding: 0.8rem 0;
		text-decoration: none;
	}

	.tabs a[aria-selected='true'] {
		background: transparent;
		border-color: var(--color-primary);
		box-shadow: none;
		color: var(--color-primary-dark);
	}

	.resource-list {
		display: grid;
		border-top: 1px solid var(--color-border);
	}

	.resource-item {
		align-items: center;
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 1rem;
		grid-template-columns: 5rem minmax(0, 1fr) auto;
		padding: 1rem 0;
		text-decoration: none;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.resource-item:hover {
		background: color-mix(in srgb, var(--color-primary) 3%, transparent);
		color: var(--color-text);
	}

	.resource-index {
		color: var(--color-primary);
		font-family: var(--font-accent);
		font-size: var(--text-xs);
		font-weight: 800;
	}

	.resource-body {
		display: grid;
		gap: 0.4rem;
	}

	.resource-title {
		font-size: var(--text-md);
		font-weight: 800;
		line-height: 1.48;
	}

	.resource-meta {
		color: var(--color-muted);
		font-size: var(--text-sm);
		font-weight: 500;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.resource-tag {
		color: var(--color-primary);
		font-size: var(--text-xs);
		font-weight: 700;
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.tabs {
			width: 100%;
		}

		.tabs a {
			flex: 1;
			text-align: center;
		}

		.resource-item {
			grid-template-columns: 1fr;
			padding: 1rem 0;
		}

		.resource-tag {
			display: none;
		}
	}
</style>
