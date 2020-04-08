# JS 基础知识(6)--异步编程基础

[[toc]]

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

### Promise 基础用法

这一部分的详情请见[阮一峰]老师的文章，写的非常详尽，我在这里不再额外赘述，只列出一些重要结论，具体的细节以及代码示意在阮老师的文章中可以更好的学习。

- Promise 对象是一个构造函数，用来生成Promise 实例。

- Promise 构造函数接受一个**函数**作为参数，该函数也有两个参数，分别是resolve 和 reject。  
  resolve 函数的作用是：将Promise 对象的状态从pending 变为 resolved，在异步操作成功时调用，并将异步操作的结果作为参数传递出去;  
  reject 函数的作用是：将Promise 对象的状态从pending 变为rejected，在异步操作失败时调用，并将异步操作报出的错误，作为函数传递出去。

- Promise 实例生成以后，可以使用then 方法分别指定resolved 状态和reject 状态的回调函数。then 方法可以接受**两个回调函数作为参数**。第一个回调函数是Promise 对象变为resolved 时调用，第二个回调函数是Promise 对象变为rejected 时调用。第二个回调函数是可选的，不一定要提供。

- 请注意，**Promise 新建以后会立即执行**

- 如果调用resolve 函数和reject 函数时带有参数，那么它们的参数会被传递给回调函数。reject 函数的参数通常是Error 对象的实例，表示抛出的错误；resolve 函数的参数除了正常的值以外，还可能是另一个 Promise 实例。这个时候，原Promise 实例的状态由参数Promise 实例的状态决定。

- 调用resolve 或reject **并不会终结 Promise 的参数函数的执行**。一般来说，调用resolve 或reject 以后，Promise 的使命就完成了，后继操作应该放到then 方法里面，而不应该直接写在resolve 或reject 的后面。所以，最好在它们前面加上return 语句，这样就不会有意外。

### Promise 常用方法

同样的，这一部分[阮一峰]老师的文章中已经写的非常的详尽，我在这里不再额外赘述，只列出大纲以及重要结论，具体的细节在阮老师的文章中可以更好的学习。

常用方法主要有下面的几种。  
在这些方法中:  
`Promise.prototype.xxx()`的方法是Promise 实例所具有的方法；  
`Promise.xxx()`会返回一个新的Promise 实例。

- `Promise.prototype.then()`

  - `then`的作用是为Promise 实例添加状态改变时的回调函数。它的参数是两个函数，第一个是resolved 状态的回调函数，第二个（可选）是rejected 状态的回调函数。
  - `then`方法返回一个新的Promise 实例（不是原来那个Promise 实例）。因此可以使用**链式写法**，即`then`方法后面再调用另一个`then`方法。**第一个回调函数的返回结果会作为参数传入第二个回调函数。**

- `Promise.prototype.catch()`

  - `catch`方法的作用是捕捉并处理错误。也就是说，当Promise 实例的状态变为rejected 时，就会调用`catch`方法指定的回调函数。
  - 不仅如此，如果`then`方法中的回调函数在运行中发生错误，也会被`catch`方法捕获。
  - Promise 实例的错误具有**冒泡**性质，会一直向后传递，直到被捕获为止。也就是说，错误总会被下一个`catch`语句捕获。
  - 基于上一条，一个`catch`方法可能不止处理一个Promise 实例的错误，他需要**处理所有在他前面产生的Promise 实例的错误**（包括`then`方法中的错误）。
  - 一般来说，不要在`then`方法中定义rejected 状态的回调函数（即`then`的第二个参数）。**总是使用`catch`方法来处理错误。**
  - 一般来说，使用Promise 实例时都要跟上`catch`方法来处理错误。
  - `catch`方法返回的还是一个Promise 对象，因此还可以继续`then`。`catch`也可以抛出错误，被在他后面的`catch`捕获。
  - 如果Promise 实例的错误没有被处理，那么这个Promise 实例的状态会变为rejected；如果错误被`catch`了，那么会回返回一个新的Promise 实例，这个Promise 实例的状态是resolved（如果没有新的错误）。

- `Promise.prototype.finally()`
  
  - `finally`方法用于无论Promise 对象的状态如何，都要执行的操作。
  - `finally`方法的回调函数不接受任何参数。`finally`方法没有办法知道也不需要知道Promise 实例的执行结果，**写在`finally`方法中的语句应该是与状态无关的**。
  - `finally`方法总是会返回原来的值。
