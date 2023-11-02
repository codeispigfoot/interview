class EventEmiter {
  constructor() {
    this.eventMap = {};
  }
  // 发布者：事件触发 一个事件可能注册多个回调
  on(eventName, callback) {
    let callbacks = this.eventMap[eventName] || [];
    callbacks.push(callback);
    this.eventMap[eventName] = callbacks
  }
  // 订阅者
  emit(eventName, ...args) {
    let callbacks = this.eventMap[eventName];
    callbacks.forEach(cb => {
      cb(...args)
    });
  }
  off(eventName, callback) {
    let callbacks = this.eventMap[eventName];
    let newCallbacks  = callbacks.filter(item => {
      item != callback && item.initialCallback !== callback;
    })
    this.eventMap[eventName] = newCallbacks;
  } 
  once(eventName, callback) {
    const one = (...args) => {
      callback(...args);
      this.off(eventName, one);
    }
    one.initialCallback = callback;
    this.on(eventName, one);
  }
}
let test = new EventEmiter();
test.on('123', (arg)=> {
  console.log('触发123事件,参数是' + arg);
})
test.emit('123', 456)
test.emit('123', 789)