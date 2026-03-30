/**
 * @fileoverview 生成 HTML 测试文件
 *
 * 使用 @dreamer/markdown 库的模板功能生成完整 HTML 页面
 *
 * 运行命令：deno run -A examples/generate-html.ts
 */

import {
  render,
  renderToc,
  createTemplate,
  applyTemplate,
} from "../src/mod.ts";

// 读取 Markdown 文件
const mdPath = new URL("./test-document.md", import.meta.url);
const markdown = await Deno.readTextFile(mdPath);

console.log("正在解析 Markdown 文件...");
console.log("文件路径:", mdPath.pathname);
console.log("文件大小:", markdown.length, "字符");

// 解析 Markdown
const result = render(markdown);

console.log("\n解析结果:");
console.log("  Front Matter:", JSON.stringify(result.frontMatter, null, 2));
console.log("  目录项数量:", result.toc.length);
console.log("  HTML 长度:", result.html.length, "字符");

// 生成目录 HTML
const tocHtml = renderToc(result.toc);

// 样式和脚本会由 render 函数自动收集，applyTemplate 自动注入
// `MarkdownResult` 上 `styles` / `scripts` 为可选字段；`render()` 通常会填充二者，此处用空串兜底便于类型检查
const styleLen = (result.styles ?? "").length;
const scriptLen = (result.scripts ?? "").length;
console.log("  自动收集样式:", styleLen, "字符");
console.log("  自动收集脚本:", scriptLen, "字符");

// 构建 Front Matter 信息 HTML
const tags = Array.isArray(result.frontMatter.tags)
  ? (result.frontMatter.tags as string[])
      .map((tag: string) => `<span class="meta-tag">${tag}</span>`)
      .join("")
  : "";

const metaHtml = `
<div class="meta">
  <div class="meta-item"><span class="meta-label">标题：</span>${result.frontMatter.title || "未命名文档"}</div>
  <div class="meta-item"><span class="meta-label">作者：</span>${result.frontMatter.author || "未知"}</div>
  <div class="meta-item"><span class="meta-label">日期：</span>${result.frontMatter.date || "未知"}</div>
  <div class="meta-item"><span class="meta-label">分类：</span>${result.frontMatter.category || "未分类"}</div>
  ${tags ? `<div class="meta-tags">${tags}</div>` : ""}
</div>`;

// 使用库的 createTemplate 创建自定义模板
// 注意：主题样式、表格样式、图表样式、Mermaid/数学公式脚本会由 applyTemplate 自动注入
const customTemplate = createTemplate({
  // 只需要写页面布局相关的自定义 CSS
  css: `
    /* 页面布局 - 覆盖主题的 max-width 限制 */
    body {
      margin: 0;
      padding: 0;
      max-width: none !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #24292e;
      background: #fff;
    }
    
    /* 侧边栏目录 */
    .sidebar {
      display: block;
      width: 280px;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      overflow-y: auto;
      padding: 20px;
      background: #f6f8fa;
      border-right: 1px solid #e1e4e8;
      z-index: 100;
    }
    
    .sidebar h2 { margin: 0 0 16px 0; font-size: 18px; color: #24292e; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar li { margin: 4px 0; }
    .sidebar a { display: block; padding: 4px 8px; color: #0366d6; text-decoration: none; font-size: 14px; border-radius: 4px; }
    .sidebar a:hover { background: #e1e4e8; }
    .sidebar ul ul { padding-left: 16px; }
    .sidebar ul ul a { font-size: 13px; color: #586069; }
    
    /* 主内容 */
    .main {
      margin-left: 300px;
      padding: 40px 60px;
      max-width: 900px;
      min-height: 100vh;
    }
    
    /* Front Matter 信息 */
    .meta { padding: 16px 20px; background: #f6f8fa; border-radius: 6px; margin-bottom: 32px; font-size: 14px; color: #586069; }
    .meta-item { margin: 4px 0; }
    .meta-label { font-weight: 600; color: #24292e; }
    .meta-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .meta-tag { display: inline-block; padding: 2px 8px; background: #0366d6; color: #fff; border-radius: 12px; font-size: 12px; }
    
    /* Markdown 内容增强 */
    .markdown-body h1 { padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
    .markdown-body h2 { padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; margin-top: 48px; }
    .markdown-body h3 { margin-top: 32px; }
    .markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
    .markdown-body blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 16px 0; }
    .markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; }
    .markdown-body img { max-width: 100%; border-radius: 4px; }
    
    /* 响应式 */
    @media (max-width: 768px) {
      .sidebar { display: none !important; }
      .main { margin-left: 0 !important; padding: 20px !important; max-width: 100% !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .sidebar { width: 220px; }
      .main { margin-left: 240px; padding: 30px 40px; }
    }
    
    @media print {
      .sidebar { display: none !important; }
      .main { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
    }
  `,

  // 侧边栏目录
  bodyPrefix: `
<aside class="sidebar">
  <h2>目录</h2>
  ${tocHtml}
</aside>
<main class="main">
  ${metaHtml}
  <article class="markdown-body">`,

  // 页面结构闭合（Mermaid、数学公式、表格脚本会自动注入）
  bodySuffix: `
  </article>
</main>
<script>
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
</script>`,
});

// 应用模板生成完整 HTML
const fullHtml = applyTemplate(customTemplate, result);

// 保存 HTML 文件
const outputPath = new URL("./test-document.html", import.meta.url);
await Deno.writeTextFile(outputPath, fullHtml);

console.log("\n生成完成！");
console.log("HTML 文件路径:", outputPath.pathname);
console.log("HTML 文件大小:", fullHtml.length, "字符");
console.log("\n可以在浏览器中打开查看效果。");
