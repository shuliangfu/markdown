# @dreamer/markdown

> 📖 English | [中文文档](./docs/zh-CN/README.md)

> A feature-rich Markdown parser: Front Matter, TOC generation, GFM extensions,
> and 45+ extension syntaxes.

[![JSR](https://jsr.io/badges/@dreamer/markdown)](https://jsr.io/@dreamer/markdown)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-559%20passed-brightgreen)](./docs/en-US/TEST_REPORT.md)

---

## Features

A Markdown parsing and rendering package with full Markdown support: GFM (GitHub
Flavored Markdown), math formulas, code highlighting, chart visualization, media
embedding, and more. Zero-dependency pure TypeScript. Suitable for documentation
systems, blog platforms, knowledge bases, and similar use cases.

---

## Installation

### Deno

```bash
deno add jsr:@dreamer/markdown
```

### Bun

```bash
bunx jsr add @dreamer/markdown
```

---

## Environment compatibility

| Environment      | Version | Status                                          |
| ---------------- | ------- | ----------------------------------------------- |
| **Deno**         | 2.0+    | ✅ Fully supported                              |
| **Bun**          | 1.0+    | ✅ Fully supported                              |
| **Server**       | -       | ✅ Supported (Deno and Bun runtimes)            |
| **Browser**      | -       | ✅ Supported (pure TypeScript, no runtime deps) |
| **Dependencies** | -       | 📦 Zero dependencies (pure TypeScript)          |

---

## Capabilities

- **Basic syntax**:
  - Headings (H1–H6), bold, italic, strikethrough
  - Links, images, inline code
  - Unordered/ordered lists, task lists
  - Blockquotes, horizontal rules
  - GFM tables (with alignment)
  - Fenced code blocks (with language tag)

- **Table enhancements**:
  - Cell merge (rowspan/colspan)
  - Sortable tables (click header to sort)
  - Responsive tables (horizontal scroll on mobile)
  - Table search/filter
  - Table caption
  - Zebra striping, hover highlight
  - Auto-generate tables from data

- **Advanced syntax**:
  - Front Matter parsing (YAML)
  - Table of contents (TOC)
  - Footnotes (`[^1]` syntax)
  - Math (`$...$` inline, `$$...$$` block)
  - Autolinks (URLs and emails)
  - Definition lists (term + `: definition`)
  - Abbreviations (`*[abbr]: full text`)
  - Custom containers (`:::type` syntax)
  - Nested lists

- **Text enhancements**:
  - Superscript (`^text^`), subscript (`~text~`)
  - Highlight (`==text==`)
  - Insert (`++text++`)
  - Keyboard keys (`[[Ctrl]]`)
  - Emoji shortcodes (`:smile:` → 😄, 600+ emoji and 100+ aliases)
  - Ruby annotations, badges, tags, buttons
  - Progress bars, text direction (RTL/LTR)

- **Charts and visualization**:
  - Mermaid (flowcharts, sequence, Gantt, pie, xychart)
  - Chart.js (line, bar, pie, radar, scatter, bubble, etc.)
  - PlantUML
  - Mind maps
  - Math rendering (KaTeX, script auto-injected)

- **Code enhancements**:
  - Prism.js syntax highlighting (auto-injected)
  - Line numbers
  - Copy button
  - Highlighted lines
  - Diff highlight
  - Code groups (multi-language tabs)
  - File tree display

- **Media support**:
  - Image caption (figure/figcaption)
  - Image lazy load, zoom, lightbox
  - Video embed (YouTube / Bilibili / Vimeo)
  - Audio player
  - iframe embed

- **Layout components**:
  - Multi-column layout
  - Tabs, accordion
  - Timeline, card grid
  - Steps

- **Interactive**:
  - Smooth scroll
  - Keyword highlight
  - TOC navigation (scroll-active)
  - Back-to-top button
  - Reading progress bar

- **Document features**:
  - File include (`@include`)
  - Variable definition and reference
  - Conditional rendering
  - Glossary, API docs
  - Changelog

- **Theme**:
  - Light/dark theme
  - GitHub / GitLab / Minimal / Modern presets
  - CSS variable system
  - Print styles

---

## Use cases

- **Documentation**: Technical docs, API docs, user manuals
- **Blog**: Articles, content management
- **Knowledge base**: Wiki, note systems
- **Static sites**: Doc site generation
- **Online editor**: Live preview, Markdown editing
- **CMS**: Content rendering

---

## Quick start

### Basic rendering

```typescript
import { render } from "@dreamer/markdown";

// Full render (Front Matter + TOC)
const result = render(`---
title: Hello World
author: Dreamer
---

# Heading

This is **Markdown** text.

## Subheading

- Item 1
- Item 2
`);

console.log(result.frontMatter); // { title: "Hello World", author: "Dreamer" }
console.log(result.html); // Rendered HTML
console.log(result.toc); // TOC structure
```

### Parse only

```typescript
import { extractToc, parse, parseFrontMatter } from "@dreamer/markdown";

// Parse Markdown only
const html = parse("# Hello **World**");

// Parse Front Matter only
const { frontMatter, body } = parseFrontMatter(`---
title: Hello
---

# Content`);

// Extract TOC from HTML
const toc = extractToc(html);
```

---

## Examples

### Advanced syntax

```typescript
import { render } from "@dreamer/markdown";

const result = render(`
## Superscript / subscript

Water is H~2~O, Einstein: E=mc^2^

## Highlight and delete

This is ==highlighted== and ~~strikethrough~~

## Keyboard keys

Press [[Ctrl]] + [[C]] to copy

## Emoji

:smile: :heart: :+1: :fire: :star:

## Definition list

Term
: Definition of the term.

## Custom containers

:::tip Tip
This is a tip.
:::

:::warning Warning
Please be careful!
:::

## Table alignment

| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |

## Footnotes

Text with a footnote[^1].

[^1]: Footnote content.

## Math

Inline: $E=mc^2$

Block:

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`);
```

### Code highlighting

```typescript
import { type CodeHighlighter, render } from "@dreamer/markdown";
import hljs from "highlight.js";

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

### Table enhancements

```typescript
import {
  createTable,
  createTableFromData,
  getTableScript,
  getTableStyles,
  parseEnhancedTable,
  parseTable,
} from "@dreamer/markdown";

// Basic table parse (with alignment)
const tableHtml = parseTable(
  `
| Name  | Age | City   |
|:------|:---:|------:|
| Alice | 25  | Beijing |
| Bob   | 30  | Shanghai |
`,
  { sortable: true, searchable: true },
);

// Table options via comment
const enhancedHtml = parseEnhancedTable(`
<!-- table: sortable, searchable, caption="User list" -->
| Name  | Age |
|:------|----:|
| Alice | 25  |
`);

// Create table from arrays
const table1 = createTable(
  ["Feature", "Status"],
  [["Sort", "✅"], ["Search", "✅"]],
  { sortable: true },
);

// Create table from array of objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
];
const table2 = createTableFromData(users, [
  { key: "name", label: "Name" },
  { key: "age", label: "Age", align: "right" },
]);

// Styles and script for full page
const styles = getTableStyles();
const script = getTableScript();
```

**Cell merge syntax**:

```markdown
<!-- Horizontal merge: || or > -->

| A | || | || |

<!-- Vertical merge: ^^ or ^ -->

| A | B | | ^^ | C |
```

**Table options via comment**:

```markdown
<!-- table: sortable, searchable, caption="User data" -->

| Name  | Age |      City |
| :---- | :-: | --------: |
| Alice | 25  |   Beijing |
| Bob   | 30  |  Shanghai |
| Carol | 28  | Guangzhou |
```

Supported options:

- `sortable` – Enable column sort (click header)
- `searchable` – Enable search/filter
- `caption="Title"` – Table caption
- `class="className"` – Custom CSS class
- `no-responsive` – Disable responsive
- `no-striped` – Disable zebra stripes
- `no-hover` – Disable hover highlight

### Full HTML page generation

```typescript
import { applyTemplate, createTemplate, render } from "@dreamer/markdown";

const result = render(`
# Title

:smile: Some text.

\`\`\`javascript
console.log("Hello");
\`\`\`

$$E = mc^2$$
`);

// render() collects required styles and scripts
console.log(result.styles); // Theme, table, chart styles
console.log(result.scripts); // Mermaid, KaTeX, Prism.js, etc.

const template = createTemplate({ title: "My doc" });
const html = applyTemplate(template, result);
// html is a full <!DOCTYPE html>... page
```

### Chart support

```typescript
import {
  getMermaidScript,
  parseMermaid,
  restoreMermaid,
} from "@dreamer/markdown";

let content = `
# Flowchart example

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Execute]
    B -->|No| D[End]
\`\`\`
`;

const { content: processed, placeholders } = parseMermaid(content);
const html = restoreMermaid(processed, placeholders);
const script = getMermaidScript();
```

### Chart.js charts

Use a \`\`\`chartjs code block in Markdown:

````markdown
```chartjs
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr"],
    "datasets": [{
      "label": "Sales",
      "data": [65, 59, 80, 81],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": { "display": true, "text": "Monthly sales" }
    }
  }
}
```
````

Supported chart types:

- `line` – Line chart
- `bar` – Bar chart
- `pie` – Pie chart
- `doughnut` – Doughnut chart
- `radar` – Radar chart
- `polarArea` – Polar area chart
- `scatter` – Scatter chart
- `bubble` – Bubble chart

```typescript
import {
  getChartJSScript,
  parseChartJS,
  restoreChartJS,
} from "@dreamer/markdown";

