---
title: 如何找到想要的 agent skill
date: '2026-02-21T14:00:00.000Z'
description: 介绍了三个AI技能平台：skillsmp以聚合和检索为主，索引23万+开源技能；skills.sh专注于跨平台分发和一键安装，适合高频实用技能；ctx7 skill专注于编码类技能的全流程管理，适合开发者。[推荐优先选择skills.sh](http://xn--skills-978ik3mr73crtb802o055a.sh/)，因其界面友好和支持软连接，避免技能重复复制。
---

![cover](https://brandonxiang.top/img/ai-cover.png)

# 如何找到想要的 agent skill 

无论是 openclaw 还是 claude coded等工具，都已经离不开 skill 的“赋能”。今天我们聊聊 **skillsmp**、**skills.sh**、**ctx7 skill** 这三个AI skill 平台以及工具。逐个拆解每个工具的特点，给出明确的推荐方向，帮大家快速挑到适配自己的工具，全程大白话，好懂不绕弯~

## 一、skillsmp

[skillsmp](https://skillsmp.com/zh) （全程Agent Skills Marketplace）的核心定位是“开源技能导航站”，主打“聚合+检索”，帮大家快速找到靠谱的AI Agent技能。它的技能规模庞大，索引了**23**万+GitHub开源技能，覆盖类别多，还特意设置了≥2星仓库的收录门槛，避免垃圾技能混入，保证基础质量。它主要靠极客风网页端操作，能让开发者有很全面认识的了解，整体更适合看重技能多样性的用户。

它是一个不错的入门门户网站，其中它介绍了skills 和 MCP的差异性，解释了 skills更是经验、最佳实践、工作流程的指引。

![1](https://brandonxiang.top/img/skillsmp-cover.png)

## 二、 skills.sh

[skills.sh](https://skills.sh/) 则是 vercel 公司主导的平台以及 cli 工具，它走的是“轻量高效”路线，核心是跨平台技能分发和一键安装，类比成AI技能圈的“npm Registry”再合适不过。它不贪多求全。平台针对性很强地收录优质高频技能，但实用性拉满，以安装量排行榜为主界面，让你清楚 skill 的技能和 trending，热门实用技能一眼就能找到。

它的跨平台适配能力是三者里最强的，支持18+种AI Agent，不管是编程类的Claude Code、Cursor、GitHub Copilot，还是通用类的Gemini，都能完美适配。功能上主打省心，用npx命令就能实现跨平台技能一键安装，不用复杂调试。

```SQL

// 搜索
npx skills search find-skills

// 安装
npx skills add vercel-labs/skills@find-skills
```

从界面上我们也可以看到热门 skill的集合仓库，例如：vercel-labs/skills， anthropics/skills 等。

## 三、ctx7 skill

[ctx7 skill](https://context7.com/docs/skills)是ctx7工具的核心模块，ctx7 是我最常用的 MCP 工具没有之一。它由Upstash公司维护，不走“全面”路线，专门聚焦AI编码类技能的全流程管理，相当于编码爱好者的“专属技能管家”。它的技能筛选很精准，主流编程框架和实用工具都覆盖到了，针对性拉满。适配方面，它专门对接Cursor、Claude Code、Codex、OpenCode等主流AI编辑器，还能指定具体客户端安装技能，不用盲目适配。功能上兼顾灵活和安全，基础的搜技能、装技能、看列表都能搞定，还支持AI生成自定义技能、指定适配客户端，能实现全局/局部双重安装管理，支持批量安装，再加上登录认证和权限管控，既方便又安心。它依托ctx7命令行操作，可通过简单参数实现个性化适配，毫秒级响应不卡顿，还能手动添加未覆盖的开源仓库，个人使用完全免费，妥妥适配开发者的日常编码需求。

它还能通过项目依赖给你推荐skill，给你意想不到的建议。

```SQL

npx ctx7 skills suggest
```

## 总结：三者核心特点以及推荐倾向

总结核心差异：skillsmp重聚合检索（技能多而全），skills.sh重跨平台分发（安装快、适配广），ctx7 skill重编码专属（精准适配编程）。我个人推荐倾向优先选skills.sh，它具备不错地排行榜界面，且工具支持软连接避免 skill 重复复制的情况。vercel 的 find-skills 也很不错地提供了 claw 的另外自由拓展的空间，是 clawhub 之外很不错的拓展手段。


> （注：文档部分内容可能由 AI 生成）