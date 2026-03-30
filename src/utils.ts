/**
 * @module utils
 *
 * Markdown 库工具函数
 *
 * 包含性能优化的正则预编译和安全增强的 HTML 处理
 */

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/**
 * HTML 转义字符映射表
 * 使用对象映射比链式 replace 更快
 * 注意：不转义 `/`，因为它在 URL 中是有效字符
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * HTML 转义正则（预编译）
 */
const HTML_ESCAPE_REGEX = /[&<>"']/g;

/**
 * 正则特殊字符转义正则（预编译）
 */
const REGEXP_ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

/**
 * HTML 标签匹配正则（预编译）
 */
const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * ID 生成用正则（预编译）
 */
const ID_INVALID_CHARS_REGEX = /[^\w\u4e00-\u9fa5\s-]/g;
const ID_SPACES_REGEX = /\s+/g;
const ID_TRIM_DASHES_REGEX = /^-+|-+$/g;

/**
 * 危险 URL 协议检测正则（预编译）
 */
const DANGEROUS_URL_REGEX = /^(javascript|vbscript|data|file):/i;

/**
 * 控制字符正则（预编译）
 * 故意使用控制字符匹配，用于安全过滤
 */
// deno-lint-ignore no-control-regex
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// ============================================================================
// HTML 处理（安全增强）
// ============================================================================

/**
 * 转义 HTML 特殊字符（性能优化版）
 *
 * 使用预编译正则和映射表，比链式 replace 更快
 *
 * @param text - 原始文本
 * @returns 转义后的文本
 *
 * @example
 * ```typescript
 * escapeHtml("<script>alert('xss')</script>");
 * // "&lt;script&gt;alert(&#39;xss&#39;)&lt;&#x2F;script&gt;"
 * ```
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(
    HTML_ESCAPE_REGEX,
    (char) => HTML_ESCAPE_MAP[char] || char,
  );
}

/**
 * 移除控制字符（安全增强）
 *
 * 移除可能导致安全问题的控制字符
 *
 * @param text - 原始文本
 * @returns 清理后的文本
 */
export function removeControlChars(text: string): string {
  if (!text) return "";
  return text.replace(CONTROL_CHARS_REGEX, "");
}

/**
 * 安全处理文本（转义 + 移除控制字符）
 *
 * @param text - 原始文本
 * @returns 安全处理后的文本
 */
export function sanitizeText(text: string): string {
  return escapeHtml(removeControlChars(text));
}

/**
 * 验证并清理 URL
 *
 * 防止 javascript:、data: 等危险协议
 *
 * @param url - 原始 URL
 * @returns 安全的 URL，如果不安全返回空字符串
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  // 移除控制字符和首尾空格
  const cleaned = removeControlChars(url.trim());

  // 检测危险协议
  if (DANGEROUS_URL_REGEX.test(cleaned)) {
    return "";
  }

  return cleaned;
}

/**
 * 验证 URL 是否安全
 *
 * @param url - URL 字符串
 * @returns 是否安全
 */
export function isUrlSafe(url: string): boolean {
  if (!url) return false;
  return !DANGEROUS_URL_REGEX.test(url.trim());
}

// ============================================================================
// 正则处理
// ============================================================================

/**
 * 转义正则表达式特殊字符（性能优化版）
 *
 * @param str - 原始字符串
 * @returns 转义后的字符串
 */
export function escapeRegExp(str: string): string {
  if (!str) return "";
  return str.replace(REGEXP_ESCAPE_REGEX, "\\$&");
}

// ============================================================================
// ID 生成
// ============================================================================

/**
 * 生成锚点 ID（性能优化版）
 *
 * 将标题文本转换为 URL 友好的 ID
 * 使用预编译正则提升性能
 *
 * @param text - 标题文本
 * @returns 锚点 ID
 *
 * @example
 * ```typescript
 * generateId("Hello World"); // "hello-world"
 * generateId("中文标题"); // "中文标题"
 * generateId("Hello 世界"); // "hello-世界"
 * ```
 */
export function generateId(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(HTML_TAG_REGEX, "")
    .replace(ID_INVALID_CHARS_REGEX, "")
    .replace(ID_SPACES_REGEX, "-")
    .replace(ID_TRIM_DASHES_REGEX, "");
}

// ============================================================================
// 缓存工具（性能优化）
// ============================================================================

/**
 * 创建带缓存的函数
 *
 * 使用 LRU 缓存避免重复计算
 *
 * @param fn - 原始函数
 * @param maxSize - 缓存大小限制
 * @returns 带缓存的函数
 */
export function memoize<T extends (...args: string[]) => string>(
  fn: T,
  maxSize = 100,
): T {
  const cache = new Map<string, string>();

  return ((...args: string[]) => {
    const key = args.join("\x00");

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    // LRU: 超过大小限制时删除最旧的条目
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 带缓存的 ID 生成函数
 */
export const generateIdCached: (text: string) => string = memoize(
  generateId,
  500,
);

// ============================================================================
// 占位符工具（代码复用）
// ============================================================================

/**
 * 占位符前缀
 */
const PLACEHOLDER_PREFIX = "\x00";

/**
 * 创建占位符
 *
 * @param type - 占位符类型
 * @param index - 索引
 * @returns 占位符字符串
 */
export function createPlaceholder(type: string, index: number): string {
  return `${PLACEHOLDER_PREFIX}${type}${index}${PLACEHOLDER_PREFIX}`;
}

/**
 * 恢复占位符
 *
 * @param html - 包含占位符的 HTML
 * @param type - 占位符类型
 * @param blocks - 替换内容数组
 * @returns 恢复后的 HTML
 */
export function restorePlaceholders(
  html: string,
  type: string,
  blocks: string[],
): string {
  let result = html;
  for (let i = 0; i < blocks.length; i++) {
    result = result.replace(createPlaceholder(type, i), blocks[i]);
  }
  return result;
}

// ============================================================================
// 清理工具
// ============================================================================

/**
 * 需要清理的段落标签模式
 */
const PARAGRAPH_CLEANUP_PATTERNS = [
  // 块级元素前的 <p>
  { search: /<p>(<h[1-6])/g, replace: "$1" },
  { search: /<p>(<pre)/g, replace: "$1" },
  { search: /<p>(<ul)/g, replace: "$1" },
  { search: /<p>(<ol)/g, replace: "$1" },
  { search: /<p>(<blockquote)/g, replace: "$1" },
  { search: /<p>(<hr)/g, replace: "$1" },
  { search: /<p>(<table)/g, replace: "$1" },
  { search: /<p>(<dl)/g, replace: "$1" },
  { search: /<p>(<div class="math-block)/g, replace: "$1" },
  { search: /<p>(<div class="container)/g, replace: "$1" },
  { search: /<p>(<details class="container)/g, replace: "$1" },
  { search: /<p>(<section class="footnotes)/g, replace: "$1" },
  // 块级元素后的 </p>
  { search: /(<\/h[1-6]>)<\/p>/g, replace: "$1" },
  { search: /(<\/pre>)<\/p>/g, replace: "$1" },
  { search: /(<\/ul>)<\/p>/g, replace: "$1" },
  { search: /(<\/ol>)<\/p>/g, replace: "$1" },
  { search: /(<\/blockquote>)<\/p>/g, replace: "$1" },
  { search: /(<\/table>)<\/p>/g, replace: "$1" },
  { search: /(<\/dl>)<\/p>/g, replace: "$1" },
  { search: /(<\/div>)<\/p>/g, replace: "$1" },
  { search: /(<\/details>)<\/p>/g, replace: "$1" },
  { search: /(<\/section>)<\/p>/g, replace: "$1" },
];

/**
 * 清理段落标签
 *
 * 移除块级元素周围不正确的 <p> 标签
 *
 * @param html - HTML 字符串
 * @returns 清理后的 HTML
 */
export function cleanupParagraphs(html: string): string {
  let result = html;

  // 移除空段落
  result = result.replace(/<p>\s*<\/p>/g, "");

  // 应用所有清理模式
  for (const pattern of PARAGRAPH_CLEANUP_PATTERNS) {
    result = result.replace(pattern.search, pattern.replace);
  }

  return result;
}

// ============================================================================
// 输入验证
// ============================================================================

/**
 * 验证输入是否为有效字符串
 *
 * @param input - 输入值
 * @returns 是否为有效字符串
 */
export function isValidString(input: unknown): input is string {
  return typeof input === "string";
}

/**
 * 验证并获取安全字符串
 *
 * @param input - 输入值
 * @param defaultValue - 默认值
 * @returns 安全的字符串
 */
export function getSafeString(input: unknown, defaultValue = ""): string {
  if (!isValidString(input)) return defaultValue;
  return removeControlChars(input);
}

/**
 * 限制字符串长度
 *
 * 防止过长输入导致的性能问题
 *
 * @param text - 输入文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export function limitLength(text: string, maxLength = 100000): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}
