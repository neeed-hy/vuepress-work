# JS 基础知识(1)--数据类型

[[toc]]

## 概念

### JS有哪些原始数据类型，有哪些引用数据类型

原生JS有7种原始数据类型：

- string
- number
- boolean
- null
- undefined
- symbol
- bigint

除去以上7种原始数据类型，其他的都是引用数据类型，也就是对象，包括普通对象Object，数组对象Array，正则对象RegExp，日期对象Date，数学函数Math，函数对象Function。

原始数据类型存储的是值，对象存储的是地址，指针。

string是不可变的。  
number是浮点数。所以有可能出现精度问题。  
null是基础数据类型，不是对象。所以`typeof`在此处不安全。  
symbol使用函数symbol()生成，用的不多，用来生成唯一不可变标识，不参与属性名的遍历。  

对象作为参数传入，修改参数内容时，函数外该对象也会发生变化。

### 下面的这段代码执行的结果是什么

```js
function test(person) {
  person.age = 26
  person = {
    name: 'hzj',
    age: 18
  }
  return person
}
const p1 = {
  name: 'fyq',
  age: 19
}
const p2 = test(p1)
console.log(p1) // -> p1：{name: “fyq”, age: 26}
console.log(p2) // -> p2：{name: “hzj”, age: 18}
```

::: tip 原因
p1作为参数传进test，在函数内第一行他的age发生了改变。随后，person变为另一块内存的指针，并返回，赋给p2.
:::

### `'1'.toString()`为什么可以调用

`'1'`是字符串，属于基本数据类型。基本数据类型存储的都是值，并没有函数可以调用。

之所以可以调用，是因为类似于**基本包装类型**的行为(**基本包装类型**：每当读取一个基础数据类型的时候，会创建一个对应的基本包装类型的对象，从而能够调用一些方法来操作数据。JS的基本包装类型有String、Number、Boolean)。

在执行`'1'.toString()`时，执行了下列操作：

```js
var s = new Object('1');
s.toString();
s = null;
```

解释一下整个过程：

- 创建Object类实例。注意为什么不是String ？ 由于Symbol和BigInt的出现，对它们调用new都会报错，目前ES6规范也不建议用new来创建基本类型的包装类。
- 调用实例方法。
- 方法执行完毕后，销毁实例。

### 0.1 + 0.2为什么不等于0.3，1 + 2为什么等于3

0.1和0.2在转换成2进制后会无限循环，由于精度的限制多余的位数会被截掉，产生精度损失。两者相加后再转换成10进制后便不等于0.3.

1和2在进制转换中不会损失精度，所以相加后会等于3.

实际开发中，没有办法控制数字进制转化的精度，所以要谨记：

**JS中的number是浮点数,有可能出现精度问题。涉及到数字运算和数字传输的地方要谨慎处理。**

### BigInt

#### 什么是BigInt，为什么使用BigInt

> BigInt是一种新的基本数据类型，用于整数值大于number数据类型支持的范围的情况下。

JS中的number是双精度64位浮点数。他无法表示特别大的整数，会将其四舍五入,同时也会存在安全问题。例如：

```js
console.log(9999999999999999999);       // =>10000000000000000000
9007199254740992 === 9007199254740993;  // => true
```

#### 使用BigInt

创建BigInt在数字末尾追加n,或者使用BigInt()构造函数：

```js
var s1 = 9007199254740995n;
var s2 = BigInt("9007199254740995");
console.log(typeof s1)     // => bigint
console.log(typeof s2)     // => bigint
```

注意：**不允许BigInt和Number之间混合操作。**

```js
10 + 10n;    // => TypeError
```

#### 浏览器兼容性

目前没有全部兼容，只有chrome67、firefox、Opera等支持。

## 检测

### `typeof`

对于除了`null`以外的原始数据类型，`typeof`可以显示出正确的类型。`typeof null`会输出`object`，这是一个历史悠久的BUG。

```js
typeof 1            // 'number'
typeof '1'          // 'string'
typeof undefined    // 'undefined'
typeof true         // 'boolean'
typeof Symbol()     // 'symbol'
typeof null         // 'object'
```

但是对于引用类型，除了函数以外，`typeof`都只会输出`object`

```js
typeof []            // 'object'
typeof {}            // 'object'
typeof console.log   // 'function'
```

因此不应该使用`typeof`用来判断对象数据类型，应该只用于判断原始数据类型。

### `instanceof`

