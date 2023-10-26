  // 封装promise
  class Promise {
    constructor(exector) {
      this.PromiseState = 'pending';
      this.PromiseResult = null;
      this.callbacks = [];
      // 保存实例对象的this值
      const self = this;
      // resolve函数
      function resolve(data) {
        // 「Q2」
        if (self.PromiseState !== 'pending') return
        // 1、修改对象状态「promiseState」
        self.PromiseState = 'fulfilled';
        // 2、设置对象结果值「promiseResult」
        self.PromiseResult = data;
        // 异步任务then方法怎么实现「Q3」
        // if (self.callback.onResolved) {
        //   self.callback.onResolved(data);
        // }
        // 「Q4」
        // 
        setTimeout(() => {
          self.callbacks.forEach(item => {
            item.onResolved(data);
          })
        })
      }
      // reject函数
      function reject(data) {
        if (self.PromiseState !== 'pending') return
        // 1、修改对象状态「promiseState」
        self.PromiseState = 'rejected';
        // 2、设置对象结果值「promiseResult」
        self.PromiseResult = data;
        // 异步任务then方法怎么实现「Q3」
        // if (self.callback.onRejected) {
        //   self.callback.onRejected(data);
        // }
        // 「Q4」
        setTimeout(() => {
          self.callbacks.forEach(item => {
            item.onRejected(data);
          })
        })
      }
      // 同步调用「执行器函数」
      // 「Q1」
      try {
        exector(resolve, reject);
      } catch (e) {
        reject(e);
      }
    }
    then(onResolved, onRejected) {
      let self = this;
      // 判断回调函数参数 不传reject的情况
      if (typeof onRejected !== 'function') {
        onRejected = reason => {
          throw reason
        }
      }
      if (typeof onResolved !== 'function') {
        onResolved = value => value;
      }
      return new Promise((resolve, reject) => {
        //  封装函数
        function callback(type) {
          try {
            let result = type(self.PromiseResult);
            if (result instanceof Promise) {
              result.then(v => {
                resolve(v);
              }, r => {
                reject(v);
              })
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e)
          }
        }
        // 怎么使用then方法执行回调
        // 「Q5」
        // 调用回调函数 PromiseState
        if (this.PromiseState  === 'fulfilled') {
          // 获取回调函数的执行结果
          // 回调函数异步执行
          setTimeout(() => {
            callback(onResolved)
          })
        }
        if (this.PromiseState === 'rejected') {
          // 回调函数异步执行
          setTimeout(() => {
            callback(onRejected)
          })
        }
        // 异步任务then方法怎么实现「Q3」
        if (this.PromiseState === 'pending') {
          // 保存回调函数
          // this.callback = {
          //   onResolved,
          //   onRejected
          // }
          // 「Q4」
          // // 异步任务then的返回结果「Q5」
          this.callbacks.push({
            // onResolved,
            // onRejected
            onResolved: function() {
              callback(onResolved)
            },
            onRejected: function() {
              callback(onRejected)
            }
          })
        }
      })
    }
    catch(onRejected) {
      return this.then(undefined, onRejected)
    }
    // 添加resolve方法 不属于实例对象，属于类
    static resolve(value) {
      return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
          value.then(v => {
            resolve(v)
          }, r => {
            reject(r)
          })
        } else {
          resolve(value)
        }
      })
    }
    // 添加reject方法
    static reject(reason) {
      return new Promise((resolve, reject) => {
        reject(reason)
      })
    }
    // 添加all方法
    static all(promises) {
      return new Promise((resolve, reject) => {
        let count = 0;
        let arr = [];
        for (let i = 0; i < promises.length; i ++) {
          promises[i].then(v => {
            count ++;
            arr[i] = v;
            if (count === promises.length) {
              resolve(arr)
            }
          }, r => {
            reject(r)
          })
        }
      })
    }
    // 添加race方法
    static race(promises) {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i ++) {
          promises[i].then(v => {
            resolve(v)
          }, r => {
            reject(r)
          })
        }
      })
    }
  }
  // 使用
  const p1 = Promise.resolve('ok')
  // 使用
  const p2 = Promise.reject('error')
  // 使用
  let p = new Promise((resolve, reject) => {
    // Promise改变状态的三种方式： 1、调用resolve() 2、调用reject()  3、抛出异常throw error
    // 怎么保证Promise的状态只能修改一次「Q2」
    // resolve('ok');
    // reject('error')
    // 怎么捕获这里抛出的异常「Q1」
    // throw 'error'
    // 异步任务then方法怎么实现「Q3」
    // 异步任务then的返回结果「Q5」
    setTimeout(() => {
      resolve('ok');
    }, 1000);
    // 「Q5」同步任务then的返回结果
    // resolve('ok');
  })
  // 异步任务then方法怎么实现「Q3」此时then的回调函数不是在Promise的.then函数里执行的，而是在Promise的resolve函数里执行的
  // p.then(value => {
  //   console.log(value)
  // }, reason => {
  //   console.warn(reason);
  // })
  // 怎么指定多个回调,保证每个回调都能执行「Q4」
  // p.then(value => {
  //   alert(value)
  // }, reason => {
  //   alert(reason);
  // })
  // console.log(p);
  // 同步任务then返回结果「Q5」由then指定的回调函数的执行结果决定
  const res = p.then(value => {
    // console.log(value);
    // return '123'
    return new Promise((resolve, reject) => {
      resolve('res')
    })
  }, reason => {
    console.warn(reason);
  })
  console.log(res);