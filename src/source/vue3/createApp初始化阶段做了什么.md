### createApp

Vue2 中，通过 new Vue() 构建实例，并执行 .mount 完成 Dom 挂载。

而 Vue3 中，用 createApp 代替了 new Vue() 的方式，用函数创建实例替代构造函数，为什么要这样设计，先来看看 createApp 内部做了什么

1.
