# JS 基础--异步编程基础

[[toc]]

## 异步编程发展历史

### 使用回调函数

回调函数是经典的 JS 异步实现手段。

```js
fs.readFile("xxx", (err, data) => {});
```

回调函数的最主要问题是在多层回调下会出现回调地狱(Callback hell)。例如：

```js
fs.readFile("1.json", (err, data) => {
  fs.readFile("2.json", (err, data) => {
    fs.readFile("3.json", (err, data) => {
      fs.readFile("4.json", (err, data) => {});
    });
  });
});
```

回调地狱的主要问题在于：

- 可读性、可维护性极差
- 每个回调函数自行维护自己的错误处理，使代码更加混乱
- 耦合性太高，牵一发而动全身

### 使用 Promise

ES6 中新添加的语法，能够很好的解决回调地狱的问题，同时合并了错误处理。

```js
readFilePromise("1.json")
  .then((data) => {
    return readFilePromise("2.json");
  })
  .then((data) => {
    return readFilePromise("3.json");
  })
  .then((data) => {
    return readFilePromise("4.json");
  });
```

### 使用 Generator + co

利用协程完成 Generator 函数，用 co 库让代码依次执行完，同时以同步的方式书写，也让异步操作按顺序执行。

```js
co(function* () {
  const r1 = yield readFilePromise("1.json");
  const r2 = yield readFilePromise("2.json");
  const r3 = yield readFilePromise("3.json");
  const r4 = yield readFilePromise("4.json");
});
```

### 使用 async + await

ES7 中新添加的关键字。凡事加上 async 的函数都默认返回一个 Promise 对象。async + await 可以让异步函数书写起来像同步一样：

```js
const readFileAsync = async function () {
  const f1 = await readFilePromise("1.json");
  const f2 = await readFilePromise("2.json");
  const f3 = await readFilePromise("3.json");
  const f4 = await readFilePromise("4.json");
};
```

## Promise

### 什么是 Promise

Promise 简单来说是一个容器，里面保存着某个未来才会结束的事件(通常是异步事件)的结果。从语法上讲，Promise 是一个对象。

Promise 对象有两个特点：

1. 对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）、rejected（已失败）。只有异步操作的结果可以决定当前是哪一种状态，其他任何行为都无法改变这个状态。
2. 一旦状态改变，就固定下来，不会二次改变。Promise 对象只有可能从 pending 变为 fulfilled 和从 pending 变为 rejected 两种状态变化方式。一旦发生变化，状态就凝固了，不再发生改变，此时称为 resolved（已定型）。

为了行文方便，下面文章中的 resolved 状态指的都是 fulfilled 状态，不包括 rejected 状态。

Promise 也有一些缺点：

- 无法取消 Promise
- 必须设置回调函数来捕捉错误

Promise 主要是为了解决两个问题：

- 回调地狱
- 多个并发的请求

### Promise 基础用法

这一部分的详情请见[阮一峰]老师的文章，写的非常详尽，我在这里不再额外赘述，只列出一些重要结论，具体的细节以及代码示意在阮老师的文章中可以更好的学习。

- Promise 对象是一个构造函数，用来生成 Promise 实例。

- Promise 构造函数接受一个**函数**作为参数，该函数也有两个参数，分别是 resolve 和 reject。  
  resolve 函数的作用是：将 Promise 对象的状态从 pending 变为 resolved，在异步操作成功时调用，并将异步操作的结果作为参数传递出去;  
  reject 函数的作用是：将 Promise 对象的状态从 pending 变为 rejected，在异步操作失败时调用，并将异步操作报出的错误，作为函数传递出去。

- Promise 实例生成以后，可以使用 then 方法分别指定 resolved 状态和 reject 状态的回调函数。then 方法可以接受**两个回调函数作为参数**。第一个回调函数是 Promise 对象变为 resolved 时调用，第二个回调函数是 Promise 对象变为 rejected 时调用。第二个回调函数是可选的，不一定要提供。

- 请注意，**Promise 新建以后会立即执行**

