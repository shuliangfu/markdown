/**
 * @module front-matter
 *
 * Front Matter 解析模块
 */

import type { FrontMatter } from "./types.ts";

// ============================================================================
// Front Matter 解析
// ============================================================================

/**
 * Front Matter 解析结果
 */
export interface FrontMatterResult {
  /** 解析出的 Front Matter 数据 */
  frontMatter: FrontMatter;
  /** Front Matter 之后的正文 */
  body: string;
}

/**
 * 解析 Front Matter
 *
 * 支持 YAML 格式的 Front Matter（以 `---` 分隔）
 *
 * @param content - Markdown 内容
 * @returns 解析结果
 *
 * @example
 * ```typescript
 * const content = `---
 * title: Hello
 * author: John
 * ---
 *
 * # Content here`;
 *
 * const { frontMatter, body } = parseFrontMatter(content);
 * console.log(frontMatter.title); // "Hello"
 * ```
 */
export function parseFrontMatter(content: string): FrontMatterResult {
  // 检查是否以 Front Matter 开始
  if (!content.startsWith("---")) {
    return { frontMatter: {}, body: content };
  }

  // 查找结束标记
  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { frontMatter: {}, body: content };
  }

  // 提取 Front Matter 内容
  const frontMatterContent = content.slice(4, endIndex);
  const body = content.slice(endIndex + 4).trim();

  // 解析 YAML（简单解析）
  const frontMatter: FrontMatter = {};
  const lines = frontMatterContent.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // 处理引号
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // 处理数组（简单支持）
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      frontMatter[key] = arrayContent.split(",").map((item) => item.trim());
    } else {
      frontMatter[key] = value;
    }
  }

  return { frontMatter, body };
}
