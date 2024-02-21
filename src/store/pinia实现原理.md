## 在 vue3 中使用 pinia

可以理解为 pinia 原理是利用应用级别的 provide，以响应式数据为核心，来实现状态管理的

Pinia 主要原理包括以下几个方面:

1. Store 实例的创建和注册： 开发者可以通过 createStore 函数创建 Store 实例，并通过 pinia.use 方法注册到 Pinia 实例中。

每个 Store 实例都是一个独立的状态容器，可以包含应用程序的状态和相关操作方法。

2. 响应式数据： Pinia 使用 Vue 3 的响应式系统来管理状态数据，确保当状态发生变化时，所有使用该状态的组件都能够自动更新。这使得状态在组件之间可以方便地共享和交互。

3. provide/inject API： Pinia 在内部使用了 provide/inject API 来在 Vue 应用程序中传递 Store 实例。

通过在应用程序的根组件上提供 Pinia 实例，并在子组件中使用 inject 来获取 Store 实例，Pinia 实现了跨组件的状态共享和管理

4. Vue Composition API： Pinia 提供了一组基于 Vue 3 Composition API 的钩子函数，例如 useStore、useState、useActions 等，用于在组件中访问和操作 Store 实例。

这些钩子函数使得在组件中使用 Store 实例变得更加方便和直观

虽然 Pinia 在一定程度上利用了 provide/inject API 来实现跨组件的状态共享，但它更多地是基于 Vue 3 的响应式系统和 Composition API 来实现状态管理的。

通过这些功能和机制，Pinia 提供了一种简单且强大的方式来管理 Vue 应用程序的状态

### createPinia

创建一个 Pinia 实例，供整个 web 应用使用

-   markRaw 函数

Vue3 辅助函数，用于标记对象是'原始'对象，意味着该对象被包装为一个不可响应对象；意味着使用 markRaw 标记的对象将不会被 Vue 的响应式系统追踪其变化，也不会触发任何响应式更新。

在 createPinia 中使用 markRaw 的目的是为了创建 Pinia 实例时，将其内部的状态对象标记为“原始”对象，从而避免 Pinia 对状态对象的状态进行追踪和响应式更新。

这样可以提高性能并降低内存消耗，尤其是在大型应用中，状态对象可能包含大量的属性和嵌套对象，如果全部都被响应式追踪，可能会导致性能问题。

```javascript
/** packages\pinia\src\createPinia.ts */
export function createPinia(): Pinia {
  const scope = effectScope(true)
  // NOTE: here we could check the window object for a state and directly set it
  // if there is anything like it with Vue 3 SSR
  const state = scope.run<Ref<Record<string, StateTree>>>(() =>
    ref<Record<string, StateTree>>({})
  )!

  let _p: Pinia['_p'] = []
  // plugins added before calling app.use(pinia)
  let toBeInstalled: PiniaPlugin[] = []

  const pinia: Pinia = markRaw({
    install(app: App) {
      // this allows calling useStore() outside of a component setup after
      // installing pinia's plugin
      setActivePinia(pinia)
      if (!isVue2) {
        pinia._a = app
		/** 为整个app实例注册了pinia对象，这样每个组件都可以访问到pinia */
        app.provide(piniaSymbol, pinia)
        app.config.globalProperties.$pinia = pinia
        toBeInstalled.forEach((plugin) => _p.push(plugin))
        toBeInstalled = []
      }
    },
    use(plugin) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin)
      } else {
        _p.push(plugin)
      }
      return this
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: new Map<string, StoreGeneric>(),
    state, // 定义 state 对象属性，ref响应式数据
  })

  return pinia
}
```

### defineStore

创建一个 Store 类，并将其注册到 Pinia 实例中，以便在应用程序中使用

用于定义 store 的函数，接收两个参数：

-   唯一 Id

-   Setup 函数或 Option 对象

在使用 <script setup> 调用 useStore()之前，store 实例是不会被创建的

