<script>
  let keynotes = [
    {
      title: '学习前端的方法',
      url: 'https://keynote.vercel.app/how-to-learn-fe.html',
      date: '6 August 2021',
    },
    {
      title: '使用Next.js实现优雅降级',
      url: 'https://keynote.vercel.app/nextjs-fallback.html',
      date: '12 June 2021',
    },
    {
      title: '如何参与一个开源项目',
      url: 'https://keynote.vercel.app/github.html',
      date: '17 April 2021',
    },
    {
      title: 'Incremental Static Regeneration',
      url: 'https://keynote.vercel.app/isr.html',
      date: '13 November 2020',
    },
    {
      title: 'ESM Import & Bundle Free',
      url: 'https://keynote.vercel.app/bundle-free.html',
      date: '14 August 2020',
    },
    {
      title: 'Svelte 入门',
      url: 'https://keynote.vercel.app/svelte.html',
      date: '16 August 2019',
    },
    {
      title: 'React-Navigation和Expo的应用',
      url: 'https://keynote.vercel.app/expo.html',
      date: '31 March 2019',
    },
    {
      title: '微前端与Web Components',
      url: 'https://keynote.vercel.app/microfrontend.html',
      date: '2 APRIL 2019',
    },
    {
      title: '小程序开发实战',
      url: 'https://keynote.vercel.app/weapp.html',
      date: '26 November 2018',
    },
    {
      title: 'PWA开发实战',
      url: 'https://keynote.vercel.app/pwa.html',
      date: '26 November 2018',
    },
    {
       title: 'Vue-cli3.0',
       url: 'https://keynote.vercel.app/vue-cli.html',
       date: '18 October 2018',
    },
    {
       title: 'Vue单元测试',
       url: 'https://keynote.vercel.app/vue-test.html',
       date: '8 November 2018',
    },
    {
      title: 'Vue开发规范',
      url: 'https://keynote.vercel.app/vue-specification.html',
      date: '12 October 2017'
    },
    {
      title: 'Vue技术选型与Webpack入门',
      url: 'https://keynote.vercel.app/vue-startup.html',
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
      <p><a sveltekit:prefetch href={keynote.url}>{keynote.title}</a></p>
      <div class="post-item-footer">
        <span class="post-item-date">— {keynote.date}</span>
      </div>
    {/each}
  </div>
  