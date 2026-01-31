/**
 * @fileoverview 目录生成示例
 *
 * 展示如何从 Markdown 生成目录（Table of Contents）
 */

import { render, extractToc } from "../src/mod.ts";
import { renderTocNavigation, getTocActiveScript } from "../src/interactive.ts";

// ============================================================================
// 基本目录生成
// ============================================================================

console.log("=== 基本目录生成 ===\n");

const document = `
# 文档标题

## 第一章 简介

### 1.1 背景

### 1.2 目的

## 第二章 安装

### 2.1 环境要求

### 2.2 安装步骤

#### 2.2.1 下载

#### 2.2.2 配置

## 第三章 使用指南

### 3.1 快速开始

### 3.2 高级用法

## 附录
`;

const result = render(document);

console.log("目录结构:");
console.log(JSON.stringify(result.toc, null, 2));

// ============================================================================
// 从 HTML 提取目录
// ============================================================================

console.log("\n=== 从 HTML 提取目录 ===\n");

const html = `
<h1 id="title">文档标题</h1>
<h2 id="intro">简介</h2>
<h3 id="background">背景</h3>
<h2 id="install">安装</h2>
<h3 id="requirements">环境要求</h3>
`;

const toc = extractToc(html);

console.log("提取的目录:");
console.log(JSON.stringify(toc, null, 2));

// ============================================================================
// 渲染目录导航
// ============================================================================

console.log("\n=== 渲染目录导航 ===\n");

// 基本导航
const basicNav = renderTocNavigation(result.toc);
console.log("基本导航 HTML:");
console.log(basicNav);

// 带编号的导航
const numberedNav = renderTocNavigation(result.toc, {
  numbered: true,
  maxDepth: 3,
});
console.log("\n带编号的导航 HTML:");
console.log(numberedNav);

// 可折叠的导航
const collapsibleNav = renderTocNavigation(result.toc, {
  collapsible: true,
  className: "sidebar-nav",
});
console.log("\n可折叠的导航 HTML:");
console.log(collapsibleNav);

// ============================================================================
// 完整页面示例
// ============================================================================

console.log("\n=== 完整页面示例 ===\n");

/**
 * 生成带目录的完整文档页面
 *
 * @param markdown - Markdown 内容
 * @returns 完整的 HTML 页面
 */
function generateDocumentPage(markdown: string): string {
  const { html, toc } = render(markdown);

  const tocNav = renderTocNavigation(toc, {
    numbered: true,
    maxDepth: 3,
    className: "doc-toc",
  });

  const activeScript = getTocActiveScript();

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文档</title>
  <style>
    .doc-layout {
      display: flex;
      max-width: 1200px;
      margin: 0 auto;
    }
    .doc-toc {
      width: 250px;
      position: sticky;
      top: 20px;
      height: fit-content;
    }
    .doc-content {
      flex: 1;
      padding: 0 20px;
    }
  </style>
</head>
<body>
  <div class="doc-layout">
    <aside>
      ${tocNav}
    </aside>
    <main class="doc-content markdown-body">
      ${html}
    </main>
  </div>
  ${activeScript}
</body>
</html>
`;
}

const fullPage = generateDocumentPage(document);
console.log("生成的页面片段:");
console.log(fullPage.slice(0, 500) + "...");
