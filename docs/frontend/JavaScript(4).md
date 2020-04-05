# JS 基础知识(4)--其他重要概念

[[toc]]

## 拷贝

### 什么是拷贝，为什么要进行拷贝

由于对象实际上是引用地址的指针，所以会出现一处更改，多处变动的问题：

```js
let arr = [1, 2, 3];
let newArr = arr;
newArr[0] = 100;

console.log(arr);                       //  [100, 2, 3]
```

当改变`newArr`,由于指向的实际上是一个地址，因此`arr`也跟着一起改变。如果在实际的开发中不希望出现这种现象，就需要在使用对象类型数据的时候进行拷贝。

拷贝的方式有两种：浅拷贝和深拷贝。浅拷贝实现简单，但是有缺陷；深拷贝可以彻底解决拷贝方面的问题。

### 浅拷贝

浅拷贝是普通的拷贝方式。浅拷贝可以很好的实现基本数据类型的拷贝：

```js
let arr = [1, 2, 3];
let newArr = arr.slice();
newArr[0] = 100;

console.log(arr);                       //  [1, 2, 3]
console.log(newArr);                    //  [100, 2, 3]
```

`newArr`是`arr`的浅拷贝结果。经过拷贝后，两者引用的不再是同一地址，因此不会发生干扰。

浅拷贝的一个重要限制在于他只能进行一层拷贝。如果被拷贝的对象存在对象嵌套，浅拷贝将失效：

```js
let arr = [1, 2, {val: 4}];             //  这里arr是一个对象，arr[2]也是一个对象
let newArr = arr.slice();
newArr[2].val = 1000;

console.log(arr);                       //  [ 1, 2, { val: 1000 } ]，拷贝失败
```

常用的浅拷贝方法有：

- `...`展开运算符

```js
let arr = [1, 2, 3];
let newArr = [...arr];                  //  跟arr.slice()是一样的效果
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
let obj = { name: 'sy', age: 18 };
const obj2 = Object.assign({}, obj, {name: 'sss'});
console.log(obj2);                      //  { name: 'sss', age: 18 }
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
const a = {val:2};
a.target = a;
JSON.parse(JSON.stringify(a))           //  Converting circular structure to JSON
```

#### 实现深拷贝

手动实现过于复杂。建议使用`lodash`的`deepClone`函数进行。

```js
let obj = {
  a: [1, 2, 3],
  b: {
    c: 2,
    d: 3
  }
}
let newObj = deepClone(obj)
newObj.b.c = 1
console.log(obj.b.c)                // 2
```

## this

## 参考出处

1. [掘金yck小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
2. [神三元掘金文章-原生JS(中篇)](https://juejin.im/post/5dbebbfa51882524c507fddb#heading-64)
