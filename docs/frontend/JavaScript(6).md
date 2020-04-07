# JS 基础知识(6)--异步编程

[[toc]]

## 并发与并行

AB两任务，通过切换任务完成，这叫做并发。

AB两任务，同时进行，叫做并行。

## 异步编程发展历史

### 使用回调函数

回调函数是经典的JS异步实现手段。

```js
fs.readFile('xxx', (err, data) => {

});

```

回调函数的最主要问题是在多层回调下会出现回调地狱(Callback hell)。例如：

```js
fs.readFile('1.json', (err, data) => {
    fs.readFile('2.json', (err, data) => {
        fs.readFile('3.json', (err, data) => {
            fs.readFile('4.json', (err, data) => {

            });
        });
    });
});

```

回调地狱的主要问题在于：

- 可读性、可维护性极差
- 每个回调函数自行维护自己的错误处理，使代码更加混乱
- 耦合性太高，牵一发而动全身

### 使用Promise

ES6中新添加的语法，能够很好的解决回调地狱的问题，同时合并了错误处理。

```js
readFilePromise('1.json').then(data => {
    return readFilePromise('2.json')
}).then(data => {
    return readFilePromise('3.json')
}).then(data => {
    return readFilePromise('4.json')
});
```

### 使用Generator + co

利用协程完成 Generator 函数，用 co 库让代码依次执行完，同时以同步的方式书写，也让异步操作按顺序执行。

```js
co(function* () {
  const r1 = yield readFilePromise('1.json');
  const r2 = yield readFilePromise('2.json');
  const r3 = yield readFilePromise('3.json');
  const r4 = yield readFilePromise('4.json');
})
```

### 使用async + await

ES7中新添加的关键字。凡事加上async的函数都默认返回一个Promise对象。async + await可以让异步函数书写起来像同步一样：

```js
const readFileAsync = async function () {
  const f1 = await readFilePromise('1.json')
  const f2 = await readFilePromise('2.json')
  const f3 = await readFilePromise('3.json')
  const f4 = await readFilePromise('4.json')
}
```

## Promise

### 什么是Promise

Promise 简单来说是一个容器，里面保存着某个未来才会结束的事件(通常是异步事件)的结果。从语法上讲，Promise 是一个对象。

Promise对象有两个特点：

1. 对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）、rejected（已失败）。只有异步操作的结果可以决定当前是哪一种状态，其他任何行为都无法改变这个状态。
2. 一旦状态改变，就固定下来，不会二次改变。Promise 对象只有可能从pending 变为fulfilled 和从pending 变为rejected 两种状态变化方式。一旦发生变化，状态就凝固了，不再发生改变，此时称为resolved（已定型）。

为了行文方便，下面文章中的resolved 状态指的都是fulfilled 状态，不包括rejected 状态。

Promise也有一些缺点：

- 无法取消Promise
- 必须设置回调函数来捕捉错误

Promise 主要是为了解决两个问题：

- 回调地狱
- 多个并发的请求

### Promise基础用法

这一部分的详情请见[阮一峰]老师的文章，写的非常详尽，我在这里不再额外赘述，只列出一些重要结论，具体的细节在阮老师的文章中可以更好的学习。

Promise 对象是一个构造函数，用来生成Promise 实例。下面代码创造了一个Promise 实例：

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

Promise 构造函数接受一个函数作为参数，该函数也有两个参数，分别是resolve 和 reject。  
resolve 函数的作用是：将Promise 对象的状态从pending 变为 resolved，在异步操作成功时调用，并将异步操作的结果作为参数传递出去;  
reject 函数的作用是：将Promise 对象的状态从pending 变为rejected，在异步操作失败时调用，并将异步操作报出的错误，作为函数传递出去。

Promise 实例生成以后，可以使用then 方法分别指定resolved 状态和reject 状态的回调函数。then 方法可以接受两个回调函数作为参数。第一个回调函数是Promise 对象变为resolved 时调用，第二个回调函数是Promise 对象变为rejected 时调用。第二个回调函数是可选的，不一定要提供。:

```js
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

下面是一个Promise 对象的例子：

```js
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then((value) => {
  console.log(value);
});
```

上面的代码中，`timeout()`方法返回一个Promise 实例。过了指定的时间（ms参数）之后，Promise 实例的状态变为resolved，触发then 绑定的回调函数。

请注意，**Promise 新建以后会立即执行：**

```js
let promise = new Promise(function(resolve, reject) {
  console.log('Promise');
  resolve();
});