`instanceof`一般用于判断对象类型。通常来说不能用来判断原始数据类型。`instanceof`的原理是基于原型链的查询。

```js
[] instanceof Array                                 //true
{} instanceof Object                                //true
/\d/ instanceof RegExp                              //true

new String('hello world') instanceof String         //true
'hello world' instanceof String                     //false

new Number(1) instanceof Number                     //true
1 instanceof Number                                 //false

console.log(function(){} instanceof Object);        //true
console.log(function(){} instanceof Function);      //true
```

#### `instanceof`判断原始数据类型

如果想让`instanceof`判断原始数据类型，需要手动重写被检测类的`instanceof`方法。例如：

```js
class PrimitiveNumber {
  static [Symbol.hasInstance](x) {
    return typeof x === 'number'
  }
}
console.log(111 instanceof PrimitiveNumber) // true
```

`Symbol.hasInstance()`是一个让我们能够自定义`instanceof`行为的东西，具体的解释请见[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)。

#### 手动实现`instanceof`

核心: 原型链的向上查找。

```js
function myInstanceof(left, right) {
    //基本数据类型直接返回false
    if(typeof left !== 'object' || left === null) return false;
    //getProtypeOf是Object对象自带的一个方法，能够拿到参数的原型对象
    let proto = Object.getPrototypeOf(left);
    while(true) {
        //查找到尽头，还没找到
        if(proto == null) return false;
        //找到相同的原型对象
        if(proto == right.prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
}
```

## 转换

### 类型转换

JS类型转换只有三种情况：

- 转boolean
- 转数字
- 转字符串

具体的转换规则如下：
(这个地方应该放个图，待我研究一下)

### `==`和`===`的区别

`===`叫做严格相等，是指：左右两边不仅值要相等，类型也要相等.  
例如'1'===1的结果是false，因为一边是string，另一边是number。

`==`没有`===`那么严格，对于一般情况，只要两者值相等，就返回`true`。`==`的执行规则如下：

- 首先判断两者类型是否相同，如果相同，那么执行`===`
- 再判断是否是`null`和`undefined`在进行比较。如果是，返回`true`
- 如果是其他数据类型，要进行类型转换：
  - 判断类型是否是`string`和`number`，如果是，将`string`转化成`number`
  - 判断一方是否是`boolean`，如果是，将`boolean`转化为`number`
  - 判断一方是否是`object`，如果是，将其转换成基本类型，一般转换成字符串或者数字，取决于另外一个对比量的类型。如果转化成字符串，转换的结果是`[object Object]`。

### `Object.is()`

ES6中的新方法，基本上就是`===`。和`===`不同的地方有两点，也就是+0和-0，NaN和NaN：

```js
// 使用 '==='
+0 === -0             //true
NaN === NaN           // false
// 使用 Object.is()
Object.is(+0, -0)     // false
Object.is(NaN, NaN)   // true
```

### 对象转换成原始类型

对象转原始类型，会调用内置的`[ToPrimitive]`函数，对于该函数而言，其逻辑如下：

1. 如果`Symbol.toPrimitive()`方法，优先调用再返回
2. 调用`valueOf()`，如果转换为原始类型，则返回
3. 调用`toString()`，如果转换为原始类型，则返回
4. 如果都没有返回原始类型，会报错

可以手动重写`Symbol.toPrimitive()`方法，该方法在转原始类型时调用优先级最高：

```js
var obj = {
  value: 3,
  valueOf() {
    return 4;
  },
  toString() {
    return '5'
  },
  [Symbol.toPrimitive]() {
    return 6
  }
}
console.log(obj + 1); // 输出7
```

### `[] == ![]`结果

`!`操作符的优先级高于==操作符。因此`![]`是一个`boolean`值，为`false`。  
`boolean`在比较中会转化成数字。因此`[]`也会转化成数字。  
`![]`和`[]`转化成数字都是`0`，因此结果为`true`。

### 四则运算

加法运算有两个原则：

- 如果一方为字符串，那么另一方也转换为字符串。
- 如果另一方不是字符串或者数字，那么将它转换成字符串或者数字。
  
```js
1 + '1'           // '11'
true + true       // 2
4 + [1,2,3]       // "41,2,3"
```

其他种类运算，会将双方转化成数字。

```js
'4' * '3'         // 12
4 * []            // 0
4 * [1, 2]        // NaN
```

## 参考出处

1. [掘金yck小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
2. [神三元掘金文章-原生JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-38)
3. [BigInt](https://juejin.im/post/5d3f8402f265da039e129574)
