<script>
	import { onNavigate } from '$app/navigation';
	import Nav from '$lib/Nav.svelte';
	import { page } from '$app/stores';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';

	$: segment = $page.url.pathname;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r) {
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				}
			});
		}
	});

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';

		/** @type {import('./$types').PageData} */
		export let data;
</script>

<Nav {segment} />

<svelte:head>
	<!-- basic SEO -->
	<title>Brandonxiang Blog</title>
	<meta
		name="keywords"
		content="brandon,blog,frontend,ai,web3,web,develop,code,study,keynote,大前端从入门到跑路,大前端,前端技术,学习"
	/>
	<meta
		name="description"
		content="how to learn web developing, deep in web3, working in advanced technology"
	/>
	<!-- og SEO -->
	<meta property="og:url" content="https://brandonxiang.top" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Brandonxiang Blog" />
	<meta
		property="og:description"
		content="Here is Brandon's Blog,how to learn web developing, deep in web3, working in advanced technology"
	/>
	<meta property="og:url" content="https://brandonxiang.top" />
	<meta property="og:image" content="/icon/logo-512.png" />
	{@html webManifest}
</svelte:head>


<main data-sveltekit-prefetch>
	<slot />
</main>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>
