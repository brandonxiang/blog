<script>
  let keynotes = [
    {
      title: '前端项目架构设计',
      url: 'https://keynote.vercel.app/how-to-learn-fe.html',
      date: 'Nov 12, 2021',
    },
    {
      title: '学习前端的方法',
      url: 'https://keynote.vercel.app/how-to-learn-fe.html',
      date: 'AUG 06, 2021',
    },
    {
      title: '使用Next.js实现优雅降级',
      url: 'https://keynote.vercel.app/nextjs-fallback.html',
      date: 'JUN 12, 2021',
    },
    {
      title: '如何参与一个开源项目',
      url: 'https://keynote.vercel.app/github.html',
      date: 'APR 17, 2021',
    },
    {
      title: 'Monorepo',
      url: 'https://keynote.vercel.app/monorepo.html',
      date: 'MAR 05, 2021',
    },
    {
      title: 'Incremental Static Regeneration',
      url: 'https://keynote.vercel.app/isr.html',
      date: 'NOV 13, 2020',
    },
    {
      title: 'ESM Import & Bundle Free',
      url: 'https://keynote.vercel.app/bundle-free.html',
      date: 'AUG 14, 2020',
    },
    {
      title: 'Svelte 入门',
      url: 'https://keynote.vercel.app/svelte.html',
      date: 'Aug 16, 2019',
    },
    {
      title: 'React-Navigation和Expo的应用',
      url: 'https://keynote.vercel.app/expo.html',
      date: 'MAR 31, 2019',
    },
    {
      title: '微前端与Web Components',
      url: 'https://keynote.vercel.app/microfrontend.html',
      date: 'APR 02, 2019',
    },
    {
      title: '小程序开发实战',
      url: 'https://keynote.vercel.app/weapp.html',
      date: 'NOV 26, 2018',
    },
    {
      title: 'PWA开发实战',
      url: 'https://keynote.vercel.app/pwa.html',
      date: 'NOV 26, 2018',
    },
    {
       title: 'Vue-cli3.0',
       url: 'https://keynote.vercel.app/vue-cli.html',
       date: 'OCT 18, 2018',
    },
    {
       title: 'Vue单元测试',
       url: 'https://keynote.vercel.app/vue-test.html',
       date: 'NOV 08, 2018',
    },
    {
      title: 'Vue开发规范',
      url: 'https://keynote.vercel.app/vue-specification.html',
      date: 'OCT 12, 2017'
    },
    {
      title: 'Vue技术选型与Webpack入门',
      url: 'https://keynote.vercel.app/vue-startup.html',
      date: 'JUN 09, 2017',
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
  
  <h1>最近分享</h1>
  
  <div>
    {#each keynotes as keynote, index}
      <p><a sveltekit:prefetch href={keynote.url}>{keynote.title}</a></p>
      <div class="post-item-footer">
        <span class="post-item-date">— {keynote.date}</span>
      </div>
    {/each}
  </div>
  