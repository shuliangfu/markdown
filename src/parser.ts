/**
 * @module parser
 *
 * Markdown 核心解析器
 *
 * 性能优化：
 * - 预编译所有正则表达式
 * - 使用占位符工具函数
 * - 使用段落清理工具函数
 */

import type { ParseOptions } from "./types.ts";
import {
  cleanupParagraphs,
  createPlaceholder,
  escapeHtml,
  escapeRegExp,
  generateIdCached,
  limitLength,
  restorePlaceholders,
  sanitizeUrl,
} from "./utils.ts";
import { getEmoji } from "./emoji.ts";
import { parseTable } from "./table.ts";
import { parseDefinitionList, parseNestedLists } from "./list.ts";

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** 代码块正则 */
const CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g;

/** 数学公式块正则 */
const MATH_BLOCK_REGEX = /\$\$([\s\S]*?)\$\$/g;

/** 行内数学公式正则 */
const MATH_INLINE_REGEX = /\$([^\$\n]+)\$/g;

/** 自定义容器正则 */
const CONTAINER_REGEX =
  /^:::(note|tip|info|warning|danger|details|quote|[\w-]+)(?:\s+(.+))?\n([\s\S]*?)^:::\s*$/gm;

/** 脚注定义正则 */
const FOOTNOTE_DEF_REGEX = /^\[\^([^\]]+)\]:\s*(.+)$/gm;

/** 脚注引用正则 */
const FOOTNOTE_REF_REGEX = /\[\^([^\]]+)\]/g;

/** 缩写定义正则 */
const ABBR_DEF_REGEX = /^\*\[([^\]]+)\]:\s*(.+)$/gm;

