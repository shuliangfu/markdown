/**
 * @fileoverview Markdown 基础渲染示例
 *
 * 展示 @dreamer/markdown 的基本用法
 */

import { render, parse } from "../src/mod.ts";

// ============================================================================
// 基本渲染
// ============================================================================

console.log("=== 基本 Markdown 渲染 ===\n");

const markdown = `
# 标题一

这是一段普通文本，包含 **粗体** 和 *斜体*。

## 标题二

- 列表项 1
- 列表项 2
- 列表项 3

### 代码块

\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`

### 链接和图片

[访问 GitHub](https://github.com)

![示例图片](https://example.com/image.png)
`;

// 使用 render 完整渲染（包含 Front Matter 解析、目录生成）
const result = render(markdown);

console.log("渲染后的 HTML:");
console.log(result.html);
console.log("\n目录结构:");
console.log(JSON.stringify(result.toc, null, 2));

// ============================================================================
// 仅解析（不处理 Front Matter）
// ============================================================================

console.log("\n=== 仅解析模式 ===\n");

const simpleMarkdown = "Hello **World**!";
const html = parse(simpleMarkdown);

console.log("输入:", simpleMarkdown);
console.log("输出:", html);

// ============================================================================
// 自定义选项
// ============================================================================

console.log("\n=== 自定义渲染选项 ===\n");

const customResult = render(markdown, {
  // 启用 GFM（GitHub Flavored Markdown）
  gfm: true,
  // 将换行符转换为 <br>
  breaks: true,
  // 自动链接 URL
  autolink: true,
  // 不生成目录
  toc: false,
});

console.log("禁用目录后的 toc:", customResult.toc);

// ============================================================================
// 代码高亮（自定义高亮函数）
// ============================================================================

console.log("\n=== 自定义代码高亮 ===\n");

/**
 * 简单的代码高亮函数示例
 *
 * @param code - 代码内容
 * @param lang - 语言
 * @returns 高亮后的 HTML
 */
function customHighlighter(code: string, lang?: string): string {
  // 这里可以集成 Prism.js、Highlight.js 等
  return `<pre class="language-${lang || "text"}"><code>${code}</code></pre>`;
}

const codeResult = render("```js\nconst x = 1;\n```", {
  highlight: customHighlighter,
});

console.log("自定义高亮结果:", codeResult.html);
