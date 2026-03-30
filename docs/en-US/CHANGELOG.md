# Changelog

All notable changes to @dreamer/markdown are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-03-30

First **stable** release. The API surface, subpath exports, and behavior match
what shipped in `1.0.0-beta.1`, with a **type-level refinement** for
`MarkdownResult` (see **Changed**). Consumers can depend on
`jsr:@dreamer/markdown@^1.0.0` for SemVer guarantees.

### Added

- **Core APIs**
  - `render(content, options?)` — full pipeline: optional YAML Front Matter,
    chart/table preprocessing (placeholders), Markdown `parse`, placeholder
    restoration, TOC extraction, and aggregation of CSS/JS fragments for tables,
    code (Prism), charts (Mermaid, PlantUML, mindmap, Chart.js), math, and base
    theme styles.
  - `parse(markdown, parseOptions?)` — HTML string output with GFM-oriented
    extensions and toggles (footnotes, math, autolink, definition lists,
    abbreviations, containers, superscript/subscript, highlight/insert/delete,
    emoji, keyboard markup, custom `highlight` callback).
  - `parseFrontMatter`, `extractToc`, `buildNestedToc`, `renderToc` — metadata
    and navigation helpers.
  - `applyTemplate(template, result)`, `DEFAULT_TEMPLATE`, `createTemplate` —
    wrap rendered HTML in a full document and inject `styles` / `scripts` when
    present.
- **Subpath exports** (for tree-shaking and advanced use): `./types`,
  `./parser`, `./front-matter`, `./toc`, `./table`, `./list`, `./container`,
  `./emoji`, `./template`, `./utils`, `./chart`, `./code`, `./media`,
  `./components`, `./text`, `./interactive`, `./document`, `./meta`, `./theme`.
- **Tables**: GFM tables plus enhanced options (merge, sort, filter/search,
  responsive behavior, caption, zebra/hover styling helpers); `getTableStyles` /
  `getTableScript` for embedding.
- **Charts & diagrams**: Mermaid, PlantUML, mind map, and Chart.js blocks
  preserved through parse via placeholders and restored in HTML; helpers such as
  `getMermaidScript`, `getChartStyles`, `getChartJSScript`, `getMathScript`,
  etc.
- **Code**: fenced blocks with language tag; optional `CodeHighlighter`;
  `getPrismStyles` / `getPrismScript` for Prism-oriented output.
- **Theme**: `getFullThemeStyles` and preset-oriented styling for rendered
  documents.
- **Safety & robustness** (parser/utilities): HTML escaping for text where
  applicable, URL sanitization (`sanitizeUrl`, protocol filtering), length
  limits, placeholder utilities for multi-phase parsing.
- **Documentation & tests**: extensive README (EN/zh-CN), test report, and a
  full automated suite with all tests passing (see `docs/en-US/TEST_REPORT.md`).

### Changed

- **`MarkdownResult`**: `styles` and `scripts` are now **optional** on the type.
  The object returned by `render()` still includes both strings. Hand-built
  `MarkdownResult` values (e.g. for `applyTemplate` in tests or custom tooling)
  no longer need to pass empty `styles`/`scripts`. `applyTemplate` already
  injected assets only when those fields are truthy, so runtime behavior is
  unchanged for real `render()` output.
- **Examples**: `examples/generate-html.ts` uses nullish coalescing when logging
  `styles` / `scripts` lengths so `deno check .` passes under strict optional
  fields.

### Migration from `1.0.0-beta.1`

- Update import map or dependency: `jsr:@dreamer/markdown@^1.0.0` (or pin
  `1.0.0`).
- No source renames or removed public exports between beta.1 and 1.0.0.
- If you typed manual `MarkdownResult` literals, you may omit `styles`/`scripts`
  where appropriate.

### Compatibility

- **Deno** 2.x recommended (see README for tested matrix).
- **Bun** 1.3+ per `package.json` engines.
- **Runtime**: pure TypeScript sources; no mandatory npm runtime dependencies
  for library consumers (see README).

---

## [1.0.0-beta.1] - 2026-02-19

Pre-release; functionality superseded by the stable **1.0.0** description above.
Use **1.0.0** for production SemVer ranges.
