<script lang="ts">
	export let segment: string;

	type AriaCurrent = "page" | undefined

	$: isBlog = (segment.includes('/blog') && !segment.includes('about') ? 'page' : undefined) as AriaCurrent;
	$: isKeynote = (segment.includes('/keynote') ? 'page' : undefined) as AriaCurrent
	$: isAbout = (segment.includes('about') ? 'page' : undefined) as AriaCurrent



</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
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
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
		font-weight:500
	}
</style>

<nav>
	<ul>
		<li>
			<a aria-current="{segment === '/' ? 'page' : undefined}" href="/">Home</a>
		</li>
		<li>
			<a sveltekit:prefetch aria-current={isBlog} href="/blog">Blog</a>
		</li>
		<li>
			<a sveltekit:prefetch aria-current="{isKeynote}" href="/keynote">Keynote</a>
		</li>
		<li>
			<a sveltekit:prefetch  aria-current="{isAbout}" href="/blog/about">About</a>
		</li>
	</ul>
</nav>
