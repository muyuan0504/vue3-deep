### createApp

Vue2 中，通过 new Vue() 构建实例，并执行 .mount 完成 Dom 挂载。

而 Vue3 中，用 createApp 代替了 new Vue() 的方式，用函数替代构造函数创建实例；

在调用 createApp 的过程中，vue 完成了对渲染器 render 的构建，支持挂载，更新，移除等 DOM 渲染操作，并且在内部创建了一个全局的上下文对象 context，在 app 的实例方法中，保持了对这个

context 的引用，比如 use, mount，directive，provide，提供了全局方法对 context 的属性变更的能力；之后，当我们调用 .mount 时，执行 render 方法，最终通过 patch 函数开始 vnode 的

渲染逻辑。

1.

```javascript
/** packages\runtime-dom\src\index.ts */

export const createApp = (...args) => {

    const app = ensureRenderer().createApp(...args)

    /** ensureRenderer 函数用来构建渲染器 */
    function ensureRenderer() {
        return ( renderer ||  (renderer = createRenderer<Node, Element | ShadowRoot>(rendererOptions)))
    }

    const { mount } = app
    app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
        const container = normalizeContainer(containerOrSelector)
        if (!container) return
        const component = app._component
        if (!isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML
        }
        // clear content before mounting
        container.innerHTML = ''
        const proxy = mount(container, false, resolveRootNamespace(container))
        if (container instanceof Element) {
            container.removeAttribute('v-cloak')
            container.setAttribute('data-v-app', '')
        }
        return proxy
    }

    return app
}

/** packages\runtime-core\src\renderer.ts
 * createRenderer：创建渲染器
 */
export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(
  options: RendererOptions,
  createHydrationFns?: typeof createHydrationFunctions,
): any {
  const target = getGlobalThis()
  target.__VUE__ = true
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent,
  } = options

  // Note: functions inside this closure should use `const xxx = () => {}`
  // style in order to prevent being inlined by minifiers.
  const patch: PatchFn = () => {
      switch (type) {
        case Text:
          processText(n1, n2, container, anchor)
          break
        case Comment:
          processCommentNode(n1, n2, container, anchor)
          break
        case Static:
          if (n1 == null) {
            mountStaticNode(n2, container, anchor, namespace)
          } else if (__DEV__) {
            patchStaticNode(n1, n2, container, namespace)
          }
          break
        case Fragment:
          processFragment(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
          )
          break
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) {
            processElement(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
            )
          } else if (shapeFlag & ShapeFlags.COMPONENT) {
            processComponent(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
            )
          } else if (shapeFlag & ShapeFlags.TELEPORT) {
            ;(type as typeof TeleportImpl).process(
              n1 as TeleportVNode,
              n2 as TeleportVNode,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals,
            )
          } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
            ;(type as typeof SuspenseImpl).process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals,
            )
          } else if (__DEV__) {
            warn('Invalid VNode type:', type, `(${typeof type})`)
          }
      }
      // set ref
      if (ref != null && parentComponent) {
        setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2)
      }
    }
  }

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {}

  const processCommentNode: ProcessTextOrCommentFn = () => {}

  const mountStaticNode = () => {}

  // Dev / HMR only
  const patchStaticNode = () => {}

  const moveStaticNode = () => {}

  const removeStaticNode = ({ el, anchor }: VNode) => {}

  const processElement = () => {}

  const mountElement = () => {}

  const setScopeId = () => {}

  const mountChildren: MountChildrenFn = () => {}

  const patchElement = () => {}

  // The fast path for blocks.
  const patchBlockChildren: PatchBlockChildrenFn = () => {}

  const patchProps = () => {}

  const processFragment = () => {}

  const processComponent = () => {
    n2.slotScopeIds = slotScopeIds
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        ;(parentComponent!.ctx as KeepAliveContext).activate(
          n2,
          container,
          anchor,
          namespace,
          optimized,
        )
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized,
        )
      }
    } else {
      updateComponent(n1, n2, optimized)
    }
  }

  const mountComponent: MountComponentFn = () => {}

  const updateComponent = (n1: VNode, n2: VNode, optimized: boolean) => {}

  const setupRenderEffect: SetupRenderEffectFn = () => {
    const componentUpdateFn = () => {}
    // create reactive effect for rendering
    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      NOOP,
      () => queueJob(update),
      instance.scope, // track it in component's effect scope
    ))
    const update: SchedulerJob = (instance.update = () => {
      if (effect.dirty) {
        effect.run()
      }
    })
    update.id = instance.uid
    // allowRecurse
    // #1801, #2043 component render effects should allow recursive updates
    toggleRecurse(instance, true)

    update()
  }

  const updateComponentPreRender = () => {
    nextVNode.component = instance
    const prevProps = instance.vnode.props
    instance.vnode = nextVNode
    instance.next = null
    updateProps(instance, nextVNode.props, prevProps, optimized)
    updateSlots(instance, nextVNode.children, optimized)
    pauseTracking()
    flushPreFlushCbs(instance)
    resetTracking()
  }

  const patchChildren: PatchChildrenFn = () => {}

  const patchUnkeyedChildren = () => {}

  // can be all-keyed or mixed
  const patchKeyedChildren = () => {}

  const move: MoveFn = () => {}

  const unmount: UnmountFn = () => {}

  const remove: RemoveFn = vnode => {}

  const removeFragment = (cur: RendererNode, end: RendererNode) => {}

  const unmountComponent = () => {}

  const unmountChildren: UnmountChildrenFn = () => {
    for (let i = start; i < children.length; i++) {}

  const getNextHostNode: NextFn = vnode => {}

  let isFlushing = false
  const render: RootRenderFunction = (vnode, container, namespace) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true)
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace,
      )
    }
    if (!isFlushing) {
      isFlushing = true
      flushPreFlushCbs()
      flushPostFlushCbs()
      isFlushing = false
    }
    container._vnode = vnode
  }
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate),
  }
}

/** packages\runtime-core\src\apiCreateApp.ts
 *  createAppAPI： 返回组件Vue-app实例对象
 */
export function createAppAPI<HostElement>(render, hydrate){

  return function createApp(rootComponent, rootProps = null) {

    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent)
    }

    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null
    }

    const context = createAppContext() // createAppContext函数用于构建 context 上下文对象

    function createAppContext(): AppContext {
      return {
        app: null as any,
        config: {
          isNativeTag: NO,
          performance: false,
          globalProperties: {},
          optionMergeStrategies: {},
          errorHandler: undefined,
          warnHandler: undefined,
          compilerOptions: {},
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap(),
      }
    }

    const installedPlugins = new WeakSet()

    let isMounted = false

    const app: App = (context.app = {
      _uid: uid++,
      _component: rootComponent as ConcreteComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config
      },
      set config(v) {
        if (__DEV__) {
          warn(
            `app.config cannot be replaced. Modify individual options instead.`,
          )
        }
      },
	  /** 插件使用方法，在Vue3的使用中，会调用plugin方法，并将 app 实例传入 */
      use(plugin: Plugin, ...options: any[]) {
        if (installedPlugins.has(plugin)) {
          __DEV__ && warn(`Plugin has already been applied to target app.`)
        } else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin)
          plugin.install(app, ...options)
        } else if (isFunction(plugin)) {
		  // Vue 3 传入 plugin 函数
          installedPlugins.add(plugin)
          plugin(app, ...options)
        } else if (__DEV__) {
			// ···
        }
        return app
      },
      // mixin 混入
      mixin(mixin: ComponentOptions) {
        if (__FEATURE_OPTIONS_API__) {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin)
          } else if (__DEV__) {
            warn(
              'Mixin has already been applied to target app' +
                (mixin.name ? `: ${mixin.name}` : ''),
            )
          }
        } else if (__DEV__) {
          warn('Mixins are only available in builds supporting Options API')
        }
        return app
      },

      component(name: string, component?: Component): any {
        if (__DEV__) {
          validateComponentName(name, context.config)
        }
        if (!component) {
          return context.components[name]
        }
        if (__DEV__ && context.components[name]) {
          warn(`Component "${name}" has already been registered in target app.`)
        }
        context.components[name] = component
        return app
      },

      directive(name: string, directive?: Directive) {
        if (__DEV__) {
          validateDirectiveName(name)
        }

        if (!directive) {
          return context.directives[name] as any
        }
        if (__DEV__ && context.directives[name]) {
          warn(`Directive "${name}" has already been registered in target app.`)
        }
        context.directives[name] = directive
        return app
      },

      mount(
        rootContainer: HostElement,
        isHydrate?: boolean,
        namespace?: boolean | ElementNamespace,
      ): any {
        if (!isMounted) {
          // #5571
          if (__DEV__ && (rootContainer as any).__vue_app__) {
            warn(
              `There is already an app instance mounted on the host container.\n` +
                ` If you want to mount another app on the same host container,` +
                ` you need to unmount the previous app by calling \`app.unmount()\` first.`,
            )
          }
          const vnode = createVNode(rootComponent, rootProps)
          // store app context on the root VNode.
          // this will be set on the root instance on initial mount.
          vnode.appContext = context

          if (namespace === true) {
            namespace = 'svg'
          } else if (namespace === false) {
            namespace = undefined
          }

          if (isHydrate && hydrate) {
            hydrate(vnode as VNode<Node, Element>, rootContainer as any)
          } else {
            render(vnode, rootContainer, namespace)
          }
          isMounted = true
          app._container = rootContainer
          // for devtools and telemetry
          ;(rootContainer as any).__vue_app__ = app
          return getExposeProxy(vnode.component!) || vnode.component!.proxy
        } else if (__DEV__) {
          warn(
            `App has already been mounted.\n` +
              `If you want to remount the same app, move your app creation logic ` +
              `into a factory function and create fresh app instances for each ` +
              `mount - e.g. \`const createMyApp = () => createApp(App)\``,
          )
        }
      },

      unmount() {
        if (isMounted) {
          render(null, app._container)
          if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
            app._instance = null
            devtoolsUnmountApp(app)
          }
          delete app._container.__vue_app__
        } else if (__DEV__) {
          warn(`Cannot unmount an app that is not mounted.`)
        }
      },
      // 用于全局provide注入
      provide(key, value) {
        context.provides[key as string | symbol] = value
        return app
      },

      runWithContext(fn) {
        currentApp = app
        try {
          return fn()
        } finally {
          currentApp = null
        }
      },
    })

    return app
  }
}
```
