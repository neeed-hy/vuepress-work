# JS 基础--作用域与闭包

[[toc]]

## 作用域

### 什么是作用域

作用域是在运行时代码中的某些特定部分中变量的可访问性。换句话说，作用域决定了代码区块中变量和其他资源的可见性。再换句话说，作用域是一套规则，用于确定在何处以及如何查找变量（也就是标识符）的规则。

```js
function output() {
  var inVariable = "内层变量";
  console.log(inVariable); // 内层变量
}
output();
console.log(inVariable); // inVariable is not defined
```

在上面的代码中,`inVariable`只在`output`函数内声明，在全局作用域下没有声明；
所以只在函数内可以正常调用，在全局调用会报错。

通俗的讲，**作用域就是查找变量的地方**。作用域最大的用处之一是隔离变量，不同作用域下同名变量不会有冲突。

在`ES5`中，只有**函数作用域**以及**全局作用域**两种作用域。`ES6`新增加了**块级作用域**。

### 全局作用域与函数作用域

#### 全局作用域

在代码中任何地方都能访问到的对象拥有全局作用域。一般来说，以下几种情况拥有全局作用域：

- 最外层函数和在最外层函数外面定义的变量

  ```js
  var outVariable = "我是最外层变量"; //最外层变量
  function outFun() {
    //最外层函数
    var inVariable = "内层变量";
    function innerFun() {
      //内层函数
      console.log(inVariable);
    }
    innerFun();
  }
  console.log(outVariable); //我是最外层变量
  outFun(); //内层变量
  console.log(inVariable); //inVariable is not defined
  innerFun(); //innerFun is not defined
  ```

- 所有未定义直接赋值的变量

  ```js
  function outFun2() {
    variable = "未定义直接赋值的变量";
    var variable2 = "内层变量2";
  }
  outFun2();
  console.log(variable); //未定义直接赋值的变量
  console.log(variable2); //variable2 is not defined
  ```

- window 对象的属性,如`window.name`,`window.location`,`window.top`等等

全局作用域变量会污染全局命名空间，容易引起命名冲突。因此尽量不要使用。

#### 函数作用域

函数作用域，指声明在函数内部的变量。和全局作用域相反，局部作用域一般只在笃定的代码片段内可访问，最常见的例如函数内部：

```js
function doSomething() {
  var testString = "test";
  function innerSay() {
    alert(testString);
  }
  innerSay();
}
alert(testString); //testString is not defined
innerSay(); //innerSay is not defined
```

函数作用域是分层的。内层作用域可以访问外层作用域的变量，反之则不行。

