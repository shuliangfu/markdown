/**
 * @module text
 *
 * 文本增强模块
 *
 * 支持：
 * - 拼音/注音标注（Ruby）
 * - 自定义属性（{#id .class style="..."})
 * - 徽章/标签（Badge）
 * - 按钮样式链接
 * - 进度条
 * - 文本方向（RTL/LTR）
 *
 * 性能优化：使用预编译正则表达式
 */

import { escapeHtml, sanitizeUrl } from "./utils.ts";

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** Ruby 语法 1: {汉字}(hàn zì) */
const RUBY_SYNTAX1_REGEX = /\{([^}]+)\}\(([^)]+)\)/g;

/** Ruby 语法 2: [[汉字]](hàn zì) */
const RUBY_SYNTAX2_REGEX = /\[\[([^\]]+)\]\]\(([^)]+)\)/g;

/** 标题属性正则 */
const HEADING_ATTR_REGEX =
  /<h([1-6])\s+id="([^"]+)"([^>]*)>([^<]+)<\/h\1>\s*\{([^}]+)\}/g;

/** 段落属性正则 */
const PARAGRAPH_ATTR_REGEX = /(<p>.*?)\s*\{([^}]+)\}\s*(<\/p>)/g;

/** 内联属性正则 */
const INLINE_ATTR_REGEX = /\[([^\]]+)\]\{([^}]+)\}/g;

/** 徽章正则 */
const BADGE_REGEX = /:badge\[([^\]]+)\](?:\{([^}]+)\})?/g;

/** 标签正则 */
const TAG_REGEX = /:tag\[([^\]]+)\](?:\{([^}]+)\})?/g;

/** 按钮正则 */
const BUTTON_REGEX = /:button\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** 进度条正则 */
const PROGRESS_REGEX = /:progress\[([^\]]+)\](?:\{([^}]+)\})?/g;

/** RTL 内联正则 */
const RTL_INLINE_REGEX = /:rtl\[([^\]]+)\]/g;

/** LTR 内联正则 */
const LTR_INLINE_REGEX = /:ltr\[([^\]]+)\]/g;

/** RTL 块正则 */
const RTL_BLOCK_REGEX = /:::rtl\n([\s\S]*?):::/g;

/** LTR 块正则 */
const LTR_BLOCK_REGEX = /:::ltr\n([\s\S]*?):::/g;

/** 引用署名正则 */
const BLOCKQUOTE_ATTR_REGEX =
  /(<blockquote>[\s\S]*?)\n—\s*([^<\n]+)(<\/blockquote>)/g;

/** 危险标记正则 */
const DANGER_MARK_REGEX = /!!([^!]+)!!/g;

/** 问题标记正则 */
const QUESTION_MARK_REGEX = /\?\?([^?]+)\?\?/g;

/** 重要标记正则 */
const IMPORTANT_MARK_REGEX = /##([^#]+)##/g;

// ============================================================================
// 拼音/注音标注
// ============================================================================

/**
 * 解析拼音标注
 *
 * 语法：
 * {汉字}(hàn zì)
 * [[汉字]](hàn zì)
 */
export function parseRuby(content: string): string {
  // 语法 1: {汉字}(hàn zì)（使用预编译正则）
  content = content.replace(
    RUBY_SYNTAX1_REGEX,
    "<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>",
  );

  // 语法 2: [[汉字]](hàn zì)（使用预编译正则）
  content = content.replace(
    RUBY_SYNTAX2_REGEX,
    "<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>",
  );

  return content;
}

// ============================================================================
// 自定义属性
// ============================================================================

/**
 * 属性选项
 */
export interface AttributeOptions {
  id?: string;
  classes?: string[];
  style?: string;
  attrs?: Record<string, string>;
}

/**
 * 解析自定义属性
 *
 * 语法：
 * # 标题 {#custom-id .class1 .class2 style="color: red"}
 * 段落 {.highlight}
 */
