---
title: ESM Import与Bundle Free
date: 2020-06-20T11:59:57.000Z
---

由于前端模块化的发展，在 nodejs 中分为了 common.js，umd，es module 三大种类。其中 umd 是可以兼容浏览器运行的，common.js 只能在 nodejs 环境运行，es module 是属于未来的一种前端模块化，能够同时满足服务端和浏览器端的代码编写。es module 也是现在前端工程师写代码最常用的模式。模块化的写法大家也不会陌生。

```javascript
import fs from "fs";
```

有别于 common.js 的写法：

```javascript
const fs = require("fs");
```

其实浏览器也支持 esm import 了，但是兼容性情况不容乐观。基于[lukeed/dimport](https://github.com/lukeed/dimport)的兼容方案，其实我们在大部分的浏览器都可以大胆使用该属性。浏览器的 esm import 把我们带进一个全新的时代（服务端模块和浏览器模块同步的时代），或者可以被称为 Bundle Free 时代。

```html
<!-- dimport 兼容方案 -->
<!-- Load the "module" version on browsers that can support it. -->
<script
  type="module"
  src="https://unpkg.com/dimport?module"
  data-main="/bundle.js"
></script>

<!-- Load the "nomodule" version on older browsers – acts as fallback! -->
<script
  type="nomodule"
  src="https://unpkg.com/dimport/nomodule"
  data-main="/bundle.js"
></script>
```

![兼容性情况](/img/caniuse-esmodule.png)

### ESM Import

其实，最早将 ESM Import 引入到前端页面开发的是[Polymer/lit-html](https://github.com/Polymer/lit-html)，它将模版模块化，直接带到浏览器。然后激发了 preact 的调整，基于[Tagged_templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates)创造出[developit/htm](https://github.com/developit/htm)语法，这样一来，JSX 的语法直接能在浏览器使用，当然也部分失去渲染函数的魅力。用模版写法部分替代了 JSX，却能让 preact 直接能在浏览器运行。

```html
<!DOCTYPE html>
<html lang="en">
  <title>htm Demo</title>
  <script type="module">
    import {
      html,
      Component,
      render,
    } from "https://unpkg.com/htm/preact/standalone.module.js";

    class App extends Component {
      addTodo() {
        const { todos = [] } = this.state;
        this.setState({ todos: todos.concat(`Item ${todos.length}`) });
      }
      render({ page }, { todos = [] }) {
        return html`
          <div class="app">
            <${Header} name="ToDo's (${page})" />
            <ul>
              ${todos.map((todo) => html` <li key="${todo}">${todo}</li> `)}
            </ul>
            <button onClick=${() => this.addTodo()}>Add Todo</button>
            <${Footer}>footer content here<//>
          </div>
        `;
      }
    }

    const Header = ({ name }) => html`<h1>${name} List</h1>`;

    const Footer = (props) => html`<footer ...${props} />`;

    render(html`<${App} page="All" />`, document.body);
  </script>
</html>
```

其中浏览器端的 esm 是可以支持相对路径和远端 https 路径的，前提是所有静态资源要在服务当中，不能以文件路径引入，例如`file://`开头的资源。

其实以现代浏览器对 esm 的支持情况，意味着未来的前端框架渐渐往浏览器原生靠近。前端工程化将我们带到了打包和编译的阶段，js 被压缩到一个文件当中，变量都是混淆的。但是打包编译速度和打包的体积永远是我们离不开的话题。ESM Import 的到来意味着 JS 资源将会越来越碎，有很多不常变动的资源可以外部引入。伴随着多资源的并行引用，http2.0 刚好解决资源并发性能的问题，也正是说，资源的 es 引入和 Bundle Free 的趋势是符合现代浏览器的发展规律的。

### Bundle Free

业界上，Bundle Free 的实现主要是[vite](https://github.com/vitejs/vite)和[snowpack](https://github.com/pikapkg/snowpack)。尤雨溪已经将 vue3 的工程化逐渐改变成 vite，vite 的出现有悖于 vue-cli3。vue-cli3 更多是 webpack 的深层封装。webpack 最大的问题就是打包性能的问题，如果 MPA，你可以通过减少打包入口来提高打包效率。但是当你的项目是一个异常庞大 SPA 的情况下，由于你不是多页面框架（mpa），所以当你的页面有一个文件变动的时候，需要重新构建一个完整 bundle，即使你用 Happypack 压榨电脑的每一寸性能，都达不到高效的开发效率。

而 vite 则是 Bundle Free 的实现，它的出现主要是有效减少开发编译时间，因为 Bundle Free 的原理就在于每一个文件都是独立的 import。Node 端和浏览器端的文件基本是对等的，每当一个文件有变动的时候，只需要替换其中一个文件即可。所以它在大型业务项目的开发中，有着很不错的体验。

![尤大大的Twitter](/img/twitter-yyx.png)

由于 vue 不同于渲染函数，很多语法是模版约定的。熟悉 vue 原理的同学就知道，它有对应的 compiler，将模版转换为 createElement 的函数，而这些函数则可以在浏览器直接运行。每一个独立的 vue 文件，都会转换成这么一个 js 文件，它们在浏览器上直接运作。这就是 vite 的基本原理。

当然，vite 也有妥协，生产模式上 vite 还是采用了 rollup 的打包方式，在考虑兼容性的情况下，让代码转换为旧浏览兼容的模式。唯一的缺点就是增加了开发和生产环境的差异性。所以资深的前端工程师在使用 vite 的时候要注意回归一下兼容性的问题。

同样，snowpack 也是采用了开发模式 Bundle Free，而生产模式还是以 bundle 为主（或提供可选择的模式）。就此看出 Bundle Free 并非完全适用于这个时代。

#### 优点

- SPA 开发效率高，每个页面独立
- 与浏览器 http2 的并发请求契合
- 与浏览器的 ESM Import 契合
- 与 deno 的 ESM Import 契合
- 依赖清晰

#### 缺点

- 兼容性不好，生产还是考虑打包模式
- 如果生产使用 bundle-free 的[加载效率问题](https://github.com/jakedeichert/svelvet/issues/83)
- 依赖需要都满足 esm（antd 不满足）
- 开发与生产的不一致性

### 对未来的畅想

![来自《The Third Age of JavaScript》](/img/third-age.png)

作为一个从 Jquery 走过来的前端工程师，你会明白以前的浏览器是弱化前端模块化，没有前端工程化的，所有的资源都是静态引入，前端项目的维护性是很弱的。但是结构是清晰的，学习成本非常低。进入了第二个时代，也就是 webpack 引领的前端工程化时代，前端项目就变成了一个 JS 文件，各种工具层出不穷，学习成本非常高。2020 后可能会进入第三个时代，这个时代是属于 Bundle Free 或者 Bundleless，部分前端项目可能会回到直接引用的状态，部分项目则是混合依赖的情况，在另一个程度，给前端性能优化带来了另一个可能。

- 第一阶段：Jquery 时代（直接依赖）
- 第二阶段：前端工程化（打包依赖）
- 第三阶段：Bundle Free？（混合依赖）

### 参考资料

- [Snowpack 2.0](https://www.snowpack.dev/posts/2020-05-26-snowpack-2-0-release/)
- [The Third Age of JavaScript](https://www.swyx.io/writing/js-third-age)
- [Using ES Modules in the Browser Today](https://www.sitepoint.com/using-es-modules/)
- [vite 和 webpack 性能对比视频](https://mobile.twitter.com/its_hebilicious/status/1290487966347874313)

### 题外话

shopee，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](mailto:weiping.xiang@shopee.com)，非诚勿扰。
