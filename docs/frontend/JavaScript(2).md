# JS 基础知识(2)--重要概念

[[toc]]

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

在上面的代码中,inVariable只在output函数内声明，在全局作用域下没有声明；
所以只在函数内可以正常调用，在全局调用会报错。

通俗的讲，**作用域就是查找变量的地方**。作用域最大的用处之一是隔离变量，不同作用域下同名变量不会有冲突。

在ES5中，只有**函数作用域**以及**全局作用域**两种作用域。ES6新增加了**块级作用域**。

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

(此处有图)

- 区域1为全局作用域，有标识符foo
- 区域2为foo作用域，有标识符a,b,bar
- 区域3为bar作用域，有标识符c

值得注意的是，块语句(也就是大括号`{}`中的语句)，例如`if`和`switch`，不像函数，他们不会创建一个新的作用域。

```js
// 'if' 条件语句块不会创建一个新的作用域
if (true) {
  var name = 'harry';       // name 依然在全局作用域中
}
console.log(name);          // harry
```

### 块级作用域

块级作用域是ES6中新添加的特性，可以通过`const`和`let`命令声明，所声明的变量在指定块的作用域以外无法被访问。块级作用域在如下情况被创建：

- 在一个函数内部
- 在一个代码块(也就是大括号`{}`)内部

## 参考出处

1. [Ice_shou的掘金文章-作用域](https://juejin.im/post/5afb0ae56fb9a07aa2138425)
2. [浪里行舟的的掘金文章-作用域](https://juejin.im/post/5c8290455188257e5d0ec64f)
3. [Ice_shou的掘金文章-闭包详解一](https://juejin.im/post/5b081f8d6fb9a07a9b3664b6)
4. [Ice_shou的掘金文章-闭包详解二](https://juejin.im/post/5b167b476fb9a01e5b10f19b)
5. [掘金yck小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
6. [神三元掘金文章-原生JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-38)