promise.then(function() {
  console.log('resolved');
});

console.log('Hi');

// Promise
// Hi!
// resolved
```

上面代码中，Promise 新建以后立即执行，所以首先输出 `Promise`，随后输出`Hi`,`then`方法中的函数被添加到微任务队列,最后执行，因此最后输出`resolved`。

如果调用resolve 函数和 reject 函数时带有参数，那么他们的参数会被传递给回调函数。reject 函数的参数通常是Error 对象的实例，表示抛出的错误；resolve 函数的参数除了正常的值以外，还可能是另一个Promise 实例。例如：

```js
const p1 = new Promise(function (resolve, reject) {
  // ...
});

const p2 = new Promise(function (resolve, reject) {
  // ...
  resolve(p1);
})
```

上面的代码中，p1 和p2 都是Promise 实例。但是p2 的resolve 方法将p1 作为参数，即一个异步操作的结果是返回另一个异步操作。

这时，p1 的状态就会传递给p2，也就是说，p1 的状态决定了p2 的状态。如果p1 的状态的pending，那么p2 的回调函数会等待p1 的状态改变；如果p1 的状态已经变为resolved 或者 rejected，那么p2 的回调函数将会立刻执行。

```js
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))

// Error: fail
```

上面代码中，p1 是一个 Promise，3 秒之后变为rejected。p2 的状态在 1 秒之后改变，resolve 方法返回的是p1。由于p2 返回的是另一个 Promise，导致p2 自己的状态无效了，由p1 的状态决定p2 的状态。所以，后面的then 语句都变成针对后者（p1）。又过了 2 秒，p1 变为rejected，导致触发catch 方法指定的回调函数。

还需要注意的是，调用resolve 或者reject 并不会终止Promise 的运行：

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});

// 2
// 1
```

上面的代码中，调用了`resolve(1)`之后，后面的`console.log(2)`依然执行。并且由于Promise 相关操作属于微任务，属于同步任务的`console.log(2)`会在前面执行。

一般来说，调用完resolve 或者reject 后Promise的任务就完成了。后续的方法应该放在then 当中，而不应该写在resolve 或者reject 的后面。所以从可读性角度考虑，最好在前面加上return，防止意外：

```js
new Promise((resolve, reject) => {
  return resolve(1);
  // 后面的语句不会执行
  console.log(2);
})
```

### 常用方法

这一部分[阮一峰]老师的文章中已经写的非常的详尽，我在这里不再额外赘述，只列出目录，具体的细节在阮老师的文章中可以更好的学习。

常用方法主要有下面的几种：

- `Promise.prototype.then()`
- `Promise.prototype.catch()`
- `Promise.prototype.finally()`
- `Promise.resolve()`
- `Promise.reject()`
- `Promise.all()`
- `Promise.race()`

最新方法有下面的几种：

- `Promise.allSettled()`
- `Promise.any()`
- `Promise.try()`

在这些方法中:  
`Promise.prototype.xxx()`的方法是Promise 实例所具有的方法；  
`Promise.xxx()`会返回一个新的Promise 实例。

## 参考出处

1. [阮一峰ES6教程-Promise][阮一峰]
2. [掘金yck小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc7198518825171726cfce)
3. [神三元掘金文章-原生JS(下篇)](https://juejin.im/post/5dd8b3a851882572f56b578f#heading-30)
4. [写代码像蔡徐抻的掘金文章-异步编程二三事](https://juejin.im/post/5e3b9ae26fb9a07ca714a5cc)
5. [蔓蔓雒轩的掘金文章-通俗易懂的Promise](https://juejin.im/post/5afe6d3bf265da0b9e654c4b)
6. [艾特老干部的掘金文章-八段代码彻底掌握Promise](https://juejin.im/post/597724c26fb9a06bb75260e8)
7. [lucefer的掘金文章-面试精选之Promise](https://juejin.im/post/5b31a4b7f265da595725f322)
8. [石墨文档的掘金文章-Promise 必知必会](https://juejin.im/post/5a04066351882517c416715d)

[阮一峰]:https://es6.ruanyifeng.com/#docs/promise
