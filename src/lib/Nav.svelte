<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {string} segment
	 */

	/** @type {Props} */
	let { segment } = $props();

	/** @typedef {'page' | undefined } AriaCurrent */

	/** @type {AriaCurrent} */
	let isRss = $derived(segment.includes('rss') ? 'page' : undefined);
	/** @type {AriaCurrent} */
	let isBlog = $derived(segment.includes('/blog') && !segment.includes('about') ? 'page' : undefined);
	/** @type {AriaCurrent} */
	let isKeynote = $derived(segment.includes('/keynote') ? 'page' : undefined);
	/** @type {AriaCurrent} */
	let isApp = $derived(segment.includes('/app') ? 'page' : undefined);
	/** @type {AriaCurrent} */
	let isAbout = $derived(segment.includes('about') ? 'page' : undefined);
</script>

<nav data-sveltekit-prefetch>
	<ul>
		<li>
			<a aria-current={segment === '/' ? 'page' : undefined} href="/">Home</a>
		</li>
		<li>
			<a aria-current={isBlog} href="/blog">Post</a>
		</li>
		<li>
			<a aria-current={isRss} href="https://brandonxiang.top/rss.xml" target="_blank">RSS</a>
		</li>
		<li>
			<a aria-current={isKeynote} href="/keynote">Slide</a>
		</li>
		<li>
			<a aria-current={isApp} href="/app">App</a>
		</li>
		<li>
			<a aria-current={isAbout} href="/blog/other-cv">About</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		border-bottom: 1px solid rgba(255, 62, 0, 0.1);
		font-weight: 300;
		padding: 0 1em;
		view-transition-name: header;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255, 62, 0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
		font-weight: 500;
	}
</style>