- `Promise.resolve()`

  - `Promise.resolve()`方法会返回一个新的 Promise 实例，该实例的状态为resolved。根据**方法参数**的不同，`Promise.resolve()`的返回不同。
  - 当参数是一个Promise 实例，`Promise.resolve()`不会做任何修改，直接返回该实例。
  - 当参数是一个**thenable （具有then 方法）对象**的时候，`Promise.resolve()`会将该对象转为Promise 实例，然后立即执行`then` 方法.
  - 当参数是一个不具有then 方法的对象或者根本不是对象时，`Promise.resolve()`会返回一个Promise 实例，状态为resolved。参数会传递到回调函数中。
  - 没有参数时，直接返回一个Promise 实例，状态为resolved。

- `Promise.reject()`

  - `Promise.reject(reason)`方法会返回一个新的 Promise 实例，该实例的状态为rejected.
  - `Promise.reject()`方法的参数，会原封不动地作为reject 的理由，变成后续方法的参数。
  - `reject`方法的作用，等同于抛出错误。

- `Promise.all()`

  - `Promise.all()`用于将多个Promise 实例，包装成一个新的Promise 实例（下文称"包装实例"）。
  - 一般来说，`Promise.all()`方法接受一个数组作为参数，且数组中的每一项都是一个Promise 实例。如果有数组成员不是Promise 实例，利用`Promise.resolve()`把它变成Promise 实例。
  - `Promise.all()`的包装实例状态由参数数组的数组成员的状态决定：
  
    - 只有当**所有数组成员的状态全变成resolved**，包装实例的状态才会变成resolved。此时全部数组成员的返回值组成一个数组，传给包装实例的回调函数。
    - 只要**有一个数组成员的状态变成rejected**，包装实例的状态就变成rejected。此时第一个被reject 的实例的返回值会作为参数传递给包装实例的回调函数。

  - 如果作为参数的Promise 实例自己定义了`catch`方法，那么如果他一旦被rejected，并不会触发`Promise.all()`的`catch`方法。如果参数Promise 实例没有定义`catch`方法，那么会调用`Promise.all()`的`catch`方法。
  - `Promise.all()`的参数可以不是数组，但必须具有Iterator 接口，且返回的每个成员都是 Promise 实例。

- `Promise.race()`

  - `Promise.race()`与`Promise.all()`类似，用于将多个Promise 实例，包装成一个新的Promise 实例。
  - `Promise.race()`的参数规则也与`Promise.all()`类似，接受一个以Promise 实例作为数组成员的数组作为参数。
  - `Promise.race()`的包装实例状态是**第一个改变状态的参数Promise 实例的状态**。参数Promise 实例的返回值会传递给包装实例的回调函数。

最新方法有下面的几种：

- `Promise.allSettled()`

  - `Promise.allSettled()`方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到**所有这些参数实例都返回结果**，不管是fulfilled 还是rejected ，包装实例才会结束。
  - `Promise.allSettled()`方法返回的新的 Promise 实例，一旦结束，状态总是fulfilled，不会变成rejected。
  - 状态变成fulfilled 后，包装实例的监听函数接收到的参数是一个数组，每个数组成员对应一个传入`Promise.allSettled()`的 Promise 实例。
  - 有时候，我们**不关心异步操作的结果，只关心这些操作有没有结束**。这种场景下适用`Promise.allSettled()`方法。
  - ES2020新加入。

- `Promise.any()`

  - 参数实例有一个变成fulfilled 状态，包装实例就会变成fulfilled 状态；如果所有参数实例都变成rejected 状态，包装实例就会变成rejected 状态。
  - 仍处于**提案**状态。

- `Promise.try()`
  - 不知道或者不想区分，函数f 是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管f 是否包含异步操作，都用then 方法指定下一步流程，用catch 方法处理f抛出的错误。
  - 仍处于**提案**状态。

### Promise 基本使用

Promise 最基本的使用方法如下：

- 新建一个Promise 对象。

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

- 调用这个Promise 对象的`then`方法，注册回调函数。回调函数的参数是一个函数，参数函数的参数是Promise 对象的返回值。

  ```js
  promise
  .then((value) => {
    // 处理value
  })
  ```

- 注册`catch`方法用来捕捉并处理前面可能发生的错误。
  
  ```js
  promise
  .then((value) => {
    // 处理value
  })
  .catch((error) => {
    // 处理error
  })
  ```

以上就是Promise 最基本的使用方法。

## async/await

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
