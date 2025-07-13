---
title: Fast-MCP Python 入门指南
date: '2025-07-14T14:00:00.000Z'
description: 快速入门 Fast-MCP Python 框架
---

# Fast-MCP Python 入门指南

Created: 2025年2月14日 14:00
Tags: AI, Python, MCP, Fast-MCP

![Fast-MCP](https://brandonxiang.top/img/fast-mcp.png)

在 AI 时代，模型上下文协议（Model Context Protocol, MCP）成为了连接 AI 模型与外部工具和资源的重要标准。**Fast-MCP** 是一个专为 Python 开发者设计的轻量级、高性能的 MCP 框架，它简化了 MCP 服务器的开发过程，让开发者能够快速构建和部署自己的 MCP 服务。

本文将从 Python 开发者的视角，详细介绍 Fast-MCP 的使用方法，包括基础概念、快速上手、核心功能、实际应用场景以及最佳实践，帮助你在 AI 时代更好地构建智能应用。

## 一、Fast-MCP 简介

Fast-MCP 是一个基于 Python 的 MCP 框架，它提供了简洁的 API 来创建 MCP 服务器。MCP（Model Context Protocol）是一个开放标准，定义了 AI 模型如何与外部工具、数据源和系统进行交互的协议。

### **核心优势：**
- **简单易用**：提供直观的装饰器语法，让开发者快速定义工具和资源
- **高性能**：基于 FastAPI 构建，支持异步操作和高并发
- **类型安全**：完整的 TypeScript 类型支持
- **灵活扩展**：支持自定义工具、资源和数据源
- **标准兼容**：完全符合 MCP 协议规范

## 二、快速开始

### **安装和基础使用**

```bash
pip install fast-mcp
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

## 六、与 AI 模型集成

### **使用 Cursor**

[Cursor](https://cursor.sh/) 是一个基于 AI 的代码编辑器，它支持 MCP 协议，可以与你的 Fast-MCP 服务器完美集成。Cursor 提供了强大的 AI 编程助手功能，结合 Fast-MCP 的自定义工具，可以显著提升开发效率。

#### **配置步骤：**

1. **安装 Cursor**
   - 访问 [cursor.sh](https://cursor.sh/) 下载并安装 Cursor
   - 启动 Cursor 并登录你的账户

2. **配置 MCP 服务器**
   - 在 Cursor 中打开设置（Settings）
   - 找到 "Model Context Protocol" 或 "MCP" 设置项
   - 添加你的 Fast-MCP 服务器配置：
     ```json
     {
       "name": "my-fast-mcp-server",
       "command": "python",
       "args": ["/path/to/your/server.py"],
       "env": {}
     }
     ```

3. **验证连接**
   - 重启 Cursor
   - 在聊天界面中测试你的工具，例如：
     ```
     请帮我计算 15 * 23 的结果
     ```

#### **实际使用场景：**

**代码分析和重构：**
```python
@server.tool()
def analyze_project_structure(project_path: str) -> str:
    """分析项目结构并提供重构建议"""
    # 分析代码结构
    # 识别重复代码
    # 提供重构建议
    return analysis_result
```

**自动化测试生成：**
```python
@server.tool()
def generate_tests(file_path: str) -> str:
    """为 Python 文件生成单元测试"""
    # 分析函数和类
    # 生成测试用例
    # 返回测试代码
    return test_code
```

**依赖管理：**
```python
@server.tool()
def analyze_dependencies(requirements_file: str) -> str:
    """分析项目依赖并提供更新建议"""
    # 检查依赖版本
    # 识别安全漏洞
    # 提供更新建议
    return dependency_analysis
```

#### **Cursor 集成优势：**

- **智能代码补全**：Cursor 的 AI 助手可以利用你的自定义工具提供更准确的代码建议
- **上下文感知**：AI 助手能够理解你的项目结构和代码风格
- **自动化工作流**：结合 Fast-MCP 工具，可以实现代码生成、重构、测试等自动化操作
- **实时反馈**：在编写代码时获得实时的 AI 建议和工具调用结果

### **使用其他 MCP 客户端**

Fast-MCP 服务器可以与任何符合 MCP 协议的客户端集成，包括：
- Cursor
- 自定义 MCP 客户端
- 其他支持 MCP 的 AI 工具

## 七、最佳实践

### **7.1 工具设计原则**

- **单一职责**：每个工具只做一件事
- **清晰命名**：使用描述性的函数名
- **完善文档**：为每个工具提供详细的文档字符串
- **错误处理**：妥善处理异常情况

### **7.2 性能优化**

```python
from functools import lru_cache

@lru_cache(maxsize=128)
@server.tool()
def expensive_calculation(input_data: str) -> str:
    """昂贵的计算操作"""
    return result
```

### **7.3 安全性考虑**

```python
import re

@server.tool()
def safe_eval(expression: str) -> str:
    """安全的表达式求值"""
    if not re.match(r'^[\d\s\+\-\*\/\(\)\.]+$', expression):
        raise MCPError("表达式包含不安全字符")
    
    try:
        result = eval(expression)
        return f"结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"
```

## 八、调试和测试

### **8.1 日志记录**

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@server.tool()
def debug_tool(param: str) -> str:
    """调试工具"""
    logger.info(f"调用工具，参数: {param}")
    result = f"处理结果: {param.upper()}"
    logger.info(f"返回结果: {result}")
    return result
```

### **8.2 单元测试**

```python
import pytest
from fast_mcp import Server

def test_calculator_tool():
    server = Server("test-server")
    
    @server.tool()
    def calculator(expression: str) -> str:
        return str(eval(expression))
    
    assert calculator("2 + 2") == "4"
    assert calculator("10 * 5") == "50"
```

## 九、部署和扩展

### **9.1 Docker 部署**

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "my_server.py"]
```

### **9.2 生产环境配置**

```python
import uvicorn
from fast_mcp import Server

if __name__ == "__main__":
    server = Server("production-server")
    
    uvicorn.run(
        server.app,
        host="0.0.0.0",
        port=8000,
        workers=4,
        log_level="info"
    )
```

## 十、总结

通过本文的介绍，我们深入了解了 Fast-MCP Python 框架的各个方面：

- **基础概念**：了解了 MCP 协议和 Fast-MCP 的核心优势
- **快速上手**：掌握了安装、配置和创建第一个 MCP 服务器的方法
- **核心功能**：学习了工具、资源和数据源的定义和使用
- **高级特性**：掌握了异步操作、错误处理和配置管理
- **实际应用**：通过代码分析、数据库操作等实例了解了实际应用场景
- **AI 集成**：详细介绍了与 Cursor 的集成方法，展示了如何提升开发效率
- **最佳实践**：学习了工具设计、性能优化和安全性考虑
- **调试部署**：掌握了日志记录、单元测试和生产环境部署

Fast-MCP 让 AI 模型能够无缝地访问你的自定义工具和数据，为构建智能应用提供了强大的基础。结合 Cursor 这样的现代 AI 编辑器，你可以创建更智能、更高效的开发环境。

在 AI 时代，掌握 Fast-MCP 这样的工具框架，能够让你更好地构建智能应用，提升开发效率。开始使用 Fast-MCP，让你的 AI 应用更加强大和智能！ 