---
title: Vue笔记十：Vue-cli3.0
date: 2018-08-14T22:53:47.000Z
---

有很多开发者在等着 Vue3.0 的到来，但是大版本的升级往往意味着 upgrade gap，这意味着以前的项目升级的风险。盼着盼着却盼来了 Vue3.0 的到来，在半年的 beta 迭代后，终于出了正式版本。

## vue init 兼容

刚开始试用 vue-cli3.0 的时候，我感觉到非常反感。因为我好不容易把 webpack2、3、4 的配置搞懂了，尤大大你居然把 webpack 的配置去掉了。

这种情况下，兼容以前的模版是所有人要考虑到的兼容，如果我们还能够拉取以前的模版就非常好了。vue-cli 的解耦设计非常好，桥接工具（@vue/cli-init）很好兼容旧版本的`vue init`功能。

```shell
npm install -g @vue/cli-init
# `vue init` 的运行效果将会跟 `vue-cli@2.x` 相同
vue init webpack my-project
```

## 基础教程

- vue create 新建项目
- vue add 增加插件
- vue serve 开发模式
- vue build 构建项目

> 这部分请移步 [Vue-cli 3.0 文档](https://cli.vuejs.org/zh)，内容非常详细

## vue ui 新功能

万万没想到的是 vue ui，Guillaume CHAU（Vue.js 核心团队）给脚手架带来不仅可以创建新项目，还可以管理项目中的插件和任务。
![vue ui](/img/vue-ui.png)

## 未来

### babel 转义（[参考](https://cli.vuejs.org/zh/guide/browser-compatibility.html#%E7%8E%B0%E4%BB%A3%E6%A8%A1%E5%BC%8F)）

babel 转义成为 ES6 的代码转义成为 ES5 的语法，如今很多浏览器已经支持原生 es-module，在不考虑兼容老版本浏览器的情况下，`modern`压缩方式会大幅减少包的体积，提高加载的效率。

```shell
vue-cli-service build --modern
```

### 单个 vue 文件调试或打包（[库](https://cli.vuejs.org/zh/guide/build-targets.html#%E5%BA%93)）

vue-cli 提供了针对某个 vue 文件启动服务，方便开发者局部调试。

```shell
vue serve MyComponent.vue
```

vue-cli 并不仅仅针对项目进行打包，还可以对某个 vue，js 或者 ts 文件进行打包。这种打包方式可以应用于组件库的打包。

```shell
vue-cli-service build --target lib --name myLib [entry]
```

### 准备微前端

Web Components 模式不支持 IE11 及更低版本，可以把 vue 文件打包直接成为 Web Components，是微前端做准备，有利于未来项目解耦和多框架融合。

```shell
vue-cli-service build --target wc --name my-element [entry]
```

### 参考

- [重磅！Vue CLI 3.0 正式发布，带来多项重大更新](https://mp.weixin.qq.com/s/hfr2Q3FXZFIdqM_r8HrLwQ)

### 题外话

[shopee](https://shopee.cn/)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](mailto:weiping.xiang@shopee.com)，非诚勿扰。
