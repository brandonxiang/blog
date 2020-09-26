---
title: PWA笔记一：Web的万物基础缓存
date: "2019-10-27T21:08:00.000Z"
---

## 前言

这里讨论的缓存包括两种，一种是HTTP缓存，一种是Service Worker缓存。

## HTTP缓存

HTTP缓存应该是最传统的方式，也是所有前端项目的基础。浏览器向服务器请求数据，发送请求(request)报文；服务器向浏览器返回数据，返回响应(response)报文。我们熟悉的浏览器缓存机制可以被分为两大类：强缓存和协商缓存。强缓存主要包括Cache-Control和Expires，协商缓存主要包括Etag和Last-Modify。协商缓存优先级是优先于强缓存。js等大部分静态资源在做了文件指纹后，都使用强缓存的策略。而html文件是页面入口和文件名不能修改比较特殊，大部分都采用协商缓存。

## 强缓存

#### Cache-Control

一般js，css和图片等静态资源文件采用强缓存的机制，保证资源在某个时间段内在命中的情况下从缓存机制中获取。

稍微了解HTTP协议的前端同学，想必对Cache-Control不会感到陌生，性能优化时经常都会跟它打交道，属于HTTP 1.1。常见的值有有private、public、no-store、no-cache、must-revalidate、max-age等。

![强缓存](https://upload-images.jianshu.io/upload_images/685800-5fefe93bdbf5beb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


- no-cache: 不管本地副本是否过期，使用资源副本前，强制回源服务器进行副本有效性校验。
- must-revalidate：本地副本过期前可以使用本地副本；本地副本一旦过期，必须去源服务器进行有效性校验。

#### Expires

Expires的值为服务端返回的到期时间，即下一次请求时，请求时间小于服务端返回的到期时间，直接使用缓存数据。这样会带来一个问题，就是服务器时间和客户端时间不一致的情况，现在网页都是全球化的，会造成不同时区的用户访问更新不一致。Expires 是HTTP 1.0的东西，现在默认浏览器均默认使用HTTP 1.1。

## 协商缓存

#### Etag

协商缓存（又名对比缓存）由服务器来确定缓存资源是否可用，所以客户端与服务器端要通过某种标识来进行通信，从而让服务器判断请求资源是否可以缓存访问。而Etag就是这个标示，属于HTTP1.1的标准。如果命中协商缓存会返回304，如果未命中会从服务器取数据返回200。它和Last-Modify最大的区别就是，Last-Modify专注某个时间点。这个和Expires犯了同样的错误。协商缓存整个流程如下图，它必须和服务器有一次交互，一般html的检查是否更新，就是这样完成。一般像JS和CSS都是带hash值，保证文件唯一性，控制缓存。

![协商缓存](https://upload-images.jianshu.io/upload_images/685800-f310778e043422b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


> 为什么需要Etag？
> - 一些文件也许会周期性的更改，但是他的内容并不改变(仅仅改变的修改时间)，这个时候我们并不希望客户端认为这个文件被修改了，而重新GET；
> - 某些文件修改非常频繁，比如在秒以下的时间内进行修改，(比方说1s内修改了N次)，If-Modified-Since能检查到的粒度是s级的，这种修改无法判断(或者说UNIX记录MTIME只能精确到秒)；
> - 某些服务器不能精确的得到文件的最后修改时间。

如果你使用协商缓存，第一次加载返回200状态码，加载速度较慢，数据量大。第二次加载返回304状态码，加载速度较快，数据量小。这也是为什么我们第二次加载速度比较快，第一次加载比较慢。此外，协商缓存和网速有强相关性，网速慢的情况下，页面加载速度也会很慢。

![缓存情况](https://upload-images.jianshu.io/upload_images/685800-b4fcf6f1591bd7e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### Last-Modify

Last-Modify记录的是指上次代码更新的时间。上次更新的时间和客户端当前时间的对比，决定了协商缓存是否执行。

### 强缓存和协商缓存的对比

强缓存和协商缓存其实都是为了解决非首次加载后的缓存问题。协商缓存可以保证渠道的静态资源是最新内容。

| 缓存类型    | 状态码   | 发送请求到服务器  |
| :--------: |:----------:| :-----:|
| 强缓存     | 200（from cache） | 否，直接从缓存取 |
| 协商缓存   | 304（Not Modified） | 否，通过服务器来告知缓存是否可用 |


|用户操作 |	Expires/Cache-Control |	Last-Modied/Etag |
| :--------: |:----------:| :-----:|
|地址栏回车	| 有效 |有效|
|页面链接跳转 |有效 |有效|
|新开窗口 | 有效 | 有效 |
|前进回退 | 有效 | 有效|
|F5刷新 | 无效 | 有效 |
|Ctrl+F5强制刷新 | 无效 |无效 |

在实际使用的过程当中，缓存的策略可以通过nginx或者cdn运营商配置对应的缓存策略。如今应该各种大厂都有自建cdn来达到静态资源加速的效果。

## Service Worker缓存

但是HTTP的缓存每次生效吗？在app强制关闭的情况下能控制缓存机制吗？在弱网的情况下，协商缓存会和后端进行交互，还是影响页面白屏时间。Service Worker缓存（简称SW缓存）就是用解决协商缓存的问题，并且给开发者提供了控制缓存的能力。如果你做的网页可以被当成一个大型单页面应用，这个应用需要一个`manifest.json`来控制它基础应用显示信息，还需要以一个`service-worker.js`来控制它的离线缓存信息。

HTTP以前的缓存机制是Network和application之间的交互，Service Worker缓存机制则是在它们之间加入一个代理层，优先取本地的资源，之后检查数据内容是否更新。如果有更新，将会在下一次更新才更新数据内容。

因此，SW缓存也是pwa的基础要素之一，详情可见[PWA笔记二：离线缓存原理](https://www.jianshu.com/p/ff25f25fdb48)。

![代理层](https://upload-images.jianshu.io/upload_images/685800-f092e4e0f857e120.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## WIFI 情况

![From SW DomLoaded 571ms Load 1.41s](https://upload-images.jianshu.io/upload_images/685800-c8d384442f7d712d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![From Cache DomLoaded 593ms Load 1.12s](https://upload-images.jianshu.io/upload_images/685800-6d865d8259ae29e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3G情况

![From SW DomLoaded 572ms Load 4.46s](https://upload-images.jianshu.io/upload_images/685800-7d6e8ef09cba17fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![From Cache DomLoaded 10.37ms Load 10.69s](https://upload-images.jianshu.io/upload_images/685800-cbd615f8c6f2ae8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


在网速弱网情况，协商缓存的情况会收到影响，因为它和网速是强相关的。而service-worker和网速时弱相关的，和单页面网页应用的属性是天然契合的，帮助网页应用更贴近native app。


#### 参考

- [彻底弄懂HTTP缓存机制及原理](https://www.cnblogs.com/chenqf/p/6386163.html)

### PS

[shopee](https://links.jianshu.com/go?to=https%3A%2F%2Fshopee.cn%2F)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[1542453460@qq.com](https://links.jianshu.com/go?to=mailto%3A1542453460%40qq.com)，非诚勿扰。