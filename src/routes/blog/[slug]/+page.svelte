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
	let date = data.post.metadata.date.toUpperCase();

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
					createIssueManually: false,
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


<h1 class="title" style:--name="post-title-{$page.params.slug}">{data.post.metadata.title}</h1>
<p class="info"><a href="https://github.com/brandonxiang">Brandonxiang</a> {date}</p>
<article>
	{@html data.post.content}
</article>
<div id="gitalk-container"></div>

<style>
	h1.title {
		margin-bottom: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		h1,
		.title {
			view-transition-name: var(--name);
		}
	}
</style>
