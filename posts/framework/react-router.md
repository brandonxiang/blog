---
title: React Router 7 的 SSR 无痛升级之旅
date: 2024-11-29T11:59:57.000Z
description: React Router 7 实战
---


![React Router 7 SSR 无痛升级之旅.png](https://brandonxiang.top/img/react-router.png)

## Nextjs 的 OTA 用户之路

SSR 和 CSR 已经是老生常谈的话题，但是，伴随着 nextjs 的日益壮大，且它的 app router 和各种新 React 写法让人难以接受，给团队带来一定的学习成本和心智负担（以下是两种特别的写法）。大家会习惯性使用 hooks，那项目大部分组件都会成为客户端渲染。这会让团队成员渐渐都往 “use client“ 模式靠拢，服务端渲染只剩下基础架子。

```jsx
// 写法一：当你要使用 hooks，必须先写个 use client，但是这个组件就成为客户端渲染

'use client'

import { useState } from 'react'
 
export default function Counter() {
  const [count, setCount] = useState(0)
 
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

// 写法二：Server Action，利用 async 和组件的结合，制造出一个四不像
// 服务端运行的组件，我相信大部分人不敢使用。

export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'
 
    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }
 
    // mutate data
    // revalidate cache
  }
 
  return <form action={createInvoice}>...</form>
}
```

大家喜欢 vercel 和 nextjs 一起使用，无形给大家一种心理压力，这两回事是不是绑定关系，其实不然，他们可以分开使用。伴随着 v0.dev 的成功，nextjs 适合个人开发者快速建站。但是陡峭的学习曲线和 file-based router 的限制，会使得团队的效率往往达不到最高，团队的技术栈，我们希望它是相对浅显的，避免”木桶效应“，所有人都能够遵守的，新人容易上手的。

## React Router 7 的进步

React Router 升级到最新的版本，最大的特点是把多个概念进行了统一。react-router 和 react-router-dom 整合为 react-router， remix 被整合进入 react-router。这样一来，没有那么多概念，方便大家用统一的“升级“解决方案。

另一个优点在于 React Router 官方推荐使用 vite，vite 优先推荐 esm 的模块化思路，代表着未来的 Web 端发展方向，默认的 esm 产物已经能够满足绝大多数浏览器了，如果要考虑浏览器兼容性问题，可以使用 [vite-plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 来实现旧浏览器代码转译。

> 正如官网所说：You can use it maximally as a React framework or minimally as a library with your own architecture. 你能够用它作为一个框架，也可以用它作为一个 library。
> 

## CSR升级步骤

### 1 升级 Vite

第一步把你的项目升级到 vite。vite 的升级参考：[记一次React技术栈前端项目依赖升级](https://www.notion.so/React-93ce1fa1d87e4c038abfe1897ba9d8bd?pvs=21) 。难点只是解循环依赖以及 esm 语法改造。vite的升级风险是可控的，当然，你要抽查一下页面改动效果即可。如果有问题，则是全盘报错。

### 2 升级 React 和 React Router

第二步，升级 React 和 react-router的版本。react-router 的升级是和 react 版本相关联的，所以它们都要走升级操作。React 18 的升级是一道“坎“，因为批处理逻辑的调整让整个项目有潜在的风险，重渲染或者副作用会失效，页面需要全量回归。

难点是 react-router的版本。版本 6 以前有 api 层面的改动，存在一定改动量。刚好这是 class 组件和 function 组件的交替过程，首先你需要调整某些路由相关组件的写法，已适配新版 react-router 写法。

从 react-router 6 到 7 的升级是无痛的，api 调整并不大。所有的 react-router-dom 引用改成了 react-router。这是你就是把它作为 library 的形式使用。

> CSR 初始化项目模板可以参考
> 

[https://github.com/brandonxiang/vite-antd-starter](https://github.com/brandonxiang/vite-antd-starter)

## SSR升级步骤

你想把项目升级为 SSR 项目，由于它支持作为 framework 使用。首先安装特定的依赖。

```bash
pnpm i @react-router/node @react-router/serve isbot
pnpm i @react-router/dev vite-tsconfig-paths -D
```

新增 react-router.config.ts 文件，进行配置项，包括 ssr 开关和 prerender 路由，可以静态直出一些页面。

```jsx
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  async prerender() {
    return ['/menu2'];
  },
} satisfies Config;
```

项目目录调整从 src 目录调整为 app 目录，项目的优势在于可以采用非 file-based router。由于大量的已有项目都是声明式路由，这我往往是一个“阻力”，让大家不想用升级框架来满足 SSR 诉求。

后面是一些“体力活“，调整文件的路由，framework 模式的路由和 library 模式的路由有所不同。

```jsx
// framework 模式
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // pattern ^           ^ module file
] satisfies RouteConfig;

// library模式
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="some/path" element={<App />} />
    </Routes>
  </BrowserRouter>
);
```

这两种写法存在写法差异，所以我希望利用配置转换把路由信息转换为路由配置代码。

```jsx
export const getRoutes = () => {
  const res = menus.map((menu) => {

    if (menu.layoutPath && menu.subMenu) {
      return layout(menu.layoutPath, menu.subMenu.map((item) => {
        return route(item.routePath, item.routeFile);
      }));
    }

    if(menu.routeFile) {
      if (menu.routePath === 'index') {
        return index(menu.routeFile);
      }
      return route(menu.routePath, menu.routeFile);
    }

    return null;
  });
  return compact(res);
};
```

> SSR 初始化模板可参考：
> 

[https://github.com/brandonxiang/vite-antd-ssr-starter](https://github.com/brandonxiang/vite-antd-ssr-starter)

## 总结

从 react-router 版本升级到 SSR 渲染模式的升级的工程化角度看，我们希望是工具库的延续是一脉相承的，也可以是 progressive 的。你用的多或者少，取决于你的项目诉求。react-router7 打通了 remix 和 react-router，给大家一种解决方案，它具备了**esm 新语法、 React 流式 SSR、声明式路由**等亮点，值得大家在业务项目当中使用。大厂们卷的 SSR 赛道在 React Router 7 之后变得没有意义，它已经提供了 CSR 和 SSR 的选择，结合 vite + React 技术栈，这是一个相对完整的技术选型了。