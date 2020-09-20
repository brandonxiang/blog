---
title: Svelte笔记四：compile源码解析
date: 2020-08-15T12:51:00.000Z
---

- [Svelte笔记三：runtime源码解读](https://www.jianshu.com/p/6e70a39e709d)
- [Svelte笔记四：compile源码解析](https://www.jianshu.com/p/f65052e112ad)

Svelte的runtime之所以可以如此简洁，是因为在compile的阶段已经完成了很多工作。compile是一个将模版语言转化成为可执行代码的一个过程，在运行时的帮助下，实现单向数据流的过程，这样才是svelte的运行原理。

svelte官方的webpack插件[svelte-loader](https://github.com/sveltejs/svelte-loader)和rollup插件[rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)的主要都是基于svelte.compile，这个编译器主要分为两部分parse和compile，parse是解析的过程，解析script和style等tag标签以及each和ifelse等mustache模版语法。compile则是包含了parse的动作，将解析出来的ast语法树转换为可执行的代码。

## parse

在svelte的语法中，svelte模版可以分为几个部分：

- html
- css
- instance
- module

html的模版逻辑可以分为三大类，tag，mustache和text，其中text是指没有语意的静态文本。

#### tag

tag标签除了HTML原生的Element，还包含了自定义的组件，和svelte定义的特殊组件：

- svelte:head
- svelte:options
- svelte:window
- svelte:body

等等，与此同时，Element 上的attribute也会读取并解析成为语法树。

#### mustache

mustache则是模版语言中的语法。

例如if else语法：

```html
{#if user.loggedIn}
	<button on:click={toggle}>
		Log out
	</button>
{:else}
	<button on:click={toggle}>
		Log in
	</button>
{/if}
```
例如each语法：

```html
<ul>
	{#each cats as { id, name }, i}
		<li><a target="_blank" href="https://www.youtube.com/watch?v={id}">
			{i + 1}: {name}
		</a></li>
	{/each}
</ul>
```
源码中有大量的硬编码和判断，将以上这些模版语法转换成为相应type为`Fragment`的语法树TemplateNode，记录所有标签的位置。数据结构在 `src/compiler/interfaces.ts`里。

svelte的css组件样式都存放在style标签里面，工程代码里的样式字符会被转换成type为`Style`的语法树。

svelte的script被分为instance和module两种。instance指的是[svelte runtime源码解析](https://www.jianshu.com/p/6e70a39e709d)中提及的instance方法，是用于处理组件内部的变化逻辑。module则是处理组件外部的逻辑，它export出来的方法可以被组件外部调用。例如下面这个例子stopAll这个方法可以被组件外部调用，用于暂停组件的音乐播放器。

```svelte
<script context="module">
	const elements = new Set();

	export function stopAll() {
		elements.forEach(element => {
			element.pause();
		});
	}
</script>
```

script的解析主要靠的是[code-red](https://github.com/Rich-Harris/code-red)，它是基于[acorn](https://github.com/acornjs/acorn)的封装。它的作用主要是解析js语法和打印js代码，主要有三个函数，分别是b，x和print。b代表body，x代表expression，print代码打印。解析主要用到b和x。将项目的业务代码解析成为语法树，再分别装入instance和module。


## compile

语法的最终编译是来自[code-red](https://github.com/Rich-Harris/code-red)的print将调整后的语法树转换成为代码。

第一步将parse过程中拿到的语法树（包含html，css，instance和module）转换为Component，第二步将Component进入**render dom**处理并生成component的转换代码以及runtime，第三步输出compiler的结果。

[《Svelte笔记三：runtime源码解读》](https://www.jianshu.com/p/6e70a39e709d)介绍了转换后代码重要的组成部分是create_fragment，该函数内拥有很多element的创建，它会是组件初始化中非常重要的函数，所有的节点都会定义在`src/compiler/compile/nodes`中。组件化是将所有的Component组成一个树状结构，render dom将匹配的节点转换为runtime可识别的代码。

重点聊一下数据流，《runtime源码解读》讲到svelte是单向数据流，将代码中变量的赋值转换成为`$$invalidate`，它并没有采用vue中的双向绑定的机制，而是直接在语法树中判断变量的赋值的语句，待变量触发变化时，引起Fragment的update以及Component的update。

```
node.type === 'AssignmentExpression' && node.operator === '=' && nodes_match(node.left, node.right) && tail.length === 0
```


## 总结

svelte是一个极简化的框架，从完备的compiler和极简的runtime可以看出。一个前端工程师的主要目标是寻找一款贴近浏览器原生的框架，svelte是你不二的选择。

### 题外话

[shopee](https://links.jianshu.com/go?to=https%3A%2F%2Fshopee.cn%2F)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](https://links.jianshu.com/go?to=mailto%3Aweiping.xiang%40shopee.com)，非诚勿扰。