/** 行内代码正则 */
const INLINE_CODE_REGEX = /`([^`]+)`/g;

/** 标题正则 */
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

/** 粗体正则（星号） */
const BOLD_ASTERISK_REGEX = /\*\*([^*]+)\*\*/g;

/** 粗体正则（下划线） */
const BOLD_UNDERSCORE_REGEX = /__([^_]+)__/g;

/** 斜体正则（星号） */
const ITALIC_ASTERISK_REGEX = /\*([^*]+)\*/g;

/** 斜体正则（下划线） */
const ITALIC_UNDERSCORE_REGEX = /_([^_]+)_/g;

/** 删除线正则 */
const STRIKETHROUGH_REGEX = /~~([^~]+)~~/g;

/** 上标正则 */
const SUPERSCRIPT_REGEX = /(?<!\[)\^([^\^\[\]\s]+)\^(?!\])/g;

/** 下标正则 */
const SUBSCRIPT_REGEX = /(?<!~)~([^~\s]+)~(?!~)/g;

/** 高亮正则 */
const HIGHLIGHT_REGEX = /==([^=]+)==/g;

/** 插入文本正则 */
const INSERT_REGEX = /\+\+([^+]+)\+\+/g;

/** 键盘按键正则（方括号） */
const KEYBOARD_BRACKET_REGEX = /\[\[([^\]]+)\]\]/g;

/** 键盘按键正则（尖括号） */
const KEYBOARD_ANGLE_REGEX = /&lt;&lt;([^&]+)&gt;&gt;/g;

/** Emoji 正则 */
const EMOJI_REGEX = /:([a-zA-Z0-9_+-]+):/g;

/** 任务列表（已完成）正则 */
const TASK_DONE_REGEX = /^[-*+]\s+\[x\]\s+(.+)$/gim;

/** 任务列表（未完成）正则 */
const TASK_TODO_REGEX = /^[-*+]\s+\[\s?\]\s+(.+)$/gim;

/** 图片正则 - 支持可选的 title 属性 */
// 格式: ![alt](url) 或 ![alt](url "title") 或 ![alt](url 'title')
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^\s")]+)(?:\s+["']([^"']+)["'])?\)/g;

/** 链接正则 */
const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

/** URL 自动链接正则 */
const URL_AUTOLINK_REGEX = /(?<![">])(https?:\/\/[^\s<>"'\[\]()]+)/g;

/** 邮箱自动链接正则 */
const EMAIL_AUTOLINK_REGEX =
  /(?<![">])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?![^<]*>)/g;

/** 引用正则 */
const BLOCKQUOTE_REGEX = /^&gt;\s+(.+)$/gm;

/** 合并引用正则 */
const MERGE_BLOCKQUOTE_REGEX = /<\/blockquote>\n<blockquote>/g;

/** 水平线正则 */
const HR_REGEX = /^[-*_]{3,}$/gm;

/** 段落分隔正则 */
const PARAGRAPH_SPLIT_REGEX = /\n\n+/g;

// ============================================================================
// 核心解析函数
// ============================================================================

/**
 * 解析 Markdown 为 HTML
 *
 * 性能优化版：使用预编译正则和工具函数
 *
 * @param markdown - Markdown 文本
 * @param options - 解析选项
 * @returns HTML 字符串
 *
 * @example
 * ```typescript
 * const html = parse("# Hello **World**");
 * // "<h1 id=\"hello-world\">Hello <strong>World</strong></h1>"
 * ```
 */
export function parse(markdown: string, options: ParseOptions = {}): string {
  const {
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

  // 输入验证和长度限制（安全优化）
  let html = limitLength(markdown, 1000000); // 1MB 限制

  // 存储代码块，防止被其他规则处理
  const codeBlocks: string[] = [];
  const mathBlocks: string[] = [];
  const containerBlocks: string[] = [];

  // 提取代码块（使用预编译正则）
  html = html.replace(CODE_BLOCK_REGEX, (_, lang: string, code: string) => {
    const langClass = lang ? ` class="language-${lang}"` : "";
    let escapedCode = escapeHtml(code.trim());

    // 应用自定义高亮
    if (highlight && lang) {
      try {
        escapedCode = highlight(code.trim(), lang);
      } catch {
        // 高亮失败时使用原始转义代码
      }
    }

    const placeholder = createPlaceholder("CODEBLOCK", codeBlocks.length);
    codeBlocks.push(`<pre><code${langClass}>${escapedCode}</code></pre>`);
    return placeholder;
  });

  // 提取数学公式块（$$...$$）
  if (math) {
    html = html.replace(MATH_BLOCK_REGEX, (_, formula) => {
      const placeholder = createPlaceholder("MATHBLOCK", mathBlocks.length);
      const escapedFormula = escapeHtml(formula.trim());
      mathBlocks.push(
        `<div class="math-block" data-math="${escapedFormula}">${escapedFormula}</div>`,
      );
      return placeholder;
    });
  }

  // 提取自定义容器（:::type ... :::）
  if (containers) {
    html = html.replace(CONTAINER_REGEX, (_, type, title, content) => {
      const placeholder = createPlaceholder(
        "CONTAINER",
        containerBlocks.length,
      );
      const safeTitle = title ? escapeHtml(title.trim()) : "";
      const containerTitle = safeTitle
        ? `<div class="container-title">${safeTitle}</div>`
        : "";
      const containerContent = content.trim();

      // details 容器使用 HTML5 details 元素
      if (type === "details") {
        const summary = safeTitle || "详情";
        containerBlocks.push(
          `<details class="container container-details"><summary>${summary}</summary><div class="container-content">${containerContent}</div></details>`,
        );
      } else {
        containerBlocks.push(
          `<div class="container container-${
            escapeHtml(type)
          }">${containerTitle}<div class="container-content">${containerContent}</div></div>`,
        );
      }
      return placeholder;
    });
  }

  // 转义 HTML（使用预编译正则）
  html = html.replace(/&/g, "&amp;");
  html = html.replace(/</g, "&lt;");
  html = html.replace(/>/g, "&gt;");

  // 行内数学公式（$...$）
  if (math) {
    html = html.replace(
      MATH_INLINE_REGEX,
      '<span class="math-inline" data-math="$1">$1</span>',
    );
  }

  // 提取脚注定义
  const footnoteMap = new Map<string, string>();
  if (footnotes) {
    html = html.replace(FOOTNOTE_DEF_REGEX, (_, id, content) => {
      footnoteMap.set(id, content);
      return "";
    });
  }

  // 提取缩写定义（*[abbr]: full text）
  const abbreviationMap = new Map<string, string>();
  if (abbreviations) {
    html = html.replace(ABBR_DEF_REGEX, (_, abbr, fullText) => {
      abbreviationMap.set(abbr, fullText.trim());
      return "";
    });
  }

  // 行内代码
  html = html.replace(INLINE_CODE_REGEX, "<code>$1</code>");

  // 表格（GFM）
  if (gfm) {
    html = parseTable(html);
  }

  // 标题（添加 ID，使用缓存的 ID 生成）
  html = html.replace(HEADING_REGEX, (_, hashes, text) => {
    const level = hashes.length;
    const id = generateIdCached(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });

  // Emoji 简码（必须在粗体/斜体之前处理，避免下划线被解析为斜体）
  if (emoji) {
    html = html.replace(EMOJI_REGEX, (match, name) => {
      const emojiChar = getEmoji(name);
      return emojiChar || match;
    });
  }

  // 粗体（使用预编译正则）
  html = html.replace(BOLD_ASTERISK_REGEX, "<strong>$1</strong>");
  html = html.replace(BOLD_UNDERSCORE_REGEX, "<strong>$1</strong>");

  // 斜体（使用预编译正则）
  html = html.replace(ITALIC_ASTERISK_REGEX, "<em>$1</em>");
  html = html.replace(ITALIC_UNDERSCORE_REGEX, "<em>$1</em>");

  // 删除线（GFM）
  if (gfm) {
    html = html.replace(STRIKETHROUGH_REGEX, "<del>$1</del>");
  }

  // 脚注引用（必须在上标之前处理）
  if (footnotes) {
    html = html.replace(FOOTNOTE_REF_REGEX, (_, id) => {
      if (footnoteMap.has(id)) {
        const safeId = escapeHtml(id);
        return `<sup class="footnote-ref"><a href="#fn-${safeId}" id="fnref-${safeId}">[${safeId}]</a></sup>`;
      }
      return `[^${escapeHtml(id)}]`;
    });
  }

  // 上标（^text^）
  if (superSubScript) {
    html = html.replace(SUPERSCRIPT_REGEX, "<sup>$1</sup>");
  }

  // 下标（~text~）
  if (superSubScript) {
    html = html.replace(SUBSCRIPT_REGEX, "<sub>$1</sub>");
  }

  // 高亮文本（==text==）
  if (highlight_text) {
    html = html.replace(HIGHLIGHT_REGEX, "<mark>$1</mark>");
  }

  // 插入文本（++text++）
  if (insertDelete) {
    html = html.replace(INSERT_REGEX, "<ins>$1</ins>");
  }

  // 键盘按键（[[key]] 或 <<key>>）
  if (keyboard) {
    html = html.replace(KEYBOARD_BRACKET_REGEX, "<kbd>$1</kbd>");
    html = html.replace(KEYBOARD_ANGLE_REGEX, "<kbd>$1</kbd>");
  }

  // 任务列表（GFM）
  if (gfm) {
    html = html.replace(
      TASK_DONE_REGEX,
      '<li class="task-item done"><input type="checkbox" checked disabled> $1</li>',
    );
    html = html.replace(
      TASK_TODO_REGEX,
      '<li class="task-item"><input type="checkbox" disabled> $1</li>',
    );
  }

  // 图片（必须在链接之前处理，添加 URL 安全检查）
  // 支持可选的 title 属性: ![alt](url "title")
  html = html.replace(IMAGE_REGEX, (_, alt, url, title) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return `![${escapeHtml(alt)}](${escapeHtml(url)})`;
    // 构建 img 标签，包含可选的 title 属性
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    return `<img src="${escapeHtml(safeUrl)}" alt="${
      escapeHtml(alt)
    }"${titleAttr}>`;
  });

  // 链接（添加 URL 安全检查）
  html = html.replace(LINK_REGEX, (_, text, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return `[${text}](${escapeHtml(url)})`;
    return `<a href="${escapeHtml(safeUrl)}">${text}</a>`;
  });

  // 自动链接
  if (autolink) {
    html = html.replace(URL_AUTOLINK_REGEX, (_match, url) => {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) return url;
      return `<a href="${escapeHtml(safeUrl)}">${escapeHtml(url)}</a>`;
    });
    html = html.replace(
      EMAIL_AUTOLINK_REGEX,
      '<a href="mailto:$1">$1</a>',
    );
  }

  // 定义列表处理
  if (definitionList) {
    html = parseDefinitionList(html);
  }

  // 嵌套列表处理
  html = parseNestedLists(html, gfm);

  // 引用
  html = html.replace(BLOCKQUOTE_REGEX, "<blockquote>$1</blockquote>");
  html = html.replace(MERGE_BLOCKQUOTE_REGEX, "\n");

  // 水平线
  html = html.replace(HR_REGEX, "<hr>");

  // 段落
  html = html.replace(PARAGRAPH_SPLIT_REGEX, "</p>\n<p>");
  html = "<p>" + html + "</p>";

  // 清理段落（使用工具函数，代码复用）
  html = cleanupParagraphs(html);

  // 添加脚注区域
  if (footnotes && footnoteMap.size > 0) {
    let footnotesHtml = '<section class="footnotes"><hr><ol>';
    for (const [id, content] of footnoteMap) {
      const safeId = escapeHtml(id);
      footnotesHtml +=
        `<li id="fn-${safeId}">${content} <a href="#fnref-${safeId}" class="footnote-backref">↩</a></li>`;
    }
    footnotesHtml += "</ol></section>";
    html += footnotesHtml;
  }

  // 恢复占位符（使用工具函数）
  html = restorePlaceholders(html, "CODEBLOCK", codeBlocks);
  html = restorePlaceholders(html, "MATHBLOCK", mathBlocks);
  html = restorePlaceholders(html, "CONTAINER", containerBlocks);

  // 应用缩写（将文本中的缩写包装为 <abbr> 标签）
  // 安全限制：缩写长度不超过 50 字符，防止 ReDoS 攻击
  const MAX_ABBR_LENGTH = 50;
  if (abbreviations && abbreviationMap.size > 0) {
    for (const [abbr, fullText] of abbreviationMap) {
      // 跳过过长的缩写，防止 ReDoS
      if (abbr.length > MAX_ABBR_LENGTH) {
        continue;
      }
      const regex = new RegExp(`\\b${escapeRegExp(abbr)}\\b(?![^<]*>)`, "g");
      html = html.replace(
        regex,
        `<abbr title="${escapeHtml(fullText)}">${escapeHtml(abbr)}</abbr>`,
      );
    }
  }

  // 换行
  if (breaks) {
    html = html.replace(/\n/g, "<br>\n");
  }

  return html;
}

// ============================================================================
// 导出工具函数
// ============================================================================

// 从 utils 导出
export {
  escapeHtml,
  escapeRegExp,
  generateIdCached as generateId,
  isUrlSafe,
  limitLength,
  sanitizeText,
  sanitizeUrl,
} from "./utils.ts";