- 如果调用 resolve 函数和 reject 函数时带有参数，那么它们的参数会被传递给回调函数。reject 函数的参数通常是 Error 对象的实例，表示抛出的错误；resolve 函数的参数除了正常的值以外，还可能是另一个 Promise 实例。这个时候，原 Promise 实例的状态由参数 Promise 实例的状态决定。

- 调用 resolve 或 reject **并不会终结 Promise 的参数函数的执行**。一般来说，调用 resolve 或 reject 以后，Promise 的使命就完成了，后继操作应该放到 then 方法里面，而不应该直接写在 resolve 或 reject 的后面。所以，最好在它们前面加上 return 语句，这样就不会有意外。

### Promise 常用方法

同样的，这一部分[阮一峰]老师的文章中已经写的非常的详尽，我在这里不再额外赘述，只列出大纲以及重要结论，具体的细节在阮老师的文章中可以更好的学习。

常用方法主要有下面的几种。  
在这些方法中:  
`Promise.prototype.xxx()`的方法是 Promise 实例所具有的方法；  
`Promise.xxx()`会返回一个新的 Promise 实例。

- `Promise.prototype.then()`

  - `then`的作用是为 Promise 实例添加状态改变时的回调函数。它的参数是两个函数，第一个是 resolved 状态的回调函数，第二个（可选）是 rejected 状态的回调函数。
  - `then`方法返回一个新的 Promise 实例（不是原来那个 Promise 实例）。因此可以使用**链式写法**，即`then`方法后面再调用另一个`then`方法。**第一个回调函数的返回结果会作为参数传入第二个回调函数。**

- `Promise.prototype.catch()`

  - `catch`方法的作用是捕捉并处理错误。也就是说，当 Promise 实例的状态变为 rejected 时，就会调用`catch`方法指定的回调函数。
  - 不仅如此，如果`then`方法中的回调函数在运行中发生错误，也会被`catch`方法捕获。
  - Promise 实例的错误具有**冒泡**性质，会一直向后传递，直到被捕获为止。也就是说，错误总会被下一个`catch`语句捕获。
  - 基于上一条，一个`catch`方法可能不止处理一个 Promise 实例的错误，他需要**处理所有在他前面产生的 Promise 实例的错误**（包括`then`方法中的错误）。
  - 一般来说，不要在`then`方法中定义 rejected 状态的回调函数（即`then`的第二个参数）。**总是使用`catch`方法来处理错误。**
  - 一般来说，使用 Promise 实例时都要跟上`catch`方法来处理错误。
  - `catch`方法返回的还是一个 Promise 对象，因此还可以继续`then`。`catch`也可以抛出错误，被在他后面的`catch`捕获。
  - 如果 Promise 实例的错误没有被处理，那么这个 Promise 实例的状态会变为 rejected；如果错误被`catch`了，那么会回返回一个新的 Promise 实例，这个 Promise 实例的状态是 resolved（如果没有新的错误）。

- `Promise.prototype.finally()`

  - `finally`方法用于无论 Promise 对象的状态如何，都要执行的操作。
  - `finally`方法的回调函数不接受任何参数。`finally`方法没有办法知道也不需要知道 Promise 实例的执行结果，**写在`finally`方法中的语句应该是与状态无关的**。
  - `finally`方法总是会返回原来的值。

- `Promise.resolve()`

  - `Promise.resolve()`方法会返回一个新的 Promise 实例，该实例的状态为 resolved。根据**方法参数**的不同，`Promise.resolve()`的返回不同。
  - 当参数是一个 Promise 实例，`Promise.resolve()`不会做任何修改，直接返回该实例。
  - 当参数是一个**thenable （具有 then 方法）对象**的时候，`Promise.resolve()`会将该对象转为 Promise 实例，然后立即执行`then` 方法.
  - 当参数是一个不具有 then 方法的对象或者根本不是对象时，`Promise.resolve()`会返回一个 Promise 实例，状态为 resolved。参数会传递到回调函数中。
  - 没有参数时，直接返回一个 Promise 实例，状态为 resolved。

