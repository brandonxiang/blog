<script>
	import { onNavigate } from '$app/navigation';
  import Nav from '$lib/Nav.svelte';

	import { page } from '$app/stores';

	$:segment = $page.url.pathname;

	onNavigate((navigation) => {
			if (!document.startViewTransition) return;

			return new Promise((resolve) => {
					document.startViewTransition(async () => {
							resolve();
							await navigation.complete;
					});
			});
	});

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
			animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out, 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
			animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in, 300ms cubic-bezier(0.4, 0, 0.2, 1) both
							slide-from-right;
	}
</style>

<Nav {segment}/>

<main data-sveltekit-prefetch>
	<slot></slot>
</main>