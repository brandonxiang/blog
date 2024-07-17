---
title: React技术栈前端项目依赖升级
date: 2024-04-23T12:00:00.000Z
---

技术债务来自旧项目的依赖过久，React 16 + antd 3 + webpack 4。React 新版本的批处理优化了，antd 最新已经由 css-in-js 重写了，不用再配置 less 等预先编译器。旧版本的 webpack 在 nodejs 20 会出现 openssl 的报错，需要配置以下环境变量才能正常运行，长期看，这些项目依赖已经不符合长期迭代。

```jsx
NODE_OPTIONS = --openssl - legacy - provider;
```

首先我们要检查依赖版本，针对核心工具库依赖升级，把打包工具从 webpack 切换成为 vite。最后总结老旧项目的升级收益。

## 一、检查依赖工具

### 1.1 vscode 插件：Version Lens

推荐，vscode插件查看 package.json 中各依赖最新的版本，你可以挑取核心依赖专门进行升级。也可以利用 knip 剪枝掉没用的 dependencies。

![version lens](https://brandonxiang.top/img/show-releases.gif)

### 1.2 taze

该工具是命令行工具，它可以按照规则批量升级依赖。它可以按照 sermer 版本号规则，利用其major/minor/patch 的规则，升级版本号，更有把握地批量升级。

## 二、 React版本升级

### 2.1 React批渲染的差异

旧代码存在不规范的 case：“在 promise 当中设置 setState，然后立即获取 this.state。”这类的逻辑是能够在 react 16 跑通的，但是 react 18 已经优化了批处理的逻辑，所以 setState 会合并，this.state 由于 setState 是异步的，所以不能获取设置后的状态。

修改方法：绕过 setState，异步直接导出数据。

```jsx
const fetchApi = async () => {
   const resp = await requestApi();
   this.setState({data: resp.data});
   return resp.data;
}

const init = async () => {
  const resp = await fetchApi();
  // 修改前
  console.log(this.state.data);
  // 修改后
  console.log(resp);
  setState...
}
```

### 2.2 React dom 根节点初始化方式改变

利用 createRoot 进行根节点的初始化。

```jsx
// 修改前
ReactDOM.render(<App />, document.querySelector('#root'));

// 修改后
const root = createRoot(document.querySelector('#root'));
root.render(<App />);
```

## 三、antd版本升级

### 3.1 Form 表单升级

1.  代码删除掉 Form.create 高阶函数
2.  利用 useForm 代替
3.  Form.Item 替代 getFieldDecorator

### 3.2 Menu Select 等组件升级

1.  将 Menu.Item 挪到 items 属性

2.  将 Select.Option 挪到 options 属性

### 3.3 Icon 升级

antd 4 开始，将 Icon 独立出来，所有要替换引用。

```jsx
// 修改前
 <Button
 type="default"
 icon="sync"
 size="default"
 className={styles.refreshButton}
 onClick={() => loadData(moduleId)}
/>
// 修改后
<Button
 type="default"
 icon={<SyncOutlined />}
 size="middle"
 className={styles.refreshButton}
 onClick={() => loadData(moduleId)}
/>
```

### 3.4 其他修改

移除 babel-plugin-import，参考[从 v4 到 v5 - Ant Design (antgroup.com)](https://ant-design.antgroup.com/docs/react/migration-v5-cn)。

## 四、 webpack 迁移到 vite

前面都是属于运行时内容调整，调整完回归一遍。后面属于编译时的调整，也涉及到一些 commonjs 写法的调整，可以参考《[记一次webpack迁移至vite的艰难优化](https://mp.weixin.qq.com/s/9_Sj2rRpZblWTJrEjMDYew)》

### 4.1 require 换成 dynamic import

首当其冲的是，require 语法在 esm 是不可用的。目标在于将 require 语法转换为 dynamic import。

该业务仓库中存在配置问题引入采用 require 语法，问题是 require 是同步加载，而 dynamic import 采用异步加载。这一块代码的修改要细致验证一下。

### 4.2 全局环境变量注入

旧代码用有全局环境变量注入，例如：

```jsx
process.env.APP_REGION;
```

在 vite config 当中，全局注入一些全局的值，保证已有逻辑能够正常运作。

```jsx
// vite.config.ts

export default defineConfig(() => {
	return {
		define: {
			'process.env.APP_REGION': process.env.APP_REGION
		}
	};
});
```

### 4.3 lodash 替换成为 lodash-es

lodash 是 antd 的重要依赖，全量引入 lodash 体积较大，而且是 cjs 语法，所以利用 vite alias 替换它的别名，指向 lodash-es。

```jsx
// vite.config.ts

export default defineConfig(() => {
	return {
		alias: {
			lodash: 'lodash-es'
		}
	};
});
```

## 五、收益总结

### 5.1 优化效果

|        | 首屏最大 js 包体积 | 首屏最大 js gzip | FCP     | LCP    |
| ------ | ------------------ | ---------------- | ------- | ------ |
| 修改前 | 1550kb             | 541 kb           | 1.4s    | 1.8s   |
| 修改后 | 1001kb             | 369kb            | 0.8 s   | 1.8s   |
| 收益   | 减小32%            | 减小32%          | 提升43% | 没变化 |

### 5.2 esm 运用

语法清一色esm，tree shaking 的效果更加明显。

### 5.3 fast refresh

升级到 react 18 后，项目支持 fast refresh，开发调试可以做到局部刷新且状态不丢。

### 5.4 antd 3 升级到 5

antd 3 是 less 编写样式，利用 vite 加载，所有资源是 bundless，js 和 css 都按需引入，进行起服务调试，如下图。这样也是会造成冷启动显得较慢，很多同学就会误认为 vite 启动很慢，其实 vite 早已经实现预打包了，但是利用 babel-plugin-import 和 vite-plugin-importer 的工具调试和预打包相违背。总共 446 资源 request，antd 占用 96 个，包含 js、css 和 less，所有资源加载独立的。冷启动耗时 17.02s。

![antd 升级](https://brandonxiang.top/img/upgrade-dependencies.png)

解决方案是把 antd3 升级到 antd 5，由于 antd 5 的样式是利用 cssinjs 编写，不利用 less 来按按需匹配样式。结合 vite 会预打包为一个包，在这种情况下只会加载 antd.js，冷启动时间2.04s。
