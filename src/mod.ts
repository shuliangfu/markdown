/**
 * @module @dreamer/markdown
 *
 * Markdown 解析库
 *
 * 提供 Markdown 渲染功能，支持：
 * - Markdown 解析和渲染
 * - Front Matter 解析
 * - 目录生成
 * - GFM（GitHub Flavored Markdown）支持
 * - 代码高亮（支持自定义高亮函数）
 * - 脚注、数学公式、自动链接
 * - 定义列表、缩写、自定义容器
 * - 上标/下标、高亮文本、Emoji
 * - 表格对齐、键盘按键
 *
 * @example
 * ```typescript
 * import { render, parse, parseFrontMatter } from "@dreamer/markdown";
 *
 * // 渲染 Markdown
 * const result = render("# Hello World");
 * console.log(result.html);
 *
 * // 解析 Front Matter
 * const { frontMatter, body } = parseFrontMatter(content);
 * ```
 */

// ============================================================================
// 类型导出
// ============================================================================

export type {
  CodeHighlighter,
  Container,
  ContainerType,
  Footnote,
  FrontMatter,
  MarkdownOptions,
  MarkdownResult,
  ParseOptions,
  TocItem,
} from "./types.ts";

// ============================================================================
// 模块导入
// ============================================================================

import type { FrontMatter, MarkdownOptions, MarkdownResult } from "./types.ts";

import { parseFrontMatter } from "./front-matter.ts";
import { extractToc } from "./toc.ts";
import { parse } from "./parser.ts";
import {
  getChartJSScript,
  getChartJSStyles,
  getChartStyles,
  getMathScript,
  getMermaidScript,
  parseChartJS,
  parseMermaid,
  parseMindmap,
  parsePlantUML,
  restoreChartJS,
  restoreMermaid,
  restoreMindmap,
  restorePlantUML,
} from "./chart.ts";
import {
  getTableScript,
  getTableStyles,
  parseEnhancedTable,
  restoreEnhancedTable,
} from "./table.ts";
import { getPrismScript, getPrismStyles } from "./code.ts";
import { getFullThemeStyles } from "./theme.ts";

// ============================================================================
// 完整渲染
// ============================================================================

/**
 * 完整渲染 Markdown
 *
 * 包含 Front Matter 解析、Markdown 渲染、目录生成
 *
 * @param content - Markdown 内容
 * @param options - 解析选项
 * @returns 渲染结果
 *
 * @example
 * ```typescript
 * const result = render(`---
 * title: Hello
 * ---
 *
 * # Hello World
 * `);
 *
 * console.log(result.frontMatter.title); // "Hello"
 * console.log(result.html);
 * console.log(result.toc);
 * ```
 */