```javascript
/** packages\pinia\src\store.ts */
export function defineStore(
  // TODO: add proper types from above
  idOrOptions: any, // key
  setup?: any,
  setupOptions?: any
): StoreDefinition {
  let id
  let options

  const isSetupStore = typeof setup === 'function'
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    // the option store setup will contain the actual options in this case
    options = isSetupStore ? setupOptions : setup
  } else {
    options = idOrOptions
    id = idOrOptions.id
  }
  function useStore(pinia?: Pinia | null, hot?: StoreGeneric): StoreGeneric {
    const hasContext = hasInjectionContext()
    pinia =
      // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      (__TEST__ && activePinia && activePinia._testing ? null : pinia) ||
      (hasContext ? inject(piniaSymbol, null) : null)
    if (pinia) setActivePinia(pinia)
    pinia = activePinia!

    if (!pinia._s.has(id)) {
      // creating the store registers it in `pinia._s`
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia)
      } else {
        createOptionsStore(id, options as any, pinia)
      }
    }
    const store: StoreGeneric = pinia._s.get(id)!
    // StoreGeneric cannot be casted towards Store
    return store as any
  }

  useStore.$id = id

  return useStore
}

/** 以 createSetupStore 实现举例 createSetupStore(id, setup, options, pinia) */
function createSetupStore<
  Id extends string,
  SS extends Record<any, unknown>,
  S extends StateTree,
  G extends Record<string, _Method>,
  A extends _ActionsTree
>(
  $id: Id,
  setup: () => SS,
  options:
    | DefineSetupStoreOptions<Id, S, G, A>
    | DefineStoreOptions<Id, S, G, A> = {},
  pinia: Pinia,
  hot?: boolean,
  isOptionsStore?: boolean
): Store<Id, S, G, A> {
  let scope!: EffectScope

  const optionsForPlugin: DefineStoreOptionsInPlugin<Id, S, G, A> = assign(
    { actions: {} as A },
    options
  )

  // watcher options for $subscribe
  const $subscribeOptions: WatchOptions = {
    deep: true,
    // flush: 'post',
  }

  // internal state
  let isListening: boolean // set to true at the end
  let isSyncListening: boolean // set to true at the end
  let subscriptions: SubscriptionCallback<S>[] = []
  let actionSubscriptions: StoreOnActionListener<Id, S, G, A>[] = []
  let debuggerEvents: DebuggerEvent[] | DebuggerEvent
  const initialState = pinia.state.value[$id] as UnwrapRef<S> | undefined

  // avoid setting the state for option stores if it is set
  // by the setup
  if (!isOptionsStore && !initialState && (!__DEV__ || !hot)) {
    /* istanbul ignore if */
    if (isVue2) {
      set(pinia.state.value, $id, {})
    } else {
      // 初始化 pinia.state的 $id属性； pinia在创建时，定义了 响应式 state 属性
      pinia.state.value[$id] = {}
    }
  }

  const hotState = ref({} as S)

  // avoid triggering too many listeners
  // https://github.com/vuejs/pinia/issues/1129
  let activeListener: Symbol | undefined
  function $patch(stateMutation: (state: UnwrapRef<S>) => void): void
  function $patch(partialState: _DeepPartial<UnwrapRef<S>>): void
  function $patch(
    partialStateOrMutator:
      | _DeepPartial<UnwrapRef<S>>
      | ((state: UnwrapRef<S>) => void)
  ): void {
    let subscriptionMutation: SubscriptionCallbackMutation<S>
    isListening = isSyncListening = false
    // reset the debugger events since patches are sync
    /* istanbul ignore else */
    if (typeof partialStateOrMutator === 'function') {
      partialStateOrMutator(pinia.state.value[$id] as UnwrapRef<S>)
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents as DebuggerEvent[],
      }
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator)
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents as DebuggerEvent[],
      }
    }
    const myListenerId = (activeListener = Symbol())
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true
      }
    })
    isSyncListening = true
    // because we paused the watcher, we need to manually call the subscriptions
    triggerSubscriptions(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[$id] as UnwrapRef<S>
    )
  }

  const $reset = isOptionsStore
    ? function $reset(this: _StoreWithState<Id, S, G, A>) {
        const { state } = options as DefineStoreOptions<Id, S, G, A>
        const newState = state ? state() : {}
        // we use a patch to group all changes into one single subscription
        this.$patch(($state) => {
          assign($state, newState)
        })
      }
    : /* istanbul ignore next */
    __DEV__
    ? () => {
        throw new Error(
          `🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`
        )
      }
    : noop

  function $dispose() {
    scope.stop()
    subscriptions = []
    actionSubscriptions = []
    pinia._s.delete($id)
  }

  /**
   * Wraps an action to handle subscriptions.
   *
   * @param name - name of the action
   * @param action - action to wrap
   * @returns a wrapped action to handle subscriptions
   */
  function wrapAction(name: string, action: _Method) {
    return function (this: any) {
      setActivePinia(pinia)
      const args = Array.from(arguments)

      const afterCallbackList: Array<(resolvedReturn: any) => any> = []
      const onErrorCallbackList: Array<(error: unknown) => unknown> = []
      function after(callback: _ArrayType<typeof afterCallbackList>) {
        afterCallbackList.push(callback)
      }
      function onError(callback: _ArrayType<typeof onErrorCallbackList>) {
        onErrorCallbackList.push(callback)
      }

      // @ts-expect-error
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError,
      })

      let ret: unknown
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args)
        // handle sync errors
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error)
        throw error
      }

      if (ret instanceof Promise) {
        return ret
          .then((value) => {
            triggerSubscriptions(afterCallbackList, value)
            return value
          })
          .catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error)
            return Promise.reject(error)
          })
      }

      // trigger after callbacks
      triggerSubscriptions(afterCallbackList, ret)
      return ret
    }
  }

  const _hmrPayload = /*#__PURE__*/ markRaw({
    actions: {} as Record<string, any>,
    getters: {} as Record<string, Ref>,
    state: [] as string[],
    hotState,
  })

  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached,
        () => stopWatcher()
      )
      const stopWatcher = scope.run(() =>
        watch(
          () => pinia.state.value[$id] as UnwrapRef<S>,
          (state) => {
            if (options.flush === 'sync' ? isSyncListening : isListening) {
              callback(
                {
                  storeId: $id,
                  type: MutationType.direct,
                  events: debuggerEvents as DebuggerEvent,
                },
                state
              )
            }
          },
          assign({}, $subscribeOptions, options)
        )
      )!

      return removeSubscription
    },
    $dispose,
  } as _StoreWithState<Id, S, G, A>

  /* istanbul ignore if */
  if (isVue2) {
    // start as non ready
    partialStore._r = false
  }

  /** 将 store 构建成响应式对象 */
  const store: Store<Id, S, G, A> = reactive(partialStore ) as unknown as Store<Id, S, G, A>
  pinia._s.set($id, store as Store)

  const runWithContext =
    (pinia._a && pinia._a.runWithContext) || fallbackRunWithContext

  // TODO: idea create skipSerialize that marks properties as non serializable and they are skipped
  const setupStore = runWithContext(() =>
    pinia._e.run(() => (scope = effectScope()).run(setup)!)
  )!

  // overwrite existing actions to support $onAction
  for (const key in setupStore) {
    const prop = setupStore[key]

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // mark it as a piece of state to be serialized
      if (__DEV__ && hot) {
        set(hotState.value, key, toRef(setupStore as any, key))
        // createOptionStore directly sets the state in pinia.state.value so we
        // can just skip that
      } else if (!isOptionsStore) {
        // in setup stores we must hydrate the state and sync pinia state tree with the refs the user just created
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key]
          } else {
            // probably a reactive object, lets recursively assign
            // @ts-expect-error: prop is unknown
            mergeReactiveObjects(prop, initialState[key])
          }
        }
        // transfer the ref to the pinia state to keep everything in sync
        /* istanbul ignore if */
        if (isVue2) {
          set(pinia.state.value[$id], key, prop)
        } else {
          pinia.state.value[$id][key] = prop
        }
      }
      // action
    } else if (typeof prop === 'function') {
      // @ts-expect-error: we are overriding the function we avoid wrapping if
      const actionValue = __DEV__ && hot ? prop : wrapAction(key, prop)
      // this a hot module replacement store because the hotUpdate method needs
      // to do it with the right context
      /* istanbul ignore if */
      if (isVue2) {
        set(setupStore, key, actionValue)
      } else {
        // @ts-expect-error
        setupStore[key] = actionValue
      }

      /* istanbul ignore else */
      if (__DEV__) {
        _hmrPayload.actions[key] = prop
      }

      // list actions so they can be used in plugins
      // @ts-expect-error
      optionsForPlugin.actions[key] = prop
    }
  }

  // add the state, getters, and action properties
  /* istanbul ignore if */
  if (isVue2) {
    Object.keys(setupStore).forEach((key) => {
      set(store, key, setupStore[key])
    })
  } else {
    assign(store, setupStore)
    // allows retrieving reactive objects with `storeToRefs()`. Must be called after assigning to the reactive object.
    // Make `storeToRefs()` work with `reactive()` #799
    assign(toRaw(store), setupStore)
  }
  Object.defineProperty(store, '$state', {
    get: () => (__DEV__ && hot ? hotState.value : pinia.state.value[$id]),
    set: (state) => {
      /* istanbul ignore if */
      if (__DEV__ && hot) {
        throw new Error('cannot set hotState')
      }
      $patch(($state) => {
        assign($state, state)
      })
    },
  })
  // apply all plugins
  pinia._p.forEach((extender) => {
    assign(
        store,
        scope.run(() =>
          extender({
            store: store as Store,
            app: pinia._a,
            pinia,
            options: optionsForPlugin,
          })
        )!
      )
  })
  // only apply hydrate to option stores with an initial state in pinia
  if (
    initialState &&
    isOptionsStore &&
    (options as DefineStoreOptions<Id, S, G, A>).hydrate
  ) {
    ;(options as DefineStoreOptions<Id, S, G, A>).hydrate!(
      store.$state,
      initialState
    )
  }

  isListening = true
  isSyncListening = true
  return store
}
```

### storeToRefs

storeToRefs 用于将 store 构建成响应式数据对象

```javascript
export function storeToRefs<SS extends StoreGeneric>(
  store: SS
): StoreToRefs<SS> {
  // See https://github.com/vuejs/pinia/issues/852
  // It's easier to just use toRefs() even if it includes more stuff
  if (isVue2) {
    // @ts-expect-error: toRefs include methods and others
    return toRefs(store)
  } else {
    store = toRaw(store)

    const refs = {} as StoreToRefs<SS>
    for (const key in store) {
      const value = store[key]
      if (isRef(value) || isReactive(value)) {
        // @ts-expect-error: the key is state or getter
        refs[key] =
          // ---
          toRef(store, key)
      }
    }

    return refs
  }
}
```
