<script lang="ts">
  import Nav from '$lib/Nav.svelte';

	import { page } from '$app/stores';

	$:segment = $page.url.pathname;

</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main data-sveltekit-prefetch>
	<slot></slot>
</main>