const { content, charts } = parseChartJS(markdown);
const html = restoreChartJS(content, charts);
const script = getChartJSScript(); // Loads from CDN
```

### Media embed

```typescript
import { parseVideo, renderBilibili, renderYouTube } from "@dreamer/markdown";

const youtubeHtml = renderYouTube("dQw4w9WgXcQ", {
  width: 560,
  height: 315,
  autoplay: false,
});

const bilibiliHtml = renderBilibili("BV1xx411c7mD", {
  width: 800,
  height: 450,
});
```

### Layout components

```typescript
import { parseColumns, parseTabs, parseTimeline } from "@dreamer/markdown";

// Multi-column
const columnsHtml = parseColumns(`
:::columns 2
:::column
First column
:::
:::column
Second column
:::
:::
`);

// Tabs
const tabsHtml = parseTabs(`
:::tabs
@tab JavaScript
console.log("Hello");
@tab Python
print("Hello")
:::
`);
```

### Theme system

```typescript
import {
  getFullThemeStyles,
  getPresetTheme,
  getThemeToggleScript,
  renderThemeToggle,
} from "@dreamer/markdown";

const styles = getFullThemeStyles();
const githubTheme = getPresetTheme("github");
const modernTheme = getPresetTheme("modern");
const toggleButton = renderThemeToggle();
const toggleScript = getThemeToggleScript();
```

---

## API reference

### Main functions

| Function                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `render(content, options)`  | Full render; returns HTML, Front Matter, TOC |
| `parse(content, options)`   | Parse Markdown to HTML only                  |
| `parseFrontMatter(content)` | Parse Front Matter                           |
| `extractToc(html)`          | Extract TOC from HTML                        |
| `buildNestedToc(items)`     | Build nested TOC structure                   |
| `renderToc(items)`          | Render TOC HTML                              |

### Table enhancement functions

| Function                                      | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| `parseTable(html, options)`                   | Parse GFM table with enhancement options |
| `parseEnhancedTable(html)`                    | Parse table with comment options         |
| `createTable(headers, rows, options)`         | Create table from arrays                 |
| `createTableFromData(data, columns, options)` | Create table from array of objects       |
| `getTableStyles()`                            | Get table CSS                            |
| `getTableScript()`                            | Get table JS (sort/search)               |

### Table enhancement options

```typescript
interface TableEnhanceOptions {
  responsive?: boolean; // default true
  sortable?: boolean; // default false
  searchable?: boolean; // default false
  searchPlaceholder?: string;
  striped?: boolean; // default true
  hover?: boolean; // default true
  className?: string;
  caption?: string;
}
```

### Render options

```typescript
interface MarkdownOptions {
  frontMatter?: boolean; // default true
  toc?: boolean; // default true
  gfm?: boolean; // default true
  breaks?: boolean; // default false
  footnotes?: boolean; // default true
  math?: boolean; // default true
  autolink?: boolean; // default true
  definitionList?: boolean; // default true
  abbreviations?: boolean; // default true
  containers?: boolean; // default true
  superSubScript?: boolean; // default true
  highlight_text?: boolean; // default true
  insertDelete?: boolean; // default true
  emoji?: boolean; // default true
  keyboard?: boolean; // default true
  highlight?: CodeHighlighter;
}
```

### Module exports

| Module                           | Main exports                                        |
| -------------------------------- | --------------------------------------------------- |
| `@dreamer/markdown`              | Main entry; all features                            |
| `@dreamer/markdown/parser`       | `parse`                                             |
| `@dreamer/markdown/front-matter` | `parseFrontMatter`                                  |
| `@dreamer/markdown/toc`          | `extractToc`, `buildNestedToc`, `renderToc`         |
| `@dreamer/markdown/table`        | `parseTable`, `createTable`, `getTableStyles`, etc. |
| `@dreamer/markdown/chart`        | Mermaid, PlantUML, mind map                         |
| `@dreamer/markdown/code`         | Code block enhancements                             |
| `@dreamer/markdown/media`        | Media embedding                                     |
| `@dreamer/markdown/components`   | Layout components                                   |
| `@dreamer/markdown/text`         | Text enhancements                                   |
| `@dreamer/markdown/interactive`  | Interactive features                                |
| `@dreamer/markdown/document`     | Document features                                   |
| `@dreamer/markdown/meta`         | Meta info                                           |
| `@dreamer/markdown/theme`        | Theme system                                        |

---

## Performance

- **Precompiled regex**: 80+ regexes precompiled to avoid repeated compilation
- **ID cache**: LRU cache (500 entries) to avoid repeated computation
- **Lookup tables**: HTML escape via character map, single pass
- **Input limit**: 1MB max length to avoid performance issues
- **Shared utilities**: Placeholder, paragraph cleanup, etc.

---

## Test report

[![Tests](https://img.shields.io/badge/tests-559%20passed-brightgreen)](./docs/en-US/TEST_REPORT.md)

| Metric      | Value |
| ----------- | ----- |
| Total tests | 559   |
| Passed      | 559   |
| Failed      | 0     |
| Pass rate   | 100%  |
| Test files  | 21    |

See [TEST_REPORT.md](./docs/en-US/TEST_REPORT.md) for details.

---

## Documentation

- **Full (中文)**: [docs/zh-CN/README.md](./docs/zh-CN/README.md)
- **Test (EN)**: [docs/en-US/TEST_REPORT.md](./docs/en-US/TEST_REPORT.md) ·
  **Test (中文)**: [docs/zh-CN/TEST_REPORT.md](./docs/zh-CN/TEST_REPORT.md)

---

## Notes

- **Security**: User input is HTML-escaped to prevent XSS
- **URL validation**: Dangerous protocols like `javascript:`, `data:` are
  filtered
- **Video ID validation**: YouTube / Bilibili / Vimeo ID format checked
- **iframe sandbox**: sandbox attribute added by default
- **Input limit**: 1MB default to avoid performance issues
- **Browser**: ES2020+ required

---

## Changelog

### [1.0.0] - 2026-03-30

First stable release: `render` / `parse` / Front Matter / TOC / `applyTemplate`,
GFM-oriented extensions, enhanced tables, diagrams (Mermaid, PlantUML, mind map,
Chart.js), Prism-oriented code helpers, theme styles, and optional
`MarkdownResult.styles` / `MarkdownResult.scripts` for hand-built results. Full
history: [docs/en-US/CHANGELOG.md](./docs/en-US/CHANGELOG.md).

---

## Contributing

Issues and Pull Requests welcome.

---

## License

Apache License 2.0 — see [LICENSE](./LICENSE)

---

<div align="center">**Made with ❤️ by Dreamer Team**</div>
