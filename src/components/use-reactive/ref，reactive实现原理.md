#### ref

ref() 接收一个参数，并返回一个带有 .value 属性的 ref 对象；通过对象的 set，get 操作符，收集对 activeEffect 的依赖，如果 ref 接收的是对象类型，那么 vue 会在内部将对象调用 toReactive 方法，

通过 proxy 完成响应式数据代理的初始化.

**ref 是如何构建响应式依赖的?**

首先 ref 函数返回一个 ref 对象，这个对象通过实例化一个定义了内部 ref 标识， value，set，get 等属性的类来构造成一个新的对象；

如果传入的是对象类型，那么在 ref 构造实例时会将 value 转换为响应式对象，底层是通过 Proxy 完成对象代理，用于劫持对象的变动；

如果传入的是基本数据类型，则直接赋值给内部的 value 属性上；在类的 get，set 属性上，完成对 value 的响应式构建。

```javascript
/** packages\reactivity\src\ref.ts */
export function ref(value?: unknown) {
	// 传入 craeteRef 的第二个参数 shallow 为false，后续将使用 toReactive 函数将其转换为响应式对象，否则直接返回原始值 value
    return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
    if (isRef(rawValue)) return rawValue
    return new RefImpl(rawValue, shallow)
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public dep?: Dep = undefined
  public readonly __v_isRef = true // ref 对象的内部属性标识，用于 ifRef() 判断

  constructor( value: T, public readonly __v_isShallow: boolean, ) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this) // 收集依赖

    export function trackRefValue(ref: RefBase<any>) {
      if (shouldTrack && activeEffect) {
        ref = toRaw(ref)
		/** 组件挂载阶段，对应的组件更新函数即时 activeEffect，初始化vnode时，完成组件更新函数对ref的依赖收集 */
        trackEffect(
          activeEffect,
          ref.dep ||
            (ref.dep = createDep(
              () => (ref.dep = undefined),
              ref instanceof ComputedRefImpl ? ref : undefined,
            )),
          __DEV__
            ? {
                target: ref,
                type: TrackOpTypes.GET,
                key: 'value',
              }
            : void 0,
        )
      }
    }

    return this._value
  }

  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      /** toReactive作用是将数据转换为响应数据，实际上是通过 reactive() 函数完成对象的 proxy 代理 */
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, DirtyLevels.Dirty, newVal)
    }
  }
}
```

### reactive

-   toReactive 函数构造响应式原理

```javascript
/** packages\reactivity\src\reactive.ts
 * 通过 createReactiveObject 函数构建响应式数据
 */

export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value

export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only specific value types can be observed.
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers,
  )
  proxyMap.set(target, proxy)
  return proxy
}

```
