/**
 * @module code
 *
 * 代码增强模块
 *
 * 支持：
 * - 代码块行号显示
 * - 代码块复制按钮
 * - 代码差异高亮（diff）
 * - 代码组/多语言切换
 * - 文件树展示
 */

import { escapeHtml } from "./utils.ts";

// ============================================================================
// 代码块增强
// ============================================================================

/**
 * 代码块选项
 */
export interface CodeBlockOptions {
  /** 是否显示行号 */
  lineNumbers?: boolean;
  /** 起始行号 */
  startLine?: number;
  /** 高亮行（如 "1,3-5,7"） */
  highlightLines?: string;
  /** 是否显示复制按钮 */
  copyButton?: boolean;
  /** 文件名 */
  filename?: string;
  /** 是否可折叠 */
  collapsible?: boolean;
}

/**
 * 解析代码块元信息
 *
 * 语法：```js {1,3-5} filename="app.js" lineNumbers
 */
export function parseCodeMeta(meta: string): CodeBlockOptions {
  const options: CodeBlockOptions = {};

  // 解析高亮行 {1,3-5}
  const highlightMatch = meta.match(/\{([^}]+)\}/);
  if (highlightMatch) {
    options.highlightLines = highlightMatch[1];
  }

  // 解析文件名
  const filenameMatch = meta.match(/filename=["']?([^"'\s]+)["']?/);
  if (filenameMatch) {
    options.filename = filenameMatch[1];
  }

  // 解析行号
  if (meta.includes("lineNumbers") || meta.includes("showLineNumbers")) {
    options.lineNumbers = true;
  }

  // 解析起始行号
  const startLineMatch = meta.match(/startLine=(\d+)/);
  if (startLineMatch) {
    options.startLine = parseInt(startLineMatch[1], 10);
  }

  // 解析复制按钮
  if (meta.includes("copy") || meta.includes("copyButton")) {
    options.copyButton = true;
  }

  // 解析可折叠
  if (meta.includes("collapsible") || meta.includes("collapsed")) {
    options.collapsible = true;
  }

  return options;
}

/**
 * 解析高亮行范围
 *
 * @param spec - 行号规范（如 "1,3-5,7"）
 * @returns 需要高亮的行号集合
 */
export function parseHighlightLines(spec: string): Set<number> {
  const lines = new Set<number>();

  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim(), 10));
      for (let i = start; i <= end; i++) {
        lines.add(i);
      }
    } else {
      lines.add(parseInt(trimmed, 10));
    }
  }

  return lines;
}

/**
 * 渲染增强代码块
 */
export function renderCodeBlock(
  code: string,
  lang: string,
  options: CodeBlockOptions = {}
): string {
  const {
    lineNumbers = false,
    startLine = 1,
    highlightLines,
    copyButton = true,
    filename,
    collapsible = false,
  } = options;

  const lines = code.split("\n");
  const highlightSet = highlightLines
    ? parseHighlightLines(highlightLines)
    : new Set<number>();

  // 构建代码行
  let codeHtml = "";
  lines.forEach((line, index) => {
    const lineNum = startLine + index;
    const isHighlighted = highlightSet.has(lineNum);
    const highlightClass = isHighlighted ? " highlighted" : "";

    if (lineNumbers) {
      codeHtml += `<span class="code-line${highlightClass}"><span class="line-number">${lineNum}</span><span class="line-content">${escapeHtml(line)}</span></span>\n`;
    } else {
      codeHtml += `<span class="code-line${highlightClass}"><span class="line-content">${escapeHtml(line)}</span></span>\n`;
    }
  });

  // 构建头部
  let headerHtml = "";
  if (filename || lang || copyButton) {
    headerHtml = `<div class="code-header">`;
    if (filename) {
      headerHtml += `<span class="code-filename">${escapeHtml(filename)}</span>`;
    } else if (lang) {
      headerHtml += `<span class="code-lang">${escapeHtml(lang)}</span>`;
    }
    if (copyButton) {
      headerHtml += `<button type="button" class="code-copy-btn" onclick="copyCode(this)" title="复制代码">📋</button>`;
    }
    headerHtml += `</div>`;
  }

  const langClass = lang ? ` language-${lang}` : "";
  const lineNumbersClass = lineNumbers ? " with-line-numbers" : "";
  const content = `${headerHtml}<pre class="code-block${lineNumbersClass}"><code class="${langClass}">${codeHtml}</code></pre>`;

  if (collapsible) {
    return `<details class="code-collapsible"><summary>${filename || lang || "代码"}</summary>${content}</details>`;
  }

  return `<div class="code-container">${content}</div>`;
}