export function parseAttributes(content: string): string {
  // 标题属性（使用预编译正则）
  content = content.replace(
    HEADING_ATTR_REGEX,
    (_, level, _oldId, attrs, text, attrStr) => {
      const options = parseAttributeString(attrStr);
      const newId = options.id || _oldId;
      const classAttr = options.classes?.length
        ? ` class="${options.classes.join(" ")}"`
        : "";
      const styleAttr = options.style
        ? ` style="${escapeHtml(options.style)}"`
        : "";
      return `<h${level} id="${
        escapeHtml(newId)
      }"${classAttr}${styleAttr}${attrs}>${text}</h${level}>`;
    },
  );

  // 段落属性（行尾，使用预编译正则）
  content = content.replace(
    PARAGRAPH_ATTR_REGEX,
    (_, start, attrStr, end) => {
      const options = parseAttributeString(attrStr);
      const classAttr = options.classes?.length
        ? ` class="${options.classes.join(" ")}"`
        : "";
      const styleAttr = options.style
        ? ` style="${escapeHtml(options.style)}"`
        : "";
      const idAttr = options.id ? ` id="${escapeHtml(options.id)}"` : "";
      return start.replace("<p>", `<p${idAttr}${classAttr}${styleAttr}>`) + end;
    },
  );

  // 行内元素属性（使用预编译正则）
  content = content.replace(
    INLINE_ATTR_REGEX,
    (_, text, attrStr) => {
      const options = parseAttributeString(attrStr);
      const classAttr = options.classes?.length
        ? ` class="${options.classes.join(" ")}"`
        : "";
      const styleAttr = options.style
        ? ` style="${escapeHtml(options.style)}"`
        : "";
      const idAttr = options.id ? ` id="${escapeHtml(options.id)}"` : "";
      return `<span${idAttr}${classAttr}${styleAttr}>${text}</span>`;
    },
  );

  return content;
}

/**
 * 解析属性字符串
 */
function parseAttributeString(attrStr: string): AttributeOptions {
  const options: AttributeOptions = { classes: [] };

  // 解析 ID
  const idMatch = attrStr.match(/#([\w-]+)/);
  if (idMatch) options.id = idMatch[1];

  // 解析类名
  const classMatches = attrStr.matchAll(/\.([\w-]+)/g);
  for (const match of classMatches) {
    options.classes!.push(match[1]);
  }

  // 解析样式
  const styleMatch = attrStr.match(/style=["']([^"']+)["']/);
  if (styleMatch) options.style = styleMatch[1];

  return options;
}

// ============================================================================
// 徽章/标签
// ============================================================================

/**
 * 徽章类型
 */
export type BadgeType =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

/**
 * 解析徽章
 *
 * 语法：
 * :badge[文本]
 * :badge[文本]{type=success}
 */
export function parseBadge(content: string): string {
  // 使用预编译正则
  return content.replace(BADGE_REGEX, (_, text, meta) => {
    const type = meta?.match(/type=(\w+)/)?.[1] || "default";
    return `<span class="badge badge-${escapeHtml(type)}">${
      escapeHtml(text)
    }</span>`;
  });
}

/**
 * 解析标签
 *
 * 语法：
 * :tag[标签名]
 * :tag[标签名]{color=#ff0000}
 */
export function parseTag(content: string): string {
  // 使用预编译正则
  return content.replace(TAG_REGEX, (_, text, meta) => {
    const colorMatch = meta?.match(/color=["']?([^"'\s}]+)["']?/);
    const style = colorMatch
      ? ` style="background-color: ${escapeHtml(colorMatch[1])}"`
      : "";
    return `<span class="tag"${style}>${escapeHtml(text)}</span>`;
  });
}

// ============================================================================
// 按钮样式链接
// ============================================================================

/**
 * 解析按钮链接
 *
 * 语法：
 * :button[文本](url)
 * :button[文本](url){type=primary size=large}
 */
export function parseButton(content: string): string {
  // 使用预编译正则和 URL 安全检查
  return content.replace(BUTTON_REGEX, (_, text, url, meta) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return escapeHtml(text);

    const type = meta?.match(/type=(\w+)/)?.[1] || "default";
    const size = meta?.match(/size=(\w+)/)?.[1] || "medium";
    return `<a href="${escapeHtml(safeUrl)}" class="btn btn-${
      escapeHtml(type)
    } btn-${escapeHtml(size)}">${escapeHtml(text)}</a>`;
  });
}

// ============================================================================
// 进度条
// ============================================================================

/**
 * 解析进度条
 *
 * 语法：
 * :progress[75%]
 * :progress[75%]{color=green label="进度"}
 */
export function parseProgress(content: string): string {
  // 使用预编译正则
  return content.replace(PROGRESS_REGEX, (_, value, meta) => {
    const percentage = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    const color = meta?.match(/color=["']?([^"'\s}]+)["']?/)?.[1];
    const label = meta?.match(/label=["']([^"']+)["']/)?.[1];
    const showLabel = meta?.includes("showLabel") || !!label;

    const colorStyle = color ? ` background-color: ${escapeHtml(color)};` : "";
    const labelHtml = showLabel
      ? `<span class="progress-label">${escapeHtml(label || value)}</span>`
      : "";

    return `<div class="progress-container">
        ${labelHtml}
        <div class="progress">
          <div class="progress-bar" style="width: ${percentage}%;${colorStyle}"></div>
        </div>
      </div>`;
  });
}

// ============================================================================
// 文本方向
// ============================================================================