export function render(
  content: string,
  options: MarkdownOptions = {},
): MarkdownResult {
  const {
    frontMatter: parseFrontMatterEnabled = true,
    toc: generateToc = true,
    gfm = true,
    breaks = false,
    footnotes = true,
    math = true,
    autolink = true,
    definitionList = true,
    abbreviations = true,
    containers = true,
    superSubScript = true,
    highlight_text = true,
    insertDelete = true,
    emoji = true,
    keyboard = true,
    highlight,
  } = options;

  let frontMatter: FrontMatter = {};
  let body = content;

  // 解析 Front Matter
  if (parseFrontMatterEnabled) {
    const parsed = parseFrontMatter(content);
    frontMatter = parsed.frontMatter;
    body = parsed.body;
  }

  // 预处理图表（Mermaid、PlantUML、Mindmap、Chart.js）
  // 使用占位符替换，避免被 Markdown 解析器处理
  const mermaidResult = parseMermaid(body);
  body = mermaidResult.content;

  const plantumlResult = parsePlantUML(body);
  body = plantumlResult.content;

  const mindmapResult = parseMindmap(body);
  body = mindmapResult.content;

  const chartjsResult = parseChartJS(body);
  body = chartjsResult.content;

  // 预处理增强表格（带选项的表格）
  body = parseEnhancedTable(body);

  // 渲染 Markdown
  let html = parse(body, {
    gfm,
    breaks,
    footnotes,
    math,
    autolink,
    definitionList,
    abbreviations,
    containers,
    superSubScript,
    highlight_text,
    insertDelete,
    emoji,
    keyboard,
    highlight,
  });

  // 恢复图表占位符
  html = restoreMermaid(html, mermaidResult.charts);
  html = restorePlantUML(html, plantumlResult.charts);
  html = restoreMindmap(html, mindmapResult.charts);
  html = restoreChartJS(html, chartjsResult.charts);

  // 恢复增强表格占位符
  html = restoreEnhancedTable(html);

  // 提取目录
  const toc = generateToc ? extractToc(html) : [];

  // 自动收集需要的样式和脚本
  const stylesList: string[] = [];
  const scriptsList: string[] = [];

  // 基础主题样式（始终包含）
  stylesList.push(getFullThemeStyles());

  // 表格样式（检测是否有表格）
  if (html.includes("<table") || gfm) {
    stylesList.push(getTableStyles());
    scriptsList.push(`<script>${getTableScript()}</script>`);
  }

  // 图表样式（检测是否有图表）
  const hasMermaidCharts = mermaidResult.charts.length > 0 ||
    plantumlResult.charts.length > 0 ||
    mindmapResult.charts.length > 0;
  if (hasMermaidCharts) {
    stylesList.push(getChartStyles());
  }

  // Mermaid 脚本（检测是否有 Mermaid 图表）
  if (mermaidResult.charts.length > 0) {
    scriptsList.push(getMermaidScript());
  }

  // Chart.js 样式和脚本（检测是否有 Chart.js 图表）
  if (chartjsResult.charts.length > 0) {
    stylesList.push(getChartJSStyles());
    // Chart.js 脚本需要在图表配置之前加载
    scriptsList.unshift(getChartJSScript());
  }

  // 数学公式脚本（检测是否有数学公式）
  if (math && (html.includes("math-block") || html.includes("math-inline"))) {
    scriptsList.push(getMathScript("katex"));
  }

  // 代码高亮（检测是否有代码块）
  if (html.includes("<pre>") || html.includes("<code")) {
    stylesList.push(getPrismStyles());
    scriptsList.push(getPrismScript());
  }

  return {
    html,
    frontMatter,
    toc,
    styles: stylesList.join("\n"),
    scripts: scriptsList.join("\n"),
  };
}

// ============================================================================
// 公共 API 导出
// ============================================================================

// Front Matter
export { parseFrontMatter } from "./front-matter.ts";
export type { FrontMatterResult } from "./front-matter.ts";

// 解析器
export { parse } from "./parser.ts";

// 目录
export { buildNestedToc, extractToc, renderToc } from "./toc.ts";

// 模板
export { applyTemplate, createTemplate, DEFAULT_TEMPLATE } from "./template.ts";

// 工具函数
export {
  cleanupParagraphs,
  createPlaceholder,
  escapeHtml,
  escapeRegExp,
  generateId,
  generateIdCached,
  getSafeString,
  isUrlSafe,
  isValidString,
  limitLength,
  memoize,
  removeControlChars,
  restorePlaceholders,
  sanitizeText,
  sanitizeUrl,
} from "./utils.ts";

// Emoji
export { EMOJI_MAP, getEmoji, parseEmoji } from "./emoji.ts";

// 表格
export {
  createTable,
  createTableFromData,
  generateTableHtml,
  getTableScript,
  getTableStyles,
  parseCellMerge,
  parseEnhancedTable,
  parseTable,
  parseTableAlignment,
  parseTableOptions,
  processCellMerge,
  restoreEnhancedTable,
} from "./table.ts";
export type {
  TableAlignment,
  TableData,
  TableEnhanceOptions,
} from "./table.ts";

// 列表
export { parseDefinitionList, parseNestedLists } from "./list.ts";

// 容器
export {
  extractContainers,
  getContainerStyles,
  restoreContainers,
} from "./container.ts";
export type { ContainerResult } from "./container.ts";

// ============================================================================
// 图表与可视化
// ============================================================================

export {
  getChartJSScript,
  getChartJSStyles,
  getChartStyles,
  getMathScript,
  getMermaidScript,
  parseChartJS,
  parseMermaid,
  parseMindmap,
  parsePlantUML,
  restoreChartJS,
  restoreMermaid,
  restoreMindmap,
  restorePlantUML,
} from "./chart.ts";
export type {
  ChartJSConfig,
  ChartOptions,
  ChartType,
  MathRenderer,
  MindmapNode,
} from "./chart.ts";

