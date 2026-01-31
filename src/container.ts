/**
 * @module container
 *
 * 自定义容器解析模块
 */

import type { ContainerType } from "./types.ts";

// ============================================================================
// 容器解析
// ============================================================================

/**
 * 容器解析结果
 */
export interface ContainerResult {
  /** 容器类型 */
  type: ContainerType;
  /** 容器标题 */
  title?: string;
  /** 容器内容 */
  content: string;
  /** 渲染后的 HTML */
  html: string;
}

/**
 * 解析自定义容器
 *
 * 语法：
 * ```
 * :::note 标题
 * 内容
 * :::
 * ```
 *
 * 支持的容器类型：
 * - note: 普通提示
 * - tip: 技巧提示
 * - info: 信息
 * - warning: 警告
 * - danger: 危险
 * - details: 可折叠（使用 HTML5 details 元素）
 * - quote: 引用
 * - 自定义类型
 *
 * @param content - Markdown 内容
 * @returns 处理后的内容（容器已被占位符替换）和容器列表
 */
export function extractContainers(content: string): {
  content: string;
  containers: string[];
} {
  const containers: string[] = [];

  const processed = content.replace(
    /^:::(note|tip|info|warning|danger|details|quote|[\w-]+)(?:\s+(.+))?\n([\s\S]*?)^:::\s*$/gm,
    (_, type, title, innerContent) => {
      const placeholder = `\x00CONTAINER${containers.length}\x00`;
      const containerTitle = title
        ? `<div class="container-title">${title.trim()}</div>`
        : "";
      const containerContent = innerContent.trim();

      // details 容器使用 HTML5 details 元素
      if (type === "details") {
        const summary = title ? title.trim() : "详情";
        containers.push(
          `<details class="container container-details"><summary>${summary}</summary><div class="container-content">${containerContent}</div></details>`
        );
      } else {
        containers.push(
          `<div class="container container-${type}">${containerTitle}<div class="container-content">${containerContent}</div></div>`
        );
      }
      return placeholder;
    }
  );

  return { content: processed, containers };
}

/**
 * 恢复容器占位符
 *
 * @param html - 包含占位符的 HTML
 * @param containers - 容器 HTML 列表
 * @returns 恢复后的 HTML
 */
export function restoreContainers(html: string, containers: string[]): string {
  let result = html;
  for (let i = 0; i < containers.length; i++) {
    result = result.replace(`\x00CONTAINER${i}\x00`, containers[i]);
  }
  return result;
}

// ============================================================================
// 容器样式
// ============================================================================

/**
 * 获取容器默认样式
 *
 * @returns CSS 样式字符串
 */
export function getContainerStyles(): string {
  return `
    /* 自定义容器样式 */
    .container { 
      margin: 16px 0; 
      padding: 16px; 
      border-radius: 4px; 
      border-left: 4px solid; 
    }
    .container-title { font-weight: bold; margin-bottom: 8px; }
    .container-content { margin: 0; }
    .container-note { background: #e8f4fd; border-color: #2196f3; }
    .container-tip { background: #e8f5e9; border-color: #4caf50; }
    .container-info { background: #e3f2fd; border-color: #03a9f4; }
    .container-warning { background: #fff3e0; border-color: #ff9800; }
    .container-danger { background: #ffebee; border-color: #f44336; }
    .container-quote { background: #f5f5f5; border-color: #9e9e9e; font-style: italic; }
    .container-details { background: #fafafa; border-color: #607d8b; }
    details.container summary { cursor: pointer; font-weight: bold; margin-bottom: 8px; }
    details.container[open] summary { margin-bottom: 12px; }
  `;
}