- `Promise.reject()`

  - `Promise.reject(reason)`方法会返回一个新的 Promise 实例，该实例的状态为 rejected.
  - `Promise.reject()`方法的参数，会原封不动地作为 reject 的理由，变成后续方法的参数。
  - `reject`方法的作用，等同于抛出错误。

- `Promise.all()`

  - `Promise.all()`用于将多个 Promise 实例，包装成一个新的 Promise 实例（下文称"包装实例"）。
  - 一般来说，`Promise.all()`方法接受一个数组作为参数，且数组中的每一项都是一个 Promise 实例。如果有数组成员不是 Promise 实例，利用`Promise.resolve()`把它变成 Promise 实例。
  - `Promise.all()`的包装实例状态由参数数组的数组成员的状态决定：

    - 只有当**所有数组成员的状态全变成 resolved**，包装实例的状态才会变成 resolved。此时全部数组成员的返回值组成一个数组，传给包装实例的回调函数。
    - 只要**有一个数组成员的状态变成 rejected**，包装实例的状态就变成 rejected。此时第一个被 reject 的实例的返回值会作为参数传递给包装实例的回调函数。

  - 如果作为参数的 Promise 实例自己定义了`catch`方法，那么如果他一旦被 rejected，并不会触发`Promise.all()`的`catch`方法。如果参数 Promise 实例没有定义`catch`方法，那么会调用`Promise.all()`的`catch`方法。
  - `Promise.all()`的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

- `Promise.race()`

  - `Promise.race()`与`Promise.all()`类似，用于将多个 Promise 实例，包装成一个新的 Promise 实例。
  - `Promise.race()`的参数规则也与`Promise.all()`类似，接受一个以 Promise 实例作为数组成员的数组作为参数。
  - `Promise.race()`的包装实例状态是**第一个改变状态的参数 Promise 实例的状态**。参数 Promise 实例的返回值会传递给包装实例的回调函数。

最新方法有下面的几种：

- `Promise.allSettled()`

  - `Promise.allSettled()`方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到**所有这些参数实例都返回结果**，不管是 fulfilled 还是 rejected ，包装实例才会结束。
  - `Promise.allSettled()`方法返回的新的 Promise 实例，一旦结束，状态总是 fulfilled，不会变成 rejected。
  - 状态变成 fulfilled 后，包装实例的监听函数接收到的参数是一个数组，每个数组成员对应一个传入`Promise.allSettled()`的 Promise 实例。
  - 有时候，我们**不关心异步操作的结果，只关心这些操作有没有结束**。这种场景下适用`Promise.allSettled()`方法。
  - ES2020 新加入。

- `Promise.any()`

  - 参数实例有一个变成 fulfilled 状态，包装实例就会变成 fulfilled 状态；如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态。
  - 仍处于**提案**状态。

- `Promise.try()`
  - 不知道或者不想区分，函数 f 是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管 f 是否包含异步操作，都用 then 方法指定下一步流程，用 catch 方法处理 f 抛出的错误。
  - 仍处于**提案**状态。

### Promise 基本使用

Promise 最基本的使用方法如下：

- 新建一个 Promise 对象。

  ```js
  let promise = new Promise((resolve,reject) => {
    // ... some code
    if (/* 异步操作成功 */){
      return resolve(value);
    } else {
      return reject(error);
    }
  })
  ```

- 调用这个 Promise 对象的`then`方法，注册回调函数。回调函数的参数是一个函数，参数函数的参数是 Promise 对象的返回值。

  ```js
  promise.then((value) => {
    // 处理value
  });
  ```

- 注册`catch`方法用来捕捉并处理前面可能发生的错误。

  ```js
  promise
    .then((value) => {
      // 处理value
    })
    .catch((error) => {
      // 处理error
    });
  ```

以上就是 Promise 最基本的使用方法。

## Generator/co

Generator 生成器函数，在 async/await 出现之前可以用来做异步解决方案。一般来说需要配合 co 这个第三方库来使用。

现在一般已经不使用 Generator/co 进行异步编程。推荐使用 async/await 方案。

