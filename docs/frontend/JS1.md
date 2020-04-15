# JS 基础--数据类型与数据结构

[[toc]]

## 数据类型概念

### JS 有哪些原始数据类型，有哪些引用数据类型

原生 JS 有 7 种原始数据类型：

- string
- number
- boolean
- null
- undefined
- symbol
- bigint

除去以上 7 种原始数据类型，其他的都是引用数据类型，也就是对象，包括普通对象 Object，数组对象 Array，正则对象 RegExp，日期对象 Date，数学函数 Math，函数对象 Function。

原始数据类型存储的是值，对象存储的是地址，指针。

string 是不可变的。  
number 是浮点数。所以有可能出现精度问题。  
null 是基础数据类型，不是对象。所以`typeof`在此处不安全。  
symbol 使用函数 symbol()生成，用的不多，用来生成唯一不可变标识，不参与属性名的遍历。

对象作为参数传入，修改参数内容时，函数外该对象也会发生变化。

### 下面的这段代码执行的结果是什么

```js
function test(person) {
  person.age = 26;
  person = {
    name: "hzj",
    age: 18,
  };
  return person;
}
const p1 = {
  name: "fyq",
  age: 19,
};
const p2 = test(p1);
console.log(p1); // -> p1：{name: “fyq”, age: 26}
console.log(p2); // -> p2：{name: “hzj”, age: 18}
```

::: tip 原因
p1 作为参数传进 test，在函数内第一行他的 age 发生了改变。随后，person 变为另一块内存的指针，并返回，赋给 p2.
:::

### `'1'.toString()`为什么可以调用

`'1'`是字符串，属于基本数据类型。基本数据类型存储的都是值，并没有函数可以调用。

之所以可以调用，是因为类似于**基本包装类型**的行为(**基本包装类型**：每当读取一个基础数据类型的时候，会创建一个对应的基本包装类型的对象，从而能够调用一些方法来操作数据。JS 的基本包装类型有 String、Number、Boolean)。

在执行`'1'.toString()`时，执行了下列操作：

```js
var s = new Object("1");
s.toString();
s = null;
```

解释一下整个过程：

- 创建 Object 类实例。注意为什么不是 String ？ 由于 Symbol 和 BigInt 的出现，对它们调用 new 都会报错，目前 ES6 规范也不建议用 new 来创建基本类型的包装类。
- 调用实例方法。
- 方法执行完毕后，销毁实例。

### 0.1 + 0.2 为什么不等于 0.3，1 + 2 为什么等于 3

0.1 和 0.2 在转换成 2 进制后会无限循环，由于精度的限制多余的位数会被截掉，产生精度损失。两者相加后再转换成 10 进制后便不等于 0.3.

1 和 2 在进制转换中不会损失精度，所以相加后会等于 3.

实际开发中，没有办法控制数字进制转化的精度，所以要谨记：

**JS 中的 number 是浮点数,有可能出现精度问题。涉及到数字运算和数字传输的地方要谨慎处理。**

### BigInt

#### 什么是 BigInt，为什么使用 BigInt

> BigInt 是一种新的基本数据类型，用于整数值大于 number 数据类型支持的范围的情况下。

JS 中的 number 是双精度 64 位浮点数。他无法表示特别大的整数，会将其四舍五入,同时也会存在安全问题。例如：

```js
console.log(9999999999999999999); // =>10000000000000000000
9007199254740992 === 9007199254740993; // => true
```

#### 使用 BigInt

创建 BigInt 在数字末尾追加 n,或者使用 BigInt()构造函数：

```js
var s1 = 9007199254740995n;
var s2 = BigInt("9007199254740995");
console.log(typeof s1); // => bigint
console.log(typeof s2); // => bigint
```

注意：**不允许 BigInt 和 Number 之间混合操作。**

```js
10 + 10n; // => TypeError
```

#### 浏览器兼容性

目前没有全部兼容，只有 chrome67、firefox、Opera 等支持。

## 数据类型检测

### `typeof`

对于除了`null`以外的原始数据类型，`typeof`可以显示出正确的类型。`typeof null`会输出`object`，这是一个历史悠久的 BUG。

```js
typeof 1; // 'number'
typeof "1"; // 'string'
typeof undefined; // 'undefined'
typeof true; // 'boolean'
typeof Symbol(); // 'symbol'
typeof null; // 'object'
```

但是对于引用类型，除了函数以外，`typeof`都只会输出`object`

```js
typeof []; // 'object'
typeof {}; // 'object'
typeof console.log; // 'function'
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
    return typeof x === "number";
  }
}
console.log(111 instanceof PrimitiveNumber); // true
```

`Symbol.hasInstance()`是一个让我们能够自定义`instanceof`行为的东西，具体的解释请见[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)。

