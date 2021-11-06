<script context="module">
  export const prerender = true;
  import { base } from '$app/paths';
  import { variables } from '$lib/variables';

  export async function load({ page, fetch }) {
    const slug = page.params.slug;
    const post = await fetch(`${base}/blog/${slug}.json`)
        .then((r) => r.json());
    return {
      props: { post }
    };
  }
</script>

<script>
  import { onMount, tick } from "svelte";
  import { page } from '$app/stores';

  export let post;
  // @ts-ignore
  let date = post.metadata.date.toUpperCase();

  function loadScript(url){
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      console.log(url);
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject();
      }
      document.head.appendChild(script);
      document.head.removeChild(script);
    })
  }

  async function gitalkAction() {
    
    if(!location.pathname.includes('blog')) return;
    const container = document.querySelector('#gitalk-container')

    //@ts-ignore
    if(container && Gitalk){
      if(container.children[0]) {
        container.removeChild(container.children[0]);
      }
      await tick();

      //@ts-ignore
      const gitalk = new Gitalk({
        clientID: variables.CLIENT_ID,
        clientSecret: variables.CLIENT_SECRET,
        repo: 'blog',
        owner: 'brandonxiang',
        admin: ['brandonxiang'],
        id: location.pathname,
        distractionFreeMode: false,
        createIssueManually: true
      })

      gitalk.render(container)
    }
  }

  page.subscribe(gitalkAction);
  onMount(async ()=> {
    await gitalkAction();
  })
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
  <meta property="og:url" content="https://brandonxiang.vercel.app/blog/{post.slug}">
	<meta property="og:type" content="article">
	<meta property="og:title" content={post.metadata.title}>
	<!-- <meta property="og:description" content={post.metadata.description}> -->
</svelte:head>

<h1 class="title">{post.metadata.title}</h1>
<p class="info"><a href="https://github.com/brandonxiang">Brandonxiang</a> {date}</p>

{@html post.content}

<div id="gitalk-container"></div>

<style lang="less">
  h1.title {
    margin-bottom: 0;
  }
</style>