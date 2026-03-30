/**
 * @module template
 *
 * HTML 模板模块
 */

import type { MarkdownResult } from "./types.ts";

// ============================================================================
// 默认模板
// ============================================================================

/**
 * 默认 HTML 模板
 *
 * 包含基本样式和响应式设计
 */
export const DEFAULT_TEMPLATE: string = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
           max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    pre { background: #f4f4f4; padding: 16px; overflow-x: auto; border-radius: 4px; }
    code { font-family: 'SFMono-Regular', Consolas, monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    img { max-width: 100%; height: auto; }
    a { color: #0066cc; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f4; }
    .task-list { list-style: none; padding-left: 0; }
    .task-item { margin: 4px 0; }
    .task-item input { margin-right: 8px; }
    /* 脚注样式 */
    .footnotes { margin-top: 32px; font-size: 0.9em; color: #666; }
    .footnotes hr { margin-bottom: 16px; }
    .footnote-ref a { text-decoration: none; color: #0066cc; }
    .footnote-backref { text-decoration: none; margin-left: 4px; }
    /* 数学公式样式 */
    .math-block { 
      display: block; 
      text-align: center; 
      padding: 16px; 
      margin: 16px 0; 
      background: #f8f9fa; 
      border-radius: 4px;
      font-family: 'Times New Roman', serif;
      overflow-x: auto;
    }
    .math-inline { 
      font-family: 'Times New Roman', serif;
      background: #f8f9fa;
      padding: 2px 4px;
      border-radius: 3px;
    }
    /* 嵌套列表样式 */
    ul ul, ul ol, ol ul, ol ol { margin-left: 20px; }
    /* 定义列表样式 */
    dl { margin: 16px 0; }
    dt { font-weight: bold; margin-top: 12px; }
    dd { margin-left: 24px; margin-bottom: 8px; color: #444; }
    /* 缩写样式 */
    abbr { text-decoration: underline dotted; cursor: help; }
    abbr[title]:hover { text-decoration: underline; }
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
    /* 上标/下标样式 */
    sup, sub { font-size: 0.75em; }
    sup { vertical-align: super; }
    sub { vertical-align: sub; }
    /* 高亮文本样式 */
    mark { background: #fff59d; padding: 0.1em 0.2em; border-radius: 2px; }
    /* 插入文本样式 */
    ins { text-decoration: underline; background: #c8e6c9; }
    /* 键盘按键样式 */
    kbd { 
      display: inline-block; 
      padding: 3px 6px; 
      font-size: 0.85em; 
      font-family: monospace;
      line-height: 1;
      color: #444;
      background: #f7f7f7;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.2), inset 0 0 0 2px #fff;
    }
  </style>
</head>
<body>
{{content}}
</body>
</html>`;

// ============================================================================
// 模板应用
// ============================================================================

/**
 * 应用模板
 *
 * 自动注入 render 函数收集的样式和脚本
 *
 * @param template - HTML 模板
 * @param result - Markdown 渲染结果
 * @returns 完整的 HTML 页面
 *
 * @example
 * ```typescript
 * const result = render(content);
 * const page = applyTemplate(DEFAULT_TEMPLATE, result);
 * // 样式和脚本会自动注入到 HTML 中
 * ```
 */
export function applyTemplate(
  template: string,
  result: MarkdownResult,
): string {
  let html = template;

  // 替换基础占位符
  html = html.replace(/\{\{title\}\}/g, result.frontMatter.title || "Document");
  html = html.replace(/\{\{content\}\}/g, result.html);

  // 自动注入样式（在 </head> 之前）
  if (result.styles) {
    const styleTag = `<style>\n${result.styles}\n</style>\n`;
    html = html.replace("</head>", `${styleTag}</head>`);
  }

  // 自动注入脚本（在 </body> 之前）
  if (result.scripts) {
    html = html.replace("</body>", `${result.scripts}\n</body>`);
  }

  return html;
}

/**
 * 创建自定义模板
 *
 * @param options - 模板选项
 * @returns HTML 模板字符串
 */
export function createTemplate(options: {
  /** 自定义 CSS */
  css?: string;
  /** 自定义 head 内容 */
  head?: string;
  /** 自定义 body 前置内容 */
  bodyPrefix?: string;
  /** 自定义 body 后置内容 */
  bodySuffix?: string;
} = {}): string {
  const { css = "", head = "", bodyPrefix = "", bodySuffix = "" } = options;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  ${head}
  <style>
    ${css}
  </style>
</head>
<body>
${bodyPrefix}
{{content}}
${bodySuffix}
</body>
</html>`;
}
