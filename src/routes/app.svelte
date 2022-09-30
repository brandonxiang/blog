<script>
  let apps = [
    {
      title: 'pwaland',
      url: 'https://pwaland.brandonxiang.top/',
      description: 'PWA应用推荐网站',
    },
    {
      title: 'pb to typescript',
      url: 'https://pb.brandonxiang.top/',
      description: 'Protobuffer转typescript类型定义文件',
    }
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
  
  <h1>应用推荐</h1>
  
  <div>
    {#each apps as app, index}
      <p><a sveltekit:prefetch href={app.url}>{app.title}</a></p>
      <div class="post-item-footer">
        <span class="post-item-date">— {app.description}</span>
      </div>
    {/each}
  </div>
  