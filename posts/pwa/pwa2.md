---
title: PWA笔记二：离线缓存原理
date: "2019-10-27T21:09:00.000Z"
---

ServiceWorker既然命名为worker，很大一部分原因就是它和WebWorker相关。它是在第二个线程完成缓存代理的任务，不会影响dom渲染的主线程，两个Worker之间的通讯是基于postMessage，两个线程是不能直接进行通讯。

这一点和小程序有点像，但是又不一样。 小程序是把渲染层和逻辑层用两个线程进行分离。逻辑层的报错，并不会影响渲染层的展示，具体这么做能够提升多少优化量，微信团队并没有给出一个很确切的数据统计。PWA使用worker更多是为了处理离线缓存的内容，并且会使用indexedDB来存缓存文件的版本编号，UI的渲染层和逻辑层（可以被称之为主线层）并没有得到分离。


## 前提条件

#### 基于HTTPS

HTTPS 不仅仅可以保证你网页的安全性，还可以让一些比较敏感的 API 完美的使用。值得一提的是，SW 是基于 HTTPS 的，所以，如果你的网站不是 HTTPS，那么基本上你也别想了 SW。

#### Scope作用域

一个sw.js并不能接管一个站点所有的页面，它只能在所在路由底下起到作用。意思就是如果你在`//example.com/foo/bar.js`里注册了一个 SW，那么它默认的作用域为`//example.com/foo/`。

#### SPA
虽然说PWA可以使用在多页面应用（MPA）上，一个sw文件和一个manifest文件主要的设计理念在于搭配着用在SPA，SW在SPA使用更合理。

## 生命周期

#### 注册

ServiceWorker.js(又名sw.js)是一个独立js，页面注册在浏览器支持的情况下，注册sw.js来控制Service Worker缓存。`register`将会触发安装声明周期，所有的源码都是有原生浏览器实现。


```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('ServiceWorker registration successful with scope: ',    registration.scope);
  }).catch(function(err) {
    console.log('ServiceWorker registration failed: ', err);
  });
}
```

### install

注册完成后会出发安装的生命周期，把设置好的静态文件，采用Service Worker的缓存方式，使用了Cache API来将资源缓存起来，同时使用e.waitUntil接手一个Promise来等待资源缓存成功，等到这个Promise状态成功后，ServiceWorker进入installed状态，意味着安装完毕。这时候主线程中返回的registration.waiting属性代表进入installed状态的ServiceWorker。


```javascript
var CACHE_NAME = "my_cache";
var urlsToCache = [
  '/index.html',
  '/css/style.css',
  '/js/script.js'
];
//这里的self代表ServiceWorkerGlobalScope
self.addEventListener('install', function(event) {
//这里的waitUtil会在安装成功之前执行一些预装的操作，但是只建议做一些轻量级和非常重要资源的缓存，减少安装失败的概率。安装成功
//后ServiceWorker状态会从installing变为installed 
event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
             console.log('Opendhe : ',cache);
            return cache.addAll(urlsToCache);
      })
    );
});

```

#### skipWaiting

skipWaiting()意味着新 SW 控制了之前用旧 SW 获取的页面，也就是说你的页面有一部分资源是通过旧 SW 获取，剩下一部分是通过新 SW 获取.

### activate

安装完，则会进入激活状态。如果之前已有ServiceWorker，这个版本只是对ServiceWorker进行了更新。如果你在`event.waitUntil()`中传入了一个 Promise，SW 将会缓存住功能性事件(fetch,push,sync等等)，直到 Promise 返回 resolve 的时候再触发，也就是说，当你的fetch事件被触发的时候，SW 已经被完全激活了。

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      // V2控制缓存
    })
  );
});

```

### fetch

fetch请求是有别于xhr请求，sw提供监听拦截fetch的事件，对于命中缓存的数据可以直接返回请求。当接受到 fetch 请求时，会直接返回`event.respondWith` 得到Promise 结果。这样我们可以捕获页面所有的 fetch 请求。

```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

### redundant

Service Worker 可能以下之一的原因而被废弃（redundant，原意为“多余的，累赘的”）——

- installing 事件失败
- activating 事件失败
- 新的 Service Worker 替换其成为激活态 worker



## 调试方法

#### 方法一

`chrome://inspect/#service-workers` 就可以查看当前浏览器正在注册的 SW，并且可以对它们进行调试和结束进程。调试会直接在service worker线程进行，不用理会主线层的逻辑。

![调试Service worker](https://upload-images.jianshu.io/upload_images/685800-53b2a993e5160e68.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 方法二

另外，还有 `chrome://serviceworker-internals`，用来查看当前浏览器中所有注册过的 SW。输入这个地址就像打开新世界的大门，原来你访问那么多PWA页面。

![所有注册过的service worker](https://upload-images.jianshu.io/upload_images/685800-6aa6d410d32deab1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 方法三

在打开chrome的调试面板devtools，Application tab里面有个service workers页面，可以针对该页面的SW，进行缓存调试以及消息推送，在这里也可以看到SW所在的生命周期，大大提高SW的调试效率。

![chrome查看缓存情况](https://upload-images.jianshu.io/upload_images/685800-b81efca2228dffbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 更新问题

浏览器获取了新版本的ServiceWorker代码，如果浏览器本身对sw.js进行缓存的话，也不会得到最新代码，所有代码会变成死代码无法更新。这里有两种解决方案：

1. 在ngnix或cdn的缓存配置中，sw文件最好配置成`cache-control: no-cache`。
2. 采用[sw-register-webpack-plugin](https://github.com/lavas-project/sw-register-webpack-plugin)来处理sw文件的更新问题。

### 参考

- [【Service Worker】生命周期那些事儿](https://segmentfault.com/a/1190000007487049#articleHeader16)
- [借助Service Worker和cacheStorage缓存及离线开发](https://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/)

### PS

[shopee](https://links.jianshu.com/go?to=https%3A%2F%2Fshopee.cn%2F)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[1542453460@qq.com](https://links.jianshu.com/go?to=mailto%3A1542453460%40qq.com)，非诚勿扰。
