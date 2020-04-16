# JS 基础--函数式编程

[[toc]]

## 相关概念

### 高阶函数

> 高阶函数是对其他函数进行操作的函数。如果一个函数能够将函数作为参数或是返回值是一个函数，那么这个函数就是高阶函数。

### 纯函数

纯函数指没有**副作用**的函数。**对于相同的输入，永远有着相同的输出**。

这种特性也叫**引用透明**。

一个函数不是纯函数可能有下列原因：

- 改变了该函数之外的变量;
- 调用了该函数参数之外的变量;
- 改变了函数参数的值;
- 函数内存在随机过程;
- 处理输入;
- 打印日志;
- 抛出异常;
- ……

代码示例：

```js
// 是纯函数
function add(x, y) {
  return x + y;
}
// 随机过程，不是纯函数
function random(x) {
  return Math.random() * x;
}
// 改变了参数，不是纯函数
function setColor(el, color) {
  el.style.color = color;
}
// 调用并改变了该函数参数之外的变量，不是纯函数
var count = 0;
function addCount(x) {
  count += x;
  return count;
}
```

简而言之，纯函数有以下性质：

- 函数的输出仅取决于函数的输入，不依赖其他任何外部状态。
- 除了输出以外，不会造成任何变化，例如修改外部变量。

### 函数组合 compose

顾名思义，函数组合指的是将代表各个动作的多个函数合并成一个函数。**上一个函数的输出是下一个函数的输入**。

实现函数组合可以使用 lodash 库的 `flow` 以及 `flowRight` 方法。可以方便的生成组合函数。

```js
import flow from "lodash/fp/flow";
import add from "lodash/fp/add";
function square(n) {
  return n * n;
}
const compose = flow([add, square]);
console.log(compose(1, 2));
```

### 函数柯里化 curry

#### 概念

柯里化是一种将使用多个参数的函数转换成一系列使用一个参数的函数的技术。柯里化函数**接受一个参数**，并**返回一个接收余下参数的函数**。直到接收参数的数量完整，才会返回最后的结果。

举例来讲。  
假设一个函数 f1 接收三个参数。如果 f1 不进行柯里化，那么如果在调用 f1 时参数数量只有两个，函数也将直接返回结果。

```js
function f1(a, b, c) {
  console.log(a + b + c);
}

f1(1, 2); //  NaN
f1(1, "3"); //  13undefined
```

设 f2 为 f1 的柯里化函数。那么如果在调用 f2 时传入参数数量不足，他不会返回一个结果，而是返回一个函数。新函数会接收 f1 的剩余参数，直到接收满三个，并计算出结果。

实现函数柯里化可以使用 lodash 库的 `curry` 方法。可以方便的生成一个函数的柯里化函数。

```js
import curry from "lodash/fp/curry";
function f2(a: number, b: number, c: number) {
  console.log(a + b + c);
}
const curried = curry(this.f2);
const temp1 = curried(1);
const temp2 = temp1(2);
const temp3 = temp2(3);
console.log(temp1); //  f(){}
console.log(temp2); //  f(){}
console.log(temp3); //  6
```

在 JS 中，柯里化函数允许一次传递多个参数。

```js
//普通函数
function fn(a, b, c, d, e) {
  console.log(a, b, c, d, e);
}
//生成的柯里化函数
let _fn = curry(fn);

_fn(1, 2, 3, 4, 5); // print: 1,2,3,4,5
_fn(1)(2)(3, 4, 5); // print: 1,2,3,4,5
_fn(1, 2)(3, 4)(5); // print: 1,2,3,4,5
_fn(1)(2)(3)(4)(5); // print: 1,2,3,4,5
```

总结：

> 对于已经柯里化的函数\_fn，当接收的参数数量与原函数的参数数量相同，执行原函数；当参数数量小于原函数的参数数量，返回一个函数用于接收剩余的参数，直到接收的参数数量与原函数的参数数量一致，执行原函数。

#### 函数柯里化的用途

- 通过固定某几个参数，将具有多个参数的复杂函数包装成单参数函数，提升可用性。
- 避免频繁调用具有相同参数的函数。

## 数组中的高阶函数

### map

