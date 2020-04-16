# JS 基础--原型、面向对象、new

[[toc]]

## 原型

### 原型对象与构造函数

在 js 中，每创建一个函数 A（就是声明一个函数），浏览器就会自动的创建一个对象 B。函数 A 的 prototype 属性指向对象 B（也就是`A.prototype === B`）。这个对象 B 就是函数 A 的原型对象，简称函数的原型。原型对象 B 默认有一个属性 constructor 指向函数 A（也就是`B.constructor === A`）。

当函数经过 new 调用，这个函数就变成了构造函数。构造函数会返回一个实例对象。实例对象会有一个`__proto__`属性，指向构造函数的原型对象。  
设上面的构造函数 A 生成了实例函数 C，那么`C.__proto__ === B`，也就是`C.__proto__ === A.prototype`。

更一般的，每一个对象都有`__proto__`属性，都指向其构造函数的原型对象。

这个关系可以用这张图来说明：

![11](https://pic2.zhimg.com/80/v2-e722d5325f7d4215169f1d04296e0f89_720w.jpg)

代码示例：

```js
function Person(nick, age) {
  this.nick = nick;
  this.age = age;
}
Person.prototype.sayName = function () {
  console.log(this.nick);
};

var p1 = new Person("Byron", 20);
var p2 = new Person("Casper", 25);

p1.sayName(); // Byron
p2.sayName(); // Casper

p1.__proto__ === Person.prototype; //true
p2.__proto__ === Person.prototype; //true
p1.__proto__ === p2.__proto__; //true

Person.prototype.constructor === Person; //true
```

### 原型链

有一个实例对象 A；  
`let B = A.__proto__;`此时 B 是 A 的原型对象，也可以称父对象；  
`let C = B.__proto__;`此时 C 是 B 的原型对象，是 A 的祖对象；  
如此还可以继续向上指向，直到指向 Object 对象为止:

```js
Object.prototype.__proto__ === null;
```

这种通过`__proto__`一直向上指向父对象，形成一个原型指向的链条，就是**原型链**。

如果试图引用对象的某个属性或方法，会首先在该对象上寻找该属性。**如果没有发现，会在他的原型对象上寻找**，再找不到的话会再在原型对象的原型对象上寻找，依次向上，直到 null 为止。

示例：

```js
var arr = [1, 2, 3];

//则arr 的原型链为：
// arr ---> Array.prototype ---> Object.prototype ---> null
```

### 概念总结

- `prototype` 和 `__proto__`

  - 每个对象都有一个`__proto__`属性，并且指向它的`prototype`原型对象;
  - 每个构造函数都有一个`prototype`原型对象;
  - `prototype`原型对象里的`constructor`指向构造函数本身。

- 原型链

  - 每个对象都有一个`__proto__`，它指向它的`prototype`原型对象;
  - 而`prototype`原型对象又具有一个自己的`prototype`原型对象，就这样层层往上直到一个对象的原型`prototype`为`null`停止;
  - 这个查询的路径就是原型链。

## 面向对象

### 创建对象

有三种方法可以创建对象。代码示例请见：

```js
// 第一种，手动创建
// 手动创建的对象，其父对象为Object
// 也就是  a1.__proto__ === Object.prototype
var a1 = { name: "lala" };

// 第二种，构造函数
function A2() {
  this.name = "lala";
}
var a2 = new A2();

// 第三种，class (ES6标准写法)
class A3 {
  constructor() {
    //super();此处没有使用extends显式继承，不可使用super()
    this.name = "lala";
  }
}
var a3 = new A3();
//其实后面两种方法本质上是一种写法
```

### 查看对象原型

除了使用对象的`__proto__`属性查看原型对象以外，ES6 新增加了`Object.getPrototypeOf()`方法来获取原型。推荐使用新的方法。代码示例如下：

```js
function A() {
  this.name = "lala";
}
var a = new A();

// 传统方法
console.log(a.__proto__);
// 推荐使用这种方式获取对象的原型
console.log(Object.getPrototypeOf(a));

console.log(a.__proto__ === Object.getPrototypeOf(a));
// true
```

### 确定原型和实例的关系

有两种方法可以确定原型和实例的关系。

- `instanceof`操作符。操作符前为待测的实例，操作符后为目标类型。只要待测实例的原型链上有目标类型，就会返回`true`;
- `isPrototypeOf()`方法。该方法返回`true`的规则与`instanceof`一致。

代码示例如下：

```js
function Father() {
  this.property = true;
}
function Son() {
  this.sonProperty = false;
}
//继承 Father
Son.prototype = new Father();

var instance = new Son();

// 实例对象 instance 既属于 Object，也属于 Father，也属于 Son
console.log(instance instanceof Object); //true
console.log(instance instanceof Father); //true
console.log(instance instanceof Son); //true

console.log(Object.prototype.isPrototypeOf(instance)); //true
console.log(Father.prototype.isPrototypeOf(instance)); //true
console.log(Son.prototype.isPrototypeOf(instance)); //true
```

### 确定属性和实例的关系

- 使用对象的`hasOwnProperty()`方法可以检查对象**自身**是否有某个属性;  
  注意：`hasOwnProperty()`方法会忽略原型链上的属性！
- 使用`in`可以检查属性是否存在与某个对象中。  
  注意：`in`方法会检查原型链上的属性！

代码示例：

```js
function Father() {
  this.property = true;
}
function Son() {
  this.sonProperty = false;
}
//继承 Father
Son.prototype = new Father();

var instance = new Son();

console.log(instance.hasOwnProperty("sonProperty"));
console.log(instance.hasOwnProperty("property"));
console.log("sonProperty" in instance);
console.log("property" in instance);

//  true
//  false
//  true
//  true
```

### 继承

JS 实现继承有下面几种方式：

- 借助原型链

  - 优点：能够访问到父类的方法和属性
  - 缺点：父类中的属性如果有引用类型，会被所有子类共享

  ```js
  function Parent1() {
    this.name = "parent1";
    this.play = [1, 2, 3];
  }
  function Child1() {
    this.type = "child1";
  }
  Child1.prototype = new Parent1();
  console.log(new Child1());
  ```

- 借助构造函数

  - 优点：父类中的引用类型值独立了
  - 缺点：无法访问父类中的方法
    > 基本思路:即在子类型构造函数的内部调用超类型构造函数.

  ```js
  function Parent2() {
    this.name = "parent2";
  }
  function Child2() {
    Parent2.call(this);
    this.type = "child2";
  }
  console.log(new Child2());
  ```

- 将前两种组合，即组合继承

  - 优点：集合了前两者的优点
  - 缺点：调用了两次构造函数
    > 基本思路: 使用原型链实现对原型属性和方法的继承,通过借用构造函数来实现对实例属性的继承.

  ```js
  function Parent3() {
    this.name = "parent3";
    this.play = [1, 2, 3];
  }
  function Child3() {
    Parent3.call(this); //  第一次使用
    this.type = "child3";
  }
  Child3.prototype = new Parent3(); //  第二次使用
  var s3 = new Child3();
  var s4 = new Child3();
  s3.play.push(4);
  console.log(s3.play, s4.play);
  ```

- 寄生组合继承

  - 优点：ES5 条件下最完美的继承
  - 缺点：不如 ES6
    > 基本思路：不必为了指定子类型的原型而调用超类型的构造函数

  ```js
  function Parent5() {
    this.name = "parent5";
    this.play = [1, 2, 3];
  }
  function Child5() {
    Parent5.call(this);
    this.type = "child5";
  }
  Child5.prototype = Object.create(Parent5.prototype);
  Child5.prototype.constructor = Child5;
  ```

- ES6 新增的 Class 和 extends 关键字

### Class

#### 基础

在 ES5 时代，JS 想要实现面向对象还是很繁琐的。  
ES6 新增加了 Class（类）这个概念以及`class` 关键字，用来定义类。  
`class`是原型的一个语法糖。他让对象原型的写法更加清晰、更像面向对象编程的语法。

这一部分的详细内容请参考[阮一峰的 class 部分]内容，我这里不再赘述，只在此列出大纲和重要结论，详细内容可以到阮老师的文章中学习。

- 在生成类的实例时，必须使用`new`命令生成实例，不能直接调用。
- 与 ES5 一样，实例的属性除非显示的定义在本身（即定义在 this 对象上），否则都是定义在原型上（即定义在 class 上）。
- 与 ES5 一样，一个类的所有实例共享一个原型对象。
- 和 java 类似，可以使用 get 和 set 关键字拦截某个属性的存取行为。
- class 中的方法加上 static 关键字就变成静态方法。静态方法属于这个类而不是属于实例。
- 类可以用表达式的形式定义。

#### constructor 方法

`constructor`方法是类的默认方法。通过`new`命令生成对象实例时，会自动调用这个方法。

一个类**必须**有`constructor`方法。如果没有显示定义，一个空的`constructor`方法会被默认添加。

代码示例：

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }
}

