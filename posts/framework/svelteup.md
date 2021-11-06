---
title: svelteup -- 实现 web component 的最佳实践
date: 2021-11-06T12:51:00.000Z
---

## 背景

svelte是新晋的前端框架。在打包体积和页面显示性能上有着不可磨灭的意义。现在越来越多网站上都已经能看到它的身影。之前我也对它的源码有了深入的解读，《[Svelte笔记三：runtime源码解读](https://brandonxiang.vercel.app/blog/svelte3)》和《[Svelte笔记四：compile源码解析](https://brandonxiang.vercel.app/blog/svelte4)》两篇文章可以作为参考。 svelte的优势很明显， 主要在体积极小和预编译组件逻辑。没有virtual dom，让业务代码更加纯粹地集中在页面显示上。

web component 一直是大家很想落地的一个浏览器新技术，但是实际应用上我们却很难看到。即使是在微前端方面它都非常难落地。web component和Server Side Rendering（SSR）的两个概念是不搭的，它更多一切从浏览器出发，在不考虑ie的兼容性的情况下，已经达到了可用的情况。它的使用方式很简单，直接在页面中写入自定义的标签即可，例如 `<my-element />`，但是 native web component 的开发语法确实让开发者难以适应。

![custom elements 兼容性](https://brandonxiang.vercel.app/img/custom-elements.png)


svelte 和 web component 的概念一拍即合。由于 native web component 现在还不成熟，用它去实现一些页面的难度（学习成本和心智负担）会较大，不太适合新手学习。你可能会问使用像lit-element这样的框架写 web component 是否合适？《[A Comparison Of Web Component Solutions](https://hackernoon.com/a-comparison-of-web-component-solutions-xu163u3o)》、《[All the Ways to Make a Web Component](https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component-april2020/)》这两篇文章很好地对比了第三方框架 svelte、stencil、lit-element、Lightning Web Components 的各个优缺点，证明了svelte在体整体体积和它的易用性有着独特的优势。《[Custom Elements Everywhere](https://custom-elements-everywhere.com/)》一文横向对比了18款框架转 web component，svelte的支持度非常好。

## 什么是 svelteup

[svelteup](https://github.com/brandonxiang/svelteup) 的诞生，目标更多是为了满足独立的小工具页面和已有页面的插入小组件。这些页面就非常适合用svelte进行实现，正是因为它“小运行时”的特点，很贴近浏览器，用最原生最底层的方式去实现网页的组件库。

svelteup是由三个概念混合而成，svelte是前端框架，esbuild是编译工具，web component是输出产物。在浏览器中使用就是以web component的方式。它的优势就是“快，轻量，直接，好用、客户端渲染”。

> svelteup = svelte + esbuild + web component

> svelteup  = client rendering + light we!ight + extremely fast 

svelteup的使用非常简单，初始约定了 component 文件夹作为组件代码的位置，而 public 文件夹则是托管静态资源的目录。这些都可以通过cli、配置文件或者js api进行配置，详情参考[文档](https://github.com/brandonxiang/svelteup)。借助于svelteup可以实现组件打包和页面开发调试等工作。

```bash
# 组件打包
svelteup
# 页面开发调试
svelteup -s public
```

## 什么样的项目需要svelteup

我承认svelteup并不完美，没有一个工具是完美，没有一个工具能够覆盖所有项目。它更适合：

- “客户端渲染页面”
- “对包体积要求极高的小工具”
- “插入已有页面的组件”

svelte打包产物极小，所以性能和react、vue比就是天然优势。如果你想用它去写个简单页面，[svelteup-starter](https://github.com/brandonxiang/svelteup-starter)是一个最简单的初始化模版，值得你去尝试。

## svelteup的最佳实践

### 实践一：基于 [reveal.js](https://github.com/hakimel/reveal.js) 的 [keynote-svelte](https://github.com/WhatisHappyPlanet/keynote-svelte) 模版

reveal.js 是一款完成度很高、历史悠久的在线ppt库，著名的[slides](https://slides.com/)网站就是基于它。它能够让你的分享有很好的传播力。我一直使用它的 markdown 扩展工具 "[webpro/reveal-md](https://github.com/webpro/reveal-md)" 来写一些技术分享。其使用很简单，只需要以markdown的形式来写ppt的内容，利用reveal-md运行和打包即可，“[brandonxiang的分享](https://github.com/brandonxiang/keynote)” 值得参考一下。

![reveal.js](https://brandonxiang.vercel.app/img/revealjs.png)

它可以实现 markdown 和 html 混写，有较高的灵活度。但是，如果html要考虑复用，你只能复制粘贴，怎么能够将html组件插入到已有的ppt页面？很直接的一个想法就是利用svelteup来实现插入式的组件。

举个例子，如果你想几个页面能够显示一个同样的标签。你可以用svelte的语法简单写一个组件，打包一个web component。你可以在 markdown 中直接使用`<name-corner></name-corner>`。这里注意 `svelte:options` 的语法可以定义web component的名字。这里没有使用黑魔法，只是用天然的浏览器特性给你的ppt如虎添翼。

```html
<svelte:options tag="name-corner" />
<div class="box">
	<slot>
		<em>Created by Brandonxiang</em>
	</slot>
</div>

<style>
	.box {
		width: 300px;
		border: 1px solid #aaa;
		border-radius: 2px;
		box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
		padding: 1em;
		margin: 0 0 1em 0;
	}
</style>
```

[keynote-svelte](https://github.com/WhatisHappyPlanet/keynote-svelte) 就是这个基于svelteup和reveal-md的在线ppt初始化模版，欢迎尝鲜。

### 实践二：[chrome-extension-svelte](https://github.com/brandonxiang/chrome-extension-svelte)

chrome的插件已经是非常成熟的工具载体，聪明的开发者可以利用它开发提高效率的工具。它的实现是通过html的页面渲染和插件线程之间的通讯。在开发的过程当中，不可避免的是组件化。chrome插件和SSR无关，但是和 svelteup 则是相辅相成。[chrome-extension-svelte](https://github.com/brandonxiang/chrome-extension-svelte) 就是基于svelteup的chrome插件的初始化开发模版。借助svelte的轻量，该模版可以大大提高你的开发效率和插件显示效率。

### 实践三：版本切换小工具

在业务需求迭代的过程中，我们会考虑按需求分支来虚拟环境。而Version-Tool是一个虚拟多环境的版本切换小工具，它的主要工作只是为了给页面设置cookie带上版本参数。它的第一个版本是采用 **react + ant desgin + axios + webpack** 这样的技术栈，在没有gzip的情况下，结果打包体积在**2.1M左右**，体积太大到了不能接受的地步。

该工具采用svelteup工具进行重构，通过自定义组件替换ant design，利用fetch来替换axios。既能够保证功能的统一和组件的拓展性，也能够有效减少产物体积。在没有gzip的情况下，体积有效减少到**13kb**，是**以前的165分之一**，小了超过一百倍。这时候你可以看到svelte的应用价值。

## 总结

以上三个实践，从易用性、产物体积和拓展性等方面，展示了svelteup的用途和定位。在现代前端发展的过程当中，我们的目标是为了把页面做得更贴近浏览器，更贴近高性能。svelte的体积小和web原生组件不谋而合，希望这个工具可以打造很多原生组件在其他项目中直接使用。
