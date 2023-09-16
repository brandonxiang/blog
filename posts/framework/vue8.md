---
title: Vue笔记八：多页面打包框架（mpa）
date: 2018-01-06T16:01:09.000Z
---

> 该文章已经过时，请移步[Vue 笔记十：Vue-cli3.0](https://brandonxiang.top/blog/vue10)

我记得去年很多人看了我《用 Webpack 构建 Vue》一篇文章，但是因为 webpack 和 vue 升级速度很快，那文章很快就过时了。学习 vue 最好的教材莫过于[vue-cli](https://github.com/vuejs/vue-cli)直接生成的单页面项目。可惜的是它不过是一个单页面的项目，在我们的实际生产环境中，往往都是较为分散的页面，为的是保证项目的解耦。

> [饿了么的 PWA 升级实践](https://huangxuan.me/2017/07/12/upgrading-eleme-to-pwa/)正讲到饿了么的超大型 SPA 如何解耦成 MPA 的过程。

## 多页面脚手架

> github 源码在此，记得点星: [https://github.com/brandonxiang/mpa](https://github.com/brandonxiang/mpa)

### 特点

- 多个入口
- DllReferencePlugin 利用控制多页面常用包
- CommonsChunkPlugin 控制多页面的公用包
- ejs 模版语言控制 html
- --nomap 命令控制 sourceMap
- whitelist 控制专门打包

### 使用方法

```bash
npm install -g vue-cli
vue init brandonxiang/mpa my-project
cd my-project
npm install
npm run build:dll
npm run dev
npm run build
```

### 用法

第一点，JS 包的大小直接影响着首屏弱网情况下的页面加载情况，DllReferencePlugin 和 CommonsChunkPlugin 就有效拆分公用包的大小，每个包控制在 100k 左右。

dll 打包在`config`中的`dll.js`中控制，把公共全量使用的 npm 包写入配置文件：

```javascript
module.exports = {
	path: 'static/dll',
	libs: ['vue/dist/vue.esm.js', 'vue-router']
};
```

在`npm run dev`和`npm run build`前使用`npm run build:dll`去打固定 dll 包，提高打包调试的效率。

第二点，模版语言在 html-webpack-plugin 中的使用，将一些关键代码内联拼接在 html 中。例如：

- header 中的 meta（包括 dns 预解析等）
- loading 全局插件
- 计算 rem 的单位
- 关键全局样式

第三点，黑名单的打包

在`config/index.js`配置黑名单，有些项目将不会打包。

```javascript
blackList: ['Hello', 'eCommand', 'Pingan'],
```

同时，我们也可以专门指定打几个包。

```shell
npm run build Hello eCommand Pingan
```

## 性能优化

参考[【技术研究】vue 项目的性能优化之路](https://www.jianshu.com/p/40b04701c571)

## Webpack3 的升级

Webpack 的版本升级速度真的是非常快，快得无法想象。有幸经历 1 到 2 和 2 到 3 的升级，体验了一步一步的性能优化。同期无论是 [rollup](https://rollupjs.org/guide/en/) 还是 [parcel](https://parceljs.org/) 的出现，他们的优缺点很好地反哺了 webpack 的优化点。parcel 的出现又一次让人反思“wbepack 的配置是不是太过于繁琐”，但是 parcel 由不够成熟，而且 tree-shaking 和 scope-hoisting 的缺席。所以，现在前端工程化中，能投入生产的还是 webpack，我也相信 webpack4 会变得更好。

[多页面脚手架](https://github.com/brandonxiang/mpa)正是采用全新的 webpack3 构建，里面包含它的“内容不变 hash 值不变”的特性，欢迎大家指点评论。