// 报错
var point = Point(2, 3);

// 正确
var point = new Point(2, 3);
```

#### extends

class 可以使用 extends 关键字进行继承。虽然本质上还是语法糖，但是可写性和可读性都大幅提升。

这一部分的详细内容请参考[阮一峰的 class 继承部分]内容，我这里不再赘述，只在此列出大纲和重要结论，详细内容可以到阮老师的文章中学习。

- 子类必须在 `constructor` 方法中调用 `super` 方法，否则新建实例时会报错。  
  因为子类自己的 this 对象，必须首先通过父类的构造函数完成塑造，得到父类的属性和方法，然后再由子类加上自己的属性和方法。不调用 `super` 方法，子类就得不到 this 对象。
- 在子类的构造函数中，必须调用 `super` 之后，才能够使用 this 关键字。
- super 关键字既可以当函数使用，也可以当对象使用。
  - 当函数使用时，代表调用父类的构造函数。由于上面的原因，子类中必须执行一次 `super()`函数。
    - `super()`函数虽然是父类的构造函数，返回的是子类的实例。
    - `super()`函数只能在子类的构造函数中运行。
  - 当作对象使用时，代表父类的原型对象。

## new

新创建对象实例的时候，都需要用到 new 关键字。

在使用 new 关键字时会进行如下的操作：

> - 创建一个空的对象`{}`;
> - 利用原型链，设置这个新对象的父类为构造函数的原形对象;
> - 将第一步的对象作为构造函数执行时 this 的上下文;
> - 如果构造函数没有返回对象，则返回 this。

代码示例：

设有如下代码：

```js
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}

