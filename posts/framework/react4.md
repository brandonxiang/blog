---
title: React笔记四：next.js的从零到百入门配置
date: 2019-05-11T00:13:53.000Z
description: 前端工程化
---

接触了 react 很长一段时间，终于有时间给我接触到实际的项目当中，虽然只是个`entry task`，我希望能够将在 vue 所学到的优化点都运用到 react 上。首先选型肯定是 next.js，它是一个轻量级的服务端渲染框架。在现在 node 服务端横行的年代，首屏直出的效果是非常重要的，除了 seo 的要求外，用户体验的提升是非常明显的。

这里直出分为：

- 静态直出（静态化）
- 动态直出（服务端渲染）
- 预渲染（prerender-spa-plugin）

其中，静态直出和动态直出是利用 react 的 renderToNodeStream 或者 vue 的 renderToString 的 api 实现了将 dom 监控直出到 node 端，可以动态实时渲染数据（其中会有秒级 cache）或者静态化渲染。预渲染则是采用[puppeteer](https://github.com/GoogleChrome/puppeteer)在构建时将首屏的 dom 结构提前抓取下来构造成为 html。其中静态化渲染效果应该和预渲染效果是接近的，都是 html 的内容是死的，而非数据真实动态数据。静态化广泛运用在[vuepress](https://github.com/vuejs/vuepress)和[gatsby](https://github.com/gatsbyjs/gatsby)，这种技术更多是服务于博客或者网站官网。

相比之下，动态直出在列表渲染等因为用户数据动态变化的页面有着它天然的优势。

为什么说[next.js](https://github.com/zeit/next.js)是轻量级框架？它的出现有着渐进式的感觉。阿里出了[umijs](https://github.com/umijs/umi)企业级插件化前端框架，但是太过于繁琐，不适合新手上手。next.js 的插件化目的性更加明确。以下是 next.js 的官方插件，可以很轻易的接入`css modules`、`typescript`等。在 ssr 的框架里面算是非常友善，可以有非常丰富的[examples](https://github.com/zeit/next.js/tree/canary/examples)。

- [@zeit/next-mdx](https://github.com/zeit/next-plugins/blob/master/packages/next-mdx)
- [@zeit/next-css](https://github.com/zeit/next-plugins/blob/master/packages/next-css)
- [@zeit/next-sass](https://github.com/zeit/next-plugins/blob/master/packages/next-sass)
- [@zeit/next-less](https://github.com/zeit/next-plugins/blob/master/packages/next-less)
- [@zeit/next-stylus](https://github.com/zeit/next-plugins/blob/master/packages/next-stylus)
- [@zeit/next-preact](https://github.com/zeit/next-plugins/blob/master/packages/next-preact)
- [@zeit/next-typescript](https://github.com/zeit/next-plugins/blob/master/packages/next-typescript)
- [@zeit/next-bundle-analyzer](https://github.com/zeit/next-plugins/blob/master/packages/next-bundle-analyzer)
- [@zeit/next-source-maps](https://github.com/zeit/next-plugins/blob/master/packages/next-source-maps)
- [@zeit/next-workers](https://github.com/zeit/next-plugins/blob/master/packages/next-workers)

### 如何快速从零构建构建 next.js

首先初始化项目，安装三个依赖，配置`npm script`，框架已经搭建完成。其中，`next`用于开发环境的调试。`next build`用于构建服务端资源。将资源移交到服务器后，`next start`命令启动 node 服务。`next export`是用于静态化资源，静态化的资源可以用于降级。

```shell
yarn add next react react-dom
```

```json
{
	"scripts": {
		"dev": "next",
		"build": "next build",
		"start": "next start",
		"export": "next export"
	}
}
```

这时需要建个`\pages`的文件夹，里面新建文件`index.js`，写入 react 组件，组件会自动注入到 SPA 当中。其中 pages 是一个目录，所有的页面都会根据文件的存放格式自动生成路由，这也免去了[react-router](https://github.com/ReactTraining/react-router)的干扰。

```javascript
export default () => <div>Welcome to next.js!</div>;
```

### 项目的从一到十

掘金有一篇文章[Next.js 踩坑入门系列](https://juejin.im/post/5b83e1776fb9a01a2022879b)。我读完这个系列后，发现这些文章果然有坑。我在这里帮忙填坑。项目的页面 Layout 配置，并非生成组件去完成，而是可以通过自定义重写 pages 目录当中的`_app.js`和`_document.js`。这些都属于 next.js 走向高阶的必经之路。例如，\_app.js 的重写就由以下几个优点，额外 next 提供了`getInitialProps`的生命周期，完成服务端数据的获取工作，这部分代码是跑在服务端，而且每个页面组件一样存在`getInitialProps`的生命周期（这里不用担心像 vue 一样 created 的生命周期是走在服务端）。

- 保持页面间跳转的功能，不同页面会走一样的生命周期
- 页面间跳转时候保持 state
- 全局错误处理
- 额外的插件处理（例如 mobx 的引入）

```javascript
//_app.js
import React from 'react';
import App, { Container } from 'next/app';

class MyApp extends App {
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};

		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		return { pageProps };
	}

	render() {
		const { Component, pageProps } = this.props;

		return (
			<Container>
				<Component {...pageProps} />
			</Container>
		);
	}
}

export default MyApp;
```

这时候，有人会问，如果要内联一些脚本，自定义引用外部 css 或 js，seo 要加入 meta 标签要怎么办？

这时`_document.js`需要被重写，`next`还提供了`Head`组件方便你自定义<head>，并且可以把<html>, <body>等重写。

```javascript
// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html>
				<Head>
					<style>{`body { margin: 0 } /* custom! */`}</style>
				</Head>
				<body className="custom_class">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
```

有了这两个自定义方案，很多场景都可以被自定义，项目也可以灵活起来。

### 项目的从十到百

需要各位同学的实战和研究，[next.js/examples](https://github.com/zeit/next.js/tree/canary/examples)有大量值得学习的栗子，可供借鉴模仿，我相信很多代码模仿能力好的同学绝对不会错过。

也可以通过执行`create-next-app`的命令来了解例子。

```shell
npx create-next-app --example with-typescript with-typescript-app
# or
yarn create next-app --example with-typescript with-typescript-app
```

### 题外话

[shopee](https://shopee.cn/)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](mailto:weiping.xiang@shopee.com)，非诚勿扰。
