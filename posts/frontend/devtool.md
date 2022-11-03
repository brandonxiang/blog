---
title: ESM Import与Bundle Free
date: 2020-06-20T11:59:57.000Z
---

首先我默认你使用的是 mac 电脑，windows 电脑可以自行研究一下，原理基本相同。

针对前端工程师，我们离不开几个工具（terminal、vscode、chrome），而 proxy 工具是可选的。有人会说把软件都装一遍就完事。其实我们可以玩出一些花样，提高大家开发效率（防止不断切换 mac 桌面）。

## 配置开发环境

### VSCode Server

参考[VSCode Server 官方文档](https://code.visualstudio.com/docs/remote/vscode-server)，这里我们采用的是最新推出的 VSCode 的 web server 版本，该版本有别于 desktop 版本。它可以通过远程模式和本地模式来启动服务。远程模式利用 https://vscode.dev/ （无需借助 codespace）进行远程开发访问。本文更多介绍的是本地模式。

首先安装依赖：

```bash
wget -O- https://aka.ms/install-vscode-server/setup.sh | sh
```

我这里主要采用的是它的本地服务模式，利用以下命令本地启动：

```bash
code-server serve-local
```

在安装额外依赖包后，服务启动成功。你可以通过默认端口`localhost:8000`访问。此时你可以登陆的 Github 或者 Microsoft 账号来同步你的编辑器偏好设置。

![VSCode Server](https://brandonxiang.top/img/vscode-web.jpg)

VSCode Server 是自带 Web terminal，所以我的开发经验就是打开`localhost:8000`，快捷键打开 terminal。该编辑器已经将 code 命令设置好了，当你想启动一个项目，你可以毫不犹豫地敲上`code .`，即可新开窗口打开当前目录。

这样好处在于，我把前面所说三大工具 terminal、vscode、chrome 揉合在一起，都放在 chrome 里面。我只需要关注 chrome 这个窗口即可，调试页面会更加得心应手，不需要切换窗口。所以内存消耗都交给 chrome 处理，有效避免 electron 的性能担忧（虽然 vscode 已经优化得非常好）。你一天的工作基本上离不开 Chrome 浏览器，除非你在摸鱼。

### 进程守护

VSCode Server 是经常使用的，希望它进程常驻在后台，这里我们采用 supervisor 来守护进程。首先安装 supervisor：

```bash
brew install supervisor
```

默认在初始目录`/usr/local/etc/supervisor.d`下配置一个 vs-code-server.ini。利用以下配置文件确保你的项目是能够开机启动且自动重启的，并将日志放置在指定位置，确保报错信息有迹可循。

```ini
[program:code-server]
directory = /usr/local/bin
command = /usr/local/bin/code-server serve-local
autostart = true
startsecs = 5
autorestart = true
startretries = 3
user = weipingxiang
redirect_stderr = true
stdout_logfile_backups = 20
stdout_logfile=/usr/local/var/log/vs-code-server.log
stdout_logfile_maxbytes=10MB
stderr_logfile=/usr/local/var/log/vs-code-server-err.log
stderr_logfile_maxbytes=10MB
```

配置完成后，记得`supervisorctl reload`重新加载配置文件，配置文件才会生效。`supervisorctl`是可交互命令，可以查看当前服务运行状态。如果你的 nodejs 服务开启过多导致卡死，直接采用`killall node`杀死所有 nodejs 进程，该 vscode server 也将会自动重启。

### VSCode Server 和 Code Server

讲了很多 VSCode Server 的使用，大家肯定会拿它和[Code Server](https://github.com/coder/code-server)进行比较。Code Server 同样是利用 VScode 源码改造的 BS 模式工具，有很多博文都已经介绍过了，这里不再赘述。而 VSCode Server 的远程模式则比较麻烦，它启动，注册，并通过 secure tunnel 与微软官方进行通信，为你的机器命名。简而言之，就是它多了一层 tunnel，将你的 vscode web 和服务器相连接。

为了体验 VScode Server 的远程模式，你还需要填写[signup form](https://aka.ms/vscode-server-signup)，等待微软官方审批方可使用。我有幸等到了它的许可，远程模式的体验还是比较慢，开发体验算不上流畅。效果远不如本地模式，大家可以自行试用。

![架构](https://brandonxiang.top/img/server-arch.png)

以下是它与 Code Server 的对比，Code Server 更适合在自己搭建服务器使用。VSCode Server 还在发展的过程中，本地模式则是相对友好，希望它未来会发展得更好。

| VSCode Server          | Code Server      |
| ---------------------- | ---------------- |
| 官方（亲儿子）         | 第三方           |
| 远程模式要经过官方注册 | 远程模式只需登陆 |
| github 验证            | 密码验证         |
| 自带 code 命令         | 无               |

## 配置代理工具

proxy 工具是可选的，部分 web 项目会采用开发工具 webpack-dev-server 或者 vite 的 proxy 工具。这种方式是比较推荐的，因为它没有依赖代理工具的配置，做到了较好的开发体验（DX）。

当我们遇到登陆模块页面等调试的时候，由于域名有限制，我们想将远端域名代理到本地，我们可以采用 whistle（由这款 nodejs 开发的工具），全局安装`npm install -g whistle`即可。利用 chrome 的 SwitchyOmega 将设备的服务映射到端口上，方可利用 http://local.whistlejs.com/ 界面来管理代理规则。

```bash
w2 start --init
```

代理规则也极其简单，我们可以通过简单的规则让快速满足开发需求，通配符规则可以参考[官方文档匹配模式](https://wproxy.org/whistle/pattern.html)。whistle 服务是否常驻在后台，以你的开发需求习惯而定。

## 总结

作为前端开发，我们的目标是开发工具越轻量越好，尽可能提高自身的调试效率。希望 VSCode Server 会成为你的未来开发工具选择之一。（愿不远的将来，你也可以使用 mac mini + ipad 进行开发）。

