---
title: Svelte笔记二：从零搭建服务端渲染
date: 2020-02-06T12:51:00.000Z
---

> 源码github地址在此，记得点星：[svelte-ssr](https://github.com/brandonxiang/svelte-ssr)

服务端渲染大家应该不陌生了吧，[next.js的从零到百入门配置](https://brandonxiang.vercel.app/blog/react4)已经很好地介绍了怎么去构建一个简单的服务端渲染项目，当然，next.js是react框架下最成熟的服务端渲染框架，在它的帮助下，搭建服务端渲染非常简单高效。但是从程序员自我增长的角度上看，成熟的框架反而会妨碍原理的学习。[Sapper](https://github.com/sveltejs/sapper)则是相当于Svelte的next.js。

所以类似[React笔记三：从0开始搭建项目配置](https://brandonxiang.vercel.app/blog/react3)，学会如何从零搭建服务端渲染是非常重要的，这次，Svelte框架也可以实现服务端渲染，虽然Svelte并没有Virtual Dom的机制，但是它同样具备了同构的能力。首先，复习一下“同构”是什么意思？所谓的“服务端渲染”可以由很多种方法来实现。同构能力是由前端框架层面决定的，像“Vue”，“React”，“Svelte”当然可以实现同构渲染，而是否在意数据的实时性则是决定了是动态渲染还是静态渲染。动态渲染是需要起服务，需要计算服务器的压力，但是也保证了数据的实时性和页面的高显示效率。静态渲染则不需要考虑服务端的压力，而有取舍，需要leader们根据实际情况决策。

![Nodejs服务端渲染](https://upload-images.jianshu.io/upload_images/685800-7e641350b5b78105.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而不实现同构一样可以达到服务端渲染的功能，其中一种就是取快照，同构pupteer等工具实现快照获取，这种方法明显是各种前端框架通吃的方案，该方案的缺点在于“治标不治本”。这种方法与静态渲染得到的页面是可以直接放在cdn上，达到JAMStack的标准。另一种方法则是Node后端框架模版渲染，需要起服务，需要计算服务器压力，不如SSR动态渲染。

## webpack配置文件

[Svelte笔记一：入门脚手架](https://brandonxiang.vercel.app/blog/react1)介绍了svelte基本原理在于compiler的预编译，把代码编译成为最小的dom操作单元，数据变化会触发dom的更新。而compiler提供两种模式dom和ssr，dom是我们常见的客户端渲染（csr）。ssr则是服务端渲染模式，同构的代码会在服务端先跑一遍。项目中需要两个webpack配置文件，分别对应server和client，两个不同的入口文件，两个svelte-loader的配置也有所不一样。服务端的配置需要设置`css:false`说明css文件将不会混入js代码中。客户端的配置里面的`hydratable`指的是客户端激活，当客户端加载完成后，需要对已有的dom进行激活。

```javascript
// webpack.server.config.js
{
   css: false,
   generate: 'ssr',
}
// webpack.client.config.js
{
   hydratable: true,
   emitCss: true,
   hotReload: true,
}
```

这里采用webpack的node API，先运行服务端配置的webpack，得到svelte组件对象，`AppServer.render`则会得到预渲染得到的html，css，head等字符串，将其拼接到index.html，再运行客户端配置的webpack，则会得到动态渲染好的页面。

```javascript
const { default: AppServer } = require('../dist/server'); 
const App = await AppServer.render(); 
```

## preload服务端拉取数据

在当前中国的4g网络环境下，服务端渲染的魅力不在于html的拼接，而是在于数据呈现给用户的时间，也就是time to content。光有页面不够，内容请求时间的优化才是关键。

这里利用了svelte的[script_context_module](https://svelte.dev/docs#script_context_module)的特性，即当`<script\>`标签有 `context="module"`属性的时候， 暴露方法能够被组件外部调用。Sapper提供了方法preload里面执行着服务端预拉取数据的逻辑，大大提高了页面的显示效率。

在App.svelte当中，添加数据预取的逻辑并返回该数据，数据则会以props的形式传递到组件当中。

```javascript
// App.svelte
<script context="module">
  import axios from 'axios';
  export async function preload() {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos?_limit=20`
    );
    return { photos: data };
  }
</script>
```
服务端的代码如下，preload的方法在组件渲染前先调用，得到预取的数据，将预取的数据传入组件内进行预渲染，得到有内容的组件。

```javascript
const { default: AppServer, preload } = require('../dist/server');
let propsData = {};
if (preload) {
  propsData = await preload();
}
const App = await AppServer.render(propsData);
```

## 总结

所有的SSR框架基本上都是这么一个原理，不过，svelte相对来说，比较轻量，所以看起来比较清晰。感兴趣的同学可以研究一下[Vue SSR 指南](https://ssr.vuejs.org/zh/)。