// ============================================================================
// Diff 高亮
// ============================================================================

/**
 * 解析 Diff 代码块
 *
 * 语法：
 * ```diff
 * - 删除的行
 * + 添加的行
 *   普通行
 * ```
 */
export function parseDiff(content: string): {
  content: string;
  diffs: string[];
} {
  const diffs: string[] = [];

  const processed = content.replace(
    /```diff\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00DIFF${diffs.length}\x00`;
      diffs.push(renderDiff(code.trim()));
      return placeholder;
    }
  );

  return { content: processed, diffs };
}

/**
 * 渲染 Diff 代码
 */
export function renderDiff(code: string): string {
  const lines = code.split("\n");
  let html = "";

  for (const line of lines) {
    if (line.startsWith("+")) {
      html += `<span class="diff-add">${escapeHtml(line)}</span>\n`;
    } else if (line.startsWith("-")) {
      html += `<span class="diff-remove">${escapeHtml(line)}</span>\n`;
    } else if (line.startsWith("@")) {
      html += `<span class="diff-info">${escapeHtml(line)}</span>\n`;
    } else {
      html += `<span class="diff-normal">${escapeHtml(line)}</span>\n`;
    }
  }

  return `<pre class="code-diff"><code>${html}</code></pre>`;
}

/**
 * 恢复 Diff 占位符
 */
export function restoreDiff(html: string, diffs: string[]): string {
  let result = html;
  for (let i = 0; i < diffs.length; i++) {
    result = result.replace(`\x00DIFF${i}\x00`, diffs[i]);
  }
  return result;
}

// ============================================================================
// 代码组
// ============================================================================

/**
 * 代码组项
 */
export interface CodeGroupItem {
  label: string;
  lang: string;
  code: string;
}

/**
 * 解析代码组
 *
 * 语法：
 * ::: code-group
 * ```js [JavaScript]
 * console.log('hello');
 * ```
 * ```py [Python]
 * print('hello')
 * ```
 * :::
 */
export function parseCodeGroup(content: string): {
  content: string;
  groups: string[];
} {
  const groups: string[] = [];

  const processed = content.replace(
    /:::code-group\n([\s\S]*?):::/g,
    (_, groupContent: string) => {
      const placeholder = `\x00CODEGROUP${groups.length}\x00`;
      const items = parseCodeGroupItems(groupContent);
      groups.push(renderCodeGroup(items, groups.length));
      return placeholder;
    }
  );

  return { content: processed, groups };
}

/**
 * 解析代码组项
 */
function parseCodeGroupItems(content: string): CodeGroupItem[] {
  const items: CodeGroupItem[] = [];
  const regex = /```(\w+)(?:\s+\[([^\]]+)\])?\n([\s\S]*?)```/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    items.push({
      lang: match[1],
      label: match[2] || match[1].toUpperCase(),
      code: match[3].trim(),
    });
  }

  return items;
}

/**
 * 渲染代码组
 */
function renderCodeGroup(items: CodeGroupItem[], groupId: number): string {
  if (items.length === 0) return "";

  const tabsHtml = items
    .map(
      (item, i) =>
        `<button type="button" class="code-group-tab${i === 0 ? " active" : ""}" data-tab="${groupId}-${i}" onclick="switchCodeTab(this)">${escapeHtml(item.label)}</button>`
    )
    .join("");

  const panelsHtml = items
    .map(
      (item, i) =>
        `<div class="code-group-panel${i === 0 ? " active" : ""}" data-panel="${groupId}-${i}"><pre><code class="language-${item.lang}">${escapeHtml(item.code)}</code></pre></div>`
    )
    .join("");

  return `<div class="code-group"><div class="code-group-tabs">${tabsHtml}</div><div class="code-group-panels">${panelsHtml}</div></div>`;
}

/**
 * 恢复代码组占位符
 */
export function restoreCodeGroup(html: string, groups: string[]): string {
  let result = html;
  for (let i = 0; i < groups.length; i++) {
    result = result.replace(`\x00CODEGROUP${i}\x00`, groups[i]);
  }
  return result;
}

