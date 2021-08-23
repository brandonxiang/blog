<script lang="ts">
  import Nav from '$lib/Nav.svelte';

	import { page } from '$app/stores';

	$:segment = $page.path;

</script>


<svelte:head>
  <link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css">
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Overpass">
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Fira+Mono">
</svelte:head>

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

<main>
	<slot></slot>
</main>