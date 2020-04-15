# JS 基础--一 this、new、拷贝

[[toc]]

## this

### 前言

[理解-JavaScript 中的 this、call、apply 和 bind]这篇文章讲解的十分易懂且全面，推荐全文阅读。下面只列出大纲和重要性结论：

- this 允许复用函数时使用不同的上下文。换句话说，**this 关键字允许在调用函数或方法时决定到底应该关注哪个对象。**
- this 实际上是一个引用。判断 this 引用什么的**唯一**方法就是看**使用 this 关键字的这个方法在哪里被调用**的。
- this 有四种绑定规则：
  - 隐式绑定
  - 显式绑定
  - new + 构造函数绑定
  - window 绑定

### 隐式绑定

隐式绑定是最常见的绑定规则。

隐式绑定规则的主要关键点：

> 为了判断 this 关键字的引用，函数在被调用时先看一眼点号`.`左侧。如果有“点号”那么点号左侧的对象就是 this 的引用。

```js
let user = {
  name: "Tyler",
  age: 27,
  greet() {
    console.log(`${this.name}`);
  },
  mother: {
    name: "Stacey",
    greet() {
      console.log(`${this.name}`);
    },
  },
};

user.greet();
user.mother.greet();

//  Tyler
//  Stacey
```

每当判断 this 的引用时，都需要查看调用过程，并确认“点号左侧”是什么。  
第一个调用，点号左侧是`user`,因此输出的是`user.name`也就是`Tyler`；  
第二个调用，点号左侧是`mother`,因此输出的是`mother.name`也就是`Stacey`。

### 显式绑定

#### call()

> `call()`是每个函数都有的一个方法，它允许你在调用函数时为函数指定上下文。

```js
let user = {
  name: "Tyler",
  age: 27,
};
function greet() {
  console.log(this.age);
}

greet();
greet.call(user);

//  undefined
//  27
```

上面的代码中，直接调用`greet()`会输出`undefined`。  
使用`call()`显式的将`user`指定为`greet()`的上下文，就可以输出`user.age`也就是`27`。

传递给`call()`方法的第一个参数会作为函数被调用时的上下文。换句话说，this 将会指向`call()`的第一个参数。

`call()`方法支持参数的传递。从第二个参数开始，将参数一个一个的传入。

```js
function greet(lang1, lang2, lang3) {
  console.log(
    `Hello, my name is ${this.name} and I know ${lang1}, ${lang2}, and ${lang3}`
  );
}

let user = {
  name: "Tyler",
  age: 27,
};

let languages = ["JavaScript", "Ruby", "Python"];

greet(languages[0], languages[1], languages[2]);
greet.call(user, languages[0], languages[1], languages[2]);

//  Hello, my name is  and I know JavaScript, Ruby, and Python
//  Hello, my name is Tyler and I know JavaScript, Ruby, and Python
```

#### apply()

`apply()`和`call()`的功能上是一致的。唯一的区别在于参数的传递方式。

正如上文所讲，`call()`需要将参数一个一个追加到第一个参数的后面，在参数多的情况下有些繁琐。

`apply()`支持直接传递参数数组。这样可以让代码更清晰。利用`apply()`方法，上文中的代码可以改写成：

```js
let languages = ["JavaScript", "Ruby", "Python"];

//  greet.call(user, languages[0], languages[1], languages[2])
greet.apply(user, languages);
```

和作用域不一样，作用域链是按照作用域**创建**的层级进行查找；  
this 则是根据**调用**进行确定。this 的指向并不是在创建时就可以确定的。**this 永远指向最后调用它的那个对象**！

#### bind()

`call()`和`apply()`都是一次性使用的方法。如果想要重复的使用绑定特定 this 的方法，可以使用`bind()`。

`bind()`和`call()`在意义上完全一样，区别在于他们的返回。  
`call()`会立即执行函数，而`bind()`会返回一个能够以后调用的新函数。

关于`call()`、`apply()`和`bind()`完整实例如下：

