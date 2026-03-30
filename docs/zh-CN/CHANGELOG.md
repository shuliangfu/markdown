# 变更日志

@dreamer/markdown 的所有重要变更均记录于此。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.0] - 2026-03-30

首个**稳定版**。公开 API、子路径导出与行为与 `1.0.0-beta.1` 一致，并对
`MarkdownResult` 做了**类型层**收紧/放宽（见 **变更**）。生产环境建议使用
`jsr:@dreamer/markdown@^1.0.0` 以遵循 SemVer。

### 新增（相对「能力定型」的归纳）

- **核心 API**
  - `render(content, options?)`：可选 YAML Front
    Matter、图表/增强表格预处理（占位符）、Markdown
    `parse`、占位符还原、目录提取，并汇总表格/代码（Prism）/图表（Mermaid、PlantUML、思维导图、Chart.js）/数学公式及基础主题的
    CSS、JS 片段。
  - `parse(markdown, parseOptions?)`：输出 HTML，支持类 GFM
    扩展及可选项（脚注、数学、自动链接、定义列表、缩写、自定义容器、上标/下标、高亮/插入/删除、Emoji、键盘标记、自定义
    `highlight` 等）。
  - `parseFrontMatter`、`extractToc`、`buildNestedToc`、`renderToc`：元数据与导航。
  - `applyTemplate(template, result)`、`DEFAULT_TEMPLATE`、`createTemplate`：将渲染结果包成完整
    HTML，并在存在时注入 `styles` / `scripts`。
- **子路径导出**（按需裁剪、高级用法）：`./types`、`./parser`、`./front-matter`、`./toc`、`./table`、`./list`、`./container`、`./emoji`、`./template`、`./utils`、`./chart`、`./code`、`./media`、`./components`、`./text`、`./interactive`、`./document`、`./meta`、`./theme`。
- **表格**：GFM 表格 +
  增强能力（合并、排序、检索/过滤、响应式、标题、斑马纹/悬停等样式辅助）；`getTableStyles`
  / `getTableScript`。
- **图表**：Mermaid、PlantUML、思维导图、Chart.js 等经占位符贯穿解析并在 HTML
  中还原；`getMermaidScript`、`getChartStyles`、`getChartJSScript`、`getMathScript`
  等辅助方法。
- **代码**：围栏代码块与语言标记；可选 `CodeHighlighter`；`getPrismStyles` /
  `getPrismScript`。
- **主题**：`getFullThemeStyles` 及预设向样式。
- **安全与健壮性**：文本转义、URL
  消毒与协议过滤、长度限制、多阶段解析占位工具等。
- **文档与测试**：中英文 README、测试报告，完整自动化测试套件全部通过（见
  `docs/zh-CN/TEST_REPORT.md`）。

### 变更

- **`MarkdownResult`**：`styles`、`scripts` 在类型上改为**可选**。`render()`
  的返回值仍会带上这两项。手写 `MarkdownResult`（例如仅用于 `applyTemplate`
  的测试或工具链）可不填 `styles`/`scripts`。`applyTemplate`
  本就仅在字段为真时注入，对真实 `render()` 输出无行为变化。
- **示例**：`examples/generate-html.ts` 在打印 `styles` / `scripts` 长度时使用空值合并，与可选字段类型一致，保证 `deno check .` 通过。

### 从 `1.0.0-beta.1` 迁移

- 将依赖改为 `jsr:@dreamer/markdown@^1.0.0`（或固定 `1.0.0`）。
- 与 beta.1 相比无删除或重命名的公开导出。
- 若曾手写 `MarkdownResult` 字面量，可按需省略 `styles`/`scripts`。

### 兼容性

- **Deno** 建议 2.x（详见 README 环境表）。
- **Bun** 见 `package.json` 的 `engines`（≥ 1.3）。
- 库侧为纯 TypeScript 源码，对使用者无强制 npm 运行时依赖（见 README）。

---

## [1.0.0-beta.1] - 2026-02-19

预发布版本；能力描述已由稳定版 **1.0.0** 覆盖。生产请使用 **1.0.0** 的 SemVer
范围。
