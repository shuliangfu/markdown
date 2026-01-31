/**
 * @module toc
 *
 * 目录生成模块
 */

import type { TocItem } from "./types.ts";

// ============================================================================
// 目录提取
// ============================================================================

/**
 * 从 HTML 中提取目录结构
 *
 * @param html - HTML 内容
 * @returns 目录项列表
 *
 * @example
 * ```typescript
 * const html = '<h1 id="title">Title</h1><h2 id="sub">Sub</h2>';
 * const toc = extractToc(html);
 * // [{ level: 1, text: "Title", id: "title", children: [...] }]
 * ```
 */
export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([1-6])\s+id="([^"]+)"[^>]*>([^<]+)<\/h\1>/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3],
      children: [],
    });
  }

  return items;
}

/**
 * 构建嵌套目录结构
 *
 * 将扁平的目录列表转换为嵌套结构
 *
 * @param items - 扁平目录列表
 * @returns 嵌套目录结构
 *
 * @example
 * ```typescript
 * const flat = [
 *   { level: 1, text: "Title", id: "title", children: [] },
 *   { level: 2, text: "Sub", id: "sub", children: [] }
 * ];
 * const nested = buildNestedToc(flat);
 * // [{ level: 1, text: "Title", id: "title", children: [{ level: 2, ... }] }]
 * ```
 */
export function buildNestedToc(items: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const item of items) {
    // 创建新项目（深拷贝以避免修改原数据）
    const newItem: TocItem = { ...item, children: [] };

    // 找到合适的父级
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(newItem);
    } else {
      stack[stack.length - 1].children.push(newItem);
    }

    stack.push(newItem);
  }

  return result;
}

/**
 * 生成目录 HTML
 *
 * @param toc - 目录结构
 * @param options - 选项
 * @returns HTML 字符串
 */
export function renderToc(
  toc: TocItem[],
  options: {
    /** 最大深度（默认 3） */
    maxDepth?: number;
    /** 是否显示编号（默认 false） */
    ordered?: boolean;
    /** CSS 类名 */
    className?: string;
  } = {},
): string {
  const { maxDepth = 3, ordered = false, className = "toc" } = options;

  /**
   * 递归渲染目录项
   */
  function renderItems(items: TocItem[], depth: number): string {
    if (depth > maxDepth || items.length === 0) {
      return "";
    }

    const tag = ordered ? "ol" : "ul";
    const itemsHtml = items
      .map((item) => {
        const childrenHtml = renderItems(item.children, depth + 1);
        return `<li><a href="#${item.id}">${item.text}</a>${childrenHtml}</li>`;
      })
      .join("");

    return `<${tag}>${itemsHtml}</${tag}>`;
  }

  const content = renderItems(toc, 1);
  return content ? `<nav class="${className}">${content}</nav>` : "";
}