// ============================================================================
// 代码增强
// ============================================================================

export {
  getCodeScript,
  getCodeStyles,
  getPrismScript,
  getPrismStyles,
  parseCodeGroup,
  parseCodeMeta,
  parseDiff,
  parseFileTree,
  parseHighlightLines,
  renderCodeBlock,
  renderDiff,
  restoreCodeGroup,
  restoreDiff,
  restoreFileTree,
} from "./code.ts";
export type { CodeBlockOptions, CodeGroupItem, FileTreeNode } from "./code.ts";

// ============================================================================
// 媒体支持
// ============================================================================

export {
  getLightboxScript,
  getMediaStyles,
  parseAudio,
  parseEnhancedImages,
  parseIframe,
  parseImageMeta,
  parseVideo,
  renderAudio,
  renderBilibili,
  renderIframe,
  renderImage,
  renderLocalVideo,
  renderVimeo,
  renderYouTube,
} from "./media.ts";
export type {
  AudioOptions,
  IframeOptions,
  ImageOptions,
  VideoOptions,
  VideoPlatform,
} from "./media.ts";

// ============================================================================
// 布局组件
// ============================================================================

export {
  getComponentScript,
  getComponentStyles,
  parseAccordion,
  parseCardGrid,
  parseCards,
  parseColumns,
  parseSteps,
  parseTabs,
  parseTimeline,
} from "./components.ts";
export type {
  CardOptions,
  StepItem,
  TabItem,
  TimelineItem,
} from "./components.ts";

// ============================================================================
// 文本增强
// ============================================================================

export {
  getTextStyles,
  parseAttributes,
  parseBadge,
  parseBlockquoteAttribution,
  parseButton,
  parseProgress,
  parseRuby,
  parseSpecialMarks,
  parseTag,
  parseTextDirection,
} from "./text.ts";
export type { AttributeOptions, BadgeType } from "./text.ts";

// ============================================================================
// 交互功能
// ============================================================================

export {
  enhanceFootnotes,
  getBackToTopScript,
  getInteractiveStyles,
  getReadingProgressScript,
  getSearchHighlightScript,
  getSmoothScrollScript,
  getTocActiveScript,
  highlightKeywords,
  renderBackToTop,
  renderReadingProgress,
  renderTocNavigation,
} from "./interactive.ts";

// ============================================================================
// 文档功能
// ============================================================================

export {
  applyVariables,
  getDocumentStyles,
  linkGlossaryTerms,
  parseApiDoc,
  parseChangelog,
  parseConditional,
  parseGlossary,
  parseIncludes,
  parseVariableDefinitions,
  renderGlossary,
} from "./document.ts";
export type {
  ApiParam,
  ChangelogItem,
  FileLoader,
  GlossaryTerm,
  Variables,
} from "./document.ts";

// ============================================================================
// 元信息
// ============================================================================

export {
  countWords,
  estimateReadingTime,
  extractDocumentMeta,
  formatUpdateTime,
  getMetaStyles,
  parseAuthors,
  renderAuthors,
  renderDocumentMeta,
  renderReadingTime,
  renderUpdateTime,
  renderWordCount,
} from "./meta.ts";
export type {
  Author,
  DocumentMeta,
  ReadingTimeOptions,
  ReadingTimeResult,
  UpdateTimeOptions,
  WordCountResult,
} from "./meta.ts";

// ============================================================================
// 样式主题
// ============================================================================

export {
  DARK_THEME,
  generateCSSVariables,
  getBaseThemeStyles,
  getFullThemeStyles,
  getGitHubTheme,
  getGitLabTheme,
  getMinimalTheme,
  getModernTheme,
  getPresetTheme,
  getPrintStyles,
  getThemeToggleScript,
  LIGHT_THEME,
  renderThemeToggle,
} from "./theme.ts";
export type { PresetTheme, ThemeType, ThemeVariables } from "./theme.ts";

// ============================================================================
// 兼容导出
// ============================================================================

/**
 * @deprecated 使用 render 函数代替
 */
export const markdown = render;
