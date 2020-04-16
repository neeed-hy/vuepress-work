# JS 基础--遍历器、生成器、拷贝

[[toc]]

## Iterator（遍历器）

### 什么是遍历器

这一部分的详细内容请参考[阮一峰的 Iterator 部分]内容，我这里不再赘述，只在此列出大纲和重要结论，详细内容可以到阮老师的文章中学习。

> Iterator 是一种接口，为各种不同的数据结构提供统一的访问机制。**任何数据结构只要部署 Iterator 接口，就可以完成遍历操作。**

Iterator 的作用有三个：

- 为各种数据结构提供一个统一的访问接口
- 是数据结构能够按照某种次序排列
- ES6 创造了一种新的遍历命令`for ... of`，**Iterator 接口主要供`for ... of`消费**。

### 默认 Iterator

Iterator 接口的主要目的就是和`for ... of`循环结合使用。当使用`for ... of`循环遍历某种数据结构，该循环会自动寻找 Iterator 接口。

默认的 Iterator 部署在数据结构的`Symbol.iterator`属性上。一种数据结构只要部署了 Iterator 接口，就称这种数据结构是**可遍历的(iterable)**。

为一个不具有 Iterator 的数据结构创建遍历器最简单的方法是使用下文中介绍的 Generator 生成器函数。举个例子：

```js
let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
}
[...myIterable] // [1, 2, 3]
```

ES6 中有些数据结构原生具备 Iterator 接口。分别是：

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

以上数据结构可以直接使用`for...of`进行遍历。

### 调用 Iterator 的场合

- 解构赋值
- 扩展运算符`...`
- `yield*`
- 以数组为参数的其他场合,调用了参数数组的 Iterator。

### for ... of 循环

ES6 新增加的语法。相比传统的遍历方式有属于自己的优势：

- 传统`for`循环写起来太麻烦;
- `forEach`无法中途跳出，无论是 break 还是 return 都不可以;
- `forEach`无法保证异步任务的执行顺序;
- `for ... in`主要是为遍历对象设计的，不适合遍历数组;

因此遍历，尤其是数组遍历，可以优先使用`for ... of`循环。

### 对象的遍历

对于普通对象，`for ... of`不能够直接使用。可以使用`for ... in`遍历键名：

```js
let es6 = {
  edition: 6,
  committee: "TC39",
  standard: "ECMA-262",
};

for (let e in es6) {
  console.log(e);
}
// edition
// committee
// standard

for (let e of es6) {
  console.log(e);
}
// TypeError: es6[Symbol.iterator] is not a function
```

如果想使用`for ... of`遍历对象，可以使用`Object.keys()`方法将对象的键名生成一个数组，然后遍历这个数组。

```js
for (let key of Object.keys(someObject)) {
  console.log(key + ":" + someObject[key]);
}
```

## Generator（生成器）

### 什么是生成器

> 生成器是一个带**星号**的函数（注意，他并不是真正的函数），可以通过`yield`关键字**暂停执行**和**恢复执行**。

Generator 函数有下面几个特点：

- Generator 函数的调用方法和普通函数一样，都是函数名后面加上`()`。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个执行内部状态的指针对象(一个遍历器 Iterator 对象)。
- 必须调用遍历器对象的`next`方法，使得指针移向下一个状态。也就是说，每次调用`next`方法，内部指针就从函数头部或者上一次停下来的地方开始执行，直到遇到下一个`yield`表达式(或者`return`语句)为止。换言之，Generator 函数是分段执行的，遇到`yield`表达式暂停执行，使用`next`方法恢复执行。
- `next`方法返回一个有 value 和 done 两个属性的对象。value 为当前 yield 语句后面那个表达式的值；done 是一个布尔值，表示遍历是否结束，遇到 `return`后会变成`true`。

举个例子：

```js
function* gen() {
  //  使用*定义Generator生成器函数
  console.log("enter");
  let a = yield 1;
  let b = yield (function () {
    return 2;
  })();
  return 3;
}
var g = gen(); //  阻塞住，不会执行任何语句
console.log(typeof g); //  object  看到了吗？不是"function"

console.log(g.next());
console.log(g.next());
console.log(g.next());
console.log(g.next());

// enter
// { value: 1, done: false }

// { value: 2, done: false }
// { value: 3, done: true }
// { value: undefined, done: true }
```

- 调用生成器函数`gen()`后，程序会阻塞住，不会执行任何语句。
- 使用`g.next()`,程序会执行到下一个`yield`语句（或`return`语句）后暂停。
- 每次执行`next`方法，都会返回对象。

### yield\*

在一个 Generator 函数内部调用另一个 Generator 函数的时候使用。

例如：

```js
function* gen1() {
  yield 1;
  yield 4;
}
function* gen2() {
  yield 2;
  yield 3;
}
```