// ============================================================================
// 文件树
// ============================================================================

/**
 * 文件树节点
 */
export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  highlight?: boolean;
}

/**
 * 解析文件树
 *
 * 语法：
 * ```filetree
 * src/
 *   components/
 *     Button.tsx *
 *   App.tsx
 * package.json
 * ```
 */
export function parseFileTree(content: string): {
  content: string;
  trees: string[];
} {
  const trees: string[] = [];

  const processed = content.replace(
    /```filetree\n([\s\S]*?)```/g,
    (_, code: string) => {
      const placeholder = `\x00FILETREE${trees.length}\x00`;
      const nodes = parseFileTreeNodes(code.trim());
      trees.push(renderFileTree(nodes));
      return placeholder;
    }
  );

  return { content: processed, trees };
}

/**
 * 解析文件树节点
 */
function parseFileTreeNodes(code: string): FileTreeNode[] {
  const lines = code.split("\n");
  const root: FileTreeNode[] = [];
  const stack: { node: FileTreeNode; indent: number }[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const indent = line.search(/\S/);
    const content = line.trim();
    const highlight = content.endsWith("*");
    const name = highlight ? content.slice(0, -1).trim() : content;
    const isFolder = name.endsWith("/");

    const node: FileTreeNode = {
      name: isFolder ? name.slice(0, -1) : name,
      type: isFolder ? "folder" : "file",
      highlight,
      children: isFolder ? [] : undefined,
    };

    // 找到父节点
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }

    if (isFolder) {
      stack.push({ node, indent });
    }
  }

  return root;
}

/**
 * 渲染文件树
 */
function renderFileTree(nodes: FileTreeNode[]): string {
  const renderNode = (node: FileTreeNode): string => {
    const icon = node.type === "folder" ? "📁" : getFileIcon(node.name);
    const highlightClass = node.highlight ? " highlighted" : "";
    const childrenHtml =
      node.children && node.children.length > 0
        ? `<ul class="filetree-children">${node.children.map(renderNode).join("")}</ul>`
        : "";

    return `<li class="filetree-node filetree-${node.type}${highlightClass}"><span class="filetree-icon">${icon}</span><span class="filetree-name">${escapeHtml(node.name)}</span>${childrenHtml}</li>`;
  };

  return `<ul class="filetree">${nodes.map(renderNode).join("")}</ul>`;
}

/**
 * 获取文件图标
 */
function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons: Record<string, string> = {
    ts: "📄",
    tsx: "⚛️",
    js: "📄",
    jsx: "⚛️",
    json: "📋",
    md: "📝",
    html: "🌐",
    css: "🎨",
    scss: "🎨",
    py: "🐍",
    go: "🐹",
    rs: "🦀",
    java: "☕",
    kt: "🎯",
    swift: "🍎",
    rb: "💎",
    php: "🐘",
    sql: "🗃️",
    sh: "🐚",
    yml: "⚙️",
    yaml: "⚙️",
    toml: "⚙️",
    xml: "📰",
    svg: "🖼️",
    png: "🖼️",
    jpg: "🖼️",
    gif: "🖼️",
    mp3: "🎵",
    mp4: "🎬",
    pdf: "📕",
    zip: "📦",
    lock: "🔒",
  };
  return icons[ext] || "📄";
}

/**
 * 恢复文件树占位符
 */
export function restoreFileTree(html: string, trees: string[]): string {
  let result = html;
  for (let i = 0; i < trees.length; i++) {
    result = result.replace(`\x00FILETREE${i}\x00`, trees[i]);
  }
  return result;
}

// ============================================================================
// 代码样式
// ============================================================================

/**
 * 获取代码增强样式
 */
