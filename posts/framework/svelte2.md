---
title: Svelte笔记二：从零搭建服务端渲染
date: 2020-02-06T12:51:00.000Z
---

> 源码 github 地址在此，记得点星：[svelte-ssr](https://github.com/brandonxiang/svelte-ssr)

服务端渲染大家应该不陌生了吧，[next.js 的从零到百入门配置](https://brandonxiang.top/blog/react4)已经很好地介绍了怎么去构建一个简单的服务端渲染项目，当然，next.js 是 react 框架下最成熟的服务端渲染框架，在它的帮助下，搭建服务端渲染非常简单高效。但是从程序员自我增长的角度上看，成熟的框架反而会妨碍原理的学习。[Sapper](https://github.com/sveltejs/sapper)则是相当于 Svelte 的 next.js。

所以类似[React 笔记三：从 0 开始搭建项目配置](https://brandonxiang.top/blog/react3)，学会如何从零搭建服务端渲染是非常重要的，这次，Svelte 框架也可以实现服务端渲染，虽然 Svelte 并没有 Virtual Dom 的机制，但是它同样具备了同构的能力。首先，复习一下“同构”是什么意思？所谓的“服务端渲染”可以由很多种方法来实现。同构能力是由前端框架层面决定的，像“Vue”，“React”，“Svelte”当然可以实现同构渲染，而是否在意数据的实时性则是决定了是动态渲染还是静态渲染。动态渲染是需要起服务，需要计算服务器的压力，但是也保证了数据的实时性和页面的高显示效率。静态渲染则不需要考虑服务端的压力，而有取舍，需要 leader 们根据实际情况决策。

![Nodejs服务端渲染](https://brandonxiang.top/img/nodejs-ssr.png)

而不实现同构一样可以达到服务端渲染的功能，其中一种就是取快照，同构 pupteer 等工具实现快照获取，这种方法明显是各种前端框架通吃的方案，该方案的缺点在于“治标不治本”。这种方法与静态渲染得到的页面是可以直接放在 cdn 上，达到 JAMStack 的标准。另一种方法则是 Node 后端框架模版渲染，需要起服务，需要计算服务器压力，不如 SSR 动态渲染。

## webpack 配置文件

[Svelte 笔记一：入门脚手架](https://brandonxiang.top/blog/react1)介绍了 svelte 基本原理在于 compiler 的预编译，把代码编译成为最小的 dom 操作单元，数据变化会触发 dom 的更新。而 compiler 提供两种模式 dom 和 ssr，dom 是我们常见的客户端渲染（csr）。ssr 则是服务端渲染模式，同构的代码会在服务端先跑一遍。项目中需要两个 webpack 配置文件，分别对应 server 和 client，两个不同的入口文件，两个 svelte-loader 的配置也有所不一样。服务端的配置需要设置`css:false`说明 css 文件将不会混入 js 代码中。客户端的配置里面的`hydratable`指的是客户端激活，当客户端加载完成后，需要对已有的 dom 进行激活。

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

这里采用 webpack 的 node API，先运行服务端配置的 webpack，得到 svelte 组件对象，`AppServer.render`则会得到预渲染得到的 html，css，head 等字符串，将其拼接到 index.html，再运行客户端配置的 webpack，则会得到动态渲染好的页面。

```javascript
const { default: AppServer } = require("../dist/server");
const App = await AppServer.render();
```

## preload 服务端拉取数据

在当前中国的 4g 网络环境下，服务端渲染的魅力不在于 html 的拼接，而是在于数据呈现给用户的时间，也就是 time to content。光有页面不够，内容请求时间的优化才是关键。

这里利用了 svelte 的[script_context_module](https://svelte.dev/docs#script_context_module)的特性，即当`<script\>`标签有 `context="module"`属性的时候， 暴露方法能够被组件外部调用。Sapper 提供了方法 preload 里面执行着服务端预拉取数据的逻辑，大大提高了页面的显示效率。

在 App.svelte 当中，添加数据预取的逻辑并返回该数据，数据则会以 props 的形式传递到组件当中。

```html
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

服务端的代码如下，preload 的方法在组件渲染前先调用，得到预取的数据，将预取的数据传入组件内进行预渲染，得到有内容的组件。

```javascript
const { default: AppServer, preload } = require("../dist/server");
let propsData = {};
if (preload) {
  propsData = await preload();
}
const App = await AppServer.render(propsData);
```

## 总结

所有的 SSR 框架基本上都是这么一个原理，不过，svelte 相对来说，比较轻量，所以看起来比较清晰。感兴趣的同学可以研究一下[Vue SSR 指南](https://ssr.vuejs.org/zh/)。