![函数作用域](https://user-gold-cdn.xitu.io/2019/3/8/169590b8c66f551b?imageView2/0/w/1280/h/960/ignore-error/1)

- 区域 1 为全局作用域，有标识符 foo
- 区域 2 为 foo 作用域，有标识符 a,b,bar
- 区域 3 为 bar 作用域，有标识符 c

值得注意的是，块语句(也就是大括号`{}`中的语句)，例如`if`和`switch`，`for`和`while`，不像函数，他们不会创建一个新的作用域。

```js
// 'if' 条件语句块不会创建一个新的作用域
if (true) {
  var name = "harry"; // name 依然在全局作用域中
}
console.log(name); // harry
```

### 块级作用域

块级作用域是`ES6`中新添加的特性，可以通过`const`和`let`命令声明，所声明的变量在指定块的作用域以外无法被访问。块级作用域在如下情况被创建：

- 在一个函数内部
- 在一个代码块(也就是大括号`{}`)内部

块级作用域有以下几个特点：

- 声明变量不会提升到代码块顶部

  `let/const`命令并不会提升到代码块的顶部，必须手动将`let/const`命令放置到顶部，以便让变量在块级作用域下可用。

  ```js
  function getValue(condition) {
    if (condition) {
      // value 在此处可用
      let value = "blue";
      return value;
    } else {
      // value 在此处不可用
      return null;
    }
    // value 在此处不可用
  }
  ```

- 禁止重复申明

  如果如果一个标识符已经在代码块内部被定义，那么在此代码块内在此声明就会产生错误：

  ```js
  let count = 30;
  let count = 40; // Identifier 'count' has already been declared
  ```

  但是在嵌套作用域下可以声明同一个变量：

  ```js
  let count = 30;
  console.log(count); // 30
  if (condition) {
    let count = 40;
    console.log(count); // 40
  }
  ```

- `for`循环中的作用域

  在`for`循环中使用`let`定义的循环变量，只会被限制在循环内。

  ```js
  for (let i = 0; i < 10; i++) {
    // ...
  }
  console.log(i); // ReferenceError: i is not defined
  ```

  如果使用`var`定义，那么结果会不一样：

  ```js
  var a = [];
  for (var i = 0; i < 10; i++) {
    a[i] = function () {
      console.log(i);
    };
  }
  a[6](); // 10
  ```

  上面的代码中，变量`i`是`var`声明的。由于`for`不会创造函数作用域，因此全局只有一个`i`。在执行完循环后，`i`的值变为 10，因此调用`a[i]()`总会输出 10.

  如果使用`let`，声明的变量仅在块级作用域内有效，所以每次循环的 i 都是一个新的`i`，所以最后输出 6.

  ```js
  var a = [];
  for (let i = 0; i < 10; i++) {
    a[i] = function () {
      console.log(i);
    };
  }
  a[6](); // 6
  ```

  此外，`for`循环还有一个特别之处，就是循环变量属于一个作用域，循环体属于一个作用域：

  ```js
  for (let i = 0; i < 3; i++) {
    let i = "abc";
    console.log(i);
  }
  // abc
  // abc
  // abc
  ```

## 自由变量与作用域链

### 自由变量

> 当前作用域没有定义的变量叫做自由变量。

如下所示：

```js
var a = 100;
function fn() {
  var b = 200;
  console.log(a); // 这里的a在这里就是一个自由变量
  console.log(b);
}
fn();
```

### 自由变量的取值

> 自由变量在创建作用域的作用域中取值，而不是在调用作用域的作用域中取值。

这句话在理解上可能有些难度。请看示例代码 1。  
代码中，`fn()`的创建作用域为全局，在全局作用域下`x = 10`，因此最终输出 10 而不是 20：

```js
// 示例代码1
var x = 10
function fn() {
  console.log(x)；
}
function show(f) {
  var x = 20；
  (function() {
    f()                 //10，而不是20
  })()
}
show(fn)
```

下方为示例代码 2。  
在示例代码 2 中，`fn()`返回`bar()`并赋值给`x`。  
`x`在执行时，需要找到`a`与`b`的值进行相加。  
在寻找`b`的值时，首先在创建`bar()`的作用域，也就是`fn()`中寻找 b 的值，而不是在创建`x`的作用域也就是全局作用域中寻找 b 的值。  
而在寻找`a`的值时,无法在`fn()`作用域中找到，继续向上，在创建`fn()`的作用域也就是全局作用域下找到`a`的值，所以最终结果输出 30。

```js
// 示例代码2
var a = 10;
function fn() {
  var b = 20;
  function bar() {
    console.log(a + b); //30
  }
  return bar;
}
var x = fn();
var b = 200;
x(); //bar()
```

### 作用域链

正如上文所述，函数在本作用域没有找到变量，就会向上一层一层寻找，直到找到全局作用域，如果还没找到，就宣布放弃。这种一层一层的关系，就是作用域链。

```js
var a = 100;
function F1() {
  var b = 200;
  function F2() {
    var c = 300;
    console.log(a); // 自由变量，顺作用域链向父作用域找
    console.log(b); // 自由变量，顺作用域链向父作用域找
    console.log(c); // 本作用域的变量
  }
  F2();
}
F1();
```

## 执行上下文

有篇文章写的很好，请见[这里](https://juejin.im/post/5ba32171f265da0ab719a6d7#heading-1)。目前在各种文章中少有提及到上下文的，因此暂时只放一个参考文献在此，未来再做精读。

### 作用域与执行上下文

> 执行上下文在运行时确定，随时可能改变；作用域在定义时就确定，并且不会改变。

一个作用域下可能包含若干个上下文环境。  
有可能从来没有过上下文环境（函数从来就没有被调用过）；  
有可能有过，现在函数被调用完毕后，上下文环境被销毁了；  
有可能同时存在一个或多个（闭包）。  
**同一个作用域下，不同的调用会产生不同的执行上下文环境，继而产生不同的变量的值。**

## 闭包

### 什么是闭包

闭包概念紧跟作用域概念而来。

《JavaScript 高级程序设计》中描述如下：

> 闭包指有权访问另一个函数作用域的函数。

《JavaScript 权威指南》中描述如下：

> 从技术上讲，所有 JavaScript 函数都是闭包：他们都是对象，都关联到作用域链。

《你不知道的 JavaScript》中描述如下：

> 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

个人认为第一种描述比较容易理解。

下面来看几组样例代码

```js
// 样例代码1
function fn1() {
  var name = "iceman";
  function fn2() {
    console.log(name); // iceman
  }
  fn2();
}
fn1();
```

样例代码 1 中，`fn2()`就是一个闭包，他访问到了 fn1()中的变量,成功输出了`iceman`。

```js
// 样例代码2
function fn1() {
  var name = "iceman";
  function fn2() {
    console.log(name); // iceman
  }
  return fn2;
}
var fn3 = fn1();
fn3();
```

样例代码 2 中对闭包的展示更为清晰：

- `fn2`能访问到`fn1`的作用域
- `fn2`被`fn1`返回
- `fn3`是`fn1`的执行结果，也就是`fn2`的引用
- 执行`fn3`，实际上就是执行了`fn2`，他访问到了`fn1`中的变量，成功输出了`iceman`。

是不是只有返回函数才算是产生了闭包呢？

并不一定。对函数值的传递可以通过其他的方式，并不一定值有返回该函数这一条路。闭包的核心是对上一级作用域的访问。因此只要让上一级作用域存在即可：

```js
// 样例代码3
var f3;
function f1() {
  var a = 2;
  f3 = function () {
    console.log(a); // 2
  };
}
f1();
f3();
```

在样例代码 3 中，`f1`执行后，`f3`被赋值，此时`f3`拥有了**f3、f1、全局作用域的访问权限**。逐层向上查找，最后输出 2。

```js
// 样例代码4
var name = "world";
function fn1() {
  var name = "hello";
  function fn2() {
    console.log("fn2:" + name); // fn2:hello
  }
  fn3(fn2);
}
function fn3(fn) {
  fn();
  console.log("fn3:" + name); //  fn3:world
}
fn1();
```

样例代码 4 详解：

- `fn1`执行后，将`fn2`作为参数传给`fn3`；
- `fn3`执行了作为参数传进来的`fn2`；
- `fn2`在输出变量`name`时，逐层向上查找，最终在定义`fn2`的作用域也就是`fn1`作用域找到，输出`hello`；
- `fn3`自身在输出`name`时逐层向上查找，最终在定义`fn3`的作用域也就是全局作用域找到，输出`world`。

样例代码 4 中的变量查询过程都是在**创建作用域而不是调用作用域**中查找。这体现了作用域链以及闭包的性质。

### 闭包的展现形式

- 返回一个函数--见上文中的样例代码 2
- 作为函数参数传递--见上文中的样例代码 4
- 回调函数--在任何异步中，只要是用了回调函数，实际上都是在使用闭包。
- IIFE(立即执行函数表达式)创建闭包，保存了全局作用域以及当前函数作用域

  ```js
  var a = 2;
  (function IIFE() {
    console.log(a); // 输出2
  })();
  ```

### 经典问题之循环输出问题

下面的代码会输出什么？为什么？

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i); //  全部输出6
  }, 0);
}
```

**解析：**
`setTimeout`是异步函数。在执行该函数时，外部循环已经执行完毕。由于`for`不会创作用域，所以使用`var`定义的变量`i`实际上是在全局作用域下的，因此只有一个`i`。在执行`setTimeout`时，向上寻找变量`i`，在全局作用域下找到`i = 6`，因此全部输出 6。

解决方法：

- 使用闭包。当每次循环时，将此时的变量 i 作为参数传入,这样作用域便被保存下来，可以正确输出。

```js
for (var i = 1; i <= 5; i++) {
  (function (j) {
    setTimeout(function timer() {
      console.log(j);
    }, 0);
  })(i);
}
```

- 给定时器传入第三个参数, 作为`timer`函数的第一个函数参数

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(
    function timer(j) {
      console.log(j);
    },
    0,
    i
  );
}
```

- 使用`let`来定义循环变量`i`。`let`声明的变量仅在块级作用域内有效，所以每次循环的`i`都是一个新的`i`，所以最后正确输出.

```js
for (let i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i);
  }, 0);
}
```

## 参考出处

1. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
2. [神三元-原生 JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-38)
3. [Ice_shou-作用域](https://juejin.im/post/5afb0ae56fb9a07aa2138425)
4. [浪里行舟的-作用域](https://juejin.im/post/5c8290455188257e5d0ec64f)
5. [Ice_shou-闭包详解一](https://juejin.im/post/5b081f8d6fb9a07a9b3664b6)
6. [Ice_shou-闭包详解二](https://juejin.im/post/5b167b476fb9a01e5b10f19b)
7. [子非-上下文](https://juejin.im/post/5ba32171f265da0ab719a6d7#heading-1)
