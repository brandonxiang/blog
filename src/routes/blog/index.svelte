<script context="module">
	export function preload({ params, query }) {
		return this.fetch(`blog.json`).then(r => r.json()).then(posts => {
			console.log(posts);
			return { posts };
		});
	}
</script>

<script>
	export let posts;
</script>

<style>
  .post-item-footer {
    font-family: Rubik, sans-serif;
    font-weight: 700;
  }

  .post-item-date {
    color: #AAA;
    text-align: left;
    text-transform: uppercase;
    margin-right: 16px;
  }
</style>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1>Recent posts</h1>

<div>
	{#each posts as post, index}
		<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
		<p><a rel='prefetch' href='blog/{post.slug}'>{post.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {post.printDate}</span>
		</div>
	{/each}
</div>
