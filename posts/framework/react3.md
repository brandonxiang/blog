---
title: React笔记三：从0开始搭建项目配置
date: 2019-01-06T11:59:57.000Z
---

随着[create-react-app](https://github.com/facebook/create-react-app)，[create-react-native-app](https://github.com/react-community/create-react-native-app)，[vue-cli](https://github.com/vuejs/vue-cli)和[poi](https://github.com/egoist/poi)等一系列脚手架的大行其道，让很多入门级的前端工程师往往并不知道webpack最基础的原理与配置方法。

这里想用最简单的webpack4和babel7的最简单的配置方法来说明react项目的编译原理等。

## 怎么编译JSX

JSX应该是属于react的精髓，模版响应等都表现在此。而面试过很多人，发现他们对JSX的解析并不了解。typescript应该是很多前端工程师的装逼利器，但是他们往往不知道如何在已有的项目中使用typescript，或者说不知道jsx的编译原理。

与`.vue`文件不同，JSX是在babel转译的过程当中完成。在vue项目当中，单个`.vue`文件会被称为SFC（Single File Component单文件组件），样式，模版，脚本都会在一个文件内，他们是由`vue-loader`转换为js代码。所以整个编译过程是在webpack的独立loader完成。

```
<img src="../image.png">
```

会编译为：

```javascript
createElement('img', {
  attrs: {
    src: require('../image.png') // this is now a module request
  }
})
```

而jsx的编译是在babel内通过[babel-preset-react](https://babeljs.io/docs/en/babel-preset-react)完成，它当中包含了三个独立的babel插件。

*   [@babel/plugin-syntax-jsx](https://babeljs.io/docs/en/babel-plugin-syntax-jsx)
*   [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx)
*   [@babel/plugin-transform-react-display-name](https://babeljs.io/docs/en/babel-plugin-transform-react-display-name)

需要在`babel.config.js`中配置preset。

```
module.exports = {
  "presets": ["@babel/preset-react"]
}
```
或者在package.json中配置babel对象。

```
  "babel": {
    "presets": [
      "@babel/preset-react"
    ]
  },
```

基于webpack是的极简配置，webpack.config.js可以如下配置，详情[GITHUB原码](https://github.com/brandonxiang/example-react/tree/pure-webpack)。

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'react',
      inject: true,
      template: './src/index.html', // 模板地址
    }),

  ],
};
```

## 怎么把它升级为tsx版本

如今我们知道jsx的编译是基于[@babel/plugin-syntax-jsx](https://babeljs.io/docs/en/babel-plugin-syntax-jsx)的语法树转换。如果想把项目升级到typescript。丢掉babel是不可能的，否则会导致jsx转译失败。所以这里需要在babel的生态中使用typescript的preset。

现在的人是越来越分不清es5，es2015，es6，或者是最新的规范。如果在没有babel的项目当中，使用es6语法会导致低版本浏览器兼容性报错。

babel7使用 [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) 作为最新的js语法规范，不需要再去管`es2015`以及各种`stage`的问题，可以通过`browserslist `进行转换。

而 [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript) 则是可以用于替换掉  [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) ，采用ts的最新语法规范进行项目开发。package.json 可以改为：

```
  "babel": {
    "presets": [
      [
        "@babel/preset-typescript",
        {
          "isTSX": true,
          "allExtensions": true
        }
      ],
      "@babel/preset-react"
    ]
  },
```

其中isTSX的选项是用于强制打开jsx的解析。否则，`var foo = <string>bar`将会被jsx语法误解，[详情GITHUB原码](https://github.com/brandonxiang/example-react)。

### 题外话

[shopee](https://shopee.cn/)，又称虾皮，是一家腾讯投资的跨境电商平台。这里加班少，技术氛围好。如果想和我并肩作战一起学习，可以找我内推。邮箱[weiping.xiang@shopee.com](mailto:weiping.xiang@shopee.com)，非诚勿扰。


