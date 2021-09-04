---
title: React笔记四：next.js的从零到百入门配置
date: 2021-05-109T00:13:53.000Z
---

## 前言

React SSR 最成熟的开源框架是[Next.js](https://github.com/vercel/next.js)，这么多年保持着强劲的生命力，它的创始团队 vercel（曾用名 zeit），如今更关注于 SSR 和 serverless 的结合。随着服务端的容器化技术以及 serverless 技术不断完善，在国外可能 SSR 的降级已经不是一个必要命题。但是，考虑到国内的服务环境，今天我们还是有必要从前端的技术点讨论一下如何去实现 SSR 的优雅降级。

旧版本的 Next.js 是利用`getInitProps`实现服务端渲染以及静态站点生成。在 Next.js 9.3 版本后，`getInitProps`这个 api 被替换成为三个不同的 api，分别是：

- `getStaticProps` (静态页面生成 SSG): 构建的时候生成页面
- `getStaticPaths` (静态页面生成 SSG): 根据构建内容去生成动态路由
- `getServerSideProps` (服务端渲染 SSR): 在每个请求中在服务端获取数据渲染页面

这三个 api 的使用是对一个项目中不同页面的更细程度的划分，它可以有效区分哪些页面走 SSR、哪些页面走 CSR 和 SSG。高效的划分了这三种不同的渲染模式。

## What is JAMstack ？

静态页面生成 SSG 这种模式更加符合[JAMstack](https://jamstack.org/)的标准，所有的页面都是提前预渲染的，静态的页面可以直接托管在 CDN 上，有效降低运维成本，有助于你“高效下班”。Next.js 官方建议你优先使用静态页面生成，不得已才使用服务端渲染。但是静态页面不能满足你的所有 case。只有以下情况才比较适合静态页面生成：

- 数据能通过 CMS 接口有效渲染
- 数据能够公开缓存，并且不能用户特有的
- 页面必须预渲染，并且 SEO 敏感

Next.js 已经能够在一个项目不同路由支持不同的渲染模式。

源码参考 [brandonxiang/example-nextjs](https://github.com/brandonxiang/example-nextjs) ，页面的逻辑放在 modules 文件夹里面，用一个自定义的函数`getPrerenderProps `来保证页面的预渲染逻辑。这个预渲染逻辑如下，即获取数据传递到组件当中与 Next.js 的预渲染 api 类似。

```javascript
// modules/Home.tsx
export const getPrerenderProps = async (ctx) => {
  // SSG读取环境变量，并作为兜底参数
  const defaultLimits = process.env.limits || 0;
  // SSR和CSR动态渲染从URL上获取参数
  const _limits = ctx?.query?._limits || defaultLimits;
  // 获取远程动态数据
  const res = await axios.get('https://jsonplaceholder.typicode.com/photos?_limit=' + _limits);
  // 传递给各种渲染模式
  return { props: { photos: res.data } };
};
```

自定义页面渲染函数`Page`来保证页面 dom 的渲染，这里的目标是“一份核心代码，多种渲染模式”。数据 photos 则会在页面中渲染。

```javascript
// modules/Home.tsx
function Home({ photos }) {
  let _photos = photos || [];
  return (
    <div className="photos">
      {_photos.map((photo, index) => (
        <figure key={index}>
          <img src={photo.thumbnailUrl} alt={photo.title} />
          <figcaption>{photo.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export const Page = Home;
```

然后将它渲染到三种不同的模式当中。由于 Next.js 的文件路由设定，页面需要被设置成为三种：

- **index.js** SSR 模式
- **index_ssg.js** SSG 模式
- **index_csr.js** CSR 模式

## Next.js 如何实现 SSR

SSR 模式需要将自定义的`getPrerenderProps` 输出到页面级别 Next.js API 的`getServerSideProps`当中，获取数据的逻辑将会提前在服务端完成。此时，服务端可以实现页面的动态渲染。`Page`则返回给整个页面的渲染函数。

```javascript
// index.js
export { Page as default, getPrerenderProps as getServerSideProps } from '../modules/Home';
```

## Next.js 如何实现 CSR

CSR 模式则是自定义的`getPrerenderProps` 在 useEffect 中渲染，在页面加载之后，重新对页面进行渲染，达到一个客户端渲染的效果。路由参数发生变化，页面会重新进行渲染，保证的页面的动态可用。这种模式页面的渲染会比较慢，时长主要是请求时长。

```javascript
// index_csr.js
export default () => {
  const router = useRouter();
  const [extraProps, setExtraProps] = useState({});

  useEffect(() => {
    getPrerenderProps(router).then(({ props }) => {
      setExtraProps(props);
    });
  }, [router]);

  return <Page {...extraProps} />;
};
```

## Next.js 如何实现 SSG

SSG 则是静态预渲染，参数不能动态从路由传入，只能构建的时候以环境变量的形式传入，所以页面渲染需要采用特殊的兼容读取方式。

将自定义的`getPrerenderProps` 输出到页面级别 Next.js API 的`getStaticProps`当中，实现静态渲染。

```js
// index_ssg.js
export { Page as default, getPrerenderProps as getStaticProps } from '../modules/Home';
```

## 如何将 SSR 降级成为 CSR

SSR 服务端渲染由于是依赖服务器资源，在流量过大的情况下，有可能会出现服务不可用的情况，返回特殊的错误码例如 500 等。这时候我们可以实现优雅降级，利用 nginx 做对应的流量分发，当 SSR 页面返回异常错误的时候，nginx 会将流量导入到 CSR 页面当中。

SSR 页面和 CSR 页面基于 Next.js 采用同样的业务逻辑编写方式，有效保证页面逻辑的一致性，一份代码两端复用。

![SSR优雅的降级](https://brandonxiang.vercel.app/img/next-fallback.png)

## 总结

Next.js 是非常成熟高效的服务端渲染框架，本文通过一些取巧的方式来实现“一份代码，多种渲染方式”，既能提高页面的性能，也能够保证页面的优雅降级。多种渲染模式采用同一份代码，保证了逻辑的一致性，有效地为 QA 节省了回归人力。在“质量”和“性能”上找到了一个很好的平衡点。
