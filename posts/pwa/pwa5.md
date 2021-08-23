---
title: PWA笔记五：Workbox实战应用
date: "2019-11-05T18:49:00.000Z"
---

## 引言

网页缓存分为两大类，分别是服务器缓存和客户端缓存。SSR 属于浏览器缓存，service worker 属于浏览器缓存。

在第二次加载的时候，一般有 HTTP 缓存或者客户端缓存，但是在弱网的情况下，HTTP 缓存往往是不够用的。很多 app 会考虑改变网络框架的情况，优先加载本地资源，再去检查资源是否被更新，以此提高静态资源加载效率。PWA 中的 service-worker 可以被看作类似的一个代理，它改变了整个缓存结构。目前，ios11.4 已经支持 ServiceWorker 和 Web App Manifest，支持 PWA 添加到桌面。

Service Worker 的未来是在用户允许的基础上，提供接近 native app 的功能，例如：

- web push
- background sync

### web push

服务器可以定期给网页推送消息，区别于其他的传统网页。用户在打开浏览器时，不需要进入特定的网站，就能收到该网站推送而来的消息，例如：新评论，新动态等等。

### background sync

background sync 可延迟发送用户行为，直到用户网络连接稳定。这样有助于保证用户想要发送的数据就是实际发送的数据。

这些功能则会涵盖在 workbox 的功能内部。

## 历史背景

有很多文章把 pwa 技术和小程序技术放在一起比较。谷歌浏览器至于 pwa，微信至于小程序，都是给网页应用提供了离线缓存静态资源文件的功能，动静分离，native 的接口，这些都是给网页应用提供更优质的加载性能。但是小程序并没有 BOM 和 DOM，意味着它对浏览器有着更深入的改造，它并非纯正意义上的网页应用，是对所有 Web 开发资源的一种限制。

相反，pwa 则不一样。

### 兼容性情况

