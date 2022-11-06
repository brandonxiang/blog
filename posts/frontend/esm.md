---
title: 在Nodejs或浏览器运行ESM代码
date: 2021-10-01T11:23:57.000Z
---

## 前言

经典面试题目就是《Common.js 和 ES module 的区别》，这一题很多人都会熟练地背出答案。

> ### Commonjs
>
> - CommonJs 可以动态加载语句，代码发生在运行时
> - CommonJs 导出值是拷贝, 不好排查引起变量污染
>
> ### ES module(后续简称 esm)
>
> - ESM 是静态的，代码发生在编译时
> - ESM 导出是引用值之前都存在映射关系，并且值都是可读的，不能修改
>   参考[聊聊什么是 CommonJs 和 Es Module 及它们的区别](https://juejin.cn/post/6938581764432461854)

esm 是 JavaScript 模块化的未来。因为它解决了变量污染，代码维护，代码依赖的问题。它让你的代码更加科学。这也是 deno 默认采用 esm 的原因。

回归正题，我们有什么方法在 Nodejs 或者浏览器直接运行 esm 代码，这是个有趣而又实际的问题。

## 如何在 Nodejs 环境允许

### 1.利用编译工具运行 esm

最常见的方式是利用[webpack](https://webpack.js.org/)等打包工具搭配 babel 使用。随着 webpack 和 vue 的大热，这些工具似乎成为了标配，但是 webpack 的缺点也很明显，它能让 commonjs 和 esm 的混写，导致代码存在一些写法不规范的情况，我相信这种情况是普遍出现在业务代码里面，也存在于 antd3 这样的知名第三方组件库中。

而[rollup](https://github.com/rollup/rollup)则是基于 ES6 的语法规范进行编译，它的轻便小巧，非常适合 npm 库的打包。新兴的打包工具例如[esbuild](https://github.com/evanw/esbuild)和[swc](https://github.com/swc-project/swc)，也可以实现编译打包，即使速度越来越快，但是还是需要编译的过程。这些仓库很重要的一个特点就是使用 esm 语法。

以上这些工具都可以应用于 esm 语法编译，但是有很多项目不一定需要打包编译这样耗时的流程的，例如一些 cli 工具、简易微服务等，如何保证高效正确的运行 esm 代码呢？

### 2. 利用第三方库运行 esm

在 Nodejs 版本较低的情况，我们可以利用一些工具，工具的使用形式有几种，一种是 Module Loader，另一种是 Command Line（简称为 cli）。

Module Loader，这里介绍[standard-things/esm](https://github.com/standard-things/esm)，它可以 preload 第三方提供的 esm 包，从此，可以做到 babelless, bundleless。你不需要使用大型编译工具也可以直接运行 esm 代码，使用方式如下。

```bash
node -r esm index.js
```

同样，[egoist/esbuild-register](https://github.com/egoist/esbuild-register)这个库在 esbuild 的支持下，同样可以做到 Module Loader 的效果，利用 esbuild 的高性能特性，代码运行效率更高。

```bash
node -r esbuild-register index.js
```

Command Line，基于封装后的 cli，不过是换一种形式进行模块的提前处理。[babel-node](https://babeljs.io/docs/en/babel-node)直接利用它的 babel 语法优势来运行 esm 代码。由于 babel 本身还是 js 的实现，它的官方文档也表明了不建议在生产环境使用，会导致内存高占用的问题，这也是这一类工具的通病。

```bash
babel-node index.js
```

同样，[esno](https://github.com/antfu/esno)可以直接在命令行运行 esm 代码。原理基于 esbuild。在这里更推荐使用这种方式，鉴于 esbuild 是由 go 语言实现，能够较大程度解决内存高占用的问题，保证了一定的执行性能。

```bash
esno index.ts
esmo index.ts
```

这一类第三方仓库适合在低版本 nodejs 且非生产环境使用，它们的存在是为了便利性，而并非实用性和稳定性。怎么样才能高效地运行 esm 代码？

### 3.Native Nodejs 运行 esm

> Node verison 13.2.0 起开始正式支持 ES Modules 特性

所以利用 Native Nodejs 环境运行 esm 代码是非常必要的，高版本的 Nodejs 提供了直接运行 esm 的功能，这里建议使用 lts14 版本。有两种方式运行 esm 代码：

第一种，package.json 中填写 type: "modules"，表明模块的类型。此后，直接运行`node index.js`即可。

```json
// pakage.json
{
  ...
  "type": "modules"
}
```

第二种，则是将文件名改成`.mjs`，标明该文件是 esm 代码。这两种方式最大的区别则是模块作用域。前者是包的作用域，它的声明是以 package 为维度。后者则是以文件为维度，不受限于包的作用域。

## 如何在浏览器运行 esm

![浏览器script type="module"兼容性](https://brandonxiang.top/img/esm.png)

浏览器的情况有别于 Nodejs 环境，在大部分的新版本浏览器都支持 esm 的运行。esm 级别的代码编译和打包，可以有效地减少包的体积和资源传输速度。这也是为什么像 vite 这样的框架会采用现代浏览器的打包模式（外加 legacy 兼容模式）的原因。具体的原理是在 html 当中的 script 标签加入`type="module"` 则表明它引入的是 esm 代码，当旧浏览器没法支持 esm 的情况下，它会读取`nomodule script`中的地址，读取兼容版本的 js 代码。这样一来，可以有效地减少大部分浏览器加载的 js 体积，又保证了老浏览器的兼容性问题。

```html
<script type="module" src="dist/index.js"></script>
<script nomodule src="dist/index.legacy.js"></script>
```

## 总结

如今 Nodejs 和浏览器环境都能对 esm 语法有了很好的 Native 支持。作为前端工程师的我们，应该要保持着技术的前瞻性，在写一个仓库的时候，我们要想到要用 typescript，esm 还是 common.js 呢？为什么我们不选择比较新的 js 运行环境，迎接 Javascript 的第三个时代，参考[《ESM Import 与 Bundleless》](https://www.jianshu.com/p/ab0d5cc9b062)。

## 参考资料

[2020 年我们可以在 Node 中使用 ES Modules 了吗](https://zhuanlan.zhihu.com/p/337796076)
