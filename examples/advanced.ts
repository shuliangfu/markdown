/**
 * @fileoverview Markdown 高级功能示例
 *
 * 展示脚注、数学公式、自定义容器、缩写、上下标等高级功能
 */

import { render } from "../src/mod.ts";
import {
  enhanceFootnotes,
  getInteractiveStyles,
  highlightKeywords,
} from "../src/interactive.ts";

// ============================================================================
// 脚注
// ============================================================================

console.log("=== 脚注 ===\n");

const footnoteMarkdown = `
# 脚注示例

这是一段带有脚注的文本[^1]。

另一个脚注引用[^note]。

[^1]: 这是第一个脚注的内容。
[^note]: 这是命名脚注的内容。
`;

const footnoteResult = render(footnoteMarkdown, { footnotes: true });
console.log("脚注 HTML:");
console.log(footnoteResult.html);

// 增强脚注（悬浮预览）
const enhancedHtml = enhanceFootnotes(footnoteResult.html);
console.log("\n增强后的脚注 HTML:");
console.log(enhancedHtml);

// ============================================================================
// 数学公式
// ============================================================================

console.log("\n=== 数学公式 ===\n");

const mathMarkdown = `
# 数学公式示例

行内公式：质能方程 $E = mc^2$

块级公式：

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

另一个公式：

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$
`;

const mathResult = render(mathMarkdown, { math: true });
console.log("数学公式 HTML:");
console.log(mathResult.html);

// ============================================================================
// 自定义容器
// ============================================================================

console.log("\n=== 自定义容器 ===\n");

const containerMarkdown = `
# 容器示例

::: info
这是一个信息提示框。
:::

::: warning
这是一个警告提示框。
:::

::: danger
这是一个危险提示框。
:::

::: tip 小贴士
自定义标题的提示框。
:::

::: details 点击展开
这是可折叠的详情内容。
支持多行文本。
:::
`;

const containerResult = render(containerMarkdown, { containers: true });
console.log("容器 HTML:");
console.log(containerResult.html);

// ============================================================================
// 缩写
// ============================================================================

console.log("\n=== 缩写 ===\n");

const abbrMarkdown = `
# 缩写示例

本文介绍 HTML 和 CSS 的基础知识。

*[HTML]: 超文本标记语言
*[CSS]: 层叠样式表
`;

const abbrResult = render(abbrMarkdown, { abbreviations: true });
console.log("缩写 HTML:");
console.log(abbrResult.html);

// ============================================================================
// 上标和下标
// ============================================================================

console.log("\n=== 上标和下标 ===\n");

const subSupMarkdown = `
# 上标和下标示例

- 水的化学式：H~2~O
- 二氧化碳：CO~2~
- 平方：x^2^
- 立方：x^3^
- 指数：2^10^ = 1024
`;

const subSupResult = render(subSupMarkdown, { superSubScript: true });
console.log("上标下标 HTML:");
console.log(subSupResult.html);

// ============================================================================
// 高亮文本
// ============================================================================

console.log("\n=== 高亮文本 ===\n");

const markMarkdown = `
# 高亮文本示例

这是一段包含 ==高亮文本== 的内容。

重点：==这部分内容非常重要==
`;

const markResult = render(markMarkdown, { highlight_text: true });
console.log("高亮 HTML:");
console.log(markResult.html);

// ============================================================================
// Emoji
// ============================================================================

console.log("\n=== Emoji ===\n");

const emojiMarkdown = `
# Emoji 示例

:smile: 微笑
:heart: 红心
:thumbsup: 点赞
:rocket: 火箭
:warning: 警告
`;

const emojiResult = render(emojiMarkdown, { emoji: true });
console.log("Emoji HTML:");
console.log(emojiResult.html);

// ============================================================================
// 键盘按键
// ============================================================================

console.log("\n=== 键盘按键 ===\n");

const kbdMarkdown = `
# 快捷键示例

- 复制：[[Ctrl]] + [[C]]
- 粘贴：[[Ctrl]] + [[V]]
- 保存：[[Ctrl]] + [[S]]
- 全选：[[Ctrl]] + [[A]]
`;

const kbdResult = render(kbdMarkdown, { keyboard: true });
console.log("键盘按键 HTML:");
console.log(kbdResult.html);

// ============================================================================
// 搜索关键词高亮
// ============================================================================

console.log("\n=== 搜索关键词高亮 ===\n");

const content =
  "<p>TypeScript 是 JavaScript 的超集，TypeScript 添加了类型系统。</p>";
const keywords = ["TypeScript", "类型"];

const highlightedHtml = highlightKeywords(content, keywords);
console.log("高亮后的 HTML:");
console.log(highlightedHtml);

// ============================================================================
// 综合示例
// ============================================================================

console.log("\n=== 综合示例 ===\n");

const fullMarkdown = `
# 技术文档示例

## 简介

本文介绍 TypeScript^[一种 JavaScript 的超集]^ 的高级特性。

::: info 前置知识
需要了解 JavaScript 和 ES6 语法。
:::

## 类型系统

TypeScript 的类型系统非常强大：

- 基础类型：\`string\`、\`number\`、\`boolean\`
- 复合类型：数组、元组、对象
- 高级类型：泛型、联合类型、交叉类型

公式示例：复杂度 $O(n^2)$

::: warning 注意
类型检查只在编译时进行，运行时不会有额外开销。
:::

## 快捷操作

| 操作 | 快捷键 |
|------|--------|
| 格式化 | [[Shift]] + [[Alt]] + [[F]] |
| 跳转定义 | [[F12]] |
| 查找引用 | [[Shift]] + [[F12]] |

## 参考资料

更多信息请参考官方文档[^1]。

[^1]: https://www.typescriptlang.org/docs/

*[TypeScript]: 微软开发的开源编程语言
*[ES6]: ECMAScript 2015
`;

const fullResult = render(fullMarkdown, {
  gfm: true,
  footnotes: true,
  math: true,
  containers: true,
  abbreviations: true,
  superSubScript: true,
  keyboard: true,
});

console.log("综合渲染结果:");
console.log(fullResult.html);

// 获取交互样式
const styles = getInteractiveStyles();
console.log("\n交互样式（CSS）:");
console.log(styles.slice(0, 300) + "...");
