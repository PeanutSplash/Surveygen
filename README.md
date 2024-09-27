# Vue 3 + TypeScript + Vite

这个模板应该能帮助你开始使用 Vite 开发 Vue 3 和 TypeScript 项目。该模板使用 Vue 3 的 `<script setup>` SFC，查看[script setup 文档](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup)以了解更多信息。

## 推荐的 IDE 设置

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）+ [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)。

## TS 中 `.vue` 导入的类型支持

TypeScript 默认无法处理 `.vue` 导入的类型信息，所以我们用 `vue-tsc` 替换 `tsc` CLI 进行类型检查。在编辑器中，我们需要 [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) 来让 TypeScript 语言服务识别 `.vue` 类型。

如果你觉得独立的 TypeScript 插件不够快，Volar 还实现了一个更高性能的[接管模式](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669)。你可以通过以下步骤启用它：

1. 禁用内置的 TypeScript 扩展
   1. 从 VSCode 的命令面板运行 `Extensions: Show Built-in Extensions`
   2. 找到 `TypeScript and JavaScript Language Features`，右键选择 `Disable (Workspace)`
2. 通过从命令面板运行 `Developer: Reload Window` 重新加载 VSCode 窗口。

# Surveygen(问卷星自动答题助手)

## 支持的问题类型

当前版本支持以下问题类型:

1. 单选题 (Radio)
2. 多选题 (Checkbox)
3. 矩阵题 (Matrix)
4. 文本题 (Textarea)

## 使用说明

...（这里可以添加使用说明和其他相关信息）