```js
function greet(lang1, lang2, lang3) {
  console.log(
    `Hello, my name is ${this.name} and I know ${lang1}, ${lang2}, and ${lang3}`
  );
}

let user = {
  name: "Tyler",
  age: 27,
};

let languages = ["JavaScript", "Ruby", "Python"];
let newFn = greet.bind(user, languages[0], languages[1], languages[2]);

greet(languages[0], languages[1], languages[2]);
greet.call(user, languages[0], languages[1], languages[2]);
greet.apply(user, languages);
newFn();

//  Hello, my name is  and I know JavaScript, Ruby, and Python
//  Hello, my name is Tyler and I know JavaScript, Ruby, and Python
//  Hello, my name is Tyler and I know JavaScript, Ruby, and Python
//  Hello, my name is Tyler and I know JavaScript, Ruby, and Python
```

### new + 构造函数绑定

此时构造函数中的 this 指向实例对象。

```js
function User(name, age) {
  this.name = name;
  this.age = age;
}

let me = new User("Tyler", 27);
let you = new User("Anderson", 35);

console.log(me);
console.log(you);

//  User {name: "Tyler", age: 27}
//  User {name: "Anderson", age: 35}
```

### window 绑定

如果其他规则全都没有满足，那么 this 指向全局 window 对象。

```js
function sayAge() {
  console.log(`My age is ${this.age}`);
}
let user = {
  name: "Tyler",
  age: 27,
};
window.age = 27;
sayAge();

// My age is 27
```

在严格模式下，this 不会默认指向全局 window 对象，会保持为`undefined`。

```js
"use strict";

window.age = 27;
function sayAge() {
  console.log(`My age is ${this.age}`);
}
sayAge();

// TypeError: Cannot read property 'age' of undefined
```

### 箭头函数 =>

箭头函数没有 this，因此也不能绑定。箭头函数里面的 this 会指向当前最近的非箭头函数的 this，找不到就是 window(严格模式是 undefined)。

```js
let obj = {
  name: "Tyler",
  a: function () {
    let name = "Anderson";
    let test = () => {
      console.log(this.name);
    };
    test();
  },
};
obj.a();

//  Tyler
//  找到最近的非箭头函数a，所以箭头函数的this 就是a 的this。
//  a目前是由obj调用的，因此此时箭头函数的this 为obj
```

### this 判断流程

1. 是 new + 构造函数么？是的话指向新建的实例对象;
2. 是不是使用了`call()`、`apply()`或者`bind()`？是的话那么就是进行了显式指明;
3. 不是以上的，说明是隐式调用。首先查看函数在哪里被调用;
4. 是否是箭头函数？箭头函数没有 this，他会指向离他最近的非箭头函数的 this;
5. 调用的点号`.`左侧是否有对象？如果有，它就是 this 的引用;
6. 以上全都不是，那么在严格模式下，this 就是`undefined`；非严格模式下，指向全局 window 对象。

## new

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

1. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
2. [神三元-原生 JS(中篇)](https://juejin.im/post/5dbebbfa51882524c507fddb)
3. [sunshine 小小倩-this、apply、call、bind](https://juejin.im/post/59bfe84351882531b730bac2)
4. [子非-理解-JavaScript 中的 this、call、apply 和 bind](https://juejin.im/post/5b9f176b6fb9a05d3827d03f)
5. [call_me_R-理解 JavaScript 中的 This,Bind,Call 和 Apply](https://juejin.im/post/5dc44764f265da4d3d2e4a36)
6. [菜鸟教程](https://www.runoob.com/w3cnote/js-call-apply-bind.html)
7. [new 运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)
8. [若川-能否模拟实现 JS 的 new 操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)
9. [yck-聊聊 new 操作符](https://juejin.im/post/5c7b963ae51d453eb173896e)

[理解-javascript 中的 this、call、apply 和 bind]: https://juejin.im/post/5b9f176b6fb9a05d3827d03f
