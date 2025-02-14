---
title: OpenRouter 免费 AI 工具
date: '2025-02-14T12:00:00.000Z'
description: 免费 api 羊毛工具
---

![post](https://brandonxiang.top/img/openrouter-post.png)

## 背景

人工智能 (AI) 正在以前所未有的速度发展，各种强大的语言模型如雨后春笋般涌现。然而，选择和使用这些模型往往充满挑战：不同的模型有不同的API、定价模式和性能表现，这让开发者和用户难以找到最适合自己需求的工具。**Open Router** 应运而生，它就像一个AI世界的枢纽，连接着众多领先的AI模型，简化了访问和使用的过程，为用户提供了更灵活、更高效的AI体验。

### **Open Router 是什么?**

今天介绍的 [Open Router](https://openrouter.ai/) 是它可以被认为是**多模型 AI 路由平台**。它允许用户通过一个统一的 API 访问来自不同提供商的各种 AI 模型,包括 OpenAI、Anthropic、Cohere、AI21 Labs 等。它也有免费选择。选择模型和记住各种各种 API 密钥会变得很繁琐。

这意味着你无需分别注册、配置和管理多个 API 密钥，只需一个 Open Router 账户，就能轻松调用各种模型，体验不同的 AI 能力。

### Open Router 的核心优势:

- **模型多样性:** 它汇集了众多顶尖的 AI 模型，涵盖了文本生成、代码编写、图像生成等多种任务。你可以根据自己的需求，选择最合适的模型。例如，需要更强大的文本生成能力时,可以选择 GPT-4;需要更注重隐私保护时,可以选择本地部署的模型。
- **统一的 API:** 它提供了一个统一的 API 接口，简化了模型调用流程。无论你选择哪个模型，都可以使用相同的代码进行调用，大大降低了开发难度和时间成本。
- **智能路由:** 它具备智能路由功能,可以根据模型性能、价格、可用性等因素，自动选择最适合的模型来处理你的请求。这确保了你始终能获得最佳的性能和性价比。
- **成本优化:** 它提供了多种定价方案，并支持按需付费。你可以根据自己的使用量，选择最经济实惠的方案。此外，智能路由功能还可以帮助你优化成本，避免使用价格过高的模型。
- **易于集成:** 它提供了丰富的文档和示例代码，方便开发者将其集成到自己的应用程序中。无论是网页应用、移动应用还是后端服务,都可以轻松地利用 Open Router 的 AI 能力。
- **持续更新:** 该团队会持续更新和添加新的 AI 模型，确保用户能够访问到最新的技术。

对于个人开发者来说，这更是一种“福利”，你可选择使用“免费模型”。结合AI chat 工具和开发工具，我们聊一下怎么使用好 Open router。

## AI Chat 工具（Open Router + Open WebUI + Travily

当前， 我们已经不能满足于基本问答的AI Chat 工具，web-search和自定义知识库是大家都标准配备。这里用到了“[open-webui](https://github.com/open-webui/open-webui)”， 它是一个开源的 Web 界面，用于与各种 LLM (Large Language Models) 进行交互。它提供了一个用户友好的界面，允许用户输入问题、查看回答、管理对话历史等。同时，它也满足额外的功能点（包括web-search和自定义知识库）。

这里只是举一个最简单的配置例子。

首先安装 Open WebUI，你可以选择 docker，但是我更喜欢本地运用 python 部署，更为简单。我使用了 python uv 作为包管理工具，这里强烈推荐。

```bash
# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 确保你的python版本大于3.11，执行以下命令即可
DATA_DIR=~/.open-webui uvx open-webui@latest serve
```

在“设置“的”外部连接”的位置，添加设置“[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)”，填上你的 api key。

![](https://brandonxiang.top/img/openrouter-1.png)

此时你可以用到 open router 里面的模型，选择 free 免费模型。

![](https://brandonxiang.top/img/openrouter-2.png)

“设置”的“联网搜索”的界面可以设置web search 的一些方式，这里使用 [tavily](https://app.tavily.com/) 为例，它有每月1000token 的免费额度。

![](https://brandonxiang.top/img/openrouter-3.png)

此时你就可以用 open-webui免费玩耍了。Open Router + Open WebUI + Travily 的组合提供了一个强大的 AI 推理问答系统的框架。 通过结合这三个组件，可以构建一个能够利用各种 AI 模型进行推理，并结合知识库提供准确、流畅答案的系统。

## 开发工具（Open Router + windsurf + cline）

[windsurf](https://codeium.com/windsurf) 是非常优秀的具有不错 free plan 的 AI 编辑器，但是，在免费模式下，你只能使用它的 chat 和 autocomplete，只能满足你的最基础编程的需要。

我希望能给它补全 agent 编程的能力，选择使用 Cline 作为高效辅助。cline 支持选择多种模型，这里选择OpenRouter，并选择一个免费模型。基于它的 Auto Approve 能力，该项目它可以结合你的要求改动代码并进行多步的 agent 操作。

![](https://brandonxiang.top/img/openrouter-4.png)

Open Router、Windsurf 和 Cline 的完美结合，为开发者们打造了一个强大的 AI 开发环境。 开发者可以利用 Windsurf 强大的 AI 能力，通过 Cline 友好交互体验，高效地进行代码开发。 Open Router 的智能路由功能，可以优化成本和性能，让开发者专注于更具创造性的任务。 

## 总结

Open Router 是一个强大的 AI 平台，它简化了 AI 模型的访问和使用，为开发者和用户提供了更灵活、更高效的 AI 体验。如果你正在寻找一个多模型 AI 枢纽，Open Router 绝对值得一试。这也是一个新“思路”，运用最低的成本开展辅助开发，是每个程序员的必备，赶紧试试吧。