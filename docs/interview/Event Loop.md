# Event Loop

## 题目列表

### 题1

来自[YanceyOfficial][YanceyOfficial]

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}
console.log('script start');
setTimeout(function() {
  console.log('setTimeout');
}, 0);
async1();
new Promise(function(resolve) {
  console.log('promise1');
  resolve();
}).then(function() {
  console.log('promise2');
});
console.log('script end');
```

## 题目总结

## 参考出处

1. [YanceyOfficial的掘金文章-最后一次搞懂 Event Loop][YanceyOfficial]
2. [小美娜娜的掘金文章-Eventloop不可怕，可怕的是遇上Promise][小美娜娜]

[YanceyOfficial]:https://juejin.im/post/5cbc0a9cf265da03b11f3505
[小美娜娜]:https://juejin.im/post/5c9a43175188252d876e5903
