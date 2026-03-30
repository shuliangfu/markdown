/**
 * @module types
 *
 * Markdown 库类型定义
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * Front Matter 数据
 */
export interface FrontMatter {
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 日期 */
  date?: string;
  /** 作者 */
  author?: string;
  /** 标签 */
  tags?: string[];
  /** 分类 */
  category?: string;
  /** 其他元数据 */
  [key: string]: unknown;
}

/**
 * 渲染结果
 */
export interface MarkdownResult {
  /** 渲染后的 HTML */
  html: string;
  /** Front Matter 数据 */
  frontMatter: FrontMatter;
  /** 目录结构 */
  toc: TocItem[];
  /**
   * 需要注入的 CSS 样式（`render` 会根据内容收集）；单元测试或手写 {@link MarkdownResult} 时可省略。
   */
  styles?: string;
  /**
   * 需要注入的 JS 脚本（`render` 会根据内容收集）；单元测试或手写结果时可省略。
   */
  scripts?: string;
}

/**
 * 目录项
 */
export interface TocItem {
  /** 标题级别（1-6） */
  level: number;
  /** 标题文本 */
  text: string;
  /** 锚点 ID */
  id: string;
  /** 子目录 */
  children: TocItem[];
}

// ============================================================================
// 解析选项
// ============================================================================

/**
 * Markdown 解析选项
 */
export interface MarkdownOptions {
  /** 是否解析 Front Matter（默认 true） */
  frontMatter?: boolean;
  /** 是否生成目录（默认 true） */
  toc?: boolean;
  /** 是否启用 GFM（GitHub Flavored Markdown）（默认 true） */
  gfm?: boolean;
  /** 是否将换行转换为 <br>（默认 false） */
  breaks?: boolean;
  /** 是否启用脚注（默认 true） */
  footnotes?: boolean;
  /** 是否启用数学公式（默认 true） */
  math?: boolean;
  /** 是否启用自动链接（默认 true） */
  autolink?: boolean;
  /** 是否启用定义列表（默认 true） */
  definitionList?: boolean;
  /** 是否启用缩写（默认 true） */
  abbreviations?: boolean;
  /** 是否启用自定义容器/警告框（默认 true） */
  containers?: boolean;
  /** 是否启用上标/下标（默认 true） */
  superSubScript?: boolean;
  /** 是否启用高亮文本（默认 true） */
  highlight_text?: boolean;
  /** 是否启用插入/删除文本扩展（默认 true） */
  insertDelete?: boolean;
  /** 是否启用 Emoji 简码（默认 true） */
  emoji?: boolean;
  /** 是否启用键盘按键（默认 true） */
  keyboard?: boolean;
  /** 代码高亮函数（可选） */
  highlight?: CodeHighlighter;
}

/**
 * 解析选项（内部使用）
 */
export interface ParseOptions {
  gfm?: boolean;
  breaks?: boolean;
  footnotes?: boolean;
  math?: boolean;
  autolink?: boolean;
  definitionList?: boolean;
  abbreviations?: boolean;
  containers?: boolean;
  superSubScript?: boolean;
  highlight_text?: boolean;
  insertDelete?: boolean;
  emoji?: boolean;
  keyboard?: boolean;
  highlight?: CodeHighlighter;
}

// ============================================================================
// 函数类型
// ============================================================================

/**
 * 代码高亮函数类型
 *
 * @param code - 代码内容
 * @param language - 语言标识
 * @returns 高亮后的 HTML
 *
 * @example
 * ```typescript
 * // 使用 highlight.js
 * import hljs from "highlight.js";
 *
 * const highlight: CodeHighlighter = (code, lang) => {
 *   if (lang && hljs.getLanguage(lang)) {
 *     return hljs.highlight(code, { language: lang }).value;
 *   }
 *   return code;
 * };
 * ```
 */
export type CodeHighlighter = (code: string, language: string) => string;

// ============================================================================
// 容器类型
// ============================================================================

/**
 * 自定义容器类型
 */
export type ContainerType =
  | "note"
  | "tip"
  | "info"
  | "warning"
  | "danger"
  | "details"
  | "quote"
  | string;

/**
 * 自定义容器信息
 */
export interface Container {
  /** 容器类型 */
  type: ContainerType;
  /** 容器标题 */
  title?: string;
  /** 容器内容 */
  content: string;
}

/**
 * 脚注信息
 */
export interface Footnote {
  /** 脚注 ID */
  id: string;
  /** 脚注内容 */
  content: string;
}
