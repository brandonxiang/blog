<script>
let keynotes = [
  {
    title: 'ESM Import & Bundle Free',
    url: 'https://keynote.vercel.app/bundle-free.html#/',
    date: '14 August 2020',
  },
  {
    title: 'svelte 入门',
    url: 'https://keynote.vercel.app/svelte.html#/',
    date: '16 August 2019',
  },
  {
    title: 'react-navigation和expo的应用',
    url: 'https://keynote.vercel.app/expo.html#/',
    date: '31 March 2019',
  },
  {
    title: '微前端与WEB COMPONENTS',
    url: 'https://keynote.vercel.app/microfrontend.html#/',
    date: '2 APRIL 2019',
  },
  {
    title: '小程序开发实战',
    url: 'https://keynote.vercel.app/weapp.html#/',
    date: '26 November 2018',
  },
  {
    title: 'PWA开发实战',
    url: 'https://keynote.vercel.app/pwa.html#/',
    date: '26 November 2018',
  },
  {
     title: 'VUE-CLI3.0',
     url: 'https://keynote.vercel.app/vue-cli.html#/',
     date: '18 October 2018',
  },
  {
     title: 'VUE-CLI3.0',
     url: 'https://keynote.vercel.app/vue-test.html#/',
     date: '18 October 2018',
  },
  {
    title: 'VUE单元测试',
    url: 'https://keynote.vercel.app/vue-specification.html#/',
    date: '8 NOVEMBER 2017'
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
