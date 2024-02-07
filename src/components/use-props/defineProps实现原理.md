### defineProps

在 composition API 的设计架构下，vue 用 defineProps 函数取代了选项式 API 的 props 配置，在 defineProps 中保持了跟 props 基本相同的使用方式，也同样支持 props 的数据校验。

defineProps 的实现依赖于 vue 编译器的支持，在编译阶段解析 defineProps 的参数，之后保存在编译上下文中，用于追踪和管理 props 定义的信息，包括 props 对应的每一个 key 的名称，类型，默认值等

要注意的是，defineProps 函数的设计是为了提供编译时的类型检查和提示，而不是在运行时提供响应式的 props 数据。在后续 vue 执行组件挂载

实际上，props 数据的响应式化是由 Vue 3 的编译器处理的，而不是在运行时通过 defineProps 函数完成的。在 setup 声明的变量，会被视为响应式引用，而不是普通的变量。

Vue 3 在编译时会根据 setup 中定义的变量创建响应式引用，并确保这些变量能够在模板中被正确地访问和使用

类似的实现还比如 defineEmit

```vue
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```

### props 的初始化

-   编译阶段 genRuntimeProps

用于生成组件在运行时需要使用的 props 数据。它的作用是将组件的 props 定义转换成一个对象，包含了组件的所有 props 数据，并确保这些 props 数据在运行时能够正确地被访问和使用

具体的解析过程可以参考： src\source\vue3\script-setup 编译实现.md

这里有几个注意点：

1. 通过 <script setup> 编写的单文件组件（SFC）在编译后会被转换成可执行的 JavaScript 代码，然后在运行时被 Vue 3 的运行时环境加载和执行；

2. 编译后的 <script setup> 部分会被转换成普通的 JavaScript 函数，并被包裹在一个立即执行函数表达式 (IIFE) 中，以确保作用域隔离。

这些函数包含了通过 import 引入的组件模板、props、context 等变量，以及 defineProps、defineEmits 等函数调用

3. 当运行时环境加载编译后的 JavaScript 代码时，会执行其中的函数，并且根据其内部逻辑进行相应的初始化和操作。具体来说，编译后的代码会执行以下几个关键步骤：

1: 创建组件实例： 编译后的代码会根据组件的模板和配置信息创建组件实例。这个过程涉及到调用 defineComponent 函数创建组件选项对象，并传入相应的配置信息

```javascript
/** packages\runtime-core\src\apiDefineComponent.ts */
export function defineComponent(options: unknown, extraOptions?: ComponentOptions) {
    return isFunction(options)
        ? // #8326: extend call and options.name access are considered side-effects
          // by Rollup, so we have to wrap it in a pure-annotated IIFE.
          /*#__PURE__*/ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
        : options
}
```

2: 初始化组件状态： 组件实例化后，会执行 <script setup> 中定义的 setup 函数。在 setup 函数中，可以进行组件的初始化，包括响应式数据的创建、计算属性的定义、事件处理函数的声明等

3: 渲染组件： 一旦组件实例化完成并且 setup 函数执行完毕，运行时环境会调用组件的 render 函数来生成组件的虚拟 DOM 树。这个过程会根据组件的模板、props、状态等信息来生成组件的 UI 结构

4: 挂载组件： 生成组件的虚拟 DOM 树后，运行时环境会将组件的虚拟 DOM 树渲染到真实的 DOM 上，从而将组件呈现给用户

