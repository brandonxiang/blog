---
title: Svelte笔记一：入门脚手架
date: "2019-10-27T08:38:00.000Z"
---

> 源码 github 地址在此，记得点星：[brandonxiang/svelte-webpack-mpa](https://github.com/brandonxiang/svelte-webpack-mpa)

## 背景

[svelte](https://github.com/sveltejs/svelte)是来自[rollup](https://github.com/rollup/rollup)的作者 Rich Harris，它主打的就是轻量和高效开发效率。如今开发的项目除了后台系统外，其他前端项目基本都是基于移动端页面，资讯页面，博客为主。一个轻量级的框架能解决非常多的问题。

> 一项调查统计了现实世界中 Web 应用使用多种 Web 框架构建的相关数据。统计显示，使用一些流行框架的应用经过 gzip 压缩后的大小（KB）分别为：
> Angular + ngrx：134
> React + Redux：193
> Vue：41.8
> Svelte：9.7

## 前端框架给我们提供什么

在做了那么多的前端项目之后，前端框架到底带给我们什么样的开发体验。毫无疑问的是效率的提高，但是如果要考虑到极致的用户体验，极小的项目构建体积是每一个前端项目必须考虑的一个问题，尤其是移动端的项目。减少 20kb js 大小，给用户带来的用户体验优化是非常大的，特别在弱网环境。svelte 应该是如今最轻量级的前端框架之一。它的轻量是建立于没有多余的运行时，没有 virtual dom 的基础上。类似 vue 的构思，所有的逻辑会集中于模版处理本身。

在 web component 还未成熟的时代下，一个标准的前端框架是非常有必要的，有助于提高我们项目的开发效率。我总结为以下两个点：

- 数据流的处理
- 组件化以及代码复用

然而 svelte 给予开发者的东西不多不少，刚好是这些内容。

## virtual-dom 的价值

svelte 的优势站在损失掉 virtual-dom 的基础之上，但是缺少了 virtual dom 页面就会慢很多吗？还是变得更快。这样，给予我们一个思考题。前端框架到底需不需要一个 virtual dom？

Rich Harris 大佬的[virtual-dom-is-pure-overhead](https://svelte.dev/blog/virtual-dom-is-pure-overhead)一文中，指出 virtual dom 并非免费的午餐，它也会带来性能和内存上的消耗。例如一个 HelloWorld 的组件，要把`props`的值进行修改，需要三个步骤：

1. 先后两次 virtual dom 要记录下来，对相同的节点进行比较
2. 需要把该节点上所有的属性进行对比，记录下变动的内容
3. 更新真实 dom

svelte 则是省去前面两步，直接更新 dom，它是一个 compiler，对已有的组件进行预编译，最终实现的代码。关键的步骤都已经在编译过程中完成了。

```javascript
if (changed.name) {
  text.data = name;
}
```

尤大大发推说 vue3 能够比 svelte 更加快。具体的情况现在还无从考证。而且有时候 benchmark 不能说明所有的问题，因为现实的开发情况往往和 benchmark 不太一样。但是有一点我是能确认的就是越贴近原生性能越好，除了后台页面外，其他的页面 svelte 有着天然的优势，因为它的体积小，作用纯粹。

![Twitter](/img/twitter.png)

## 多页面开发模版

由于 svelte 的轻量化的特性，我会将它和多页面打包联想在一起。与 SPA 的统一集成性不同，每个页面往往都是独立运作，项目中各种活动页面，运营页面都是如此。由于打包后的 js 包很小，所以 ssr 的效果也不再明显。对于首屏显示要求不高的业务场景，完全可以考虑 CSR 或者静态直出即可。

[brandonxiang/svelte-webpack-mpa](https://github.com/brandonxiang/svelte-webpack-mpa)是一个多页面开发模版，基于以往多页面的开发经验。

里面自带了[svelte-preprocess](https://github.com/kaisermann/svelte-preprocess)，[Postcss](https://github.com/postcss/postcss)的[Autoprefixer](https://github.com/postcss/autoprefixer)插件有助于处理浏览器的兼容问题，你也可以自行配置 scss 或者 less。

### 使用方法

```shell
npx degit brandonxiang/svelte-webpack-mpa svelte-app
yarn
# or
npm i
```

### 开发

`dev`是起服务的命令。`http://localhost:9000/page1.html`是第一个页面。`http://localhost:9000/page2.html`则是第二个页面，`build`则是构建命令。

```shell
yarn dev
# or
npm run dev
```

### 配置 scss

svelte 的官方源码把所有代码预编译都会经过 preprocess，是为了让开发者自行调整，而[svelte-preprocess](https://github.com/kaisermann/svelte-preprocess)帮你完成了 99%的工作，只需要装上相关依赖，写好配置即可。

```javascript
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: require('svelte-preprocess')({
                pug({ /* pug options */ }),
                scss({ /* scss options */ }),
                coffeescript({ /* coffeescript options */ })
            })
          },
        },
      },
      ...
    ]
  }
  ...
```

## 吐槽

svelte 对于 typescript 的支持不是特别友好，因为它是以模版语言为基础的。这一点和 vue 类似，如果以模版为 SFC 的开发形式，vue 的组件属性类型判断并不如 react 友好。期待一下 vue3 和 svelte 的后续 ts 支持。

## 语法

svelte 进入 3.0 后，语法借鉴了 vue 的 SFC 语法，非常简单。[官网](<[https://svelte.dev/examples](https://svelte.dev/examples)>)上有很多栗子，这里只提及一个循环渲染的栗子，语法类似模版语言，数值的插值使用`{}`，大家感受一下，熟悉 vue 的童鞋应该很熟悉。由于框架中没有 virtual-dom，所以不需要像 vue 和 react 一样需要 dom 根节点。

```html
<script>
  let cats = [
    { id: "J---aiyznGQ", name: "Keyboard Cat" },
    { id: "z_AbfPXTKms", name: "Maru" },
    { id: "OUtn3pvWmpg", name: "Henri The Existential Cat" },
  ];
</script>

<h1>The Famous Cats of YouTube</h1>

<ul>
  {#each cats as { id, name }, i}
  <li>
    <a target="_blank" href="https://www.youtube.com/watch?v={id}">
      {i + 1}: {name}
    </a>
  </li>
  {/each}
</ul>
```

## 参考资料

- [被称为“三大框架”替代方案，Svelte 如何简化 Web 开发工作](https://mp.weixin.qq.com/s/5Y822yLWy0Kp-OqgyQx7NQ)

### 题外话

shopee，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](mailto:weiping.xiang@shopee.com)，非诚勿扰。
