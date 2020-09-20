---
title:  PWA笔记四：Web App Manifest 介绍
date: "2019-11-05T18:48:00.000Z"
---


首先，在vue的初始化webpack项目中存在manifest.js，这个文件更多是静态脚本的代码指纹。但是它和PWA的Web App Manifest是两个概念。下面是webkit.org对它的定义。

> A JSON-format manifest file for developers to place metadata associated with a web application.
> Web App Manifest是用json格式文件来配置网页应用。

网页应用需要配置哪些方面？

```json
{
  "name": "pwa-mpa",
  "short_name": "pwa-mpa",
  "icons": [
    {
      "src": "../static/img/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }, {
      "src": "../static/img/icons/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/appStatic/zebela/index.html",
  "background_color": "#000000",
  "display": "standalone",
  "theme_color": "#2874f0"
}

```

```html
<!-- 在html头部引入manifest.json -->
<link rel="manifest" href="../static/manifest.json">
```

PWA指的是网页应用，Web App Manifest主要针对的是单页面应用而言，包含了应用名字，图标，起始路径。如今最新版本的ios和Android都已经支持 Web App Manifest，用户可以把网页应用直接“留在”手机桌面上，它就像小程序后台一样注册你的应用信息。手机操作系统会根据你提供的信息，帮你注册这款网页应用到收集当中，以后会把该应用也可能出现在对应的appStore。
