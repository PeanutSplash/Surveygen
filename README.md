# SurveyGen

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4.27-brightgreen" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.4.5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.2.12-purple" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Pinia-2.2.2-yellow" alt="Pinia">
</p>

<p align="center">
  <b>问卷星自动答题</b>
</p>

<p align="center">
  <img src="src/assets/image/screenshot.png" alt="SurveyGen Screenshot" width="700">
</p>

## 🎯 核心功能

这个脚本可以帮助你在问卷星全自动答题，并且绕过问卷星的复制限制。

## 📋 支持的问题类型

- 单选题
- 多选题
- 矩阵单选题
- 矩阵多选题
- 文本题
- 下拉选择题
- 量表题

## 📱 使用教程

### 方法一：通过页面预设答案

1. 在问卷页面中，首先手动填写所有问题的正确答案。
2. 将页面滑动到最底部。
3. 点击"提交为标准答案"按钮。
4. 之后，你可以选择"自动提交"（如果需要多次提交）或"单次提交"。

### 方法二：通过悬浮窗选择答案

1. 打开问卷页面后，脚本的悬浮窗会自动出现。
2. 在悬浮窗内，为每个问题选择或填写相应的答案。
3. 提交方式同上。

## 🔧 技术栈

- **前端框架**: Vue 3.4.27
- **构建工具**: Vite 5.2.12
- **开发语言**: TypeScript 5.4.5
- **状态管理**: Pinia 2.2.2
- **UI框架**: TailwindCSS 3.4.11

## 📝 许可证

[Apache-2.0](https://github.com/PeanutSplash/Surveygen?tab=Apache-2.0-1-ov-file)

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request 来帮助改进项目。

## ✨ 后续功能

- **高级模式（开发中）**: 允许用户为每个选项自定义提交填写的内容，并设置填写概率。敬请期待！