/**
 * 解析文本方向
 *
 * 语法：
 * :rtl[从右到左的文本]
 * :ltr[从左到右的文本]
 */
export function parseTextDirection(content: string): string {
  // RTL（使用预编译正则）
  content = content.replace(
    RTL_INLINE_REGEX,
    '<span dir="rtl" class="text-rtl">$1</span>',
  );

  // LTR（使用预编译正则）
  content = content.replace(
    LTR_INLINE_REGEX,
    '<span dir="ltr" class="text-ltr">$1</span>',
  );

  // RTL 块（使用预编译正则）
  content = content.replace(
    RTL_BLOCK_REGEX,
    '<div dir="rtl" class="block-rtl">$1</div>',
  );

  // LTR 块（使用预编译正则）
  content = content.replace(
    LTR_BLOCK_REGEX,
    '<div dir="ltr" class="block-ltr">$1</div>',
  );

  return content;
}

// ============================================================================
// 引用来源
// ============================================================================

/**
 * 解析引用来源
 *
 * 语法：
 * > 引用内容
 * > — 作者, 《来源》
 */
export function parseBlockquoteAttribution(content: string): string {
  // 使用预编译正则
  return content.replace(
    BLOCKQUOTE_ATTR_REGEX,
    '$1<footer class="blockquote-footer">— $2</footer>$3',
  );
}

// ============================================================================
// 特殊标记
// ============================================================================

/**
 * 解析特殊标记
 *
 * 语法：
 * !!危险文本!! -> 红色高亮
 * ??待确认?? -> 黄色标记
 * ##重要## -> 加粗高亮
 */
export function parseSpecialMarks(content: string): string {
  // 危险/错误（使用预编译正则）
  content = content.replace(
    DANGER_MARK_REGEX,
    '<span class="mark-danger">$1</span>',
  );

  // 待确认/疑问（使用预编译正则）
  content = content.replace(
    QUESTION_MARK_REGEX,
    '<span class="mark-question">$1</span>',
  );

  // 重要（使用预编译正则）
  content = content.replace(
    IMPORTANT_MARK_REGEX,
    '<span class="mark-important">$1</span>',
  );

  return content;
}

// ============================================================================
// 文本样式
// ============================================================================

/**
 * 获取文本增强样式
 */
export function getTextStyles(): string {
  return `
/* 拼音标注 */
ruby { ruby-position: over; }
ruby rt { font-size: 0.5em; color: #666; }
ruby rp { display: none; }

/* 徽章 */
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.85em;
  font-weight: 500;
  border-radius: 12px;
  white-space: nowrap;
}
.badge-default { background: #e0e0e0; color: #424242; }
.badge-primary { background: #2196f3; color: #fff; }
.badge-success { background: #4caf50; color: #fff; }
.badge-warning { background: #ff9800; color: #fff; }
.badge-danger { background: #f44336; color: #fff; }
.badge-info { background: #00bcd4; color: #fff; }

/* 标签 */
.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.85em;
  background: #e8f4fd;
  color: #1976d2;
  border-radius: 4px;
  margin: 0 2px;
}

/* 按钮 */
.btn {
  display: inline-block;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.btn-default { background: #e0e0e0; color: #424242; }
.btn-default:hover { background: #bdbdbd; }
.btn-primary { background: #2196f3; color: #fff; }
.btn-primary:hover { background: #1976d2; }
.btn-success { background: #4caf50; color: #fff; }
.btn-success:hover { background: #388e3c; }
.btn-warning { background: #ff9800; color: #fff; }
.btn-warning:hover { background: #f57c00; }
.btn-danger { background: #f44336; color: #fff; }
.btn-danger:hover { background: #d32f2f; }
.btn-small { padding: 4px 8px; font-size: 0.85em; }
.btn-large { padding: 12px 24px; font-size: 1.1em; }

/* 进度条 */
.progress-container { margin: 16px 0; }
.progress-label { display: block; margin-bottom: 4px; font-size: 0.9em; }
.progress {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: #2196f3;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 文本方向 */
.text-rtl, .block-rtl { unicode-bidi: bidi-override; }
.block-rtl { display: block; padding: 16px; background: #f8f9fa; border-radius: 4px; }

/* 引用来源 */
.blockquote-footer {
  display: block;
  margin-top: 8px;
  font-size: 0.9em;
  color: #666;
}

/* 特殊标记 */
.mark-danger { background: #ffebee; color: #c62828; padding: 0 4px; border-radius: 2px; }
.mark-question { background: #fff3e0; color: #e65100; padding: 0 4px; border-radius: 2px; }
.mark-important { background: #e3f2fd; color: #1565c0; padding: 0 4px; border-radius: 2px; font-weight: bold; }
`;
}