#### 手动实现`instanceof`

核心: 原型链的向上查找。

```js
function myInstanceof(left, right) {
  //基本数据类型直接返回false
  if (typeof left !== "object" || left === null) return false;
  //getProtypeOf是Object对象自带的一个方法，能够拿到参数的原型对象
  let proto = Object.getPrototypeOf(left);
  while (true) {
    //查找到尽头，还没找到
    if (proto == null) return false;
    //找到相同的原型对象
    if (proto == right.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}
```

## 数据类型转换

### 类型转换

JS 类型转换只有三种情况：

- 转 boolean
- 转数字
- 转字符串

具体的转换规则如下：
![转换规则图片](https://user-gold-cdn.xitu.io/2019/10/20/16de9512eaf1158a?imageView2/0/w/1280/h/960/format/png/ignore-error/1)

### `==`和`===`的区别

`===`叫做严格相等，是指：左右两边不仅值要相等，类型也要相等.  
例如'1'===1 的结果是 false，因为一边是 string，另一边是 number。

`==`没有`===`那么严格，对于一般情况，只要两者值相等，就返回`true`。`==`的执行规则如下：

- 首先判断两者类型是否相同，如果相同，那么执行`===`
- 再判断是否是`null`和`undefined`在进行比较。如果是，返回`true`
- 如果是其他数据类型，要进行类型转换：
  - 判断类型是否是`string`和`number`，如果是，将`string`转化成`number`
  - 判断一方是否是`boolean`，如果是，将`boolean`转化为`number`
  - 判断一方是否是`object`，如果是，将其转换成基本类型，一般转换成字符串或者数字，取决于另外一个对比量的类型。如果转化成字符串，转换的结果是`[object Object]`。

### `Object.is()`

ES6 中的新方法，基本上就是`===`。和`===`不同的地方有两点，也就是+0 和-0，NaN 和 NaN：

```js
// 使用 '==='
+0 === -0; //true
NaN === NaN; // false
// 使用 Object.is()
Object.is(+0, -0); // false
Object.is(NaN, NaN); // true
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
    return "5";
  },
  [Symbol.toPrimitive]() {
    return 6;
  },
};
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
1 + "1"; // '11'
true + true; // 2
4 + [1, 2, 3]; // "41,2,3"
```

其他种类运算，会将双方转化成数字。

```js
"4" * "3"; // 12
4 * []; // 0
4 * [1, 2]; // NaN
```

## 数据结构

JS 中原生数据结构大体可以分成三类：

- 索引集合类，也就是数组 Array 以及其衍生 TypedArray。
- 键值对集合类，也就是 Map 以及 Set。这两种数据结构都是 ES6 新增加的。
- 结构化数据，也就是 JSON。

数组类型由于过于重要，单独开篇，在此主要介绍一下后两者。

以下内容的主要参考资料是[阮一峰的 Set 和 Map 数据结构]部分，在此不再赘述，只列出大纲和重要结论，具体细节可以在阮老师的网站中学习。

### Set

#### Set 基本用法

- Set 类似于数组，但是成员的值都是唯一的，没有重复的值。
- Set 本身是一个构造函数，接受一个数组（或拥有 Iterator 接口的数据结构）作为参数来进行初始化。
- Set 内部判断两个值是否相等使用的是一种类似于`===`的专有算法，和`===`的主要区别在于该算法认为所有的`NaN` 都一样，一个 Set 内只会有一个`NaN`。
- 两个对象总是不相等的，哪怕他们的键值对都一样。

#### Set 实例的属性和方法

Set 实例有以下属性：

- `Set.prototype.constructor`：构造函数，默认就是 Set 函数。
- `Set.prototype.size`：返回 Set 实例的成员总数。

Set 实例有以下方法：

- `Set.prototype.add(value)`：添加某个值，返回 Set 结构本身。
- `Set.prototype.delete(value)`：删除某个值，返回一个布尔值，表示删除是否成功。
- `Set.prototype.has(value)`：返回一个布尔值，表示该值是否为 Set 的成员。
- `Set.prototype.clear()`：清除所有成员，没有返回值。

`Array.from()`方法可以将 Set 结构转为数组。可以利用这个方法进行数组去重。

#### Set 的遍历

Set 的**遍历顺序就是插入顺序**。Set 实例有四个遍历方法：

- `Set.prototype.keys()`：返回键名的遍历器
- `Set.prototype.values()`：返回键值的遍历器
- `Set.prototype.entries()`：返回键值对的遍历器
- `Set.prototype.forEach()`：使用回调函数遍历每个成员

由于 Set 结构没有键名，只有键值，因此`keys()`和`values()`的行为是一致的。

Set 结构默认实现了 Iterator 接口，因此更好的方法是使用`for ... of`循环进行遍历。

### WeakSet

#### WeakSet 概念

与 Set 结构类似，也是不重复的值的集合。它与 Set 的区别在于：

- WeakSet 的成员都是对象。
- WeakSet 中的对象都是**弱引用**，即**垃圾回收机制不考虑 WeakSet 对该对象的引用**。

解释一下第二条：

设 WeakSet 中有一个成员对象 obj 。如果再没有其他对象引用 obj，那么垃圾回收机制就会自动回收这段内存，不考虑 WeakSet 中对 obj 的引用。

基于这个特点，WeakSet 中的成员可能会随时消失，是不适合引用的。WeakSet 也不能够遍历。

#### WeakSet 基本用法

- WeakSet 是一个构造函数，接收一个数组或类数组的结构作为参数。该参数数组的所有成员都会成为 WeakSet 实例的成员。
- 注意**是参数数组的成员**而**不是参数数组本身**加入 WeakSet 实例。因此参数数组必须是一个对象数组。

#### WeakSet 实例的属性和方法

- `WeakSet.prototype.add(value)`：向 WeakSet 实例添加一个新成员。
- `WeakSet.prototype.delete(value)`：清除 WeakSet 实例的指定成员。
- `WeakSet.prototype.has(value)`：返回一个布尔值，表示某个值是否在 WeakSet 实例之中。

### Map

JS 中的对象 Object 也是键值对结构。但是 Object 的键只能是字符串。ES6 中新添加到 Map 数据结构也是键值对结构，但是它的键不再仅限于字符串，可以是各种类型。

也就是说，Object 提供了“字符串-值”这种对应方式，Map 提供了“值-值”这种对应方式。

#### Map 基本用法

- Map 是一个构造函数，接受一个数组或类数组结构作为参数。
- 参数数组中的每一个成员都应该是双元素成员，代表`key-value`。少于两个元素，缺失的元素会变成`undefined`;多于两个元素，多出来的会被省略。
- 如果对同一个键多次赋值，后面的值将覆盖前面的值。
- 如果读取一个未知的键，则返回`undefined`。
- 如果键是原始数据类型，那么使用`===`来对键是否相等进行判断。
- 和 Set 类似，Map 中也只能有一个 NaN 键。
- 如果键是对象，那么只有对同一个对象的引用，Map 结构才将其视为同一个键，哪怕这两个对象结构完全一样。Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。

#### Map 实例的属性和方法

- `Map.prototype.constructor`：构造函数，默认就是 Map 函数。
- `Map.prototype.size`：返回 Map 实例的成员总数。

Map 实例有以下方法：

- `Map.prototype.set(key, value)`：添加某个值，返回整个 Map 结构。如果 key 已经有值，则键值会被更新，否则就新生成该键。
- `Map.prototype.get(key)`：get 方法读取 key 对应的键值，如果找不到 key，返回 undefined。
- `Map.prototype.has(key)`：返回一个布尔值，表示该值是否为 Map 的成员。
- `Map.prototype.delete(key)`：删除某个值，返回一个布尔值，表示删除是否成功。
- `Map.prototype.clear()`：清除所有成员，没有返回值。

#### Map 的遍历

Map 的**遍历顺序就是插入顺序**。Map 实例有四个遍历方法：

- `Map.prototype.keys()`：返回键名的遍历器
- `Map.prototype.values()`：返回键值的遍历器
- `Map.prototype.entries()`：返回键值对的遍历器
- `Map.prototype.forEach()`：使用回调函数遍历每个成员

Map 结构默认实现了 Iterator 接口，因此更好的方法是使用`for ... of`循环进行遍历。

### WeakMap

#### WeakMap 概念

WeakMap 结构与 Map 结构类似，也是用于生成键值对的集合。区别在于：

- WeakMap 只接受对象作为键名（null 除外），不接受其他类型的值作为键名。
- WeakMap 的**键名**所指向的对象，不计入垃圾回收机制。

### WeakMap 方法

WeakMap 只有四个方法可用：`get()`、`set()`、`has()`、`delete()`。

### JSON

有两个方法：

- `JSON.prase()` 将字符串转换成 JSON 对象。
- `JSON.stringify()` 将 JSON 对象转换成字符串。

## 参考出处

1. [阮一峰的 Set 和 Map 数据结构]
2. [yck 小册](https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdc715f6fb9a049c15ea4e0)
3. [神三元-原生 JS(上篇)](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-38)
4. [BigInt](https://juejin.im/post/5d3f8402f265da039e129574)

[阮一峰的set 和 map 数据结构]: https://es6.ruanyifeng.com/#docs/set-map