Car.prototype = {
  getMake: function () {
    return this.make;
  },
};

var car = new Car("Eagle", "Talon TSi", 1993); // 利用new关键字创建了实例car
car.getMake();
```

下面根据 new 关键字的原理，解析一下`var car = new Car("Eagle", "Talon TSi", 1993);`这一行代码：

```js
// 1. 新建一个对象
var obj = {};
// 2. 挂载新对象的原形到构造函数的原型对象上
obj.__proto__ = Car.prototype;
// 3.指定第一步的新对象为构造函数this的上下文
Car.apply(obj, ["Eagle", "Talon TSi", 1993]);
// 4.返回this
var car = obj;
```

## 参考出处

1. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bed40d951882545f73004f6)
2. [神三元-原生 JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-28)
3. [路易斯-JS 原型链与继承别再被问倒了](https://juejin.im/post/58f94c9bb123db411953691b)
4. [拉丁吴-JavaScript 原型详解](https://juejin.im/post/57f336a9816dfa00568f300c)
5. [石头-说说原型（prototype）、原型链和原型继承](https://zhuanlan.zhihu.com/p/35790971)
6. [阮一峰的 Class 部分]
7. [阮一峰的 Class 继承部分]
8. [new 运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)
9. [若川-能否模拟实现 JS 的 new 操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)
10. [yck-聊聊 new 操作符](https://juejin.im/post/5c7b963ae51d453eb173896e)
11. [快狗打车前端团队-js 基础之 new 关键字知多少](https://juejin.im/post/5e858da8518825739837afcf)

[阮一峰的 class 部分]: https://es6.ruanyifeng.com/#docs/class
[阮一峰的 class 继承部分]: https://es6.ruanyifeng.com/#docs/class-extends