如果想要输出 1234，可以修改`gen1()`函数：

```js
function* gen1() {
  yield 1;
  yield* gen2();
  yield 4;
}
```

再调用`next`方法即可。

### 协程

#### 协程的概念

> 协程是一种比线程更加轻量级的存在，协程处在线程的环境中，**一个线程可以存在多个协程**，可以将协程理解为线程中的一个个任务。不像进程和线程，协程并不受操作系统的管理，而是被具体的应用程序代码所控制。

#### 协程的运作过程

JS 是一种单线程的语言。在 JS 中，一个线程一次只能执行一个协程。  
比如当前执行 A 协程，另有一个 B 协程，如果想要执行 B 的任务，就必须**在 A 协程中将 JS 线程的控制器转交给 B 协程**。在 B 执行的过程中，A 相当于暂停状态。

举个例子：

```js
function* A() {
  console.log("我是A");
  yield B(); // A停住，在这里转交线程执行权给B
  console.log("结束了");
}
function B() {
  console.log("我是B");
  return 100; // 返回，并且将线程执行权还给A
}
let gen = A();
console.log(gen.next());
gen.next();

// 我是A
// 我是B
// {value: 100, done: false}
// 结束了
```

在这个过程中，A 将执行权交给 B ，也就是 A 启动 B，此时称 A 是 B 的**父协程**。B 中最后`return 100`实际上是将 100 传给了父协程。

## 拷贝

### 什么是拷贝，为什么要进行拷贝

由于对象实际上是引用地址的指针，所以会出现一处更改，多处变动的问题：

```js
let arr = [1, 2, 3];
let newArr = arr;
newArr[0] = 100;

console.log(arr); //  [100, 2, 3]
```

当改变`newArr`,由于指向的实际上是一个地址，因此`arr`也跟着一起改变。如果在实际的开发中不希望出现这种现象，就需要在使用对象类型数据的时候进行拷贝。

拷贝的方式有两种：浅拷贝和深拷贝。浅拷贝实现简单，但是有缺陷；深拷贝可以彻底解决拷贝方面的问题。

### 浅拷贝

浅拷贝是普通的拷贝方式。浅拷贝可以很好的实现基本数据类型的拷贝：

```js
let arr = [1, 2, 3];
let newArr = arr.slice();
newArr[0] = 100;

console.log(arr); //  [1, 2, 3]
console.log(newArr); //  [100, 2, 3]
```

`newArr`是`arr`的浅拷贝结果。经过拷贝后，两者引用的不再是同一地址，因此不会发生干扰。

浅拷贝的一个重要限制在于他只能进行一层拷贝。如果被拷贝的对象存在对象嵌套，浅拷贝将失效：

```js
let arr = [1, 2, { val: 4 }]; //  这里arr是一个对象，arr[2]也是一个对象
let newArr = arr.slice();
newArr[2].val = 1000;

console.log(arr); //  [ 1, 2, { val: 1000 } ]，拷贝失败
```

常用的浅拷贝方法有：

- `...`展开运算符

```js
let arr = [1, 2, 3];
let newArr = [...arr]; //  跟arr.slice()是一样的效果
```

- `slice`浅拷贝

```js
let arr = [1, 2, 3];
let newArr = arr.slice();
```

- `concat`浅拷贝数组

```js
let arr = [1, 2, 3];
let newArr = arr.concat();
```

- `Object.assign()`

```js
let obj = { name: "sy", age: 18 };
const obj2 = Object.assign({}, obj, { name: "sss" });
console.log(obj2); //  { name: 'sss', age: 18 }
```

### 深拷贝

深拷贝可以解决多层对象嵌套的问题，实现彻底的、复杂的拷贝。

#### 简易版深拷贝

简易版深拷贝方法是：

```js
JSON.parse(JSON.stringify());
```

这种简易版本的实现也存在诸多不足：

- 无法处理`Symbol`、`undefined`
- 无法处理函数
- 无法处理循环引用，例如下面的代码，无法进行拷贝

```js
const a = { val: 2 };
a.target = a;
JSON.parse(JSON.stringify(a)); //  Converting circular structure to JSON
```

#### 实现深拷贝

手动实现过于复杂。建议使用`lodash`的`deepClone`函数进行。

```js
let obj = {
  a: [1, 2, 3],
  b: {
    c: 2,
    d: 3,
  },
};
let newObj = deepClone(obj);
newObj.b.c = 1;
console.log(obj.b.c); // 2
```

## 参考出处

1. [阮一峰的 Iterator 部分]
2. [MDN-迭代器和生成器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators)
3. [神三元-原生 JS(中篇)](https://juejin.im/post/5dbebbfa51882524c507fddb#heading-49)
4. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bed40d951882545f73004f6)

[阮一峰的iterator部分]: https://es6.ruanyifeng.com/#docs/iterator
