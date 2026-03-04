# Changelog

# 1.1.0 (2026-03-04)


### Bug Fixes

* 优化 RangeSettingMode 组件的样式，增强选择框的可用性和用户体验。 ([738e5cb](https://github.com/PeanutSplash/Surveygen/commit/738e5cb4544f3b6dba2c98fbe9df2dfd165544fe))
* 修复 QuestionDisplay 组件中的输入处理逻辑，确保 textareaInputs 在高级模式下的正确更新；优化样式以提升用户体验。 ([169a20a](https://github.com/PeanutSplash/Surveygen/commit/169a20a280970dd9a39536c9e69feaeab9a47f57))
* 修复 QuestionDisplay 组件中的输入绑定，确保 textareaInputs 和选项输入的安全访问；优化样式以支持响应式布局。 ([572965a](https://github.com/PeanutSplash/Surveygen/commit/572965aff3a02f4c4d7d6e308b3dac8640388b23))
* 更新 QuestionDisplay 组件中的 updateTextareaValue 方法，简化输入处理逻辑，支持高级模式下的 textareaInputs 更新；优化输入绑定以确保数据一致性。 ([7647c1a](https://github.com/PeanutSplash/Surveygen/commit/7647c1ae131820ac0c847e459ba7ed1233cd1a55))
* 更新 README 文档，将项目名称修改为“问卷星自动答题助手”。 ([0902ae1](https://github.com/PeanutSplash/Surveygen/commit/0902ae123e32530b8961fbc89f983db99bf13ad0))


### Features

* add probability edit mode ([62d890f](https://github.com/PeanutSplash/Surveygen/commit/62d890f85d127bcdd1a3a4f8c7e159c11bb80944))
* add release-it config and update CI workflow ([7ffafb4](https://github.com/PeanutSplash/Surveygen/commit/7ffafb488f8ebe340d92e9dd9fbe17194d9567a5))
* 优化 MatrixProbabilityList 组件，简化按钮样式，增强概率计算逻辑，确保编辑模式下的概率值正确显示；更新概率总和计算逻辑，提升用户交互体验。 ([3b9ca8f](https://github.com/PeanutSplash/Surveygen/commit/3b9ca8f3fa34d3174ce39a07112b883852970233))
* 优化 QuestionDisplay 组件，添加随机按钮和编辑概率按钮的显示逻辑，增强用户交互体验；更新 surveyStore 以支持高级模式下的回答验证逻辑。 ([4ca2c54](https://github.com/PeanutSplash/Surveygen/commit/4ca2c5453dac303e3add9b15518b9e2fecade0ed))
* 优化 QuestionDisplay 组件的高级模式布局，增强响应式设计，提升用户交互体验；调整概率显示样式，确保在编辑模式下的可用性和一致性。 ([f7c3c78](https://github.com/PeanutSplash/Surveygen/commit/f7c3c7892156843b877b9575d4b99e63947c7be1))
* 在 QuestionDisplay 组件中添加快速填入功能，支持文本框概率编辑，优化 textareaInputs 的管理逻辑，提升用户体验。 ([325aae8](https://github.com/PeanutSplash/Surveygen/commit/325aae8f376b33165e85de12e4116c0150850c55))
* 在 QuestionDisplay 组件中集成响应式容器功能，优化布局以适应不同屏幕宽度，提升用户交互体验；新增 useResponsiveContainer composable 以支持动态网格列数计算。 ([20f773e](https://github.com/PeanutSplash/Surveygen/commit/20f773e6eb85b19044695e6ee0b342b47aca1f83))
* 在 ScaleQuestion 组件中添加星级评分支持，优化量表选项解析逻辑，增强用户交互体验。 ([81e66da](https://github.com/PeanutSplash/Surveygen/commit/81e66daff00d7a93769da1bc391a751dffda42f3))
* 更新 README 文档，修改项目名称为“问卷星自动答题”，添加核心功能和使用教程，简化问题类型描述，更新许可证信息为 Apache-2.0，增加后续功能预告。 ([18a005a](https://github.com/PeanutSplash/Surveygen/commit/18a005ad67a2b4675bbc2cdd10754f0383d5135a))
* 更新 README 文档，添加问卷生成器功能介绍和使用示例；优化 useSurveyObserver 组合式函数，增强 DOM 变化监控；完善 surveyStore 状态管理，增加问卷可见性和高级模式切换功能；改进人类行为模拟函数，提升用户交互体验。 ([c915bcd](https://github.com/PeanutSplash/Surveygen/commit/c915bcdc5acc0924c866f224514ae94de5e9321e))
* 更新 README.md，新增“支持AI作答”功能描述，提升文档内容的准确性和可读性。 ([4eefb6d](https://github.com/PeanutSplash/Surveygen/commit/4eefb6d30896152d494fc546c675d9b58ec8dfb6))
* 添加 MatrixProbabilityList 组件，支持矩阵题概率管理，优化 QuestionDisplay 组件以集成新功能，提升用户交互体验。 ([2171273](https://github.com/PeanutSplash/Surveygen/commit/2171273a89ee7fc78c28779c4e873489b9d6abf0))
* 添加手动提交功能，优化人机验证处理逻辑，增强用户交互体验；更新组件以支持单次提交操作。 ([05e433b](https://github.com/PeanutSplash/Surveygen/commit/05e433b4d1e643f6744443c4ae740110dedc1bad))
* 添加未回答问题的处理逻辑，增强用户提示体验；优化闪烁动画效果以引导用户注意未完成的问题。 ([da1634d](https://github.com/PeanutSplash/Surveygen/commit/da1634d94248a2b9eedc3e9d25031077c2018cd9))
* 添加概率编辑器组件及相关功能，支持快速预设、区间设置和手动调整模式，优化量表题概率管理逻辑。 ([9f5d9d3](https://github.com/PeanutSplash/Surveygen/commit/9f5d9d3ff4eb1bc1e56c81a55413af6a5953fab3))
