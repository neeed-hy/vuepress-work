# JavaScript 基础知识(２)--重要概念

## 作用域

### 什么是作用域

作用域是在运行时代码中的某些特定部分中变量的可访问性。换句话说，作用域决定了代码区块中变量和其他资源的可见性。再换句话说，作用域是一套规则，用于确定在何处以及如何查找变量（也就是标识符）的规则。

```js
function output() {
    var inVariable = "内层变量";
    console.log(inVariable);       // 内层变量
}
output();
console.log(inVariable);           // inVariable is not defined
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
  var outVariable = "我是最外层变量";       //最外层变量
  function outFun() {                     //最外层函数
      var inVariable = "内层变量";
      function innerFun() {               //内层函数
          console.log(inVariable);
      }
      innerFun();
  }
  console.log(outVariable);               //我是最外层变量
  outFun();                               //内层变量
  console.log(inVariable);                //inVariable is not defined
  innerFun();                             //innerFun is not defined
  ```

- 所有未定义直接赋值的变量

  ```js
  function outFun2() {
    variable = '未定义直接赋值的变量';
    var variable2 = '内层变量2'
  }
  outFun2();
  console.log(variable);          //未定义直接赋值的变量
  console.log(variable2);         //variable2 is not defined
  ```

- window对象的属性,如`window.name`,`window.location`,`window.top`等等

全局作用域变量会污染全局命名空间，容易引起命名冲突。因此尽量不要使用。

#### 函数作用域

函数作用域，指声明在函数内部的变量。和全局作用域相反，局部作用域一般只在笃定的代码片段内可访问，最常见的例如函数内部：

```js
function doSomething(){
    var testString="test";
    function innerSay(){
        alert(testString);
    }
    innerSay();
}
alert(testString);      //testString is not defined
innerSay();             //innerSay is not defined
```

函数作用域是分层的。内层作用域可以访问外层作用域的变量，反之则不行。

![函数作用域](https://user-gold-cdn.xitu.io/2019/3/8/169590b8c66f551b?imageView2/0/w/1280/h/960/ignore-error/1)

- 区域1为全局作用域，有标识符foo
- 区域2为foo作用域，有标识符a,b,bar
- 区域3为bar作用域，有标识符c

值得注意的是，块语句(也就是大括号`{}`中的语句)，例如`if`和`switch`，`for`和`while`，不像函数，他们不会创建一个新的作用域。

```js
// 'if' 条件语句块不会创建一个新的作用域
if (true) {
  var name = 'harry';       // name 依然在全局作用域中
}
console.log(name);          // harry
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
  let count = 40;           // Identifier 'count' has already been declared
  ```

  但是在嵌套作用域下可以声明同一个变量：

  ```js
  let count = 30;
  console.log(count)        // 30
  if (condition) {
    let count = 40;
    console.log(count)      // 40
  }
  ```

- `for`循环中的作用域

  在`for`循环中使用`let`定义的循环变量，只会被限制在循环内。

  ```js
  for (let i = 0; i < 10; i++) {
    // ...
  }
  console.log(i);               // ReferenceError: i is not defined
  ```

  如果使用`var`定义，那么结果会不一样：

  ```js
  var a = [];
  for (var i = 0; i < 10; i++) {
    a[i] = function () {
      console.log(i);
    };
  }
  a[6]();                     // 10
  ```

  上面的代码中，变量`i`是`var`声明的。由于`for`不会创造函数作用域，因此全局只有一个`i`。在执行完循环后，`i`的值变为10，因此调用`a[i]()`总会输出10.

  如果使用`let`，声明的变量仅在块级作用域内有效，所以每次循环的i都是一个新的`i`，所以最后输出6.

  ```js
  var a = [];
  for (let i = 0; i < 10; i++) {
    a[i] = function () {
      console.log(i);
    };
  }
  a[6]();                   // 6
  ```

  此外，`for`循环还有一个特别之处，就是循环变量属于一个作用域，循环体属于一个作用域：

  ```js
  for (let i = 0; i < 3; i++) {
    let i = 'abc';
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
var a = 100
function fn() {
    var b = 200
    console.log(a)      // 这里的a在这里就是一个自由变量
    console.log(b)
}
fn()
```

### 自由变量的取值

> 自由变量在创建作用域的作用域中取值，而不是在调用作用域的作用域中取值。

这句话在理解上可能有些难度。请看示例代码1。  
代码中，`fn()`的创建作用域为全局，在全局作用域下`x = 10`，因此最终输出10而不是20：

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

下方为示例代码2。  
在示例代码2中，`fn()`返回`bar()`并赋值给`x`。  
`x`在执行时，需要找到`a`与`b`的值进行相加。  
在寻找`b`的值时，首先在创建`bar()`的作用域，也就是`fn()`中寻找b的值，而不是在创建`x`的作用域也就是全局作用域中寻找b的值。  
而在寻找`a`的值时,无法在`fn()`作用域中找到，继续向上，在创建`fn()`的作用域也就是全局作用域下找到`a`的值，所以最终结果输出30。

```js
// 示例代码2
var a = 10
function fn() {
  var b = 20
  function bar() {
    console.log(a + b)  //30
  }
  return bar
}
var x = fn(),
  b = 200
x()                     //bar()
```

### 作用域链

正如上文所述，函数在本作用域没有找到变量，就会向上一层一层寻找，直到找到全局作用域，如果还没找到，就宣布放弃。这种一层一层的关系，就是作用域链。

```js
var a = 100
function F1() {
    var b = 200
    function F2() {
        var c = 300
        console.log(a)    // 自由变量，顺作用域链向父作用域找
        console.log(b)    // 自由变量，顺作用域链向父作用域找
        console.log(c)    // 本作用域的变量
    }
    F2()
}
F1()
```

## 执行上下文

有篇文章写的很好，请见[这里](https://juejin.im/post/5ba32171f265da0ab719a6d7#heading-1)。目前在各种文章中少有提及到上下文的，因此暂时只放一个参考文献在此，未来再做精读。

### 作用域与执行上下文

> 执行上下文在运行时确定，随时可能改变；作用域在定义时就确定，并且不会改变。

一个作用域下可能包含若干个上下文环境。有可能从来没有过上下文环境（函数从来就没有被调用过）；有可能有过，现在函数被调用完毕后，上下文环境被销毁了；有可能同时存在一个或多个（闭包）。**同一个作用域下，不同的调用会产生不同的执行上下文环境，继而产生不同的变量的值。**

## 闭包

### 什么是闭包

闭包概念紧跟作用域概念而来。

《JavaScript高级程序设计》中描述如下：

> 闭包指有权访问另一个函数作用域的函数。

《JavaScript权威指南》中描述如下：

> 从技术上讲，所有JavaScript函数都是闭包：他们都是对象，都关联到作用域链。

《你不知道的JavaScript》中描述如下：

> 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

个人认为第一种描述比较容易理解。

## 参考出处

1. [Ice_shou的掘金文章-作用域](https://juejin.im/post/5afb0ae56fb9a07aa2138425)
2. [浪里行舟的的掘金文章-作用域](https://juejin.im/post/5c8290455188257e5d0ec64f)
3. [Ice_shou的掘金文章-闭包详解一](https://juejin.im/post/5b081f8d6fb9a07a9b3664b6)
4. [Ice_shou的掘金文章-闭包详解二](https://juejin.im/post/5b167b476fb9a01e5b10f19b)
5. [子非的掘金文章-上下文](https://juejin.im/post/5ba32171f265da0ab719a6d7#heading-1)
6. [掘金yck小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
7. [神三元掘金文章-原生JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-38)