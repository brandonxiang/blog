---
title:  PWA笔记三：App Shell模型
date: "2019-11-05T16:41:00.000Z"
---

 ## 引子

我们现在使用的web技术更多是倾向于兼容老浏览器，没有考虑新的API的使用。例如fetch，IndexedDB等，只能等到浏览器份额超出一大半，才会考虑到使用。换句话说，浏览器还有很多潜力有待我们开发。webapp和nativeapp之间的差距除了页面交互效果外，最大的不同点就是首屏加载的等待中白屏。白屏的时间差一直是我们需要面对的一个问题，可以用以下方法解决：

- skeleton
- SSR
- service worker

skeleton是骨架屏幕下文有介绍。SSR不在这里赘述。

PWA全称为“Progressive Web Apps”，渐进式网页应用。它的核心技术包括：

- Web App Manifest – 在主屏幕添加app图标，定义手机标题栏颜色之类
- Service Worker – 缓存，离线开发，以及地理位置信息处理等
- App Shell – 先显示APP的主结构，再填充主数据，更快显示更好体验
- Push Notification – 消息推送，之前有写过“简单了解HTML5中的Web Notification桌面通知”

### 成功案例

![成功案例](https://upload-images.jianshu.io/upload_images/685800-1538e3a117e5f8d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


国外有非常多pwa提高转换率的案例。同样，国内大厂也纷纷试水。它们无一例外都采用了App Shell模型。

![ele](https://upload-images.jianshu.io/upload_images/685800-1794b89b507b638a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![sina](https://upload-images.jianshu.io/upload_images/685800-b9041a4d86cbdaf1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![lavas](https://upload-images.jianshu.io/upload_images/685800-1c786f371a3acef8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



# App Shell模型

PWA的原理就是改变HTTP缓存的机制，优先取本地的资源，在下一次加载才会采用新的内容。这时候谷歌提出一个新的概念----App Shell。不是所有内容都要进行离线缓存，App Shell更像是app的空壳。壳将会进行离线缓存，这些“条条框框”是不需要每次都修改的，这个“空壳”仅包含页面框架所需的最基本的 HTML 片段，CSS 和 javaScript，而对实时性要求比较高的内容将不会进行进行额外的缓存，例如列表。

这样部分离线渲染的情况被称之为App Shell模型，以便它可以在离线时正常展现，达到类似 Native App的体验。`stale-while-revalidate`会成为一个非常重要的概念，SWR是优先于本地缓存数据，再发送请求，最后在替换为新数据。

> SWR first returns the data from cache (stale), then sends the fetch request (revalidate), and finally comes with the up-to-date data again.

开发一个 App Shell, 我们通常要注意以下几点：

- 将动态内容与 Shell 分离
- 尽可能使用接口缓存数据，实现快速首屏加载
- 使用本地缓存中的静态资源

明确以上内容之后，我们就可以着手开发、定制自己的 App Shell 。就下图这个例子而言，我们可以将头部组件以及标签栏组件写入页面，对html进行`stale-while-revalidate`的缓存策略，并且对标签栏的接口数据进行离线缓存，那么头部组件就成为一个离线加载的App Shell。下面的内容由于没有进行离线处理，则为实时接口，保证了新闻内容的实时性。

这样说来，两个点成为App Shell的关键。

- 动态部分（空白部分）使用Skeleton进行填充
- 静态部分需要接口缓存数据填充

![app shell 例子](https://upload-images.jianshu.io/upload_images/685800-4bae1b507983715c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## Skeleton

Skeleton也被称为骨架页面，在页面的空白处插入html的图像，减缓视觉差距。页面在数据尚未加载前先给用户展示出页面的大致结构，直到请求数据返回后再渲染页面，补充进需要显示的数据内容，常用在单页面应用的列表页。

![骨架屏](https://upload-images.jianshu.io/upload_images/685800-dcbe395e5edab704.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

骨架图的制作也有很多中方法。

- UI提供样式生成图片
- UI提供样式绘制对应的样式
- 饿了么团队[page-skeleton-webpack-plugin](https://github.com/ElemeFE/page-skeleton-webpack-plugin)
- 百度lavas[vue-skeleton-webpack-plugin](https://github.com/lavas-project/vue-skeleton-webpack-plugin)

我个人建议移动端使用图片，PC端写样式，比较简单处理。由于图片只有两种分色，所以图片大小不大。

## 接口缓存

后续的文章会介绍怎么使用workbox进行接口缓存。

接口缓存同样可以做到优先读本地数据再请求远端数据。[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)是针对动态/运行时请求的离线缓存的工具，它已经Deprecated。后续，workbox已经把[sw-precache](https://github.com/GoogleChromeLabs/sw-precache)和[sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)进行了整合为一个平台，提供大量插件。`precache`是默认读取本地文件，`runtimeCaching`则是提供动态缓存的功能，动态缓存分为五种情况：

- networkFirst 网络优先
- cacheFirst 缓存优先
- fastest 缓存优先和网络同时执行，取最快
- cacheOnly 只取缓存
- networkOnly 只取网络

配置文件设置runtimeCaching，可以拦截所有`/api/`的接口，按照设置的情况进行缓存。`cacheFirst`可以大大提高首屏App shell数据加载的效率。

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


