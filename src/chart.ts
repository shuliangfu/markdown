/**
 * @module chart
 *
 * 图表与可视化模块
 *
 * 支持：
 * - Mermaid 图表
 * - PlantUML 图表
 * - 思维导图
 * - 数学公式（KaTeX/MathJax）
 */

import { escapeHtml } from "./utils.ts";

// ============================================================================
// 图表类型
// ============================================================================

/**
 * 图表类型
 */
export type ChartType =
  | "mermaid"
  | "plantuml"
  | "mindmap"
  | "math"
  | "katex"
  | "mathjax";

/**
 * 图表渲染选项
 */
export interface ChartOptions {
  /** 图表类型 */
  type: ChartType;
  /** 主题（light/dark） */
  theme?: "light" | "dark";
  /** 背景色 */
  background?: string;
  /** 自定义样式 */
  style?: string;
}

// ============================================================================
// Mermaid 图表
// ============================================================================

/**
 * 解析 Mermaid 图表
 *
 * 语法：
 * ```mermaid
 * graph TD
 *   A --> B
 * ```
 *
 * @param content - Markdown 内容
 * @returns 处理后的内容和图表列表
 */
export function parseMermaid(content: string): {
  content: string;
  charts: string[];
} {
  const charts: string[] = [];

  const processed = content.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00MERMAID${charts.length}\x00`;
      const id = `mermaid-${charts.length}-${Date.now()}`;
      charts.push(
        `<div class="mermaid-container" id="${id}"><pre class="mermaid">${escapeHtml(code.trim())}</pre></div>`
      );
      return placeholder;
    }
  );

  return { content: processed, charts };
}

/**
 * 恢复 Mermaid 图表占位符
 */
export function restoreMermaid(html: string, charts: string[]): string {
  let result = html;
  for (let i = 0; i < charts.length; i++) {
    result = result.replace(`\x00MERMAID${i}\x00`, charts[i]);
  }
  return result;
}

// ============================================================================
// PlantUML 图表
// ============================================================================

/**
 * 解析 PlantUML 图表
 *
 * 语法：
 * ```plantuml
 * @startuml
 * Alice -> Bob: Hello
 * @enduml
 * ```
 */
export function parsePlantUML(content: string): {
  content: string;
  charts: string[];
} {
  const charts: string[] = [];

  const processed = content.replace(
    /```plantuml\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00PLANTUML${charts.length}\x00`;
      const id = `plantuml-${charts.length}-${Date.now()}`;
      // 使用 PlantUML 服务器编码
      const encoded = encodePlantUML(code.trim());
      charts.push(
        `<div class="plantuml-container" id="${id}"><img class="plantuml" src="https://www.plantuml.com/plantuml/svg/${encoded}" alt="PlantUML Diagram" data-source="${escapeHtml(code.trim())}"></div>`
      );
      return placeholder;
    }
  );

  return { content: processed, charts };
}

/**
 * 恢复 PlantUML 图表占位符
 */
export function restorePlantUML(html: string, charts: string[]): string {
  let result = html;
  for (let i = 0; i < charts.length; i++) {
    result = result.replace(`\x00PLANTUML${i}\x00`, charts[i]);
  }
  return result;
}

/**
 * 编码 PlantUML 代码（简化版）
 *
 * 注意：完整实现需要 deflate 压缩
 */
function encodePlantUML(code: string): string {
  // 简化编码：使用 base64
  // 实际使用时建议使用官方的编码库
  try {
    return btoa(unescape(encodeURIComponent(code)));
  } catch {
    return btoa(code);
  }
}

// ============================================================================
// 思维导图
// ============================================================================

/**
 * 思维导图节点
 */
export interface MindmapNode {
  text: string;
  children: MindmapNode[];
  level: number;
}

/**
 * 解析思维导图
 *
 * 语法：
 * ```mindmap
 * # 中心主题
 * ## 分支1
 * ### 子分支1
 * ## 分支2
 * ```
 */
export function parseMindmap(content: string): {
  content: string;
  charts: string[];
} {
  const charts: string[] = [];

  const processed = content.replace(
    /```mindmap\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00MINDMAP${charts.length}\x00`;
      const id = `mindmap-${charts.length}-${Date.now()}`;
      const nodes = parseMindmapNodes(code.trim());
      const html = renderMindmapNodes(nodes);
      charts.push(
        `<div class="mindmap-container" id="${id}">${html}</div>`
      );
      return placeholder;
    }
  );

  return { content: processed, charts };
}

/**
 * 解析思维导图节点
 */
function parseMindmapNodes(code: string): MindmapNode[] {
  const lines = code.split("\n").filter((line) => line.trim());
  const root: MindmapNode[] = [];
  const stack: { node: MindmapNode; level: number }[] = [];

  for (const line of lines) {
    const match = line.match(/^(#+)\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    const node: MindmapNode = { text, children: [], level };

    // 找到父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ node, level });
  }

  return root;
}

/**
 * 渲染思维导图节点
 */
function renderMindmapNodes(nodes: MindmapNode[]): string {
  if (nodes.length === 0) return "";

  const renderNode = (node: MindmapNode): string => {
    const childrenHtml =
      node.children.length > 0
        ? `<ul class="mindmap-children">${node.children.map(renderNode).join("")}</ul>`
        : "";
    return `<li class="mindmap-node mindmap-level-${node.level}"><span class="mindmap-text">${escapeHtml(node.text)}</span>${childrenHtml}</li>`;
  };

  return `<ul class="mindmap">${nodes.map(renderNode).join("")}</ul>`;
}

/**
 * 恢复思维导图占位符
 */
export function restoreMindmap(html: string, charts: string[]): string {
  let result = html;
  for (let i = 0; i < charts.length; i++) {
    result = result.replace(`\x00MINDMAP${i}\x00`, charts[i]);
  }
  return result;
}

// ============================================================================
// 数学公式渲染
// ============================================================================

/**
 * 数学公式渲染器类型
 */
export type MathRenderer = "katex" | "mathjax";

/**
 * 获取数学公式渲染脚本
 *
 * @param renderer - 渲染器类型
 * @returns HTML script 标签
 */
export function getMathScript(renderer: MathRenderer = "katex"): string {
  if (renderer === "katex") {
    return `
<!-- KaTeX -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // 渲染块级公式
  document.querySelectorAll('.math-block').forEach(function(el) {
    var tex = el.getAttribute('data-math') || el.textContent;
    try {
      katex.render(tex, el, { displayMode: true, throwOnError: false });
    } catch (e) {
      console.error('KaTeX error:', e);
    }
  });
  // 渲染行内公式
  document.querySelectorAll('.math-inline').forEach(function(el) {
    var tex = el.getAttribute('data-math') || el.textContent;
    try {
      katex.render(tex, el, { displayMode: false, throwOnError: false });
    } catch (e) {
      console.error('KaTeX error:', e);
    }
  });
});
</script>`;
  } else {
    return `