Generator 的本质用途是用来实现 Iterator 迭代器的，用在异步上是他的一个特殊用途。Generator 的详解可以参考[这里](<JavaScript(4).md>)。

## async/await

async/await 被称为 JS 中**异步终极解决方案**。在 async 函数中使用 await，那么 await 这里的代码就会变成同步的，只有等**await 后面的 Promise 执行完毕后**才会继续下去。

详细内容请参考[阮一峰的 async 部分]内容，这里只记录大纲以及重要性结论。

### 基本概念

#### async

- **async 函数返回一个 Promise 对象**，可以使用 then 方法添加回调函数。
- async 函数内部抛出错误，会导致**返回的 Promise 对象变为 rejected 状态**。抛出的错误会被`catch`方法捕捉到。
- 一般来说，async 函数都需要返回

#### await

- 在**async 函数内部可以使用 await 命令**，表示等待一个异步函数的返回。**await 不能够单独使用**。
- 正常情况下，**await 命令后面是一个 Promise 对象，返回该对象的结果**。await 后面的 Promise 对象不必写`then`,因为 await 可以**直接获取后面 Promise 对象的 resolved 状态**传递出来的参数。
- 如果 await 命令后面不是 Promise 对象，就直接返回对应的值；如果 await 命令后面是一个 thenable 对象，await 会将其等同于 Promise 对象。

### 错误处理

- 如果 await 后面的异步操作出错，那么等同于 async 函数返回的 Promise 对象被 reject，可以被该对象的`catch`方法捕捉，reject 的参数会传入`catch`方法。
- 如果一个 async 函数中有多个 await 语句，任何一个 await 语句后面的 Promise 对象变为 reject 状态，整个 async 函数都会中断执行。
- 基于以上，可以**将 await 语句放在`try...catch`结构里面**，这样不会耽误后面的代码执行；或者在 await 后面的 Promise 对象再跟一个`catch` 方法，处理错误。

### 使用注意点

- 最好把 await 命令放在`try...catch`代码块中。
- 多个 await 命令后面的异步操作，如果**不存在继发关系，最好让他们同时触发**。同时触发有两种写法：

  - 使用`Promise.all()`
  - 见代码：

  ```js
  // 写法一
  let [foo, bar] = await Promise.all([getFoo(), getBar()]);

  // 写法二
  let fooPromise = getFoo();
  let barPromise = getBar();
  let foo = await fooPromise;
  let bar = await barPromise;
  ```

- async 函数可以保留运行堆栈.

### await 与循环

- 对于异步代码，**forEach 并不能保证按顺序执行**。
- 想要在循环中使用 await ，需要**使用`for... of` 语句**。

解决原理——Iterator

## 参考出处

1. [阮一峰 ES6 教程-Promise][阮一峰]
2. [阮一峰 ES6 教程-async][阮一峰的async部分]
3. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc7198518825171726cfce)
4. [神三元-原生 JS(下篇)](https://juejin.im/post/5dd8b3a851882572f56b578f#heading-30)
5. [写代码像蔡徐抻-异步编程二三事](https://juejin.im/post/5e3b9ae26fb9a07ca714a5cc)
6. [蔓蔓雒轩-通俗易懂的 Promise](https://juejin.im/post/5afe6d3bf265da0b9e654c4b)
7. [艾特老干部-八段代码彻底掌握 Promise](https://juejin.im/post/597724c26fb9a06bb75260e8)
8. [lucefer-面试精选之 Promise](https://juejin.im/post/5b31a4b7f265da595725f322)
9. [石墨文档-Promise 必知必会](https://juejin.im/post/5a04066351882517c416715d)
10. [陈惠超-理解 async/await](https://juejin.im/post/596e142d5188254b532ce2da)
11. [大 Y-一次性让你懂 async/await](https://juejin.im/post/5b1ffff96fb9a01e345ba704)
12. [limingru-与 Promise 血脉相连的 async/await](https://juejin.im/post/5a9516885188257a6b061d72)

[阮一峰]: https://es6.ruanyifeng.com/#docs/promise
[阮一峰的async部分]: https://es6.ruanyifeng.com/#docs/async