export function getCodeStyles(): string {
  return `
/* 代码容器 */
.code-container {
  margin: 16px 0;
  border-radius: 4px;
  overflow: hidden;
  background: #1e1e1e;
}
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}
.code-filename, .code-lang {
  color: #9d9d9d;
  font-size: 0.85em;
  font-family: monospace;
}
.code-copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1em;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.code-copy-btn:hover { opacity: 1; }

/* 行号 */
.code-block { margin: 0; padding: 16px; }
.code-block.with-line-numbers { padding-left: 0; }
.code-line { display: block; }
.line-number {
  display: inline-block;
  width: 3em;
  text-align: right;
  padding-right: 1em;
  color: #666;
  user-select: none;
  border-right: 1px solid #3d3d3d;
  margin-right: 1em;
}
.code-line.highlighted {
  background: rgba(255, 255, 0, 0.1);
  border-left: 3px solid #ffd700;
  margin-left: -3px;
}

/* Diff */
.code-diff { background: #1e1e1e; padding: 16px; margin: 16px 0; border-radius: 4px; }
.diff-add { color: #98c379; background: rgba(152, 195, 121, 0.1); display: block; }
.diff-remove { color: #e06c75; background: rgba(224, 108, 117, 0.1); display: block; }
.diff-info { color: #61afef; display: block; }
.diff-normal { display: block; }

/* 代码组 */
.code-group { margin: 16px 0; border-radius: 4px; overflow: hidden; }
.code-group-tabs { display: flex; background: #2d2d2d; }
.code-group-tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #9d9d9d;
  cursor: pointer;
  font-size: 0.9em;
}
.code-group-tab.active { background: #1e1e1e; color: #fff; }
.code-group-tab:hover { color: #fff; }
.code-group-panel { display: none; }
.code-group-panel.active { display: block; }
.code-group-panel pre { margin: 0; border-radius: 0; }

/* 文件树 */
.filetree {
  list-style: none;
  padding: 16px;
  margin: 16px 0;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
}
.filetree-children { list-style: none; padding-left: 24px; margin: 0; }
.filetree-node { padding: 2px 0; }
.filetree-icon { margin-right: 8px; }
.filetree-node.highlighted .filetree-name { background: #fff59d; padding: 0 4px; border-radius: 2px; }

/* 可折叠代码 */
.code-collapsible { margin: 16px 0; }
.code-collapsible summary {
  cursor: pointer;
  padding: 8px 12px;
  background: #2d2d2d;
  color: #fff;
  border-radius: 4px;
}
.code-collapsible[open] summary { border-radius: 4px 4px 0 0; }
`;
}

/**
 * 获取代码交互脚本
 */
export function getCodeScript(): string {
  return `
<script>
// 复制代码
function copyCode(btn) {
  const container = btn.closest('.code-container') || btn.closest('.code-collapsible');
  const code = container.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const original = btn.textContent;
    btn.textContent = '✅';
    setTimeout(() => btn.textContent = original, 2000);
  });
}

// 切换代码组标签
function switchCodeTab(tab) {
  const group = tab.closest('.code-group');
  const tabId = tab.dataset.tab;
  
  // 更新标签状态
  group.querySelectorAll('.code-group-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  
  // 更新面板状态
  group.querySelectorAll('.code-group-panel').forEach(p => p.classList.remove('active'));
  group.querySelector(\`[data-panel="\${tabId}"]\`).classList.add('active');
}
</script>`;
}

// ============================================================================
// Prism.js 代码高亮
// ============================================================================

/**
 * 获取 Prism.js 代码高亮脚本
 *
 * 支持的语言：javascript, typescript, python, java, go, rust, sql, bash, json, html, css, markdown 等
 */
export function getPrismScript(): string {
  return `
<!-- Prism.js 代码高亮 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
<script>
  // 配置自动加载器路径
  Prism.plugins.autoloader.languages_path = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/';
  
  // 页面加载完成后高亮所有代码块
  document.addEventListener('DOMContentLoaded', function() {
    Prism.highlightAll();
  });
</script>`;
}

/**
 * 获取 Prism.js 样式覆盖（与现有主题适配）
 */
export function getPrismStyles(): string {
  return `
/* Prism.js 样式覆盖 */
pre[class*="language-"] {
  margin: 16px 0;
  padding: 16px;
  overflow: auto;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

code[class*="language-"] {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
}

/* 行内代码保持原样式 */
:not(pre) > code {
  background: var(--color-bg-code, #f4f4f4);
  color: var(--color-code-text, #333);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* 代码块容器 */
.code-block-wrapper {
  position: relative;
  margin: 16px 0;
}

/* 语言标签 */
.code-lang-label {
  position: absolute;
  top: 0;
  right: 12px;
  padding: 2px 8px;
  font-size: 12px;
  color: #8b949e;
  background: rgba(45, 45, 45, 0.8);
  border-radius: 0 0 4px 4px;
  text-transform: uppercase;
}
`;
}
