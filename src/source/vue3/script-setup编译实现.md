### script setup

[vue 文档.https://cn.vuejs.org/api/sfc-script-setup.html]

vue 编译器处理 setup

Vue 3 的编译器主要由 @vue/compiler-sfc 模块提供支持

<u>packages\compiler-sfc\src\compileScript.ts</u>

1. 提取 <script setup> 内容： 首先，编译器会从 SFC 文件中提取 <script setup> 的内容;

2. 分析变量和标记响应性： 提取到的内容会被送到 parse 函数进行解析。在这个解析过程中，编译器会识别其中定义的变量，并标记它们是响应式的;

3. 生成代码： 根据解析结果，编译器会生成相应的代码，这些代码会确保 <script setup> 中定义的变量被正确地转换为响应式引用;

4. 与模板建立关联： 编译器还会分析模板中使用的变量，并建立与 <script setup> 中定义的变量的关联。这样，在运行时，模板中引用的变量能够正确地与响应式数据绑定

在 sfc 的 setup 编译中，包括以下常用变量：

-   ctx

编译上下文（context），它包含了编译过程中的各种信息和工具函数，例如 helper 函数、emitError 函数等。ctx 参数用于在编译过程中访问这些工具函数和信息

-   node

这个参数是 babel AST（抽象语法树）中的节点，代表了 defineProps 函数的调用。编译器通过解析这个节点来获取 defineProps 函数调用的参数

-   declId

这个参数是一个字符串，代表了在 Vue 3 编译器内部生成的唯一标识符；它用于在生成的代码中唯一地标识 props 对象。

在编译过程中，编译器会使用 declId 来生成相应的代码，并将其与模板中的 props 引用建立关联

### 为什么在 setup 函数中的 import 可以直接被模板使用

setup 处理用户 import

在编译 setup 函数内容时，vue 编译器内部维护了导入注册表， 通过 registerUserImport ，注册了用户导入，在后续编译过程中，会根据注册表中的信息来处理用户自定义的导入。

```javascript
/** packages\compiler-sfc\src\compileScript.ts */
export function compileScript(sfc: SFCDescriptor, options: SFCScriptCompileOptions): SFCScriptBlock {
    // ...
    if (scriptAst) {
        for (const node of scriptAst.body) {
            if (node.type === 'ImportDeclaration') {
                // record imports for dedupe
                for (const specifier of node.specifiers) {
                    const imported = getImportedName(specifier)
                    registerUserImport(
                        node.source.value,
                        specifier.local.name,
                        imported,
                        node.importKind === 'type' || (specifier.type === 'ImportSpecifier' && specifier.importKind === 'type'),
                        false,
                        !options.inlineTemplate
                    )
                }
            }
        }
    }
    // ...
}

function registerUserImport(source: string, local: string, imported: string, isType: boolean, isFromSetup: boolean, needTemplateUsageCheck: boolean) {
    // template usage check is only needed in non-inline mode, so we can skip
    // the work if inlineTemplate is true.
    let isUsedInTemplate = needTemplateUsageCheck
    if (needTemplateUsageCheck && ctx.isTS && sfc.template && !sfc.template.src && !sfc.template.lang) {
        isUsedInTemplate = isImportUsed(local, sfc)
    }
    ctx.userImports[local] = {
        isType,
        imported,
        local,
        source,
        isFromSetup,
        isUsedInTemplate,
    }
}
```

#### setup 处理 defineProps

```javascript
/** packages\compiler-sfc\src\compileScript.ts */
export function compileScript(sfc: SFCDescriptor, options: SFCScriptCompileOptions): SFCScriptBlock {
    // ...
    if (node.type === 'VariableDeclaration' && !node.declare) {
        const total = node.declarations.length
        let left = total
        let lastNonRemoved: number | undefined

        for (let i = 0; i < total; i++) {
            const decl = node.declarations[i]
            const init = decl.init && unwrapTSNode(decl.init)
            if (init) {
                if (processDefineOptions(ctx, init)) {
                    ctx.error(`${DEFINE_OPTIONS}() has no returning value, it cannot be assigned.`, node)
                }
                // defineProps / defineEmits
                const isDefineProps = processDefineProps(ctx, init, decl.id)
                const isDefineEmits = !isDefineProps && processDefineEmits(ctx, init, decl.id)
                !isDefineEmits && (processDefineSlots(ctx, init, decl.id) || processDefineModel(ctx, init, decl.id))
            }
        }
    }
    // ...
}

/** packages\compiler-sfc\src\script\defineProps.ts */
export function processDefineProps(ctx: ScriptCompileContext, node: Node, declId?: LVal) {
    if (!isCallOf(node, DEFINE_PROPS)) {
        return processWithDefaults(ctx, node, declId)
    }
    if (ctx.hasDefinePropsCall) {
        ctx.error(`duplicate ${DEFINE_PROPS}() call`, node)
    }
    ctx.hasDefinePropsCall = true
    ctx.propsRuntimeDecl = node.arguments[0]
    // register bindings
    if (ctx.propsRuntimeDecl) {
        for (const key of getObjectOrArrayExpressionKeys(ctx.propsRuntimeDecl)) {
            if (!(key in ctx.bindingMetadata)) {
                ctx.bindingMetadata[key] = BindingTypes.PROPS
            }
        }
    }
    // call has type parameters - infer runtime types from it
    if (node.typeParameters) {
        if (ctx.propsRuntimeDecl) {
            ctx.error(`${DEFINE_PROPS}() cannot accept both type and non-type arguments ` + `at the same time. Use one or the other.`, node)
        }
        ctx.propsTypeDecl = node.typeParameters.params[0]
    }
    // handle props destructure
    if (declId && declId.type === 'ObjectPattern') {
        processPropsDestructure(ctx, declId)
    }
    ctx.propsCall = node
    ctx.propsDecl = declId
    return true
}
```