![浏览器的兼容性](https://brandonxiang.vercel.app/img/caniuse-serviceworker.png)

考虑到 service worker 是一个新的接口本身，肯定会存在兼容性问题。PWA 的意思在于 Progressive，也就是支持 pwa 的页面则使用 SW 的缓存机制，而不支持的页面使用原来的 HTTP 缓存机制。由于 pwa 是谷歌的“亲儿子”，所以它在新版本安卓的各大浏览器都有非常好的支持。详情我们可以参考[lavas 的兼容性报告](https://lavas.baidu.com/ready/browser?lang=zh)

重点的重点当然是微信浏览器对 pwa 的支持情况，我们可以看到除了推送信息和支付接口之外基本已经实现支持（支付接口的支持应该是出于安全的考虑，以及和 weixin-js-sdk 重叠的原因，X5 浏览器支持它只是时间的问题）。如今我们更关心的是关于 SW-cache 这一部分，换句话说，我们可以放心在安卓微信上使用 SW-cache 的技术。

![安卓微信浏览器的支持情况](https://brandonxiang.vercel.app/img/android-serviceworker.png)

### ios（苹果）的支持

《[震惊！苹果向开发者低头？！！开始支持 Service Worker](https://zhuanlan.zhihu.com/p/28293894)》一文中讲述了苹果的开发工程师开始完成研发，并且在 2017 年底 safari 桌面技术预览版上已经实现了 service worker 的相关 api，从`In development`的状态转移到`Supported In Preview`，这意味着 service worker 极有可能在 IOS12 得到支持（详情[https://webkit.org/status](https://webkit.org/status)），这也就意味着pwa的时代很快就会到来。

![苹果safari已开始支持service worker](https://brandonxiang.vercel.app/img/safari-serviceworker.png)

## Sw-precache 和 Workbox

> [sw-precache](https://github.com/GoogleChromeLabs/sw-precache)是什么？
> [workbox](https://github.com/GoogleChrome/workbox)又是什么？

web 前端的各位同学可能或多或少听过 pwa，听过[service worker](https://w3c.github.io/ServiceWorker/)（后面简称为 SW），也知道对应的生命周期。知道了这些 api 后，你还是不知道如何将 pwa 技术投入生产。它不仅仅是个玩具，它是一个“神器”，是用来拉近 native 和 web app 之间的差距。当我们做 spa 项目越做越大的时候，JS bundle 会越来越大，单页面不能承载那么多的逻辑，我们可能会选择多个单页面（也就是多页面）。每次加载都会存在空白加载的情景，虽然性能优化上，我们能把这个时间减少到很少很少，但是没法完全把它“干掉”。pwa 的 service-worker 技术很好地弥补这片“空白”。“app-shell”也就是 web app 中的应用壳将会缓存在浏览器端，让它的加载速度更加快速。而可变的内容则是异步加载。

### 对比

我们知道 vue-cli 打造出来的 pwa 模版，使用的是[sw-precache](https://github.com/GoogleChromeLabs/sw-precache)，而[workbox](https://github.com/GoogleChrome/workbox)是它的取代品。它们各自有一个 webpack 版的插件，分别是[sw-precache-webpack-plugin](https://github.com/goldhand/sw-precache-webpack-plugin)和[workbox-webpack-plugin](https://github.com/GoogleChrome/workbox/tree/v3/packages/workbox-webpack-plugin)。

> 结合[Vue 笔记八：多页面打包框架](https://brandonxiang.vercel.app/blog/vue8)的多页面打包框架，我添加上 precache 的功能（以后计划替换成为 workbox），实现多页面的 service worker 框架，github 的地址是[https://github.com/brandonxiang/mpa-pwa](https://github.com/brandonxiang/mpa-pwa)
> 我写了一个关于 workbox 在 vue-webpack 框架的脚手架，github 的地址是[https://github.com/brandonxiang/example-vue-workbox](https://github.com/brandonxiang/example-vue-workbox)，大家可以参考一下。

它们之间的区别如下，可以说非常相似：

| 中文说明           | workbox        | 中文说明           | sw-precache     |
| ------------------ | -------------- | ------------------ | --------------- |
| 缓存的目录         | globDirectory  | 缓存前缀           | stripPrefix     |
| 缓存的静态文件类型 | globPatterns   | 缓存的静态文件类型 | staticFileGlobs |
| sw 文件路径        | swDest         | sw 文件名          | filename        |
| 让 sw 立即接管网页 | clientsClaim   | （相同）           | clientsClaim    |
| 激活的等待         | skipWaiting    | （相同）           | skipWaiting     |
| 动态请求           | runtimeCaching | （相同）           | runtimeCaching  |

sw-precache 的主要开发者 [jeffposnick](https://github.com/jeffposnick) 也是 workbox 的主要开发者，这说明了它们之间的关系，sw-precache 是为了满足 service worker 的 cache API 中的静态资源文件的注册作用。而 workbox 是为了满足所有 pwa 的资源内容，可以看作一个“平台”。

![workbox file structure](https://brandonxiang.vercel.app/img/workbox-file-structure.png)

[Workbox](https://developers.google.com/web/tools/workbox/)是 GoogleChrome 团队推出的一套 Web App 静态资源本地存储的解决方案，该解决方案包含一些 Js 库和构建工具，在 Chrome Submit 2017 上首次隆重面世，它已经支持很多方面的内容，当然，还有很多内容有待开发。而在它背后则是 Service Worker 和 Cache API 等技术和标准在驱动。在此之前，GoogleChrome 团队较早时间推出过 sw-precache 和 sw-toolbox 库，但是在 GoogleChrome 工程师们看来，Workbox 才是真正能方便统一的处理离线能力的更完美的方案，并停止了对 sw-precache 和 sw-toolbox 的维护，所以，将项目的的 SW 的打包控制插件升级到 WorkBox 是非常重要。该文主要提出以 vue 官方的[pwa 模版](https://github.com/vuejs-templates/webpack)为基础，sw-precache 升级成为 workbox。整个升级的过程参考了[lavas](https://lavas.baidu.com/)。

pwa 的框架配置升级侵入性较少，基本上只需要改框架内容，不需要修改代码的内容，详情参考[mpa-pwa](https://github.com/brandonxiang/mpa-pwa)。在实战应用中，往往不直接访问 service worker 的生命周期，基于 webpack 插件去控制缓存。

## 缓存机制

[Service Worker](https://w3c.github.io/ServiceWorker/)的出现很大程度，改变了 web app 的格局，HTTP cache 和 SW cache 有着天壤之别。这样的 HTTP 缓存机制没法弥补网页跳转带来的白屏间隙，SW cache 由于优先缓存静态资源以及接口的机制，大大减少了网络状况差（甚至断网）带来的白屏现象。优先更新本地的同时，service worker 会和后端进行一次通信，这次通信会告知静态资源是否被更改，在下次刷新的时候更改内容。

动态接口方面则会采用 [runtimeCaching](https://github.com/GoogleChromeLabs/sw-precache#runtimecaching-arrayobject) 进行交互，这部分也会进行动态内容的缓存，[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)的代码将会被引入你的 sw.js 中，它会利用正则表达式匹配到你请求的接口，进行接口缓存，当该接口出现内容变化时，SW 会和后端进行一次通讯保证下一次加载的数据是最新数据，这样的更新机制分为 5 个类型。

- networkFirst
- cacheFirst
- fastest
- cacheOnly
- networkOnly

networkFirst 是显示完成后，SW 优先和后端通讯，看接口是否更新，下一次刷新则是采用最新数据内容。cacheFirst 则是优先考虑缓存，如果缓存没有命中，才会去请求接口拿新数据，这个选型适合那种不经常更改的内容或者有别的更新机制。fastest 则是两个同时进行，哪个快执行哪个。cacheOnly 和 networkOnly 比较不常用。

## 项目中引入插件

在已有的项目的`webpack.prod.conf.js`中引入两个 webpack 插件，其中，workbox-webpack-plugin 是 workbox 的官方插件，处理项目中静态文件的缓存及更新。只有在打包至测试环境和生产环境使用上 service worker，但是在开发环境，无缓存和热更新的调试会大大提高我们开发效率。

- workbox-webpack-plugin （workbox 的官方插件）
- sw-register-webpack-plugin （sw 的更新插件，确保更新缓存）

```javascript
{
  plugins: [
    new workboxPlugin(config.sw.workbox),
    new SwRegisterWebpackPlugin(config.sw.register),
  ];
}
```

`config.sw.workbox`指的是对应的配置参数。它会配置在`config`文件夹的`sw.js`中，用于控制 workbox。

```javascript
const path = require("path");
const dist = "./dist";

module.exports = {
  workbox: {
    globDirectory: dist,
    globPatterns: ["**/*.{html,js,css}"],
    swDest: path.join(dist, "module/service-worker.js"),
    clientsClaim: true,
    skipWaiting: true,
  },
  register: {
    filePath: path.resolve(__dirname, "../src/module/sw-register.js"),
    prefix: "..",
    output: "module/sw-register.js",
    excludes: [
      /activitytemplate\.html/,
      /addMember\.html/,
      /detail\.html/,
      /ecommand\.html/,
      /infoDetail\.html/,
      /insuredetail\.html/,
      /invite\.html/,
      /onlineBooking\.html/,
      /productDetail\.html/,
      /weappClientDetail\.html/,
    ],
  },
};
```

## 参数说明

### workbox-webpack-plugin 参数

- globDirectory **缓存的目录**
- globPatterns **缓存的静态文件类型, 可以是 html，js，css 等**
- swDest **sw 生成后路径**
- clientsClaim **sw 立即接管网页**
- skipWaiting **新旧 sw 更新等待**

### sw-register-webpack-plugin 参数

- filePath **文件路径**
- prefix **文件前缀，解决 cdn 路径问题**
- output **sw-register 输出文件**
- excludes **排除某些不需要 sw 的页面**

## 自定义更新 sw-register.js

[sw-register-webpack-plugin](https://github.com/lavas-project/sw-register-webpack-plugin)是百度处理更新 service worker 的一个方案，参考[lavas](https://lavas.baidu.com/)。它会在 html 行内注入`sw-register.js`，并加入时间戳，保证每次都能获取到最新的 sw 文件，保障其他静态文件更新。

```html
<script>
  window.onload = function () {
    var script = document.createElement("script");
    var firstScript = document.getElementsByTagName("script")[0];
    script.type = "text/javascript";
    script.async = true;
    script.src = "../module/sw-register.js?v=" + Date.now();
    firstScript.parentNode.insertBefore(script, firstScript);
  };
</script>
```

在配置文件中，自定义的`sw-register.js`会写在`module`文件夹中。它的作用主要是 sw 线程和主线程通讯，主要通过 postMessage，sw 的线程钩子是没法在界面中显示的。可能当静态文件更新的时候，界面需要有所变化，或是提示，或是强制更新。都可以用自定义`sw-register.js`来完成。

```javascript
navigator.serviceWorker &&
  navigator.serviceWorker.register("./service-worker.js").then(() => {
    navigator.serviceWorker.addEventListener("message", (e) => {
      // service-worker.js 如果更新成功会 postMessage 给页面，内容为 'sw.update'
      if (e.data === "sw.update") {
        let dom = document.createElement("div");
        let themeColor = document.querySelector("meta[name=theme-color]");

        themeColor && (themeColor.content = "#000");

        dom.innerHTML = `
              <style>
                  .app-refresh{background:#000;height:0;line-height:52px;overflow:hidden;position:fixed;top:0;left:0;right:0;z-index:10001;padding:0 18px;transition:all .3s ease;-webkit-transition:all .3s ease;-moz-transition:all .3s ease;-o-transition:all .3s ease;}
                  .app-refresh-wrap{display:flex;color:#fff;font-size:15px;}
                  .app-refresh-wrap label{flex:1;}
                  .app-refresh-show{height:52px;}
              </style>
              <div class="app-refresh" id="app-refresh">
                  <div class="app-refresh-wrap" onclick="location.reload()">
                      <label>已更新最新版本</label>
                      <span>点击刷新</span>
                  </div>
              </div>
          `;
        document.body.appendChild(dom);
        setTimeout(
          () =>
            (document.getElementById("app-refresh").className +=
              " app-refresh-show"),
          16
        );
      }
    });
  });
```

## 参考

- [神奇的 Workbox 3.0](https://zoumiaojiang.com/article/amazing-workbox-3/)

## 安全性

- [如何利用/防御 Service Worker](http://mp.weixin.qq.com/s/_izQ1OeDONI8D4LPiPpVOQ)
