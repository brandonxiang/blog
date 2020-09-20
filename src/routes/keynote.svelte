<script>
let keynotes = [
  {
    title: '微前端与WEB COMPONENTS',
    url: 'https://keynote.vercel.app/microfrontend.html#/',
    date: '2 APRIL 2019',
  },
  {
    title: 'VUE开发规范',
    url: 'https://keynote.vercel.app/vue-specification.html#/',
    date: '12 NOVEMBER 2017'
  },
  {
    title: 'VUE技术选型与WEBPACK入门',
    url: 'https://keynote.vercel.app/vue-startup.html#/',
    date: '9 JUNE 2017',
  },
]
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
	<title>Keynote</title>
</svelte:head>

<h1>Recent keynotes</h1>

<div>
	{#each keynotes as keynote, index}
		<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
		<p><a rel='prefetch' href={keynote.url}>{keynote.title}</a></p>
		<div class="post-item-footer">
			<span class="post-item-date">— {keynote.date}</span>
		</div>
	{/each}
</div>
