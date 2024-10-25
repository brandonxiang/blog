<script>
	import { onNavigate } from '$app/navigation';
	import Nav from '$lib/Nav.svelte';
	import { page } from '$app/stores';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';
	import pageInfoStore from '../store/head';
	import { get } from 'svelte/store';

	let { title, description, url, keywords } = get(pageInfoStore)

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
</script>

<Nav {segment} />

<svelte:head>
	<!-- basic SEO -->
	<title>{title}</title>
	<meta
		name="keywords"
		content={keywords}
	/>
	<meta
		name="description"
		content={description}
	/>
	<!-- og SEO -->
	<meta property="og:url" content={url} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title}/>
	<meta
		property="og:description"
		content={description}
	/>
	<meta property="twitter:description" content={description}>
	<meta property="og:image" content="https://brandonxiang.top/icon/logo-512.png" />
	<meta property="twitter:image" content="https://brandonxiang.top/icon/logo-512.png">
	<meta property="twitter:card" content="summary_large_image">
	<meta property="og:site_name" content={title}>
	<meta property="twitter:title" content={title}>
	<!-- pwa -->
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
