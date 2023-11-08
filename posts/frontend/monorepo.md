---
title: 如何合并已有仓库到大仓
date: 2023-11-09T12:00:00.000Z
---


## 背景

大仓也被称为 monorepo，已经是很成熟的基础建设。代码整合成为一个仓库，主要目标还是为了便于管理，解决代码复用率低的问题，方便大家抽象公共代码，并且能让公共代码“活起来”。通过软链和CICD的工具我们可以把代码的使用效率达到一个很不错的程度。changeset、pnpm、turborepo 不在本文章的讨论范围内。

另一个大仓的优势在于减少运维成本，减少合并分支成本。前端项目的大仓并不是简单的代码堆叠，统一工具链，能够有助于统一团队规范，如eslint、tsconfig、cspell拼写规则、gitignore、husky、lint-stage、prettier。于此同时，我们可以把所有依赖的版本信息尽可能对齐。 

但是我们也会面临一个问题：怎么样将已有多个代码仓库合并大仓的同时，保留所有的提交记录？“鱼”和“熊掌”如何兼得？代码的git非常重要，记录配合 vscode 的 gitlen 使用，能够很好地帮助我们解决live问题，找到对应的问题的本质，对应的业务需求。

一个普通程序猿可能会把代码直接搬过去，这样记录都会变成你的名字。

我们能否有更好地解决方案呢？

## 利用read-tree保留提交记录

参考[About Git subtree merges - GitHub Docs](https://docs.github.com/en/get-started/using-git/about-git-subtree-merges)，我们可以做到子树合并且保留提交信息。它可以以一个子目录的情况保存在主仓库当中。

首先第一步必须要做的是创建一个新项目，并提交第一行记录（这个步骤不能省略，本地必须有初始化的commit信息，保证read-tree能正常读取信息，之前我偷懒了一次，浪费了一个下午）。

```bash
mkdir <主仓库名>
cd <主仓库名>
git init
touch .gitignore
git add .gitignore
git commit -m "initial commit"
```

初始化完成后，第一步将远端代码以`remote origin`的形式加入本地的git。第二步把它merge到本地代码，保证所有的commit信息都能够过来（这里印证上文初始化commit的重要性），它不会变动本地代码。

关键一步，通过read-tree命令读取git记录到主仓库的子目录下，读取出主要的文件内容。这时候你可以检查是否所有的commit信息得以保留。在主仓库commit所有代码，确保所有信息在主仓库提交。

```bash
# 新增指向我们感兴趣的单独项目的远程 URL
git remote add -f <子仓库名> <子仓库git地址>

# 子项目合并到本地 Git 项目。 这不会在本地更改任何文件，但会为下一步准备 Git
git merge -s ours --no-commit --allow-unrelated-histories <子仓库名>/<分支名>

# 创建新目录并将子项目的 Git 历史记录复制到其中。
git read-tree --prefix=<子目录名> -u <子仓库名>/<分支名>

# 提交更改以确保其安全
git commit -m "子仓库 merged in 主仓库"
```

这样我们就做到了“鱼”和“熊掌”的兼得。在保留commit信息的同时，我们按目录要求合并了大仓。在已有大仓基础上，我们在去调整代码满足它 CICD 的流程。

## trade off

- 代码read-tree只会合入一个分支（一般是主干分支）。在实战中，需求是不会停歇的，可以等需求都合入子仓库主干后，再同步一次代码。
- 主仓库的 `remote origin`比较多，但是它只在合并仓库的负责人本地存在，你也可以通过`git remote remove origin`删除。

## 如何同步子仓库的 commit 信息

如果存在子仓库的代码变更，我们可以通过以下命令同步子仓库代码，如果你在主仓库也有代码变更，同一行代码处，会出现代码冲突，所以请尽早把子仓库设置为 archived。

```bash
git pull <子仓库名> master
```

## 总结

这文章讲了一件“很小的事”。它可能在大仓建设的过程当中必然会遇到。“完美主义”的程序员是会在乎这一个“细节”。