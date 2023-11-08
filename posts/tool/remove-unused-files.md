---
title: 简单清理掉项目中没用的180+文件
date: 2023-11-08T12:00:00.000Z
---

## 遇到的痛点

这篇文章或许有另一个不太优雅的名字--“屎山治理”。

在繁重的业务开发当中，我们会面临一些问题。伴随着项目的不断发展，项目出现代码冗余，存在大片没用代码的情况。

举个栗子，重构优化后，某位同学没有删除掉冗余代码，项目残留着废弃的没用文件，导致跨文件引用混乱。还有，业务变更所导致逻辑代码的废弃，项目中重复的定义代码，这些情况在一个长期的项目发展的阶段里面会造成逻辑混乱，重复定义，二义性等等。

其实，程序员都是写代码的，但是很少人敢删代码，久而久之，也就没人敢动废弃代码了。

虽然在项目构建工具的加持下，tree-shaking能够控制项目的包产物体积，但是从开发体验（DX）的角度出发，这往往都是一些心智负担。结合我自己的一些优化经验，简单分享一下：

## 优化手段

### 手段一：eslint的unused检查

首先我们应该考虑的是，通过 eslint 的规则有效的去规避一些项目当中已有的没用的变量和方法，这样保证单文件代码的可用性，我们可以很容易的发现哪个`import`或者`variable`没有被使用。`import`的冗余控制也能够有效控制打包的范围，减少包体积。

eslint最常用的就是官方的no-unused-vars这一条规则。

当然还有一些，第三方的unused-exports规则，例如[eslint-plugin-canonical的no-unused-exports](https://github.com/gajus/eslint-plugin-canonical#no-unused-exports)或者[eslint-plugin-unused-imports](https://github.com/sweepline/eslint-plugin-unused-imports)，这种大家可以适度采用，毕竟eslint是把“双刃剑”。

### 手段二：静态代码工具扫描

通过一些静态分析工具可以有效地分析代码语法，根据语法树信息来判断内容是有用还是没用。

[ts-unused-exports](https://github.com/pzavolinsky/ts-unused-exports)是一个很成熟的分析工具，它可以通过 ts-compiler 对 typescript代码语法进行分析，(tsconfig可以配置allowjs，分析javascript语法)，通过TS语法树有效地找到语法中没用的 export。

该工具能够把所有的没用的 export 找到。这时候我们会很自然地想到一个问题，能否找到完全没有使用的废弃文件。这里分两种情况，情况一，该文件所有的 export 都已经被废弃了，这种情况出现在代码重构的情况，另外一种情况是部分的export没有被使用，那这种需要case by case的判断，到底这个代码有没有存在意义？

暂时这个工具只能找到所有的 export 函数，并没有文件粒度，并不能满足我们的“诉求”。我们希望能把完全没用的文件直接删除掉，所以我提了一个issue。

![找出所有 export 的文件](https://brandonxiang.top/img/issue.png)

我查看了源码，parse过后，会通过`getExportMap`获取每个文件，且它的所有exports内容。我写了一个PR，在和作者沟通交流下，尽量以最小的 api 改动情况来处理。利用一个参数`findCompletelyUnusedFiles`来控制是否找出完全没有被使用的文件，参考[PR#254](https://github.com/pzavolinsky/ts-unused-exports/pull/254)。

![PR 细节](https://brandonxiang.top/img/pr.png)

改动涉及最核心内容，如下。将该文件的真实所有 export 和 unused export 作对比，以此判断它是完全没用的文件。

```javascript
const realExportNames = Object.keys(exports);

if (
  extraOptions?.findCompletelyUnusedFiles &&
  isEqual(realExportNames, unusedExports)
) {
  unusedFiles.push(path);
}
});
```

当我们得到了这个结果后，我们可以通过自己编写的脚本“大胆”的删除文件了。

在删除脚本内，我们要想清楚几个事情：

1.  有范围的扫描（避免错删，所有改动在可控的范围内）
2.  后缀名白名单（多市场的代码可能会存在“多态”，例如，id代表印尼，index.id.ts它不应该被清除掉）

```javascript
const result = analyzeTsConfig('./tsconfig.json', ['--findCompletelyUnusedFiles']);

const outputPattern = ['/pages/partner/', '/pages/store/', '/pages/staff/', '/services/'];
const excludePattern = ['.id.', '.my.', '.ph.', '.sg.', '.vn.', '.th.', '.br.'];

function filterOutput(name: string) {
  for (let index = 0; index < outputPattern.length; index++) {
    if (name.includes(outputPattern[index]) ) {
      return true;
    }
  }
  return false;
}

function filterExclude(name: string) {
  for (let index = 0; index < excludePattern.length; index++) {
    if (name.includes(excludePattern[index]) ) {
      return false;
    }
  }
  return true;
}

const { unusedFiles, ...rest } = result;

Object.keys(rest)
.filter(r => filterOutput(r))
.filter(r => filterExclude(r))
.map((key) => {
  const exportNames = rest[key].map(r=> r.exportName).join(',')
  console.log(chalk.green(key) + ' ' + exportNames);
}) 

if(result.unusedFiles) {
  console.log('no used files: ');
  result.unusedFiles
  .filter(r => filterOutput(r))
  .filter(r => filterExclude(r))
  .forEach((r) => {
    fs.unlinkSync(r);
  })
}
 ```

### 手段三：人工调整已有代码的合理性

在删除完代码后，项目中 ts-unused-export 还会扫描出一些部分 export 废弃的文件，我们只能按照自身的情况做出调整。每个团队的代码分层情况有所不同。这些文件可能不需要改动，也可能是需要调整该纯函数位置。我们应该把它们放在合理的位置。

![代码优化](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/073fe255899d4cf3921c956bee1ffdf1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1316\&h=784\&s=70398\&e=png\&a=1\&b=1d1d1d)

## 总结

首先“清除废弃代码”是一个低频操作。可能我们一年或者几年，清理一次即可，保证代码的“清爽”。所以放在 webpack 等构建工具执行反而不太合适，脚本偶尔扫描，把一些废弃代码清干净，你的DX（developing experience）又回来了。


当然你忍受能力很强也可以“不做”。这篇文章适合具有轻度“代码强迫症”的同学食用。

PS：加餐，也可以参考[knip](https://github.com/webpro/knip)，功能更强大噢。
