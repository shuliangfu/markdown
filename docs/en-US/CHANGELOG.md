# Changelog

All notable changes to @dreamer/markdown are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.1] - 2026-07-22

### Changed

- **`@dreamer/test`**: bumped `^1.2.0` → `^1.2.3` (deno.json + package.json) to
  pick up test 1.2.3's `--test-force-exit` fix and runtime-adapter 1.2.2
  integration.
- **CI: Deno `v2.5` → `v2.9`** (3 occurrences): aligns with the local dev
  environment and other @dreamer packages.
- **`tsx`**: `^4.19.2` → `^4.23.1`.

### Fixed

- **`test:node` Linux CI exit code 1**: added `--test-force-exit` to the
  `test:node` script to force clean exit after tests (matching @dreamer/test and
  runtime-adapter patterns).

---

## [1.1.0] - 2026-07-22

### Added

- **Node.js compatibility:** First-class Node.js (>=22) support alongside Deno
  and Bun. Added `package.json` (`@dreamer/markdown`, `type: module`,
  `engines.node >= 22`), `.npmrc` (`@jsr` registry), `tsconfig.json` (tsx loader
  config), and a `test:node` script
  (`tsx --tsconfig tsconfig.json
  --test tests/*.test.ts`). All 21 test files
  are shared across the three runtimes with no Node-specific exclusions.
- **CI:** 9-job matrix (Deno / Bun / Node × Linux / macOS / Windows). Node jobs
  use `npm install` + `npm run test:node` on Node 22, with no Chromium
  installation. Triggered on push/PR to `dev`.
- **`minimumDependencyAge: 0`** in `deno.json` so freshly published
  `@dreamer/test` can be consumed during development.

### Security

- **`sanitizeUrl` / `isUrlSafe` — `\t` `\n` `\r` protocol-bypass fix.** Browsers
  strip `\t` `\n` `\r` from URLs before navigation, so a payload like
  `java\nscript:alert(1)` is normalized to `javascript:alert(1)` and executed.
  The previous protocol check ran against the raw string and was bypassable.
  Both functions now strip `\t` `\n` `\r` (precompiled
  `URL_INLINE_WHITESPACE_REGEX`) **before** the
  `^(javascript|vbscript|data|file):` check, and return the browser-normalized
  URL. Added 9 regression tests covering the bypass vectors.
- **Lightbox DOM-based XSS fix (`media.ts`).** `getLightboxScript` built the
  overlay image via `innerHTML` with `img.alt` concatenated in. Since the DOM
  decodes `&quot;` back to `"` when reading `img.alt`, an attacker-controlled
  alt containing `"` could break out of the attribute and inject
  `<img onerror=...>`. Replaced `innerHTML` with `createElement` + property
  assignment (`bigImg.src` / `bigImg.alt`), which performs no HTML parsing and
  eliminates the vector at the root.
- **iframe `src` defense-in-depth (`media.ts`).** `renderYouTube`,
  `renderBilibili`, and `renderVimeo` now wrap the computed `src` in
  `escapeHtml(...)` to match the existing `renderLocalVideo` / `renderIframe`
  pattern. This also corrects bare `&` in query strings (e.g. `&high_quality`)
  to `&amp;`, producing valid HTML attributes. Video IDs remain strictly
  whitelisted (`SAFE_VIDEO_ID_REGEX` / `SAFE_BVID_REGEX` / `^\d+$`).
- **Glossary ReDoS guard (`document.ts`).** `linkGlossaryTerms` now skips terms
  longer than 50 characters before building a `new RegExp(...)`, matching the
  existing `MAX_ABBR_LENGTH` guard in `parser.ts`.

### Tests

- Three-runtime full suite green: **Deno 574 / Bun 553 / Node 553** (0 failed).
- `deno check src/mod.ts` and `deno lint src/ tests/` both clean.

---

## [1.0.1] - 2026-04-07

### Fixed

- **`parse(..., { breaks: true })`:** Replaced naive global `\n` → `<br>` with
  **`applyGfmLineBreaks`**, which (1) preserves newlines inside fenced
  **`<pre><code>`** blocks, (2) removes decorative newlines between adjacent
  block-level tags (e.g. `</h1>` and `<ul>`), and (3) still turns in-flow soft
  line breaks into **`<br>`**, matching GFM-oriented expectations.
- **Horizontal rules in paragraphs:** `cleanupParagraphs` now closes **`</p>`**
  before **`<hr>`** when a rule sits after text on a single newline, and strips
  stray **`<hr></p>`** so output stays valid HTML.
- **Math inline + superscript:** **`^...^`** processing no longer runs across
  **`<span class="math-inline">`** placeholders, so **`data-math`** keeps raw
  LaTeX (e.g. `a^2 + b^2 = c^2`) intact.
- **Tables:** Removed erroneous **`<p>`** wrappers around
  **`<div class="md-table-responsive">`** blocks in **`cleanupParagraphs`**.

### Added

- **`applyGfmLineBreaks(html)`** in **`./utils`** and re-exported from the root
  package (`src/mod.ts`).
- **Tests** for breaks behavior, horizontal rules, math **`data-math`** safety,
  and related parser edge cases.

### Changed

- **`deno.json`:** **`deno fmt`** excludes **`examples/**/*.html`** (generated
  sample pages are not hand-formatted sources).

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
