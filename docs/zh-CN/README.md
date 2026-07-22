# @dreamer/markdown

> 📖 [English](../../README.md) | 中文

> 功能丰富的 Markdown 解析包，支持 Front Matter、目录生成、GFM 扩展及 45+
> 种扩展语法

[![JSR](https://jsr.io/badges/@dreamer/markdown)](https://jsr.io/@dreamer/markdown)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../LICENSE)
[![Tests](https://img.shields.io/badge/tests-565%20passed-brightgreen)](./TEST_REPORT.md)

---

## 🎯 功能

Markdown 解析和渲染包，提供完整的 Markdown 处理功能，支持 GFM（GitHub Flavored
Markdown）、数学公式、代码高亮、图表可视化、多媒体嵌入等丰富扩展。零依赖纯
TypeScript 实现，适用于文档系统、博客平台、知识库等场景。

---

## 📦 安装

### Deno

```bash
deno add jsr:@dreamer/markdown
```

### Bun

```bash
bunx jsr add @dreamer/markdown
```

### Node.js (>=22)

```bash
npx jsr add @dreamer/markdown
```

---

## 🌍 环境兼容性

| 环境        | 版本要求 | 状态                                        |
| ----------- | -------- | ------------------------------------------- |
| **Deno**    | 2.0+     | ✅ 完全支持                                 |
| **Bun**     | 1.0+     | ✅ 完全支持                                 |
| **Node.js** | 22+      | ✅ 完全支持                                 |
| **服务端**  | -        | ✅ 支持（兼容 Deno、Bun 和 Node.js 运行时） |
| **浏览器**  | -        | ✅ 支持（纯 TypeScript，无运行时依赖）      |
| **依赖**    | -        | 📦 零依赖（纯 TypeScript 实现）             |

---

## ✨ 特性

- **基础语法**：
  - 标题（H1-H6）、粗体、斜体、删除线
  - 链接、图片、行内代码
  - 无序/有序列表、任务列表
  - 引用块、水平线
  - GFM 表格（支持对齐）
  - 代码块（带语言标识）

- **表格增强**：
  - 单元格合并（rowspan/colspan）
  - 可排序表格（点击表头排序）
  - 响应式表格（移动端横向滚动）
  - 表格搜索/过滤
  - 表格标题（caption）
  - 斑马条纹、悬停高亮
  - 从数据自动生成表格

- **高级语法**：
  - Front Matter 解析（YAML 格式）
  - 目录生成（TOC）
  - 脚注（`[^1]` 语法）
  - 数学公式（`$...$` 行内，`$$...$$` 块级）
  - 自动链接（URL 和邮箱）
  - 定义列表（术语 + `: 定义`）
  - 缩写（`*[abbr]: full text`）
  - 自定义容器（`:::type` 语法）
  - 嵌套列表

- **文本增强**：
  - 上标（`^text^`）、下标（`~text~`）
  - 高亮文本（`==text==`）
  - 插入文本（`++text++`）
  - 键盘按键（`[[Ctrl]]`）
  - Emoji 简码（`:smile:` → 😄，600+ emoji + 100+ 别名）
  - Ruby 注音、徽章、标签、按钮
  - 进度条、文本方向（RTL/LTR）

- **图表与可视化**：
  - Mermaid 图表（流程图、时序图、甘特图、饼图、xychart）
  - Chart.js 图表（折线图、柱状图、饼图、雷达图、散点图、气泡图等）
  - PlantUML 图表
  - 思维导图
  - 数学公式渲染（KaTeX，自动注入脚本）

- **代码增强**：
  - Prism.js 语法高亮（自动注入）
  - 行号显示
  - 复制按钮
  - 高亮行
  - Diff 高亮
  - 代码组（多语言切换）
  - 文件树展示

- **媒体支持**：
  - 图片标题/说明（figure/figcaption）
  - 图片懒加载、缩放、灯箱
  - 视频嵌入（YouTube/Bilibili/Vimeo）
  - 音频播放器
  - iframe 嵌入

- **布局组件**：
  - 多栏布局
  - 标签页、手风琴
  - 时间线、卡片网格
  - 步骤条

- **交互功能**：
  - 平滑滚动
  - 关键词高亮
  - TOC 导航（滚动激活）
  - 返回顶部按钮
  - 阅读进度条

- **文档功能**：
  - 文件包含（`@include`）
  - 变量定义与引用
  - 条件渲染
  - 术语表、API 文档
  - 变更日志

- **样式主题**：
  - 亮色/暗色主题
  - GitHub/GitLab/Minimal/Modern 预设
  - CSS 变量系统
  - 打印样式

---

## 🎯 使用场景

- **文档系统**：技术文档、API 文档、用户手册
- **博客平台**：文章发布、内容管理
- **知识库**：Wiki、笔记系统
- **静态站点**：文档站点生成
- **在线编辑器**：实时预览、Markdown 编辑
- **内容管理**：CMS 内容渲染

---

## 🚀 快速开始

### 基础渲染

```typescript
import { render } from "@dreamer/markdown";

// 完整渲染（包含 Front Matter 解析和目录生成）
const result = render(`---
title: Hello World
author: Dreamer
---

# 标题

这是一段 **Markdown** 文本。

## 子标题

- 列表项 1
- 列表项 2
`);

console.log(result.frontMatter); // { title: "Hello World", author: "Dreamer" }
console.log(result.html); // 渲染后的 HTML
console.log(result.toc); // 目录结构
```

### 单独解析

```typescript
import { extractToc, parse, parseFrontMatter } from "@dreamer/markdown";

// 仅解析 Markdown
const html = parse("# Hello **World**");

// 仅解析 Front Matter
const { frontMatter, body } = parseFrontMatter(`---
title: Hello
---

# Content`);

// 从 HTML 提取目录
const toc = extractToc(html);
```

---

## 🎨 使用示例

### 高级语法

```typescript
import { render } from "@dreamer/markdown";

const result = render(`
## 上标/下标

水的化学式是 H~2~O，爱因斯坦公式 E=mc^2^

## 高亮和删除

这是 ==高亮文本== 和 ~~删除线~~

## 键盘按键

按 [[Ctrl]] + [[C]] 复制

## Emoji

:smile: :heart: :+1: :fire: :star:

## 定义列表

术语
: 这是术语的定义

## 自定义容器

:::tip 小技巧
这是一个提示信息。
:::

:::warning 警告
请注意安全！
:::

## 表格对齐

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| A      | B    | C      |

## 脚注

这是一段带脚注的文本[^1]。

[^1]: 这是脚注内容。

## 数学公式

行内公式：$E=mc^2$

块级公式：

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`);
```

### 代码高亮

```typescript
import { type CodeHighlighter, render } from "@dreamer/markdown";
import hljs from "highlight.js";

// 使用自定义高亮函数
const highlight: CodeHighlighter = (code, lang) => {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang }).value;
  }
  return code;
};

const result = render(
  `
\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`
`,
  { highlight },
);
```

### 表格增强

```typescript
import {
  createTable,
  createTableFromData,
  getTableScript,
  getTableStyles,
  parseEnhancedTable,
  parseTable,
} from "@dreamer/markdown";

// 基础表格解析（带对齐）
const tableHtml = parseTable(
  `
| 姓名 | 年龄 | 城市 |
|:-----|:----:|-----:|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |
`,
  { sortable: true, searchable: true },
);

// 使用注释语法定义表格选项
const enhancedHtml = parseEnhancedTable(`
<!-- table: sortable, searchable, caption="用户列表" -->
| 姓名 | 年龄 |
|:-----|-----:|
| 张三 | 25   |
`);

// 从数组创建表格
const table1 = createTable(
  ["功能", "状态"],
  [["排序", "✅"], ["搜索", "✅"]],
  { sortable: true },
);

// 从对象数组创建表格
const users = [
  { name: "张三", age: 25 },
  { name: "李四", age: 30 },
];
const table2 = createTableFromData(users, [
  { key: "name", label: "姓名" },
  { key: "age", label: "年龄", align: "right" },
]);

// 获取表格样式和脚本（用于完整页面）
const styles = getTableStyles();
const script = getTableScript();
```

**单元格合并语法**:

```markdown
<!-- 横向合并：使用 || 或 > -->

| A | || | || |

<!-- 纵向合并：使用 ^^ 或 ^ -->

| A | B | | ^^ | C |
```

**使用注释定义表格选项**:

```markdown
<!-- table: sortable, searchable, caption="用户数据" -->

| 姓名 | 年龄 | 城市 |
| :--- | :--: | ---: |
| 张三 |  25  | 北京 |
| 李四 |  30  | 上海 |
| 王五 |  28  | 广州 |
```

支持的选项：

- `sortable` - 启用列排序（点击表头）
- `searchable` - 启用搜索过滤
- `caption="标题"` - 设置表格标题
- `class="类名"` - 自定义 CSS 类
- `no-responsive` - 禁用响应式
- `no-striped` - 禁用斑马条纹
- `no-hover` - 禁用悬停高亮

### 完整 HTML 页面生成

```typescript
import { applyTemplate, createTemplate, render } from "@dreamer/markdown";

const result = render(`
# 标题

:smile: 这是一段文本。

\`\`\`javascript
console.log("Hello");
\`\`\`

$$E = mc^2$$
`);

// render() 自动收集所需的样式和脚本
console.log(result.styles); // 包含主题、表格、图表样式
console.log(result.scripts); // 包含 Mermaid、KaTeX、Prism.js 等

// 使用模板生成完整 HTML 页面
const template = createTemplate({ title: "我的文档" });
const html = applyTemplate(template, result);
// html 包含完整的 <!DOCTYPE html>... 页面
```

### 图表支持

```typescript
import {
  getMermaidScript,
  parseMermaid,
  restoreMermaid,
} from "@dreamer/markdown";

let content = `
# 流程图示例

\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
\`\`\`
`;

// 提取并处理 Mermaid 图表
const { content: processed, placeholders } = parseMermaid(content);

// 恢复图表
const html = restoreMermaid(processed, placeholders);

// 获取 Mermaid 初始化脚本
const script = getMermaidScript();
```

### Chart.js 图表

在 Markdown 中使用 \`\`\`chartjs 代码块定义图表：

````markdown
```chartjs
{
  "type": "bar",
  "data": {
    "labels": ["一月", "二月", "三月", "四月"],
    "datasets": [{
      "label": "销售额",
      "data": [65, 59, 80, 81],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": { "display": true, "text": "月度销售统计" }
    }
  }
}
```
````

支持的图表类型：

- `line` - 折线图
- `bar` - 柱状图
- `pie` - 饼图
- `doughnut` - 圆环图
- `radar` - 雷达图
- `polarArea` - 极坐标图
- `scatter` - 散点图
- `bubble` - 气泡图

```typescript
import {
  getChartJSScript,
  parseChartJS,
  restoreChartJS,
} from "@dreamer/markdown";

// 解析 Chart.js 代码块
const { content, charts } = parseChartJS(markdown);

// 恢复图表 HTML
const html = restoreChartJS(content, charts);

// 获取 Chart.js 脚本（自动从 CDN 加载）
const script = getChartJSScript();
```

### 媒体嵌入

```typescript
import { parseVideo, renderBilibili, renderYouTube } from "@dreamer/markdown";

// YouTube 视频
const youtubeHtml = renderYouTube("dQw4w9WgXcQ", {
  width: 560,
  height: 315,
  autoplay: false,
});

// Bilibili 视频
const bilibiliHtml = renderBilibili("BV1xx411c7mD", {
  width: 800,
  height: 450,
});
```

### 布局组件

```typescript
import { parseColumns, parseTabs, parseTimeline } from "@dreamer/markdown";

// 多栏布局
const columnsHtml = parseColumns(`
:::columns 2
:::column
第一栏内容
:::
:::column
第二栏内容
:::
:::
`);

// 标签页
const tabsHtml = parseTabs(`
:::tabs
@tab JavaScript
console.log("Hello");
@tab Python
print("Hello")
:::
`);
```

### 主题系统

```typescript
import {
  getFullThemeStyles,
  getPresetTheme,
  getThemeToggleScript,
  renderThemeToggle,
} from "@dreamer/markdown";

// 获取完整主题样式
const styles = getFullThemeStyles();

// 获取预设主题
const githubTheme = getPresetTheme("github");
const modernTheme = getPresetTheme("modern");

// 主题切换按钮
const toggleButton = renderThemeToggle();
const toggleScript = getThemeToggleScript();
```

---

## 📚 API 文档

### 主要函数

| 函数                        | 说明                                   |
| --------------------------- | -------------------------------------- |
| `render(content, options)`  | 完整渲染，返回 HTML、Front Matter、TOC |
| `parse(content, options)`   | 仅解析 Markdown 为 HTML                |
| `parseFrontMatter(content)` | 解析 Front Matter                      |
| `extractToc(html)`          | 从 HTML 提取目录                       |
| `buildNestedToc(items)`     | 构建嵌套目录结构                       |
| `renderToc(items)`          | 渲染目录 HTML                          |

### 表格增强函数

| 函数                                          | 说明                          |
| --------------------------------------------- | ----------------------------- |
| `parseTable(html, options)`                   | 解析 GFM 表格，支持增强选项   |
| `parseEnhancedTable(html)`                    | 解析带注释选项的表格          |
| `createTable(headers, rows, options)`         | 从数组创建表格                |
| `createTableFromData(data, columns, options)` | 从对象数组创建表格            |
| `getTableStyles()`                            | 获取表格 CSS 样式             |
| `getTableScript()`                            | 获取表格 JS 脚本（排序/搜索） |

### 表格增强选项

```typescript
interface TableEnhanceOptions {
  responsive?: boolean; // 响应式（默认 true）
  sortable?: boolean; // 可排序（默认 false）
  searchable?: boolean; // 可搜索（默认 false）
  searchPlaceholder?: string; // 搜索占位符
  striped?: boolean; // 斑马条纹（默认 true）
  hover?: boolean; // 悬停高亮（默认 true）
  className?: string; // 自定义类名
  caption?: string; // 表格标题
}
```

### 渲染选项

```typescript
interface MarkdownOptions {
  frontMatter?: boolean; // 是否解析 Front Matter（默认 true）
  toc?: boolean; // 是否生成目录（默认 true）
  gfm?: boolean; // 是否启用 GFM（默认 true）
  breaks?: boolean; // 是否转换换行符（默认 false）
  footnotes?: boolean; // 是否启用脚注（默认 true）
  math?: boolean; // 是否启用数学公式（默认 true）
  autolink?: boolean; // 是否自动链接（默认 true）
  definitionList?: boolean; // 是否启用定义列表（默认 true）
  abbreviations?: boolean; // 是否启用缩写（默认 true）
  containers?: boolean; // 是否启用容器（默认 true）
  superSubScript?: boolean; // 是否启用上下标（默认 true）
  highlight_text?: boolean; // 是否启用高亮文本（默认 true）
  insertDelete?: boolean; // 是否启用插入删除（默认 true）
  emoji?: boolean; // 是否启用 Emoji（默认 true）
  keyboard?: boolean; // 是否启用键盘按键（默认 true）
  highlight?: CodeHighlighter; // 自定义代码高亮函数
}
```

### 模块导出

| 模块                             | 主要导出                                         |
| -------------------------------- | ------------------------------------------------ |
| `@dreamer/markdown`              | 主入口，导出所有功能                             |
| `@dreamer/markdown/parser`       | `parse` 解析器                                   |
| `@dreamer/markdown/front-matter` | `parseFrontMatter`                               |
| `@dreamer/markdown/toc`          | `extractToc`, `buildNestedToc`, `renderToc`      |
| `@dreamer/markdown/table`        | `parseTable`, `createTable`, `getTableStyles` 等 |
| `@dreamer/markdown/chart`        | Mermaid, PlantUML, 思维导图                      |
| `@dreamer/markdown/code`         | 代码块增强                                       |
| `@dreamer/markdown/media`        | 媒体嵌入                                         |
| `@dreamer/markdown/components`   | 布局组件                                         |
| `@dreamer/markdown/text`         | 文本增强                                         |
| `@dreamer/markdown/interactive`  | 交互功能                                         |
| `@dreamer/markdown/document`     | 文档功能                                         |
| `@dreamer/markdown/meta`         | 元信息                                           |
| `@dreamer/markdown/theme`        | 主题系统                                         |

---

## 🚀 性能优化

- **预编译正则**：80+ 个正则表达式预编译，避免重复编译
- **ID 缓存**：LRU 缓存（500 条），避免重复计算
- **映射表优化**：HTML 转义使用字符映射表，单次遍历
- **输入限制**：1MB 长度限制，防止性能问题
- **工具函数复用**：占位符、段落清理等逻辑复用

---

## 📊 测试报告

[![Tests](https://img.shields.io/badge/tests-565%20passed-brightgreen)](./TEST_REPORT.md)

| 指标     | 值   |
| -------- | ---- |
| 总测试数 | 565  |
| 通过     | 565  |
| 失败     | 0    |
| 通过率   | 100% |
| 测试文件 | 21   |

详细测试报告请查看 [TEST_REPORT.md](./TEST_REPORT.md)。

---

## 📝 注意事项

- **安全性**：所有用户输入自动 HTML 转义，防止 XSS 攻击
- **URL 验证**：自动过滤 `javascript:`、`data:` 等危险协议
- **视频 ID 验证**：YouTube/Bilibili/Vimeo ID 格式验证
- **iframe sandbox**：默认添加 sandbox 属性限制功能
- **输入限制**：默认 1MB 长度限制，防止性能问题
- **浏览器兼容**：需要 ES2020+ 环境支持

---

## 📜 变更日志

### [1.0.1] - 2026-04-07

**修复** — `applyGfmLineBreaks` 与 breaks；**`cleanupParagraphs`**
下水平线与段落、 **`md-table-responsive`** 外 **`div`** 不再误包 **`</p>`** /
**`<p>`**；行内数学 **`data-math`** 免受 **`^...^`** 破坏。 **新增** —
**`applyGfmLineBreaks`** 导出及 parser 测试。 **变更** — **`deno fmt`** 排除
**`examples/**/*.html`**。完整记录见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](../../LICENSE)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
