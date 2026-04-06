/**
 * @fileoverview Front Matter 解析示例
 *
 * 展示如何解析 Markdown 文件中的 YAML Front Matter
 */

import { parseFrontMatter, render } from "../src/mod.ts";

// ============================================================================
// 基本 Front Matter 解析
// ============================================================================

console.log("=== Front Matter 解析 ===\n");

const markdownWithFrontMatter = `---
title: 我的博客文章
author: 张三
date: 2024-01-15
tags:
  - TypeScript
  - Deno
  - Markdown
draft: false
---

# ${"{"}title{"}"}

这是文章的正文内容。

作者：${"{"}author{"}"}
`;

// 方式一：使用 parseFrontMatter 单独解析
const { frontMatter, body } = parseFrontMatter(markdownWithFrontMatter);

console.log("Front Matter 数据:");
console.log(JSON.stringify(frontMatter, null, 2));
console.log("\n文章正文:");
console.log(body);

// ============================================================================
// 使用 render 自动解析
// ============================================================================

console.log("\n=== 使用 render 自动解析 ===\n");

const result = render(markdownWithFrontMatter);

console.log("渲染结果中的 Front Matter:");
console.log(JSON.stringify(result.frontMatter, null, 2));

// ============================================================================
// 博客文章完整示例
// ============================================================================

console.log("\n=== 博客文章示例 ===\n");

const blogPost = `---
title: TypeScript 入门指南
author: 李四
date: 2024-03-20
category: 技术教程
tags:
  - TypeScript
  - JavaScript
  - 编程
cover: /images/typescript-cover.jpg
excerpt: 本文介绍 TypeScript 的基础知识和常见用法
---

# TypeScript 入门指南

## 什么是 TypeScript？

TypeScript 是 JavaScript 的超集，添加了类型系统和其他特性。

## 安装

\`\`\`bash
npm install -g typescript
\`\`\`

## 基本类型

\`\`\`typescript
let name: string = "Hello";
let age: number = 25;
let isActive: boolean = true;
\`\`\`
`;

const blogResult = render(blogPost);

// 使用 Front Matter 数据构建页面元信息
const { frontMatter: meta } = blogResult;

if (meta) {
  console.log(`标题: ${meta.title}`);
  console.log(`作者: ${meta.author}`);
  console.log(`日期: ${meta.date}`);
  console.log(`分类: ${meta.category}`);
  console.log(`标签: ${(meta.tags as string[])?.join(", ")}`);
  console.log(`封面: ${meta.cover}`);
  console.log(`摘要: ${meta.excerpt}`);
}

// ============================================================================
// 无 Front Matter 的文档
// ============================================================================

console.log("\n=== 无 Front Matter 的文档 ===\n");

const plainMarkdown = `# 普通文档

这个文档没有 Front Matter。
`;

const plainResult = parseFrontMatter(plainMarkdown);

console.log("Front Matter:", plainResult.frontMatter);
console.log("正文:", plainResult.body);