<!-- MathJax -->
<script>
MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']]
  }
};
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`;
  }
}

// ============================================================================
// 图表样式
// ============================================================================

/**
 * 获取图表样式
 */
export function getChartStyles(): string {
  return `
/* Mermaid 图表样式 */
.mermaid-container {
  margin: 16px 0;
  text-align: center;
  overflow-x: auto;
}
.mermaid {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
}

/* PlantUML 图表样式 */
.plantuml-container {
  margin: 16px 0;
  text-align: center;
}
.plantuml-container img {
  max-width: 100%;
  height: auto;
}

/* 思维导图样式 */
.mindmap-container {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow-x: auto;
}
.mindmap {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mindmap-node {
  position: relative;
  padding: 8px 16px;
  margin: 4px 0;
}
.mindmap-text {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  background: #fff;
  border: 2px solid #ddd;
}
.mindmap-level-1 .mindmap-text {
  background: #2196f3;
  color: white;
  border-color: #1976d2;
  font-size: 1.2em;
  font-weight: bold;
}
.mindmap-level-2 .mindmap-text {
  background: #4caf50;
  color: white;
  border-color: #388e3c;
}
.mindmap-level-3 .mindmap-text {
  background: #ff9800;
  color: white;
  border-color: #f57c00;
}
.mindmap-children {
  list-style: none;
  padding-left: 24px;
  margin: 0;
  border-left: 2px solid #ddd;
}
`;
}

/**
 * 获取 Mermaid 脚本
 */
export function getMermaidScript(): string {
  return `
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>`;
}

// ============================================================================
// Chart.js 图表
// ============================================================================

/**
 * Chart.js 图表配置接口
 */
export interface ChartJSConfig {
  /** 图表类型 */
  type: "line" | "bar" | "pie" | "doughnut" | "radar" | "polarArea" | "bubble" | "scatter";
  /** 数据配置 */
  data: {
    labels?: string[];
    datasets: Array<{
      label?: string;
      data: number[] | Array<{ x: number; y: number; r?: number }>;
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
      [key: string]: unknown;
    }>;
  };
  /** 图表选项 */
  options?: Record<string, unknown>;
}

/**
 * 解析 Chart.js 图表
 *
 * 语法：
 * ```chartjs
 * {
 *   "type": "bar",
 *   "data": { ... }
 * }
 * ```
 *
 * @param content - Markdown 内容
 * @returns 处理后的内容和图表列表
 */
export function parseChartJS(content: string): {
  content: string;
  charts: string[];
} {
  const charts: string[] = [];

  const processed = content.replace(
    /```chartjs\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00CHARTJS${charts.length}\x00`;
      const id = `chartjs-${charts.length}-${Date.now()}`;
      const canvasId = `canvas-${id}`;

      // 验证 JSON 格式
      const configStr = code.trim();
      try {
        JSON.parse(configStr);
      } catch {
        // JSON 解析失败，返回错误提示
        charts.push(
          `<div class="chartjs-error">Chart.js 配置错误：无效的 JSON 格式</div>`
        );
        return placeholder;
      }

      // 生成图表容器和初始化脚本
      charts.push(
        `<div class="chartjs-container" id="${id}">
  <canvas id="${canvasId}"></canvas>
</div>
<script>
(function() {
  const config = ${configStr};
  const ctx = document.getElementById('${canvasId}');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, config);
  } else if (ctx) {
    // Chart.js 还未加载，等待加载完成
    window.addEventListener('chartjs-ready', function() {
      new Chart(ctx, config);
    });
  }
})();
</script>`
      );
      return placeholder;
    }
  );

  return { content: processed, charts };
}

/**
 * 恢复 Chart.js 图表占位符
 */
export function restoreChartJS(html: string, charts: string[]): string {
  let result = html;
  for (let i = 0; i < charts.length; i++) {
    result = result.replace(`\x00CHARTJS${i}\x00`, charts[i]);
  }
  return result;
}

/**
 * 获取 Chart.js 脚本
 */
export function getChartJSScript(): string {
  return `
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
  // 通知 Chart.js 已加载
  window.dispatchEvent(new Event('chartjs-ready'));
</script>`;
}

/**
 * 获取 Chart.js 样式
 */
export function getChartJSStyles(): string {
  return `
/* Chart.js 图表样式 */
.chartjs-container {
  margin: 16px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  max-width: 100%;
}
.chartjs-container canvas {
  max-width: 100%;
  height: auto !important;
}
.chartjs-error {
  margin: 16px 0;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
}
`;
}
