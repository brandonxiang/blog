---
title: Svelte笔记四：compile源码解析
date: 2020-08-15T12:51:00.000Z
---

- [Svelte 笔记三：runtime 源码解读](https://brandonxiang.vercel.app/blog/svelte3)
- [Svelte 笔记四：compile 源码解析](https://brandonxiang.vercel.app/blog/svelte4)

Svelte 的 runtime 之所以可以如此简洁，是因为在 compiler 的阶段已经完成了很多工作。compiler 是一个将模版语言转化成为可执行代码的一个过程，在运行时的帮助下，实现单向数据流的过程，这样才是 svelte 的运行原理。

svelte 官方的 webpack 插件[svelte-loader](https://github.com/sveltejs/svelte-loader)和 rollup 插件[rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)的主要都是基于 svelte.compile，这个编译器主要分为两部分 parse 和 compile，parse 是解析的过程，解析 script 和 style 等 tag 标签以及 each 和 ifelse 等 mustache 模版语法。compile 则是包含了 parse 的动作，将解析出来的 ast 语法树转换为可执行的代码。

## parse

在 svelte 的语法中，svelte 模版可以分为几个部分：

- html
- css
- instance
- module

html 的模版逻辑可以分为三大类，tag，mustache 和 text，其中 text 是指没有语意的静态文本。

### tag

tag 标签除了 HTML 原生的 Element，还包含了自定义的组件，和 svelte 定义的特殊组件：

- svelte:head
- svelte:options
- svelte:window
- svelte:body

等等，与此同时，Element 上的 attribute 也会读取并解析成为语法树。

### mustache

mustache 则是模版语言中的语法。

例如 if else 语法：

```html
{#if user.loggedIn}
<button on:click="{toggle}">Log out</button>
{:else}
<button on:click="{toggle}">Log in</button>
{/if}
```

例如 each 语法：

```html
<ul>
  {#each cats as { id, name }, i}
  <li>
    <a target="_blank" href="https://www.youtube.com/watch?v={id}">
      {i + 1}: {name}
    </a>
  </li>
  {/each}
</ul>
```

源码中有大量的硬编码和判断，将以上这些模版语法转换成为相应 type 为`Fragment`的语法树 TemplateNode，记录所有标签的位置。数据结构在 `src/compiler/interfaces.ts`里。

svelte 的 css 组件样式都存放在 style 标签里面，工程代码里的样式字符会被转换成 type 为`Style`的语法树。

svelte 的 script 被分为 instance 和 module 两种。instance 指的是[svelte runtime 源码解析](https://brandonxiang.vercel.app/blog/svelte3)中提及的 instance 方法，是用于处理组件内部的变化逻辑。module 则是处理组件外部的逻辑，它 export 出来的方法可以被组件外部调用。例如下面这个例子 stopAll 这个方法可以被组件外部调用，用于暂停组件的音乐播放器。

```html
<script context="module">
  const elements = new Set();

  export function stopAll() {
    elements.forEach((element) => {
      element.pause();
    });
  }
</script>
```

script 的解析主要靠的是[code-red](https://github.com/Rich-Harris/code-red)，它是基于[acorn](https://github.com/acornjs/acorn)的封装。它的作用主要是解析 js 语法和打印 js 代码，主要有三个函数，分别是 b，x 和 print。b 代表 body，x 代表 expression，print 代码打印。解析主要用到 b 和 x。将项目的业务代码解析成为语法树，再分别装入 instance 和 module。

## compile

语法的最终编译是来自[code-red](https://github.com/Rich-Harris/code-red)的 print 将调整后的语法树转换成为代码。

第一步将 parse 过程中拿到的语法树（包含 html，css，instance 和 module）转换为 Component，第二步将 Component 进入**render dom**处理并生成 component 的转换代码以及 runtime，第三步输出 compiler 的结果。

[《Svelte 笔记三：runtime 源码解读》](https://brandonxiang.vercel.app/blog/svelte3)介绍了转换后代码重要的组成部分是 create_fragment，该函数内拥有很多 element 的创建，它会是组件初始化中非常重要的函数，所有的节点都会定义在`src/compiler/compile/nodes`中。组件化是将所有的 Component 组成一个树状结构，render dom 将匹配的节点转换为 runtime 可识别的代码。

重点聊一下数据流，《runtime 源码解读》讲到 svelte 是单向数据流，将代码中变量的赋值转换成为`$$invalidate`，它并没有采用 vue 中的双向绑定的机制，而是直接在语法树中判断变量的赋值的语句，待变量触发变化时，引起 Fragment 的 update 以及 Component 的 update。

```javascript
node.type === "AssignmentExpression" &&
  node.operator === "=" &&
  nodes_match(node.left, node.right) &&
  tail.length === 0;
```

## 总结

svelte 是一个极简化的框架，从完备的 compiler 和极简的 runtime 可以看出。一个前端工程师的主要目标是寻找一款贴近浏览器原生的框架，svelte 是你不二的选择。

### 题外话

[shopee](https://links.jianshu.com/go?to=https%3A%2F%2Fshopee.cn%2F)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](https://links.jianshu.com/go?to=mailto%3Aweiping.xiang%40shopee.com)，非诚勿扰。