数组的`map`方法会对数组中的每一个元素进行操作，将操作结果添加到一个新数组中，最后**返回这个新的结果数组**。

- `map`方法接收两个参数，一个是回调函数，一个是回调函数的 this（可选）。
- 参数回调函数默认有三个参数，依次为当前元素、当前索引、整个数组。
- 一般来说在回调函数中要 `return` 一个值。`return` 的值会添加到`map`方法的结果数组中。
- `map`方法对原来的数组没有影响。

代码示例：

```js
// 完整的用例
let nums = [1, 2, 3];
let obj = { val: 5 };
let newNums = nums.map(function (item, index, array) {
  return item + index + array[index] + this.val;
  //对第一个元素，1 + 0 + 1 + 5 = 7
  //对第二个元素，2 + 1 + 2 + 5 = 10
  //对第三个元素，3 + 2 + 3 + 5 = 13
}, obj);
console.log(newNums);
//  [7, 10, 13]

// 最常见的用例，省略了一般不会使用的参数
let nums2 = [4, 5, 6];
let newNum2s = nums2.map((item) => {
  return item + 1;
});
console.log(newNum2s);

//  [5, 6, 7]
```

### reduce

数组的`reduce`方法对数组中的每一个元素进行操作，最后将整个数组**合并到一个值上**。

- `reduce`方法接收两个参数，一个为回调函数，另一个为初始值（可选）。
- 如果没有设置初始值参数，会默认将数组第一个元素作为初始值。
- 参数回调函数默认有三个参数，依次是积累值、当前值、整个数组。
- 一般来说在回调函数中要 `return` 一个值。如果没有`return` 的值，那么整个`reduce`方法的积累值会变成 `undefined`。
- `reduce`方法对原来的数组没有影响。

代码示例：

```js
let nums = [1, 2, 3];
//  多个数的加和
let newNums = nums.reduce((preSum, curVal, array) => {
  return preSum + curVal;
}, 0);
console.log(newNums);
//  6
```

### filter

数组的`filter`方法对数组中的每一个元素进行条件判断，筛选出符合条件的元素并添加到一个新数组中，最后返回这个新的结果数组。

- `filter`方法接收一个参数，即回调函数。参数回调函数默认也只有一个参数，就是数组当前元素。
- 参数回调函数的返回值是一个布尔类型，决定元素是否保留。
- `filter`方法对原来的数组没有影响。

```js
let nums = [1, 2, 3];
//  保留奇数项
let oddNums = nums.filter((item) => item % 2);
console.log(oddNums);
//  [1, 3]
```

### sort

对数组进行排序。在原数组上直接排序，不会返回新的数组。

- `sort`方法接收一个参数，即回调函数（可选）。参数回调函数默认有两个参数 a，b，分别是代表比较的两个元素。
- 当比较函数的返回值大于 0，则 a 应该排在 b 的后面，即 a 的下标要比 b 大;
- 当返回值小于 0，则 a 应该排在 b 的前面，即 a 的下标要比 b 小;
- 如果两者相对，返回值等于 0。
- 基于以上规则，就完成了一次升序排列。
- 如果没有显式的指定比较函数，也就是`sort`方法没有参数时，默认将所有元素转换成字符串再排序。因此如果不想按照字符串 ASCII 码排序的话需要指明`sort`方法的排序函数。

代码示例：

```js
let nums = [10, 20, 1, 2];
//两个比较的元素分别为a, b
nums.sort(function (a, b) {
  if (a > b) return 1;
  else if (a < b) return -1;
  else if (a == b) return 0;
});
console.log(nums);
//  [1, 2, 10, 20]

let nums2 = [10, 20, 1, 2];
nums2.sort();
console.log(nums2);
//  [1, 10, 2, 20]
```

## 参考出处

1. [神三元-原生 JS(中篇)](https://juejin.im/post/5dbebbfa51882524c507fddb#heading-18)
2. [云中桥-彻底弄懂函数柯里化](https://juejin.im/post/5d2299faf265da1bb67a3b65)
3. [淘淘笙悦-JavaScript 函数式编程](https://juejin.im/post/5b4ac0d0f265da0fa959a785#heading-2)
