---
title: React渲染的优化方案
date: 2024-07-24T00:13:53.000Z
description: react的渲染机制是非常独特的，有别于 Vue 框架的渲染次数的优化计算。React 很久以来就有PureComponent、shouldUpdate。Function component 又有了memo、useMemo、useCallback 这样的函数工具，让它成为有一定深度的前端框架。
---

## 一、引子

react的渲染机制是非常独特的，有别于 Vue 框架的渲染次数的优化计算。React 很久以来就有PureComponent、shouldUpdate。Function component 又有了memo、useMemo、useCallback 这样的函数工具，让它成为有一定深度的前端框架。

怎么使用 useMemo 和 useCallback 是我们值得思考的点。

## 二、代码范式

首先，假设大家对 React 都有一个基础的入门水平，所以本文不再赘述“useMemo 和 useCallback ”基本用法。《[React 官网](https://react.dev/)》、《[Why React Re-Renders](https://www.joshwcomeau.com/react/why-react-re-renders/)》和《[Understanding useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/)》很好讲解了基本用法。

### 2.1 Memo 缓存组件

引起重渲染的最常见的情况是，组件的 props。**memo**包裹着函数组件，针对props 参数的浅对比。

子组件的渲染有些情况，子组件控制不住，它受到父组件的参数影响。

```jsx
function _Boxes({ boxes }: {
  boxes: {
    flex: number;
    background: string;
  }[]
}) {
  return (
    <div className="boxes-wrapper">
      {boxes.map((boxStyles, index) => (
        <div className="box" style={boxStyles} key={index} />
      ))}
    </div>
  );
}

const Boxes = memo(_Boxes);
```

### 2.2 父组件层面，对象使用 useMemo

作为 Box 的父组件，boxes 的传参是一个对象，每次改变，它会生成一个全新的对象。这里要对 boxes 对象使用缓存(useMemo)。这样，age 的改动将不会影响到 Box 的重渲染。

```jsx
function App() {
  const [age, setAge] = React.useState(0);
  const [boxWidth, setBoxWidth] = React.useState(1);

  const id = React.useId();

  // Age 属性的变更不会影响 boxes 属性变化
  const boxes = useMemo(() => {
    return [
      { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },
      { flex: 3, background: 'hsl(260deg 100% 40%)' },
      { flex: 1, background: 'hsl(50deg 100% 60%)' },
    ];
  }, [boxWidth]);

  return (
    <>
      <Boxes boxes={boxes} />

      <section>
        <button onClick={() => {
          setAge(age + 1)
        }}>
          Increment age
        </button>
        <p>Hello! You are {age}.</p>
      </section>

      <section>
        <label htmlFor={`${id}-box-width`}>
          First box width:
        </label>
        <input
          id={`${id}-box-width`}
          type="range"
          min={1}
          max={5}
          step={0.01}
          value={boxWidth}
          onChange={(event) => {
            setBoxWidth(Number(event.target.value));
          }}
        />
      </section>
    </>
  );
}
```

### 2.3 context provider 最好用 useMemo

同理，参考《[How To useContext With useReducer](https://hswolff.com/blog/how-to-usecontext-with-usereducer/)》，context provider 的 value 参数是一个很容易被遗忘的点，provider 可能会传入一个对象，利用useMemo 或者 useCallback 来保护 App 组件不会做出过多重渲染。

```jsx
const Main = () => {
  const [state, dispatch] = useReducer(reducer, { age: 42 });
  
  // 利用useMemo 或者 useCallback 来保护 Context 不会做出过多重渲染
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  
  return (
    <MyContext.Provider value={contextValue}>
      <App />
    </MyContext.Provider>
  )
}
```

《[useContext + useReducer re-renders](https://www.nielskrijger.com/posts/2021-02-16/use-reducer-and-use-context/)》

### 2.4 其他

还有一种特殊情况是：不规范、分批的 Context 调用导致了页面的重新渲染。针对一些老旧项目，以前的业务逻辑导致 Context 的调用混乱，已经不是前面几种方法能够解决的。

解决方法：改动代码，把多次 Context 调用整合为一次。

## 三、补救防范

### 3.1 断点查看调用堆栈

利用 Chrome 原生调试工具打断点，看每一行代码的堆栈信息。这种方式最为原始但是它往往“行之有效”。

### 3.2 devtool 查看渲染次数和渲染堆栈

React Devtool 的 Profiler 能协助我们排查 React 渲染次数和渲染堆栈。

1. 点击 Profiler 的记录圆圈
2. 刷新页面或者做其他操作
3. 停止记录
4. 参考快照记录
    
![Google Chrome React DevTool Profiler](https://brandonxiang.top/img/debug-profiler.gif)
    

同时，我们还能够通过“highlight updates when components render”来可视化整个渲染过程。

![Rendering Visualization](https://brandonxiang.top/img/react-render-visualize.gif)

### 3.3 渲染打印工具

**ahooks的useWhyDidYouUpdate**

该函数能够帮助开发者排查是哪个属性改变导致了组件的 rerender，但是更多集中在 props、state，开发者需要主动去缩小范围，它起到辅助打印的工作，如果是 Context 或者更外侧的数据变动，效果不见得达到效果。

**Welldone Software 的 [why-did-you-render](https://github.com/welldone-software/why-did-you-render)**

该工具能全局打印 rerender 日志，但是在复杂项目当中，它的打印较为混乱，不一定能够很好的发现问题。

## 四、总结

React 的渲染优化有非常多篇博客已经聊过，但是还是“No Silver Bullet”，没有最佳方案。特别在一些数据流非常复杂的前端工程项目当中。

React 的前端项目能够划分为：聪明组件和懒惰组件。聪明组件负责的内容是页面逻辑的数据流向，懒惰组件负责的是样式的渲染，数据流越是清晰，代码可维护性越强。

以下是我个人的代码编写建议：

1. 不要把所有数据都往 Context 里面放，只有极其核心，多个页面都复用情况。
2. 简单的页面，尽量以聪明组件和懒惰组件的方式来处理。
3. 如果已经出现数据流混乱的情况下，合理使用 memo，或者状态管理工具（例如zustand、jotai等）让代码数据流尽量走向清晰，初始化主路径尽量批量渲染好。

虽然有很多分析工具，但是它们更多是辅助，最重要还是要通过人工分析。重点要分析出渲染次数过多的代码，做出针对性地处理。