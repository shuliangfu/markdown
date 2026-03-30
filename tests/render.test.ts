/**
 * Markdown 渲染和模板测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  applyTemplate,
  type CodeHighlighter,
  DEFAULT_TEMPLATE,
  render,
} from "../src/mod.ts";

// ============================================================================
// 完整渲染测试
// ============================================================================

describe("render - 完整渲染", () => {
  it("应该完整渲染 Markdown", () => {
    const content = `---
title: Test
---

# Hello

Content here`;

    const result = render(content);

    expect(result.frontMatter.title).toBe("Test");
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello");
    expect(result.toc.length).toBeGreaterThan(0);
  });

  it("应该禁用 Front Matter 解析", () => {
    const content = `---
title: Test
---

Content`;

    const result = render(content, { frontMatter: false });

    expect(result.frontMatter.title).toBeUndefined();
    // 当禁用 Front Matter 时，--- 被作为 hr 处理
    expect(result.html).toContain("<hr>");
    expect(result.html).toContain("title: Test");
  });

  it("应该禁用目录生成", () => {
    const content = `# Heading`;

    const result = render(content, { toc: false });

    expect(result.toc.length).toBe(0);
  });

  it("应该传递所有选项", () => {
    const content = "~~text~~";

    const resultWithGfm = render(content, { gfm: true });
    const resultWithoutGfm = render(content, { gfm: false });

    expect(resultWithGfm.html).toContain("<del>");
    expect(resultWithoutGfm.html).not.toContain("<del>");
  });

  it("应该使用自定义高亮函数", () => {
    const highlight: CodeHighlighter = (code, lang) => {
      return `<span class="lang-${lang}">${code}</span>`;
    };

    const content = "```js\ncode\n```";
    const result = render(content, { highlight });

    expect(result.html).toContain('class="lang-js"');
  });
});

// ============================================================================
// 模板应用测试
// ============================================================================

describe("applyTemplate - 模板应用", () => {
  it("应该替换标题和内容", () => {
    const template = "<title>{{title}}</title><body>{{content}}</body>";
    const result = {
      html: "<p>Hello</p>",
      frontMatter: { title: "Test" },
      toc: [],
    };

    const html = applyTemplate(template, result);

    expect(html).toContain("<title>Test</title>");
    expect(html).toContain("<body><p>Hello</p></body>");
  });

  it("应该使用默认标题", () => {
    const template = "<title>{{title}}</title>";
    const result = {
      html: "",
      frontMatter: {},
      toc: [],
    };

    const html = applyTemplate(template, result);

    expect(html).toContain("<title>Document</title>");
  });

  it("应该支持自定义模板", () => {
    const template = `<!DOCTYPE html>
<html lang="zh">
<head><title>{{title}}</title></head>
<body>{{content}}</body>
</html>`;

    const result = {
      html: "<h1>Hello</h1>",
      frontMatter: { title: "Custom" },
      toc: [],
    };

    const html = applyTemplate(template, result);

    expect(html).toContain('lang="zh"');
    expect(html).toContain("<title>Custom</title>");
  });

  it("应该替换多个占位符", () => {
    const template = "{{title}} - {{title}}";
    const result = {
      html: "",
      frontMatter: { title: "Test" },
      toc: [],
    };

    const html = applyTemplate(template, result);

    expect(html).toBe("Test - Test");
  });
});

// ============================================================================
// 默认模板测试
// ============================================================================

describe("DEFAULT_TEMPLATE - 默认模板", () => {
  it("应该包含基本 HTML 结构", () => {
    expect(DEFAULT_TEMPLATE).toContain("<!DOCTYPE html>");
    expect(DEFAULT_TEMPLATE).toContain("<html>");
    expect(DEFAULT_TEMPLATE).toContain("</html>");
    expect(DEFAULT_TEMPLATE).toContain("<head>");
    expect(DEFAULT_TEMPLATE).toContain("<body>");
  });

  it("应该包含占位符", () => {
    expect(DEFAULT_TEMPLATE).toContain("{{title}}");
    expect(DEFAULT_TEMPLATE).toContain("{{content}}");
  });

  it("应该包含样式", () => {
    expect(DEFAULT_TEMPLATE).toContain("<style>");
    expect(DEFAULT_TEMPLATE).toContain(".task-list");
    expect(DEFAULT_TEMPLATE).toContain(".footnotes");
    expect(DEFAULT_TEMPLATE).toContain(".math-block");
    expect(DEFAULT_TEMPLATE).toContain(".math-inline");
    // 新增样式
    expect(DEFAULT_TEMPLATE).toContain("dl {");
    expect(DEFAULT_TEMPLATE).toContain("abbr");
    expect(DEFAULT_TEMPLATE).toContain(".container");
  });

  it("应该包含响应式元标签", () => {
    expect(DEFAULT_TEMPLATE).toContain('charset="UTF-8"');
    expect(DEFAULT_TEMPLATE).toContain("viewport");
  });
});

// ============================================================================
// 边界情况测试
// ============================================================================

describe("边界情况", () => {
  it("应该处理空内容", () => {
    const html = render("").html;
    expect(html).toBeDefined();
  });

  it("应该处理空内容渲染", () => {
    const result = render("");
    expect(result.html).toBeDefined();
    expect(result.frontMatter).toBeDefined();
    expect(result.toc).toBeDefined();
  });

  it("应该转义 HTML 防止 XSS", () => {
    const result = render("<script>alert('xss')</script>");
    expect(result.html).not.toContain("<script>alert");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("应该处理只有空白的内容", () => {
    const html = render("   \n\n   ").html;
    expect(html).toBeDefined();
  });

  it("应该处理非常长的内容", () => {
    const longContent = "# Heading\n\n" + "Paragraph ".repeat(1000);
    const result = render(longContent);
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Paragraph");
  });

  it("应该处理特殊 Unicode 字符", () => {
    const content = "# 中文标题 🎉\n\nEmoji: 🚀 ✨ 💻";
    const result = render(content);
    expect(result.html).toContain("中文标题");
    expect(result.html).toContain("🚀");
  });

  it("应该处理复杂混合内容", () => {
    const markdown = `# Title

**Bold** and *italic* and ~~deleted~~

- List item
- Another item

\`\`\`js
code
\`\`\`

> Quote

| Table |
|-------|
| Cell |

$E = mc^2$

Reference[^1]

[^1]: Footnote content`;

    const result = render(markdown);

    expect(result.html).toContain("<h1");
    expect(result.html).toContain("<strong>");
    expect(result.html).toContain("<em>");
    expect(result.html).toContain("<ul>");
    expect(result.html).toContain("<pre>");
    expect(result.html).toContain("<blockquote>");
    expect(result.html).toContain("<table");
    expect(result.html).toContain('class="math-inline"');
    expect(result.html).toContain('class="footnotes"');
  });
});
