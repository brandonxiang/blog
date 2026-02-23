---
title: AI 时代如何重新学习Python:fast-mcp
date: '2026-02-22T14:00:00.000Z'
description: 本文是 Fast-MCP 最基础入门文，简单介绍其作为 Python 轻量 MCP 框架的优势，讲解安装、简单服务器搭建、三种通信方式及核心工具，助力新手快速上手。
---

![Fast-MCP](https://brandonxiang.top/img/fast-mcp-github.png)

![Fast-MCP](https://brandonxiang.top/img/fast-mcp.png)

## 一、引子

在 AI 时代，模型上下文协议（Model Context Protocol, MCP）成为了连接 AI 模型与外部工具和资源的重要标准。**Fast-MCP** 是一个专为 Python 开发者设计的轻量级、高性能的 MCP 框架，它简化了 MCP 服务器的开发过程，让开发者能够快速构建和部署自己的 MCP 服务。

### FastMCP 与官方 SDK 的关系

相比官方 SDK，FastMCP的 API 设计更加简洁、开发效率更高，它是用于处理模型上下文协议的标准框架。

这是FastMCP 2.0，这是一个积极维护的版本，为处理MCP生态系统提供了一个完整的工具包，具有一套全面的功能，远超核心MCP规范，所有这些都在为提供通往生产的最简单路径服务。这包括部署、认证、客户端、服务器代理和组合、从REST API生成服务器、动态工具重写、内置测试工具、集成等。


## 二、快速开始

### **安装和基础使用**

```bash
uv pip install fast-mcp
```

创建一个简单的 MCP 服务器：

```python
from fast_mcp import Server

server = Server("my-mcp-server")

@server.tool()
def calculator(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"

if __name__ == "__main__":
    server.run()
```

## MCP 三种通信方式简介

Fast-MCP 支持三种主流的通信方式，满足不同开发和部署场景的需求：

### 1. stdio（标准输入输出）
- **原理**：通过进程的标准输入（stdin）和标准输出（stdout）进行数据交换。
- **优点**：实现简单，适合本地开发、调试和嵌入式场景。
- **缺点**：不适合分布式或远程调用，扩展性有限。
- **典型场景**：本地 CLI 工具、插件式集成、AI 编辑器本地调用。

### 2. SSE（Server-Sent Events）
- **原理**：基于 HTTP 协议的单向流式通信，服务器可以持续向客户端推送事件。
- **优点**：支持实时流式输出，适合需要持续反馈的 AI 推理场景。
- **缺点**：仅支持单向通信，客户端无法主动推送数据到服务器。
- **典型场景**：AI 聊天、流式推理、实时日志推送。

### 3. Streamable HTTP
- **原理**：通过 HTTP 协议实现双向流式通信，支持请求和响应的数据流传输。
- **优点**：兼容性好，易于与 Web 服务、云平台集成，支持大规模分布式部署。
- **缺点**：实现相对复杂，对服务端和客户端的流式处理能力有一定要求。
- **典型场景**：Web API、云端 AI 服务、跨平台集成。

## 三、核心概念

### **3.1 工具（Tools）**
工具是 MCP 服务器的核心组件，它们定义了 AI 模型可以调用的功能：

```python
@server.tool()
def my_tool(param1: str, param2: int) -> str:
    """工具描述"""
    return "结果"
```

### **3.2 资源（Resources）**
资源允许 AI 模型访问外部数据源：

```python
@server.resource("file://{path}")
def file_resource(path: str) -> str:
    """读取文件资源"""
    with open(path, 'r') as f:
        return f.read()
```

### **3.3 数据源（Data Sources）**
数据源提供了更复杂的数据访问能力：

```python
@server.data_source("database")
def database_source(query: str) -> list:
    """数据库查询"""
    return results
```

## 四、高级功能

### **4.1 异步支持**

Fast-MCP 完全支持异步操作：

```python
@server.tool()
async def async_weather_api(city: str) -> str:
    """异步获取天气信息"""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q={city}") as response:
            data = await response.json()
            return f"{city}: {data['current']['temp_c']}°C"
```

### **4.2 错误处理**

```python
from fast_mcp import MCPError

@server.tool()
def safe_division(a: float, b: float) -> str:
    """安全的除法运算"""
    if b == 0:
        raise MCPError("除数不能为零")
    return f"结果: {a / b}"
```

### **4.3 配置管理**

```python
from fast_mcp import ServerConfig

config = ServerConfig(
    name="my-server",
    version="1.0.0",
    description="我的 MCP 服务器"
)

server = Server(config=config)
```

## 五、实际应用场景

### **5.1 代码分析工具**

```python
import ast

@server.tool()
def analyze_python_code(file_path: str) -> str:
    """分析 Python 代码结构"""
    try:
        with open(file_path, 'r') as f:
            code = f.read()
        
        tree = ast.parse(code)
        functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
        
        return f"""
文件: {file_path}
函数数量: {len(functions)}
类数量: {len(classes)}
函数列表: {', '.join(functions)}
类列表: {', '.join(classes)}
        """
    except Exception as e:
        return f"分析错误: {str(e)}"
```

### **5.2 数据库操作工具**

```python
import sqlite3

@server.tool()
def query_database(db_path: str, sql: str) -> str:
    """执行 SQL 查询"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(sql)
        results = cursor.fetchall()
        conn.close()
        
        return f"查询结果: {results}"
    except Exception as e:
        return f"查询错误: {str(e)}"
```

### **5.3 文件系统工具**

```python
import os
import json

@server.tool()
def list_directory(path: str) -> str:
    """列出目录内容"""
    try:
        items = os.listdir(path)
        files = [item for item in items if os.path.isfile(os.path.join(path, item))]
        dirs = [item for item in items if os.path.isdir(os.path.join(path, item))]
        
        return f"""
目录: {path}
文件: {files}
文件夹: {dirs}
        """
    except Exception as e:
        return f"列出目录错误: {str(e)}"

@server.tool()
def create_json_file(file_path: str, data: str) -> str:
    """创建 JSON 文件"""
    try:
        parsed_data = json.loads(data)
        with open(file_path, 'w') as f:
            json.dump(parsed_data, f, indent=2)
        return f"成功创建文件: {file_path}"
    except Exception as e:
        return f"创建文件错误: {str(e)}"
```


## 六、总结

咱们只要掌握这几点，就算入门啦：
- 知道它是个简化MCP服务器开发的Python框架，比官方SDK好上手

- 会安装、能写出简单的MCP服务器，且定义基础工具

- 了解三种通信方式和核心的工具。



它的核心就是帮咱们快速搭建AI能调用的服务，新手不用慌，跟着基础步骤练，很快就能上手～
