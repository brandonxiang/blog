---
title: 把 Cursor 打扮成为 VSCode 的样子
date: '2025-07-16T14:00:00.000Z'
description: 把 Cursor 还原回 VS Code 的样子：一键导入原有的设置、主题、键位和插件，把侧边栏调回纵向，选回熟悉的暗色主题。
---

Cursor 大家用的已经很久了吧，不知道大家习惯了 Cursor 的定制样式吗？

我下载 Cursor 后，做的第一件事，就是把它还原回 vscode 的样子，让它舒服一点，也让我自己舒服一点。

其实不用一项项手动改。Cursor 是从 VS Code 源码 fork 出来的，它留了一个一键导入的入口，可以把原来那套配置整套搬过来。

## 先把 VS Code 的配置整套搬过来

打开 Cursor Settings（Mac 快捷键 Cmd + Shift + J，也可以从命令面板搜 Cursor Settings），进 General > Account，找到 VS Code Import，点一下 Import。设置、主题、键位映射和插件都会跟着过来。

容易搞混的是两个设置面板。Cmd + Shift + J 打开的是 Cursor 自己的设置，管的是 AI 相关的功能；VS Code Settings 是 Cmd + , 打开的那个，管编辑器本身的外观和操作。侧边栏、主题、字体这些都在后者里面，在前者里翻是翻不到的。

不想一键导入，或者想自己挑着迁移，可以走 profile。在 VS Code 里用 Preferences: Open Profiles (UI) 把当前 profile 导出，可以存成本地文件，也可以导到 GitHub Gist，再到 Cursor 里用 Import Profile 导入。

有一点要有预期：Cursor 会定期 rebase 到新版本的 VS Code，但通常比官方略旧一些，所以偶尔会遇到某个新出的设置项在 Cursor 里还没有。

## Step 1 设置侧边栏为纵向布局

打开设置（你可以 command + P 或者 ctrl + P，注意这里是 VS Code Settings，不是 Cursor Settings，或者你从首选项里面找）

![打开设置](https://brandonxiang.top/img/cursor-vscode1.webp)

设置 workbench.activityBar.orientation 为 vertical

![设置 activityBar](https://brandonxiang.top/img/cursor-vscode2.webp)

这样你的左侧栏就回来了，如果你有很多 plugin。我觉得 vertical 模式还是能够提高很多显示效率。

Cursor 默认把它做成横向是有原因的，官方为了给 AI chat 面板腾出显示空间。按 Cursor 文档的说明，改完需要重启 Cursor 才会生效，不重启的话会以为设置没保存上。

## Step 2 主题设置

你可以 command + P 或者 ctrl + P，找到 code theme。

![打开主题设置](https://brandonxiang.top/img/cursor-vscode3.webp)

把颜色设置为 Dark (Visual Studio)。

![选择主题](https://brandonxiang.top/img/cursor-vscode4.webp)

Dark (Visual Studio) 是那个偏蓝的老暗色主题。现在 Cursor 的暗色默认主题叫 Default Dark Modern，另外还自带一个 Cursor Dark，想要更接近 VS Code 现在的默认观感就选 Default Dark Modern。设置里还有一个 Auto Detect Color Scheme，打开之后会跟着系统的深浅色走，想固定住主题就把它关掉。

## 字体和字号

Cmd + , 打开 VS Code Settings，搜 Font Family 和 Font Size，编辑器字体、字号都在这里改，比如换成 JetBrains Mono 再把 Font Ligatures 打开。终端字体是独立的一项，在 terminal.integrated.fontFamily，搜 Terminal 也能找到。

## 键位基本不用重学

Cursor 的默认快捷键和 VS Code 是一样的，自己改过的键位会跟着导入一起过来，这块不用重新适应。如果 VS Code 自带的键位还不够，想连 Vim 那一套也配进来，可以看[最简单的 VIM 入门教程](https://brandonxiang.top/blog/tool-vim)。

## 插件里要注意的地方

Cursor 用的是 Open VSX，不是 VS Code Marketplace。大部分常用插件在 Open VSX 上都有，但有一部分只在微软 Marketplace 上架的插件找不到，Cursor 会给其中一些提供自己审计过的 Anysphere 替代版本。所以搜不到某个插件是正常的，不用先怀疑网络问题。

同一个 publisher.extension 名字在 Open VSX 上可能对应不同的发布者，把它当依赖看待，装之前确认一下发布者是不是你信任的那个。

## Cursor 和 VS Code 可以同时留着

两个是独立的应用，可以都装，同一个项目也能两边开，不用二选一。只是它们的设置是分开存的，Import 只是一次性的快照，之后一边改了另一边不会跟着变。想长期保持一致，可以隔一段时间用 profile 重新导一次。

编辑器只是开发环境里的一部分，终端、编辑器、浏览器这几样怎么配合起来，我在[如何配置前端工程师开发环境](https://brandonxiang.top/blog/frontend-devtool)里写过。

## 啊，这下舒服了

新工具的学习成本真的很高，但是我的审美还停留在原来，所以我把 Cursor 打扮成为 VS Code 的样子，这样拯救了我的强迫症，降低了编码的心智负担，快来试试吧。
