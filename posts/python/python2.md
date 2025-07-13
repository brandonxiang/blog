---
title: AI 时代如何重新学习 Python2：streamlit 写网站
date: '2025-05-10T15:57:00.000Z'
description: Streamlit是一个开源Python库，允许用户快速将数据科学和机器学习脚本转化为交互式Web应用，无需HTML、CSS或JavaScript。它与多种数据库兼容，支持快速迭代和用户反馈，适合数据科学家和Python开发者使用。
---


![image.png](https://brandonxiang.top/img/python2.png)

在 AI 时代，你如果只学一门计算机语言，我觉得它会是 python。因为它简单，容易入门。生态链丰富，各种各样的工具，宛如“瑞士军刀”。

今天想讲的是 [streamlit](https://streamlit.io/)，它是一个开源的 Python 库，它可以让你快速地将数据科学和机器学习脚本转化为交互式 Web 应用。其优势在于简单易用，无需 HTML、CSS 或 JavaScript 即可构建功能强大的 Web 应用。首先它是用 react 写底层组件样式，给了**”不愿意写样式不会写页面的人”**一次机会，你只要动一下 python 脚本，你就可以生成一个像样不难看的页面。

**想象一下**：您是一名数据科学家，您工作的公司需要快速做出一些决策！您需要一种方法来整理数字，调查新兴趋势，并帮助您的利益相关者根据这些趋势采取行动。您知道数据应用程序将是完成这项工作的完美解决方案，但您没有时间陷入复杂的 Web 开发、乏味的 UI 样式或缓慢的迭代周期中。我相信未来这样想法的人只会越来越多。

## 一、Streamlit是什么

### **直观的语法**

Streamlit 的突出特点之一是它具有直观的默认样式“内置”，因此你不必考虑样式的编写，无需 CSS、HTML 或 JavaScript 经验。

### **无缝可组合，AI 兼容**

Streamlit与[生成AI](https://streamlit.io/generative-ai?ref=blog.streamlit.io)中的所有最新工具集成，例如任何LLM、矢量数据库或各种AI框架，如[LangChain](https://blog.streamlit.io/langchain-streamlit/)、[LlamaIndex](https://blog.streamlit.io/build-a-chatbot-with-custom-data-sources-powered-by-llamaindex/)或Weights & Biases。与此同时，它结构化的声明风格也方便 AI 生成。

### **您的首选 UI**

Streamlit 可以更快地将应用程序呈现在用户面前，更快地获得反馈并更快地改进。Streamlit 使您的迭代周期更短。如今，[Streamlit 社区](https://streamlit.io/community?ref=blog.streamlit.io)每月有超过 300 名活跃开发人员，80% 的财富 50 强公司都在使用。无论您是数据团队的一员、经验丰富的数据科学家还是新的 Python 开发人员，Streamlit 的可能性都是无限的。

## 二、简单入门

运行 pip install streamlit 安装

```bash
pip install streamlit

# 或

uv add streamlit
```

### **栗子一、创建简单的应用程序**

只需两行代码，即可创建一个基本的“Hello world”应用程序，方法是创建一个新 Python 文件并向其添加以下代码，我们用上一期学的 uv 来运行 `uv run streamlit run [app.py](http://app.py)` 。

```python
import streamlit as st

st.write("My first Streamlit app 🎈")
```

### 栗子二、绘制数据

在进入任何页面之前，我们需要加载数据。下面的代码只要是使用 Pandas 创建一个从 CSV 文件加载数据的函数。然后我们使用装饰器来加速我们的应用程序。`@st.cache_data` 可以用作数据缓存，它能确保将 Pandas 添加到内存当中，数据能够提前准备好。

而[`st.data_editor`](https://docs.streamlit.io/develop/api-reference/data/st.data_editor?ref=blog.streamlit.io) 在可编辑的表中显示数据，[`st.bar_chart`](https://docs.streamlit.io/develop/api-reference/charts/st.bar_chart?ref=blog.streamlit.io) 以条形图形式显示数据。

在下面的代码中，我们使用数据创建一个条形图，并将 x 轴和 y 轴分别声明为 states 和 population。

```python
import pandas as pd
import streamlit as st

@st.cache_data

def load_data():
  return pd.read_csv("https://github.com/dataprofessor/population-dashboard/raw/master/data/us-population-2010-2019-reshaped.csv", index_col=0)

df = load_data()

st.header("1. Inspect the data 🔍")

st.write("`st.data_editor` allows us to display AND edit data")

st.data_editor(df)

st.header("2. Get started with a simple bar chart 📊")

st.write("Let's chart the US state population data from the year 2019")

st.bar_chart(df[['year', 'states', 'population']],
             x='states',
             y='population')
```

## 三、终极栗子用它写播客

是的，你不需要 [vitepress](https://vitepress.dev/zh/guide/getting-started)，不需要 [docusaurus](https://www.docusaurus.cn/docs)，你就能够用 python 创建一篇博客。

你的页面可以利用 `st.Page` 声明多页应用来配置页面，初始化 StreamlitPage 对象，并将其传递给 `st.navigation` 以在你的应用程序中声明页面。当用户导航到页面时，能够路由到选定的 StreamlitPage 对象。你可以把每个 python 文件当做一个页面，每次进入的时候 rerun 一次它的页面。

```python
import streamlit as st

pages = [
    st.Page(
        "example1.py",
        title="Example 1",
        icon=":material/home:"
    ),
    st.Page(
        "example2.py",
        title="Example 2",
        icon=":material/widgets:"
    ),
    st.Page(
        "post/python1.py",
        title="Post Python Series 1",
        icon=":material/article:"
    ),
    st.Page(
        "post/python2.py",
        title="Post Python Series 2",
        icon=":material/article:"
    )
]

page = st.navigation(pages)
page.run()
```

页面内容可采用 markdown 内容，利用以下方法转换为页面，它本身内置了编译器的能力，我们能够把文本内容转换为 html 页面。

```python
# post/python1.py

import streamlit as st

post = '''
# Markdown 标题

## Markdown 副标题

内容
'''

st.markdown(post)
```

## 总结

streamlit 就了解到那么多够了，剩下的交给 AI，交给 cursor。我们可以利用它生成不错的页面，官网也有不错的栗子。如果你是一个 pro，你还能自定义页面样式，如果你有需要的话，快点试试吧。