# 变更日志

@dreamer/markdown 的所有重要变更均记录于此。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.1.1] - 2026-07-22

### 变更

- **`@dreamer/test`**：`^1.2.0` → `^1.2.3`（deno.json 与 package.json
  同步），接入 test 1.2.3 的 `--test-force-exit` 修复与 runtime-adapter 1.2.2
  集成。
- **CI：Deno `v2.5` → `v2.9`**（3 处）：对齐本地开发环境与其他 @dreamer 包。
- **`tsx`**：`^4.19.2` → `^4.23.1`。

### 修复

- **`test:node` Linux CI 退出码 1**：为 `test:node` 脚本添加
  `--test-force-exit`，测试完成后强制干净退出（与 @dreamer/test、runtime-adapter
  一致）。

---

## [1.1.0] - 2026-07-22

### 新增

- **Node.js 兼容：** 在 Deno、Bun 之外提供一等公民的 Node.js（>=22）支持。新增
  `package.json`（`@dreamer/markdown`、`type: module`、`engines.node >= 22`）、
  `.npmrc`（`@jsr` registry）、`tsconfig.json`（tsx loader 配置）与 `test:node`
  脚本（`tsx --tsconfig tsconfig.json --test tests/*.test.ts`）。全部 21
  个测试文件 三端共享，无 Node 专属剔除。
- **CI：** 9 任务矩阵（Deno / Bun / Node × Linux / macOS / Windows）。Node
  任务使用 `npm install` + `npm run test:node`（Node 22），不安装 Chromium。在
  push/PR 到 `dev` 分支时触发。
- `deno.json` 新增 `minimumDependencyAge: 0`，使开发期能消费刚发布的
  `@dreamer/test`。

### 安全

- **`sanitizeUrl` / `isUrlSafe` — `\t` `\n` `\r` 协议绕过修复。**
  浏览器在导航前会 剥离 URL 中的 `\t` `\n` `\r`，因此 `java\nscript:alert(1)`
  会被规范化为 `javascript:alert(1)`
  并执行。旧实现仅对原始串做协议检测，可被绕过。两个函数现改为 在
  `^(javascript|vbscript|data|file):` 检测**之前**剥离 `\t` `\n` `\r`（预编译
  `URL_INLINE_WHITESPACE_REGEX`），并返回浏览器规范化后的 URL。新增 9
  个回归测试覆盖 各绕过向量。
- **灯箱 DOM 型 XSS 修复（`media.ts`）。** `getLightboxScript` 原先用
  `innerHTML` 拼接 `img.alt` 构建大图。由于 DOM 读取 `img.alt` 时会把 `&quot;`
  解码回 `"`， 攻击者可在 alt 中用 `"` 断出属性并注入
  `<img onerror=...>`。已改为 `createElement` + 属性赋值（`bigImg.src` /
  `bigImg.alt`），不触发 HTML 解析，从根上 消除该向量。
- **iframe `src` 防御性加固（`media.ts`）。**
  `renderYouTube`、`renderBilibili`、 `renderVimeo` 现对计算所得 `src` 包裹
  `escapeHtml(...)`，与既有 `renderLocalVideo` / `renderIframe`
  模式一致。同时将查询串中的裸 `&`（如 `&high_quality`）修正为 `&amp;`，产出合法
  HTML 属性。视频 ID 仍受严格白名单约束 （`SAFE_VIDEO_ID_REGEX` /
  `SAFE_BVID_REGEX` / `^\d+$`）。
- **术语表 ReDoS 防护（`document.ts`）。** `linkGlossaryTerms` 在构建
  `new RegExp(...)` 前跳过长度超过 50 字符的术语，与 `parser.ts` 既有
  `MAX_ABBR_LENGTH` 防护一致。

### 测试

- 三端全量套件全绿：**Deno 574 / Bun 553 / Node 553**（0 failed）。
- `deno check src/mod.ts` 与 `deno lint src/ tests/` 均通过。

---

## [1.0.1] - 2026-04-07

### 修复

- **`parse(..., { breaks: true })`：** 不再对整段 HTML 粗暴执行 `\n` →
  `<br>`，改为 **`applyGfmLineBreaks`**：保护围栏 **`<pre><code>`**
  内真实换行；去掉仅位于相邻块级标签之间的排版换行；保留段落/列表项等正文内的软换行为
  **`<br>`**。
- **水平线与段落：** **`cleanupParagraphs`** 在「单换行接 `---`」等情况下先于
  **`<hr>`** 正确闭合 **`</p>`**，并清理错误的 **`<hr></p>`**，保证 HTML 合法。
- **行内数学与上标：** 处理 **`^...^`** 时用占位符保护
  **`<span
  class="math-inline">`**，避免正则从 **`data-math`** 跨到正文，破坏
  LaTeX（如 `a^2 + b^2 = c^2`）。
- **表格：** 去掉误包在 **`<p>`** 内的 **`md-table-responsive`** 外层
  **`div`**。

### 新增

- **`applyGfmLineBreaks(html)`**（**`./utils`**），并从根包 **`src/mod.ts`**
  再导出。
- **测试**：breaks、水平线、数学 **`data-math`** 安全及相关解析边界。

### 变更

- **`deno.json`：** **`deno fmt`** 排除
  **`examples/**/*.html`**（示例生成页不作手写源码格式化）。

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
- **示例**：`examples/generate-html.ts` 在打印 `styles` / `scripts`
  长度时使用空值合并，与可选字段类型一致，保证 `deno check .` 通过。

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