```javascript
/** packages\compiler-sfc\src\compileScript.ts */
export function compileScript(sfc: SFCDescriptor, options: SFCScriptCompileOptions): SFCScriptBlock {
    const propsDecl = genRuntimeProps(ctx)
	// 将 props 同步到 runtimeOptions 中
    if (propsDecl) runtimeOptions += `\n  props: ${propsDecl},`
	//...
	 if (ctx.isTS) {
        // for TS, make sure the exported type is still valid type with
        // correct props information
        // we have to use object spread for types to be merged properly
        // user's TS setting should compile it down to proper targets
        // export default defineComponent({ ...__default__, ... })
        const def =
          (defaultExport ? `\n  ...${normalScriptDefaultVar},` : ``) +
          (definedOptions ? `\n  ...${definedOptions},` : '')
		// 将整个执行字符串加上 defineComponet 的调用，并 将
        ctx.s.prependLeft(
          startOffset,
          `\n${genDefaultAs} /*#__PURE__*/${ctx.helper(
            `defineComponent`,
          )}({${def}${runtimeOptions}\n  ${
            hasAwait ? `async ` : ``
          }setup(${args}) {\n${exposeCall}`,
        )
        ctx.s.appendRight(endOffset, `})`)
      } else {
        if (defaultExport || definedOptions) {
          // without TS, can't rely on rest spread, so we use Object.assign
          // export default Object.assign(__default__, { ... })
          ctx.s.prependLeft(
            startOffset,
            `\n${genDefaultAs} /*#__PURE__*/Object.assign(${
              defaultExport ? `${normalScriptDefaultVar}, ` : ''
            }${definedOptions ? `${definedOptions}, ` : ''}{${runtimeOptions}\n  ` +
              `${hasAwait ? `async ` : ``}setup(${args}) {\n${exposeCall}`,
          )
          ctx.s.appendRight(endOffset, `})`)
        } else {
          ctx.s.prependLeft(
            startOffset,
            `\n${genDefaultAs} {${runtimeOptions}\n  ` +
              `${hasAwait ? `async ` : ``}setup(${args}) {\n${exposeCall}`,
          )
          ctx.s.appendRight(endOffset, `}`)
        }
      }
      return {
        ...scriptSetup,
        bindings: ctx.bindingMetadata,
        imports: ctx.userImports,
        content: ctx.s.toString(),
        map:
          options.sourceMap !== false
            ? (ctx.s.generateMap({
                source: filename,
                hires: true,
                includeContent: true,
              }) as unknown as RawSourceMap)
            : undefined,
        scriptAst: scriptAst?.body,
        scriptSetupAst: scriptSetupAst?.body,
        deps: ctx.deps ? [...ctx.deps] : undefined,
      }
}

/** packages\compiler-sfc\src\script\defineProps.ts */
export function genRuntimeProps(ctx: ScriptCompileContext): string | undefined {
    let propsDecls: undefined | string
    if (ctx.propsRuntimeDecl) {
        propsDecls = ctx.getString(ctx.propsRuntimeDecl).trim()
        if (ctx.propsDestructureDecl) {
            const defaults: string[] = []
            for (const key in ctx.propsDestructuredBindings) {
                const d = genDestructuredDefaultValue(ctx, key)
                const finalKey = getEscapedPropName(key)
                if (d) defaults.push(`${finalKey}: ${d.valueString}${d.needSkipFactory ? `, __skip_${finalKey}: true` : ``}`)
            }
            if (defaults.length) {
                propsDecls = `/*#__PURE__*/${ctx.helper(`mergeDefaults`)}(${propsDecls}, {\n  ${defaults.join(',\n  ')}\n})`
            }
        }
    } else if (ctx.propsTypeDecl) {
        propsDecls = extractRuntimeProps(ctx)
    }

    const modelsDecls = genModelProps(ctx)

    if (propsDecls && modelsDecls) {
        return `/*#__PURE__*/${ctx.helper('mergeModels')}(${propsDecls}, ${modelsDecls})`
    } else {
        return modelsDecls || propsDecls
    }
}

export function extractRuntimeProps(ctx: TypeResolveContext,): string | undefined {
  // this is only called if propsTypeDecl exists
  const props = resolveRuntimePropsFromType(ctx, ctx.propsTypeDecl!)

  function resolveRuntimePropsFromType(ctx,node ) {
    const props: PropTypeData[] = []
    const elements = resolveTypeElements(ctx, node)
    for (const key in elements.props) {
      const e = elements.props[key]
      let type = inferRuntimeType(ctx, e)
      let skipCheck = false
      // skip check for result containing unknown types
      if (type.includes(UNKNOWN_TYPE)) {
        if (type.includes('Boolean') || type.includes('Function')) {
          type = type.filter(t => t !== UNKNOWN_TYPE)
          skipCheck = true
        } else {
          type = ['null']
        }
      }
      props.push({
        key,
        required: !e.optional,
        type: type || [`null`],
        skipCheck,
      })
    }
    return props
  }

  if (!props.length) {
    return
  }

  const propStrings: string[] = []
  const hasStaticDefaults = hasStaticWithDefaults(ctx)

  for (const prop of props) {
	/** genRuntimePropFromType 生成的每个 props 定义包含了 props 的名称、类型、默认值等信息 */
    propStrings.push(genRuntimePropFromType(ctx, prop, hasStaticDefaults))

    // register bindings
    if ('bindingMetadata' in ctx && !(prop.key in ctx.bindingMetadata)) {
      ctx.bindingMetadata[prop.key] = BindingTypes.PROPS
    }
  }

  let propsDecls = `{
    ${propStrings.join(',\n    ')}\n  }`

  if (ctx.propsRuntimeDefaults && !hasStaticDefaults) {
    propsDecls = `/*#__PURE__*/${ctx.helper(
      'mergeDefaults',
    )}(${propsDecls}, ${ctx.getString(ctx.propsRuntimeDefaults)})`
  }

  /** propsDecls: 用于跟踪和管理组件的 props 定义信息 */
  return propsDecls
}

/** packages\compiler-sfc\src\script\defineProps.ts */
function genRuntimePropFromType(
  ctx: TypeResolveContext,
  { key, required, type, skipCheck }: PropTypeData,
  hasStaticDefaults: boolean,
): string {
  let defaultString: string | undefined
  const destructured = genDestructuredDefaultValue(ctx, key, type)
  if (destructured) {
    defaultString = `default: ${destructured.valueString}${
      destructured.needSkipFactory ? `, skipFactory: true` : ``
    }`
  } else if (hasStaticDefaults) {
    const prop = (ctx.propsRuntimeDefaults as ObjectExpression).properties.find(
      node => {
        if (node.type === 'SpreadElement') return false
        return resolveObjectKey(node.key, node.computed) === key
      },
    ) as ObjectProperty | ObjectMethod
    if (prop) {
      if (prop.type === 'ObjectProperty') {
        // prop has corresponding static default value
        defaultString = `default: ${ctx.getString(prop.value)}`
      } else {
        defaultString = `${prop.async ? 'async ' : ''}${
          prop.kind !== 'method' ? `${prop.kind} ` : ''
        }default() ${ctx.getString(prop.body)}`
      }
    }
  }

  const finalKey = getEscapedPropName(key)
  if (!ctx.options.isProd) {
    return `${finalKey}: { ${concatStrings([
      `type: ${toRuntimeTypeString(type)}`,
      `required: ${required}`,
      skipCheck && 'skipCheck: true',
      defaultString,
    ])} }`
  } else if (
    type.some(
      el =>
        el === 'Boolean' ||
        ((!hasStaticDefaults || defaultString) && el === 'Function'),
    )
  ) {
    // #4783 for boolean, should keep the type
    // #7111 for function, if default value exists or it's not static, should keep it
    // in production
    return `${finalKey}: { ${concatStrings([
      `type: ${toRuntimeTypeString(type)}`,
      defaultString,
    ])} }`
  } else {
    // #8989 for custom element, should keep the type
    if (ctx.isCE) {
      if (defaultString) {
        return `${finalKey}: ${`{ ${defaultString}, type: ${toRuntimeTypeString(
          type,
        )} }`}`
      } else {
        return `${finalKey}: {type: ${toRuntimeTypeString(type)}}`
      }
    }

    // production: checks are useless
    return `${finalKey}: ${defaultString ? `{ ${defaultString} }` : `{}`}`
  }
}
```

-   组件实例化阶段

在 patch 函数执行 processComponent 处理组件节点时，mountComponent 函数会执行 setupComponent(instance) <packages\runtime-core\src\renderer.ts>

```javascript
/** packages\runtime-core\src\component.ts */

export function setupComponent(instance: ComponentInternalInstance, isSSR = false) {
    isSSR && setInSSRSetupState(isSSR)

    const { props, children } = instance.vnode
    const isStateful = isStatefulComponent(instance)
    initProps(instance, props, isStateful, isSSR)
    initSlots(instance, children)

    const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : undefined

    isSSR && setInSSRSetupState(false)
    return setupResult
}

/** packages\runtime-core\src\componentProps.ts
 * 通过 shallowReactive 完成对props 的深度响应
 */
export function initProps(instance: ComponentInternalInstance, rawProps: Data | null, isStateful: number) {
    const props: Data = {}
    const attrs: Data = {}
    def(attrs, InternalObjectKey, 1)
    instance.propsDefaults = Object.create(null)
    setFullProps(instance, rawProps, props, attrs)
    // ensure all declared prop keys are present
    for (const key in instance.propsOptions[0]) {
        if (!(key in props)) {
            props[key] = undefined
        }
    }
    if (isStateful) {
        // stateful
        instance.props = isSSR ? props : shallowReactive(props)
    } else {
        if (!instance.type.props) {
            // functional w/ optional props, props === attrs
            instance.props = attrs
        } else {
            // functional w/ declared props
            instance.props = props
        }
    }
    instance.attrs = attrs
}

/** packages\reactivity\src\reactive.ts */
export function shallowReactive<T extends object>(
       target: T,
     ): ShallowReactive<T> {
       return createReactiveObject(
         target,
         false,
         shallowReactiveHandlers,
         shallowCollectionHandlers,
         shallowReactiveMap,
       )
     }
```
