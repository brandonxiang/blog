---
title: 如何识别前端项目的技术栈构成
date: 2024-05-20T12:00:00.000Z
---

一个第三方的技术项目，你可能会看看它的源码，并分析它的技术栈构成。举个栗子，openai 的官网是nuxtjs写的，它部署在 Azure，使用了 tailwind css。例如，nodejs 的官网是由 nextjs 写的，部署在 vercel。这些能帮助你去初步了解“优质项目”，它们是怎么做技术选型的，扒清楚它的项目构成，这是一个前端人员学会“学习”的必要路径。

无论是 Web 端还是 App 端，只要是客户端，我们都能够在项目中找到“蛛丝马迹”。

## Website 分析

《[Wappalyzer](https://www.wappalyzer.com/)》

利用插件直接做 Web页面分析。除了技术栈的分析，还能分析出 CDN、 CMS、支付处理器、问题跟踪器、[用户界面（UI）框架](https://www.wappalyzer.com/technologies/ui-frameworks/?utm_source=popup&utm_medium=extension&utm_campaign=wappalyzer)等额外信息和商业工具，它也能够分析出来，功能十分强大。

![Wappalyzer](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ddd84d9b95744188124dbc6d5581ac7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=960&h=720&s=339545&e=png&b=ec1688)

## App 分析

《[LibChecker](https://play.google.com/store/apps/details?id=com.absinthe.libchecker)》

如果你懂得 RN 或者 hybrid H5 开发，App 层面的“组成情况”可能更能够吸引你。这里主要指的是 Android 平台。LibChecker 是一个开源软件，它的 github 地址：[LibChecker地址](https://github.com/LibChecker/LibChecker)，它的核心功能就是用于分析项目中的重要组成部分，有趣的是它的判断规则也是通过一个独立仓库管理的，是一个小而美的工具。如图所示，我们可以很清楚的发现”小红书“是典型的React Native 应用。

![LibChecker](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0ae5090897b4c1e950e2715fbf3142f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=960&h=720&s=460297&e=png&b=e9148d)

《[android开发工具箱](https://app.mi.com/details?id=com.su.assistant.pro&ref=search)》

这款应用则是一款非开源的应用，判断技术栈构成只是它的一部分功能，功能强大，不再展开。

![android开发工具箱](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96a7dc9d3f7d4ec1874e33c8bceccf61~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=960&h=720&s=413847&e=png&b=ef1481)

## Library 分析

《[npmgraph](https://npmgraph.js.org/)》

对于前端开发，往往应用层面的分析已经不能满足我们的诉求，我们希望能够深入到 npm Library内部，npmgraph 就是用于分析 npm 包的依赖关系网络。以 vite 为例，它的重要组成部分是 esbuild 和 rollup。出名的 library 一般它的依赖都会很慎重，因为 npm 真的是“黑洞”啊。

![npmgraph](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcdf5ac7d0cd41d08dda2300f9f58590~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1810&h=969&s=215859&e=png&b=ffffff)

《[Bundlephobia](https://bundlephobia.com/)》

如果这个 library 用在前端侧并非 nodejs 侧。bundlephobia 就非常推荐给你，它主要用于分析 library 的包体积。同时它也具备分析依赖组成的能力。

![Bundlephobia](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba94442c8c8146c8ab01a0995b2b82f5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1056&h=677&s=44394&e=png&b=ffffff)

## 总结

该 blog 是一个小分享。分享一种学习方法，在没有“反编译”和“非法操作”的情况下，我们怎么掌握一种学习方法。从另一种角度分析一个项目。
