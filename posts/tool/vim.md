---
title: 最简单的 VIM 入门教程
date: 2024-09-26T12:00:00.000Z
description: 这篇文章是一篇针对 Vim 新手的入门教程，涵盖了基本导航、编辑命令、常用插件以及 Neovim 的简要介绍，旨在帮助初学者快速上手 Vim，提高代码编辑效率。
author: Weiping Xiang
Tags: Frontend, Javascript, React, npm
---


如果你是在 VSCODE 或者 sublime 上使用 vim 模式的的大牛，这篇博文明显不适合你。它是一个简单的入门教程，给一些技术小白了解并熟悉 vim 的基本操作。如果你有买 Android 平板（例如小米平板等），你可以利用 termux 来配置 terminal，使用 vim 查看代码。

## 一、基础操作

基础操作，请死记硬背。找到规则还是能够快速上手的。

### 1.1 上下左右移动光标

`h` 左

`j` 下

`k` 上

`l` 右

`ctrl + f` 往下一页

`ctrl + b` 往上一页

`ctrl + d` 往下一页

`ctrl + u` 往上一页

### 1.2 插入模式

`i` insert 在光标之前，进入插入模式

`I` 在本行开头，进入插入模式

`a` append 在光标之后，进入插入模式

`A` 在本行结尾，进入插入模式

`o` open 在本行之后新增一行，并进入插入模式

`O` 在本行之前新增一行，并进入插入模式

`s` 删除当前字符，并进入插入模式

`S` 删除当前行中的所有文本，并进入插入模式

### 1.3 常用按键CV

一个好的 CV 工程师要牢牢记住这一部分

`y` yank 复制

`d` delelte 删除

`p` paste粘贴

**Copying (Yanking)**

- `yy`复制整行
- `3yy` 复制 3 行代码
- `y$` 复制到本文这行至最后
- `y^` 复制到这行开始
- `yiw` 复制整个单词

**Cutting (Deleting)**

- `dd` 剪切并删除整行
- `3dd` 剪切并删除 3 代码
- `d$` 剪切并删除 到本文这行至最后
- `diw` 删除整个单词

**Putting (Pasting)**

- `P`: 粘贴到附表以前
- `p`: 粘贴到附表以后

### 1.4 其他常用按键

其他按键请酌情记忆

`r` replace 替换

`u` undo 撤回

`f` find 当前行查找字符

`w` word 单词

`b` back 返回上一个节点

`gg` 回到文件顶端

## 二、Vim 常用插件

vim 插件使用vim script编写，如果你的目标是为了使用一些基础编辑器操作，常用插件是

### 2.1 vim-plug

[vim-plug](https://github.com/junegunn/vim-plug) 是精简的 plugin 安装工具，通过 Vim script 来管理 vim 依赖。

安装也非常简单，如果你是 unix 系统：

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

编辑**`~/.vimrc`**即可以调整依赖，使用`:PlugInstall` 即可安装依赖

```bash
call plug#begin()
Plug 'tpope/vim-sensible'
call plug#end()
```

### 2.2 NERDTree

NERDTree 查看该文件夹里面的所有文件树，类似 IDE。使用`:NERDTree` 即可打开开关

```bash
call plug#begin()
Plug 'preservim/nerdtree'
call plug#end(）
```

### 2.3 FZF

[FZF](https://github.com/junegunn/fzf) 是一个文件检索的工具，让你快速定位文件位置。使用 `:FZF` 快速检索文件。

```bash
call plug#begin()
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'
call plug#end(）
```

## 三、高级操作—Neovim

Neovim 则是基于 Lua 脚本的更上层封装，UI 样式也会更加好看，lua 脚本更为灵活，整体使用体验也会接近 ide。github 上有很多种 Neovim configuration，它能够提供快速上手 Neovim 配置。这里以 [astrovim](https://astronvim.com/) 为例，简单介绍一下。它是一揽子插件的集合，且拥有 lsp，可做代码提示等操作。

```bash
# 安装 neovim
brew install neovim

# Make a backup of your current nvim config (if exists)
mv ~/.config/nvim ~/.config/nvim.bak

# Clean neovim folders (Optional but recommended)
mv ~/.local/share/nvim ~/.local/share/nvim.bak
mv ~/.local/state/nvim ~/.local/state/nvim.bak
mv ~/.cache/nvim ~/.cache/nvim.bak

# Clone the repository
git clone --depth 1 https://github.com/AstroNvim/template ~/.config/nvim
# remove template's git connection to set up your own later
rm -rf ~/.config/nvim/.git
nvim
```

这里是astrovim 基础命令，针对前端开发者你可以使用一下内容

- `:LspInstall typescript` 安装typescript 语言的 lsp
- `:TSInstall typescript` 安装 typescript 的语言解释器

Leader 键默认是 Space，不用死记硬背，按一下空格即可调用快捷功能。基础的快捷键如下：

- `space + e` 展开文件树
- `space + g` 完成 git 操作
- `space + q` 退出窗口
- `space + Q` 退出neovim

## 四、总结

回头看，vim 其实并不难，它确实是最简易的编辑器，启动效率也足够高，特别在 linux 系统当中它起到很重要的作用。由浅入深，我们能够很清楚看到它的玩法非常多，一系列的高效率快捷按键能够帮助你提高工作效率。