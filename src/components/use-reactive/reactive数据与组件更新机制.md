### 响应式 API

要理解响应式的实现，要从响应式架构分析，基于数据的变动，自动驱动视图更新，从而使开发者只需要关注数据的变化，而不需要关注 dom 的渲染。核心就是将数据的变动和 DOM 的更新建立关联。

在 Vue2 中，利用 Object.defineProperty API 劫持对象属性，将每一个用组件 Vue 实例构造的 Watcher 监听器(这个监听器包含了组件更新函数)，以达到在组件初始阶段，完成属性对 watcher 的依赖收集的目的，如

此；属性的变动，通知到有相关依赖的组件的 watcher, 以此更新组件本身。

在 Vue3 中用 reactiveEffect 代替了 watcher 类，使得响应式系统变得更加清晰，副作用与响应式数据之间的关系更加明确和直观，得益于 Proxy API 使得数据变动的粒度从属性升级到对象变量，vue 可以构建更清晰的

数据与副作用之间的关系。

```javascript
/** Vue2: src\core\instance\lifecycle.js
 * 伪代码实现如下：
 */
export function mountComponent(vm: Component, el: ?Element, hydrating?: boolean): Component {
    vm.$el = el
    callHook(vm, 'beforeMount')
    let updateComponent = () => { vm._update(vm._render(), hydrating) }
    // 在组件挂载阶段，Watcher实例会收集各个响应式数据的依赖，同样的，当响应式数据的属性变更，notify 也会使得updateComponent函数触发
    new Watcher(
        vm,
        updateComponent,
        noop,
        {
            before() {
                if (vm._isMounted && !vm._isDestroyed) {
                    callHook(vm, 'beforeUpdate')
                }
            },
        },
        true /* isRenderWatcher */
    )
    hydrating = false
    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
}

/** vue3
 * 伪代码实现如下：
 */
const mountComponent: MountComponentFn = (
    initialVNode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace: ElementNamespace,
    optimized,
  ) => {
    // 2.x compat may pre-create the component instance before actually
    // mounting
    const compatMountInstance =
      __COMPAT__ && initialVNode.isCompatRoot && initialVNode.component
    const instance: ComponentInternalInstance =
      compatMountInstance ||
      (initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense,
      ))
    // inject renderer internals for keepAlive
    if (isKeepAlive(initialVNode)) {
      ;(instance.ctx as KeepAliveContext).renderer = internals
    }
    // resolve props and slots for setup context
    if (!(__COMPAT__ && compatMountInstance)) {
      if (__DEV__) {
        startMeasure(instance, `init`)
      }
      setupComponent(instance)
      if (__DEV__) {
        endMeasure(instance, `init`)
      }
    }

    // setup() is async. This component relies on async logic to be resolved
    // before proceeding
    if (__FEATURE_SUSPENSE__ && instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect)

      // Give it a placeholder if this is not hydration
      // TODO handle self-defined fallback
      if (!initialVNode.el) {
        const placeholder = (instance.subTree = createVNode(Comment))
        processCommentNode(null, placeholder, container!, anchor)
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized,
      )
    }

    if (__DEV__) {
      popWarningContext()
      endMeasure(instance, `mount`)
    }
  }
const setupRenderEffect: SetupRenderEffectFn = (instance, initialVNode, container, anchor, parentSuspense, namespace: ElementNamespace, optimized) => {
    const componentUpdateFn = () => {
		/** 组件更新逻辑以及相关阶段的生命周期hook调用 */
		if (
          __COMPAT__ &&
          isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
        ) {
          instance.emit('hook:beforeMount')
        }
        /** ··· */
		 if (
          __COMPAT__ &&
          isCompatEnabled(DeprecationTypes.INSTANCE_EVENT_HOOKS, instance)
        ) {
          queuePostRenderEffect(
            () => instance.emit('hook:mounted'),
            parentSuspense,
          )
        }
    }
    // create reactive effect for rendering -> 为渲染机制创建响应式副作用函数, 全局 activeEffect 指向当前组件的 componentUpdateFn
    const effect = (instance.effect = new ReactiveEffect(
        componentUpdateFn,
        NOOP,
        () => queueJob(update),
        instance.scope // track it in component's effect scope
    ))
    const update: SchedulerJob = (instance.update = () => {
        if (effect.dirty) {
			// dirty 标识组件是否需要重新渲染，在 ReactiveEffect实例effect内部还有一个_dirtyLevel，表示组件重新渲染的程度，有以下值：
			// _dirtyLevel -> 1. 不需要重新渲染 2. 需要重新渲染组件 3. 需要重新渲染组件，并且子组件也需要重新渲染
            effect.run()
        }
    })
    update.id = instance.uid
    update()
}
```
