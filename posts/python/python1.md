---
title: AI 时代如何重新学习 Python
date: '2025-02-14T15:57:00.000Z'
description: 本文主要介绍了前端工程化的相关内容，包括前端开发流程的标准化、自动化和模块化。通过工程化手段，可以提升前端项目的开发效率、代码质量和可维护性。常见的前端工程化实践包括使用构建工具（如 Webpack、Vite）、模块化开发、自动化测试、持续集成与部署等。这些方法帮助团队更高效地协作，降低出错率，加快产品迭代速度。
---


![OIP.jpeg](https://brandonxiang.top/img/OIP.jpeg)

大前端人都在学 rust，我却学习 python。因为 AI 时代，Python 成为了很多工具的首选语言，它能够帮助大家快速的建立 AI 应用，“人生苦短，我用 Python”，这一句话的含金量在 AI 时代再一次焕发生命。所以为何我们不从前端 JavaScript 的视角，来重新学习一下 Python？

## 一、包管理

提到 Python 的包管理，大家都会想到 pip。但是它已经跟不上时代的变迁。 [uv](https://github.com/astral-sh/uv) 是更高效的包管理工具，并具备项目管理的功能，是利用 rust 所写的。它可以用于替代`pip`, `pip-tools`, `pipx`, `poetry`, `pyenv`, `twine`, `virtualenv`。

现已成为关键一环，很多 ai 工具都优先使用它进行管理，所以它成为了 Python 必要开发工具，有了它，Python重新找回新的活力。基本使用非常简单，有些类似 npm，如下：

```bash
# 初始化项目
$ uv init example
Initialized project `example` at `/home/user/example`

$ cd example

# 添加依赖
$ uv add ruff
Creating virtual environment at: .venv
Resolved 2 packages in 170ms
   Built example @ file:///home/user/example
Prepared 2 packages in 627ms
Installed 2 packages in 1ms
 + example==0.1.0 (from file:///home/user/example)
 + ruff==0.5.0

# 执行命令
$ uv run ruff check
All checks passed!

$ uv lock
Resolved 2 packages in 0.33ms

# 同步安装依赖
$ uv sync
Resolved 2 packages in 0.70ms
Audited 1 package in 0.02ms
```

它还可以用作项目管理，Python 虚拟环境等控制，等同于 nodejs 里面的 [nvm](https://github.com/nvm-sh/nvm)。例如管理全局的 Python 版本，你肯定拥有多个 Python。例如在项目中指定使用 3.11 python 版本。

```bash
# 参考所有Python 版本
uv python list

# 安装Python 3.12
uv python install 3.12

# 固定版本到当前项目
uv python pin 3.12

# 设置Python环境
uv venv --python 3.11

# 激活虚拟环境
source .venv/bin/activate

#虚拟环境中全局安装
uv pip install browser-use
```

## 二、类型定义

作为一门动态类型语言，Python 的灵活性备受开发者喜爱。然而，这种灵活性也带来了一定的风险，特别是在大型项目中，类型错误很难在开发阶段被发现，容易导致运行时异常。为了对抗这个问题，Python 3.5 引入了类型提示（Type Hints），并逐渐发展出强大的类型定义系统。本文将深入探讨 Python 类型定义，探讨其核心概念、实际应用以及未来发展趋势。

### **2.1 为什么需要类型定义？**

在深入了解类型定义之前，我们需要明确其带来的价值：

- **提高代码可读性:** 类型提示可以清晰地表达变量、函数参数和返回值的预期类型，更容易理解代码意图。
- **静态分析:** 类型提示允许使用静态类型检查工具（如 `mypy`、`pyright`）在不运行代码的情况下发现潜在的类型错误，降低 bug 的风险。
- **代码自动补全和重构:** 集成开发环境 (IDE) 可以利用类型信息提供更准确的代码自动补全和更安全的重构功能。
- **提升代码可维护性:** 清晰的类型信息有助于团队协作，更容易理解和修改代码。

### **2.2 Python 类型提示的基础**

Python 类型提示使用冒号 `:` 标注变量类型，使用 `->` 标注函数返回值类型。

```python
# 变量类型提示
name: str = "Alice"
age: int = 30
is_active: bool = True
data: list[int] = [1, 2, 3]  # Python 3.9+ 支持 list[int]
data_old: List[int] = [1, 2, 3] # Python 3.5 - 3.8 使用 typing 模块

# 函数类型提示
def greet(name: str) -> str:
    return f"Hello, {name}!"
def process_data(data: list[int]) -> int:
    return sum(data)
```

### **2.3 typing 模块：类型提示的基础设施**

Python 3.5 引入了 `typing` 模块，用于为动态类型语言提供静态类型检查的支持。`typing` 模块定义了一系列类型提示工具：

- **`List`, `Tuple`, `Dict`, `Set`:** 用于指定集合类型的元素类型。例如 `List[str]` 表示字符串列表。 注意：Python 3.9 之后，可以直接使用 `list[str]` 等内置类型。
- **`Optional[T]`:** 表示一个变量可能为 `T` 类型，也可能为 `None`。相当于 `Union[T, None]`。
- **`Union[T1, T2, ...]`:** 表示一个变量可以是多种类型之一。
- **`Any`:** 表示任何类型，禁用类型检查。应尽量避免使用，因为它失去了类型检查的好处。
- **`TypeVar`:** 用于定义泛型类型变量。
- **`Callable[[Arg1, Arg2], ReturnType]`:** 用于表示可调用类型，例如函数。

## 三、语法检查

`ruff` 是一个高性能的 Python 代码检查器，旨在替代 `flake8`, `pylint` 以及其他类似的工具，它和 uv 是同一个团队开发的工具。它速度极快，配置简单，并且提供了广泛的代码质量和风格检查。 它的核心是用 Rust 编写的，它比 `flake8` 快 10-100 倍，比 `pylint` 快 20-30 倍！这意味着更快的反馈循环和更高效的开发体验，具有以下特点：

- **易用性:** 配置非常简单，通常只需要运行一个命令即可开始使用。预设规则覆盖了广泛的常见问题。
- **可靠性:** `ruff` 旨在提供准确的诊断，减少误报和漏报。
- **统一化:** `ruff` 可以替代多个工具，简化了开发流程。

配置主要通过 `ruff.toml` 文件进行。  可以将该文件放在项目根目录或用户主目录，**检查整个项目:**

```bash
ruff check .
```

`ruff` 会输出发现的所有问题，包括错误类型、文件名和行号

## 四、协程

### **4.1 定义与执行协程**

```python
import asyncio

async def main():    
  print("Start")    
  await asyncio.sleep(1)# 非阻塞等待    
  print("End")
  asyncio.run(main())# 运行主协程

```

### **4.2 并发执行任务**

使用 `asyncio.gather()` 或 `create_task()` 实现并发：

```python
async def task_one():    
  await asyncio.sleep(2)    
  return "Task 1 Done"
  
async def task_two():    
  await asyncio.sleep(1)    
  return "Task 2 Done"
  
async def main():    
# 并发执行并获取结果    
  results = await asyncio.gather(task_one(), task_two())    
  print(results)# ['Task 1 Done', 'Task 2 Done']
  asyncio.run(main())
```

### **4.3 错误处理**

```python
async def risky_task():    
  raise ValueError("Oops!")
 
async def main():    
  try:        
    await risky_task()    
    except ValueError as e:        
    print(f"Caught error: {e}")
```

## 五、总结

通过前面的内容，我们从 JavaScript 开发者的视角重新认识了 Python 在 AI 时代的重要性和新特性：

- **包管理现代化：**使用 uv 作为包管理工具，提供了类似 npm 的使用体验，极大提升了开发效率。
- **类型系统完善：**Python 的类型提示系统不断进化，为大型项目提供了更好的代码可维护性和开发体验，类似 typescript。
- **高效代码检查：**ruff 工具带来了超快的代码检查能力，统一了多个工具的功能。
- **异步编程支持：**通过协程实现高效的异步编程，满足现代应用开发需求。

这些特性使 Python 在 AI 时代焕发新生，成为开发者构建 AI 应用的得力助手。对于前端开发者来说，了解这些特性可以更好地在 AI 项目中应用 Python。