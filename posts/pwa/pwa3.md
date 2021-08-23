---
title: PWA笔记三：App Shell模型
date: "2019-11-05T16:41:00.000Z"
---

## 引子

我们现在使用的 web 技术更多是倾向于兼容老浏览器，没有考虑新的 API 的使用。例如 fetch，IndexedDB 等，只能等到浏览器份额超出一大半，才会考虑到使用。换句话说，浏览器还有很多潜力有待我们开发。webapp 和 nativeapp 之间的差距除了页面交互效果外，最大的不同点就是首屏加载的等待中白屏。白屏的时间差一直是我们需要面对的一个问题，可以用以下方法解决：

- skeleton
- SSR
- service worker

skeleton 是骨架屏幕下文有介绍。SSR 不在这里赘述。

PWA 全称为“Progressive Web Apps”，渐进式网页应用。它的核心技术包括：

- Web App Manifest – 在主屏幕添加 app 图标，定义手机标题栏颜色之类
- Service Worker – 缓存，离线开发，以及地理位置信息处理等
- App Shell – 先显示 APP 的主结构，再填充主数据，更快显示更好体验
- Push Notification – 消息推送，之前有写过“简单了解 HTML5 中的 Web Notification 桌面通知”

### 成功案例

![成功案例](https://brandonxiang.vercel.app/img/pwa-success.png)

国外有非常多 pwa 提高转换率的案例。同样，国内大厂也纷纷试水。它们无一例外都采用了 App Shell 模型。

![ele](https://brandonxiang.vercel.app/img/pwa-ele.png)

![sina](https://brandonxiang.vercel.app/img/pwa-sina.png)

![lavas](https://brandonxiang.vercel.app/img/pwa-lavas.png)

## App Shell 模型

PWA 的原理就是改变 HTTP 缓存的机制，优先取本地的资源，在下一次加载才会采用新的内容。这时候谷歌提出一个新的概念----App Shell。不是所有内容都要进行离线缓存，App Shell 更像是 app 的空壳。壳将会进行离线缓存，这些“条条框框”是不需要每次都修改的，这个“空壳”仅包含页面框架所需的最基本的 HTML 片段，CSS 和 javaScript，而对实时性要求比较高的内容将不会进行进行额外的缓存，例如列表。

这样部分离线渲染的情况被称之为 App Shell 模型，以便它可以在离线时正常展现，达到类似 Native App 的体验。`stale-while-revalidate`会成为一个非常重要的概念，SWR 是优先于本地缓存数据，再发送请求，最后在替换为新数据。

> SWR first returns the data from cache (stale), then sends the fetch request (revalidate), and finally comes with the up-to-date data again.

开发一个 App Shell, 我们通常要注意以下几点：

- 将动态内容与 Shell 分离
- 尽可能使用接口缓存数据，实现快速首屏加载
- 使用本地缓存中的静态资源

明确以上内容之后，我们就可以着手开发、定制自己的 App Shell 。就下图这个例子而言，我们可以将头部组件以及标签栏组件写入页面，对 html 进行`stale-while-revalidate`的缓存策略，并且对标签栏的接口数据进行离线缓存，那么头部组件就成为一个离线加载的 App Shell。下面的内容由于没有进行离线处理，则为实时接口，保证了新闻内容的实时性。

这样说来，两个点成为 App Shell 的关键。

- 动态部分（空白部分）使用 Skeleton 进行填充
- 静态部分需要接口缓存数据填充

![app shell 例子](https://brandonxiang.vercel.app/img/pwa-appshell.png)

## Skeleton

Skeleton 也被称为骨架页面，在页面的空白处插入 html 的图像，减缓视觉差距。页面在数据尚未加载前先给用户展示出页面的大致结构，直到请求数据返回后再渲染页面，补充进需要显示的数据内容，常用在单页面应用的列表页。

![骨架屏](https://brandonxiang.vercel.app/img/pwa-skeleton.png)

骨架图的制作也有很多中方法。

- UI 提供样式生成图片
- UI 提供样式绘制对应的样式
- 饿了么团队[page-skeleton-webpack-plugin](https://github.com/ElemeFE/page-skeleton-webpack-plugin)
- 百度 lavas[vue-skeleton-webpack-plugin](https://github.com/lavas-project/vue-skeleton-webpack-plugin)

我个人建议移动端使用图片，PC 端写样式，比较简单处理。由于图片只有两种分色，所以图片大小不大。

## 接口缓存

后续的文章会介绍怎么使用 workbox 进行接口缓存。

接口缓存同样可以做到优先读本地数据再请求远端数据。[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)是针对动态/运行时请求的离线缓存的工具，它已经 Deprecated。后续，workbox 已经把[sw-precache](https://github.com/GoogleChromeLabs/sw-precache)和[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)进行了整合为一个平台，提供大量插件。`precache`是默认读取本地文件，`runtimeCaching`则是提供动态缓存的功能，动态缓存分为五种情况：

- networkFirst 网络优先
- cacheFirst 缓存优先
- fastest 缓存优先和网络同时执行，取最快
- cacheOnly 只取缓存
- networkOnly 只取网络

配置文件设置 runtimeCaching，可以拦截所有`/api/`的接口，按照设置的情况进行缓存。`cacheFirst`可以大大提高首屏 App shell 数据加载的效率。

```javascript
runtimeCaching: [{
  urlPattern: /api/,
  handler: 'fastest',
  options: {
    cache: {
      name: 'my-api-cache',
      maxEntries: 5,
      maxAgeSeconds: 60,
    },
  },
}],
```
