# SurveyGen

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4.27-brightgreen" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.4.5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.2.12-purple" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Pinia-2.2.2-yellow" alt="Pinia">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  <b>一个现代化的问卷调查生成器</b>
</p>

## 📋 支持的问题类型

### 1. 单选题 (Radio)
- 支持单选按钮样式
- 可自定义选项数量
- 支持必填设置
- 支持选项说明

### 2. 多选题 (Checkbox)
- 支持多选按钮样式
- 可自定义选项数量
- 支持必填设置
- 支持选项说明
- 支持最大/最小选择数量限制

### 3. 矩阵题 (Matrix)
- 支持行标题和列标题
- 支持单选/多选模式
- 可自定义行列数量
- 支持必填设置
- 支持行列说明

### 4. 文本题 (Textarea)
- 支持单行/多行文本输入
- 支持字数限制
- 支持必填设置
- 支持占位符提示
- 支持正则表达式验证

## 🎯 核心功能

### 问卷设计
- 拖拽式问题添加
- 问题排序和复制
- 问题分组管理
- 问卷模板保存
- 问卷预览功能

### 数据管理
- 问卷数据导出(CSV/Excel)
- 数据统计分析
- 答卷记录查看
- 数据可视化展示

### 主题定制
- 自定义问卷主题色
- 自定义字体样式
- 自定义布局样式
- 支持暗黑模式

### 高级功能
- 问卷分享链接
- 答卷时间限制
- 答卷次数限制
- 问卷密码保护
- 答卷IP限制

## 🚀 快速开始

### 安装
```bash
# 克隆项目
git clone https://github.com/your-username/surveygen.git

# 进入项目目录
cd surveygen

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 📱 使用示例

### 创建问卷
1. 点击"新建问卷"按钮
2. 从左侧拖拽问题类型到设计区
3. 编辑问题内容和选项
4. 设置问题属性（必填、验证等）
5. 保存问卷

### 发布问卷
1. 点击"发布"按钮
2. 设置问卷访问权限
3. 获取问卷链接或二维码
4. 分享给目标用户

### 查看数据
1. 进入"数据统计"页面
2. 查看答卷数据统计
3. 导出数据报表
4. 分析数据结果

## 🔧 技术栈

- **前端框架**: Vue 3.4.27
- **构建工具**: Vite 5.2.12
- **开发语言**: TypeScript 5.4.5
- **状态管理**: Pinia 2.2.2
- **UI框架**: TailwindCSS 3.4.11

## 📝 许可证

[MIT](LICENSE)

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request 来帮助改进项目。
