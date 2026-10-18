<script>
	import { afterNavigate, onNavigate } from '$app/navigation';
	import Nav from '#lib/Nav.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights';
	import { inject, pageview } from '@vercel/analytics';
	import {
		defaultSeo,
		SITE_AUTHOR_URL,
		SITE_IMAGE_HEIGHT,
		SITE_IMAGE_WIDTH,
		SITE_NAME,
		SITE_TWITTER,
		SITE_URL
	} from '#lib/seo.js';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	let segment = $derived(page.url.pathname);
	let seo = $derived(page.data.seo ?? defaultSeo);
	let jsonLd = $derived(JSON.stringify(seo.jsonLd ?? defaultSeo.jsonLd));
	let jsonLdScript = $derived(
		'<script type="application/ld+json">' + jsonLd + '</scr' + 'ipt>'
	);
	let breadcrumbScript = $derived(
		seo.breadcrumbJsonLd
			? '<script type="application/ld+json">' +
				JSON.stringify(seo.breadcrumbJsonLd) +
				'</scr' +
				'ipt>'
			: null
	);
	let isArticle = $derived(seo.type === 'article');

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// The framework-agnostic entrypoints are used on purpose: the `/sveltekit`
	// entrypoints of both packages still subscribe to `$app/stores`, which was
	// removed in SvelteKit 3.
	afterNavigate(() => {
		if (!page.route.id) return;

		pageview({ route: page.route.id, path: page.url.pathname });
		speedInsights?.setRoute(page.route.id);
	});

	/** @type {{setRoute: (route: string | null) => void} | null} */
	let speedInsights = null;

	onMount(() => {
		const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);

		if (!isLocalPreview) {
			/** @type {Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number }} */
			const analyticsWindow = window;
			/** @type {string | undefined} */
			const basePath = import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH;
			/** @type {string | undefined} */
			const clientConfig = import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG;

			const loadAnalytics = () => {
				speedInsights = injectSpeedInsights({ basePath });
				inject(
					{
						basePath,
						debug: false,
						disableAutoTrack: true,
						framework: 'sveltekit'
					},
					clientConfig
				);
				speedInsights?.setRoute(page.route.id ?? null);
				pageview({ route: page.route.id, path: page.url.pathname });

				analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
				analyticsWindow.gtag = (...args) => {
					analyticsWindow.dataLayer?.push(args);
				};
				analyticsWindow.gtag('js', new Date());
				analyticsWindow.gtag('config', 'G-QSKELYBDHP');

				const script = document.createElement('script');
				script.async = true;
				script.src = 'https://www.googletagmanager.com/gtag/js?id=G-QSKELYBDHP';
				document.head.appendChild(script);
			};

			if (analyticsWindow.requestIdleCallback) {
				analyticsWindow.requestIdleCallback(loadAnalytics, { timeout: 5000 });
			} else {
				globalThis.setTimeout(loadAnalytics, 3000);
			}
		}
	});
</script>

<Nav {segment} />

<svelte:head>
	<!-- basic SEO -->
	<title>{seo.title}</title>
	<meta name="keywords" content={seo.keywords} />
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.url} />
	<!--
		`max-image-preview:large` lets Google show full-size post covers in Image
		Search, and `max-snippet:-1` stops it from truncating meta descriptions.
	-->
	<meta
		name="robots"
		content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
	/>
	<!-- lets feed readers discover /rss.xml from any page -->
	<link
		rel="alternate"
		type="application/rss+xml"
		title="{SITE_NAME} RSS Feed"
		href="{SITE_URL}/rss.xml"
	/>
	<!-- og SEO -->
	<meta property="og:url" content={seo.url} />
	<meta property="og:type" content={seo.type} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={seo.image} />
	<meta property="og:image:alt" content={seo.imageAlt ?? SITE_NAME} />
	<meta property="og:image:type" content={seo.imageType ?? 'image/png'} />
	<meta property="og:image:width" content={String(seo.imageWidth ?? SITE_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(seo.imageHeight ?? SITE_IMAGE_HEIGHT)} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={seo.locale} />
	{#if isArticle}
		<meta property="article:published_time" content={seo.publishedTime} />
		<meta property="article:modified_time" content={seo.modifiedTime} />
		<meta property="article:section" content={seo.section} />
		<meta property="article:author" content={SITE_AUTHOR_URL} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={SITE_TWITTER} />
	<meta name="twitter:creator" content={SITE_TWITTER} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.image} />
	<meta name="twitter:image:alt" content={seo.imageAlt ?? SITE_NAME} />
	{@html jsonLdScript}
	{#if breadcrumbScript}
		{@html breadcrumbScript}
	{/if}
</svelte:head>

<main class:home-main={segment === '/'} data-sveltekit-prefetch>
	{@render children?.()}
</main>

<style>
	main {
		position: relative;
		max-width: 76rem;
		background: transparent;
		padding: clamp(1.5rem, 5vw, 4rem) clamp(1.2rem, 4vw, 3rem);
		margin: 0 auto;
		box-sizing: border-box;
		width: 100%;
	}

	main.home-main {
		display: flex;
		max-width: none;
		min-height: calc(100svh - 3.75rem);
		padding-block: clamp(2rem, 5vw, 4.5rem);
		width: 100%;
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
