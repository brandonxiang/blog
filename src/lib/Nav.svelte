<script>
	/** @type {string} */
	export let segment;

	/** @typedef {'page' | undefined } AriaCurrent */

	/** @type {AriaCurrent} */
	$: isBlog = segment.includes('/blog') && !segment.includes('about') ? 'page' : undefined;
	/** @type {AriaCurrent} */
	$: isKeynote = segment.includes('/keynote') ? 'page' : undefined;
	/** @type {AriaCurrent} */
	$: isApp = segment.includes('/app') ? 'page' : undefined;
	/** @type {AriaCurrent} */
	$: isAbout = segment.includes('about') ? 'page' : undefined;
</script>

<nav data-sveltekit-prefetch>
	<ul>
		<li>
			<a aria-current={segment === '/' ? 'page' : undefined} href="/">Home</a>
		</li>
		<li>
			<a aria-current={isBlog} href="/blog">Blog</a>
		</li>
		<li>
			<a aria-current={isKeynote} href="/keynote">Keynote</a>
		</li>
		<li>
			<a aria-current={isApp} href="/app">App</a>
		</li>
		<li>
			<a aria-current={isAbout} href="https://brandonxiang.notion.site/brandonxiang-notion-078346416d174cb0bf79e0023ef7d8af" target="_blank">About</a>
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
