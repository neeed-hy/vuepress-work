# JS 基础--Event Loop

[[toc]]

## 浏览器篇

### 事件执行机制

JavaScript 是一门**单线程**语言。因此 JS 任务是一个一个顺序执行的。一个任务耗时过长，排在他后面的任务也必须等待。

单线程的语言存在一些执行性能上的问题。例如，网页上有高清图片，那么在高清图片下载完之前网页不会显示。为了解决这个问题，JS 将执行任务从大类上分成两大类：

- 同步任务
- 异步任务

整个页面的渲染过程，比如 dom 树、css 树和渲染树的生成就是同步任务，而 ajax 技术就是典型的异步任务。关于这部分有严格的定义，不再赘述。

明确了两种任务概念，直接使用图片说明 JS 的事件执行机制：

![同步、异步任务](https://user-gold-cdn.xitu.io/2017/11/21/15fdd88994142347?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

图片解释：

- 同步任务和异步任务分别进入不同的执行"场所"，同步的进入主线程，异步的进入 Event Table 并注册回调函数;
- 当异步函数执行完成，Event Table 将回调函数移入 Event Queue;
- 当主线程内的任务执行完毕为空时，去 Event Queue 读取对应的函数，进入主线程执行;顾名思义，Event Queue 是一个队列;
- 以上过程不断重复，也就是传说中的**Event Loop 事件循环**(简化版)。

JS 引擎存在 monitoring process 进程，会持续不断的检查主线程执行栈是否为空，一旦为空，就会去 Event Queue 那里检查是否有等待被调用的函数。

下面是一段 ajax 样例代码：

```js
let data = [];
$.ajax({
  url: www.javascript.com,
  data: data,
  success: () => {
    console.log("发送成功!");
  },
});
console.log("代码执行结束");

//  代码执行结束
//  发送成功!
```

代码解释：

- ajax 进入 Event Table，注册回调函数`success`;
- 执行同步代码`console.log('代码执行结束')`;
- 异步函数 ajax 执行结束，其回调函数`success`进入 Event Queue;
- 主线程为空，从 Event Queue 读取回调函数`success`执行。

### setTimeout

著名的`setTimeout()`函数是异步函数，起到延迟执行的效果：

```js
setTimeout(() => {
  console.log("执行setTimeout"); //  再执行异步函数
}, 3000);
console.log("执行console"); //  先执行同步函数

// 执行console
// 执行setTimeout
```

上面的代码表面上看是指 3000ms 之后执行`console.log('执行setTimeout');`,但实际上这样的理解有误。请看下面的伪代码：

```js
setTimeout(() => {
  task();
}, 3000);

sleep(10000000); //  伪代码，js没有sleep()
```

上面的函数中，`task()`是不会在 3000ms 之后被执行的，而是必须等到`sleep()`函数执行完才能执行。原因是：

- 遇到异步函数`setTimeout()`，进入 Event Table,注册回调函数 task();
- 执行`sleep(10000000)`;
- 3000ms 之后，`setTimeout()`执行完毕，`task()`进入 Event Queue;此时主线程仍在执行`sleep(10000000)`，并不为空，因此不直接执行`task()`;
- `sleep(10000000)`执行完成后，主线程从 Event Queue 中获取`task()`并执行。

因此，`setTimeout()`的真正意义是**在经过指定时间后，将回调函数添加到 Event Queue 当中**。

因此，`setTimeout(fn,0)`的含义也不是立即执行`fn`，而是立即将`fn`添加到 Event Queue 当中，在主线程最早得到空闲的时候执行`fn`。请见下面的代码：

```js
console.log("先执行这里");
setTimeout(() => {
  console.log("执行第一个setTimeout");
}, 3000);
console.log("再执行这里");
setTimeout(() => {
  console.log("执行第二个setTimeout");
}, 0);

//  先执行这里
//  再执行这里
//  执行第二个setTimeout
//  3秒后
//  执行第一个setTimeout
```

### setInterval

`setInterval`和`setTimeout`基本一致，只不过后者是一次性的，前者是循环的。

`setInterval(fn,time)`真正的意义也不是每 time 时间后执行一次`fn`，而是每 time 时间后将`fn`添加到 Event Queue 中。

值得说明的是，如果`fn`的执行时间大于 time，那么`setInterval`便完全看不出时间间隔了，因为这种情况下 Event Queue 一直不会变空。

### 宏任务与微任务

在上面我们将 JS 的任务分成了同步任务和异步任务。实际上，异步任务还可以继续进行分类：

- 宏任务(macro-task)：包括整体代码`script`; `setTimeout`; `setInterval`; `setImmediate`; I/O; UI rendering
- 微任务(micro-task):`Promise`;`MutationObserver`;`process.nextTick`(node.js 独有);

两种类型的任务各自维护一个 Event Queue ,每种类型的任务只会进入对应的 Event Queue 中。

进入整体代码(`script`是宏任务)后，开始第一次 Event Loop。执行完毕后，接着执行所有的微任务。微任务执行完毕后，再次执行一个宏任务，宏任务执行完后再次执行所有的微任务；依此循环。请看下面的代码：

```js
console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

Promise.resolve()
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });

console.log(5);

//  结果：1 5 3 4 2
```

代码解释：

- 这段代码作为宏任务，进入主线程
- 第一轮宏任务执行：
  - 执行第一个`console.log(1)`;
  - `setTimeout()`进入 Event Table,并直接将它的回调函数注册进宏任务的 Event Queue;
  - 遇到 Promise，将两个`then`函数注册到微任务的 Event Queue;
  - 执行最后一个`console.log(5)`;
  - 宏任务执行完毕，检查微任务队列，发现有两个`then()`函数在里面，执行，即执行`console.log(3)`与`console.log(4)`;
- 第一轮宏任务执行完毕，检查宏任务队列，发现仍有宏任务，执行第二轮循环;
- 执行`setTimeout()`的回调函数，也就是`console.log(2)`;
- 宏任务队列空，结束

事件循环，宏任务，微任务的关系如图所示：

![事件循环，宏任务，微任务的关系1](https://user-gold-cdn.xitu.io/2017/11/21/15fdcea13361a1ec?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### Event Loop

在明确了宏任务、微任务的概念后，便可以给出真正的 Event Loop 过程：

1. 整段代码作为第一个**宏任务**执行;
2. 同步代码直接执行，**宏任务**进入**宏任务队列**，**微任务**进入**微任务队列**;
3. 第一个宏任务执行完毕，检查微任务队列，如果有则依次执行，知道微任务队列为空;
4. 执行 UI 渲染工作;
5. 检查是否有 Web Worker 工作，有则执行;
6. 从宏任务队列中拉取宏任务执行，回到 2，依此循环，直到宏任务队列、微任务队列全部为空。

如图所示：

![Event Loop](https://user-gold-cdn.xitu.io/2018/1/19/1610c344b595114b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 代码分析

以上概念较为生涩。最好的学习方法便是辅以代码作为习题，加深理解。

```js
console.log("1");

setTimeout(function () {
  console.log("2");
  process.nextTick(function () {
    console.log("3");
  });
  new Promise(function (resolve) {
    console.log("4");
    resolve();
  }).then(function () {
    console.log("5");
  });
});
process.nextTick(function () {
  console.log("6");
});
new Promise(function (resolve) {
  console.log("7");
  resolve();
}).then(function () {
  console.log("8");
});

setTimeout(function () {
  console.log("9");
  process.nextTick(function () {
    console.log("10");
  });
  new Promise(function (resolve) {
    console.log("11");
    resolve();
  }).then(function () {
    console.log("12");
  });
});

//  1 7 6 8 2 4 3 5 9 11 10 12
```

代码解析：

- 整体代码作为第一个宏任务执行：

  - 执行同步代码`console.log('1');`
  - 遇到第一个`setTimeout()`，将它的回调函数添加到宏任务队列 Event Queue 中;
  - 遇到`process.nextTick()`，将它的回调函数添加到微任务队列 Event Queue 中;
  - 遇到`Promise`，`new Promise` 中的`console.log('7')`直接执行，将`then`添加到微任务队列中;
  - 遇到第二个`setTimeout()`，将它的回调函数添加到宏任务队列 Event Queue 中;
  - 此时已经输出了 1 和 7，任务队列状态如下所示：

  | 宏任务队列  | 微任务队列 |
  | ----------- | ---------- |
  | setTimeout1 | process1   |
  | setTimeout2 | then1      |

  - 依次执行微任务队列，输出 6,8;

- 第一个宏任务结束，从宏任务队列中取出 setTimeout1 执行：

  - 执行同步代码`console.log('2');`
  - 遇到`process.nextTick()`，将它的回调函数添加到微任务队列 Event Queue 中;
  - 遇到`Promise`，`new Promise` 中的`console.log('4')`直接执行，将`then`添加到微任务队列中;
  - 此时已经数出了 2、4，任务队列状态如下所示：

  | 宏任务队列  | 微任务队列 |
  | ----------- | ---------- |
  | setTimeout2 | process2   |
  |             | then2      |

  - 依次执行微任务队列，输出 3,5;

- 第二个宏任务结束，从宏任务队列中取出 setTimeout2 执行：

  - 执行同步代码`console.log('9');`
  - 遇到`process.nextTick()`，将它的回调函数添加到微任务队列 Event Queue 中;
  - 遇到`Promise`，`new Promise` 中的`console.log('11')`直接执行，将`then`添加到微任务队列中;
  - 此时已经数出了 9、11，任务队列状态如下所示：

  | 宏任务队列 | 微任务队列 |
  | ---------- | ---------- |
  |            | process3   |
  |            | then3      |

  - 依次执行微任务队列，输出 10,12;

- 最终输出 1，7，6，8，2，4，3，5，9，11，10，12

### async/await

async/await 实际上是 Promise 的语法糖，因此在遇到的时候，把它转化成 Promise 来处理。下面这段代码是 async/await 的经典形式：

```js
async function foo() {
  //  await 之前的代码
  await bar();
  //  await 之后的代码
}

async function bar() {
  //  do something
}

foo();
```

其中，**await 前面的代码是同步的**，`await bar()`这句话可以转换成`Promise.resolve(bar())`**;await 之后的之后的代码会被放到`Promise.then()`方法中去**。因此，上面的代码会转换成如下形式：

```js
function foo() {
  //  await 之前的代码
  Promise.resolve(bar()).then(() => {
    //  await 之后的代码
  });
}

function bar() {
  //  do something
}

foo();
```

更具体的题目可以参见[这里](../interview/Event%20Loop.md)的题 1。

## node.js 篇

## 参考出处

1. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5be04a8e6fb9a04a072fd2cd)
2. [神三元-原生 JS(下篇)](https://juejin.im/post/5dd8b3a851882572f56b578f#heading-0)
3. [ssssyoki-彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)
4. [蚂蚁金服-Event Loop 的规范和实现](https://juejin.im/post/5a6155126fb9a01cb64edb45)
5. [YanceyOfficial-最后一次搞懂 Event Loop](https://juejin.im/post/5cbc0a9cf265da03b11f3505)
