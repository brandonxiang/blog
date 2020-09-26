---
title:  PWA笔记四：Web App Manifest 介绍
date: "2019-11-05T18:48:00.000Z"
---


首先，在vue的初始化webpack项目中存在manifest.js，这个文件更多是静态脚本的代码指纹。但是它和PWA的Web App Manifest是两个概念。下面是webkit.org对它的定义。

> A JSON-format manifest file for developers to place metadata associated with a web application.
> Web App Manifest是用json格式文件来配置网页应用。

## 网页应用需要配置哪些方面？

PWA指的是网页应用，Web App Manifest主要针对的是单页面应用而言，包含了应用名字，图标，起始路径。如今最新版本的ios和Android都已经支持 Web App Manifest，用户可以把网页应用直接“留在”手机桌面上，它就像小程序后台一样注册你的应用信息。手机操作系统会根据你提供的信息，帮你注册这款网页应用到收集当中，以后会把该应用也可能出现在对应的appStore。

```json
{
	"background_color": "#ffffff",
	"theme_color": "#333333",
	"name": "Brandon's Blog",
	"short_name": "Brandon's Blog",
	"description": "A Web Developer's Blog",
	"display": "standalone",
	"start_url": "/",
	"scope": "/",
	"icons": [
		{
			"src": "logo-192.png",
			"sizes": "192x192",
			"type": "image/png"
		},
		{
			"src": "logo-512.png",
			"sizes": "512x512",
			"type": "image/png"
		}
	],
	"share_target": {
    "action": "compose/share",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    },
    "method": "GET",
    "enctype": "application/x-www-form-urlencoded"
	},
	"prefer_related_applications": false
}
```

通过这个manifest，app的名字和图标可以被设置（其中还包括分享模块）。该`manifest.json`需要在页面header被引入，service-worker会控制它的缓存机制。

```html
<!-- 在html头部引入manifest.json -->
<link rel="manifest" href="../static/manifest.json">
```

## Chrome的支持

最新版本的chrome能够支持桌面级别的pwa应用，当它检测到该页面是pwa时，地址栏处会出现一个加号，可以将pwa安装至电脑本地。它正如一个app般存在于你的电脑里。

![Chrome PWA](https://brandonxiang.vercel.app/img/chrome_pwa.png)

## IOS的支持

最新版本的IOS也对pwa应用有着最新的支持，能够对`status-bar`或者苹果应用图标有特殊的设置，此处，IOS并没有取manifest中的icon，需要对`apple-touch-icon`进行设置。

此处注意下对iPhoneX刘海屏的样式支持，此处采用`viewport-fit`的属性进行最简单的设置，具体复杂的适配方案不在这里展开。

```html
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="default">
	<meta name="apple-mobile-web-app-title" content="Brandon's Blog">
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=contain">
	<link rel="apple-touch-icon" href="appicon.png">
```



