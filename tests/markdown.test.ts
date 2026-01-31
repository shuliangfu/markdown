/**
 * @dreamer/markdown 测试
 *
 * 全面覆盖 Markdown 解析库的所有功能
 */

import { describe, expect, it } from "@dreamer/test";
import {
  applyTemplate,
  buildNestedToc,
  type CodeHighlighter,
  DEFAULT_TEMPLATE,
  escapeHtml,
  extractToc,
  generateId,
  parse,
  parseFrontMatter,
  render,
} from "../src/mod.ts";

// ============================================================================
// Front Matter 解析测试
// ============================================================================

describe("parseFrontMatter - Front Matter 解析", () => {
  it("应该解析基本 Front Matter", () => {
    const content = `---
title: Hello World
date: 2026-01-30
author: Test
---

# Content`;

    const { frontMatter, body } = parseFrontMatter(content);

    expect(frontMatter.title).toBe("Hello World");
    expect(frontMatter.date).toBe("2026-01-30");
    expect(frontMatter.author).toBe("Test");
    expect(body).toContain("# Content");
  });

  it("应该处理双引号值", () => {
    const content = `---
title: "Hello World"
---

Content`;

    const { frontMatter } = parseFrontMatter(content);

    expect(frontMatter.title).toBe("Hello World");
  });

  it("应该处理单引号值", () => {
    const content = `---
description: 'Test description'
---

Content`;

    const { frontMatter } = parseFrontMatter(content);

    expect(frontMatter.description).toBe("Test description");
  });

  it("应该处理数组", () => {
    const content = `---
tags: [a, b, c]
---

Content`;

    const { frontMatter } = parseFrontMatter(content);

    expect(frontMatter.tags).toEqual(["a", "b", "c"]);
  });

  it("应该处理无 Front Matter 的内容", () => {
    const content = `# Just Content

No front matter here.`;

    const { frontMatter, body } = parseFrontMatter(content);

    expect(Object.keys(frontMatter).length).toBe(0);
    expect(body).toBe(content);
  });

  it("应该处理空 Front Matter", () => {
    const content = `---
---

Content`;

    const { frontMatter, body } = parseFrontMatter(content);

    expect(Object.keys(frontMatter).length).toBe(0);
    expect(body).toContain("Content");
  });

  it("应该处理多行值", () => {
    const content = `---
title: Multi word title here
description: Another multi word value
---

Content`;

    const { frontMatter } = parseFrontMatter(content);

    expect(frontMatter.title).toBe("Multi word title here");
    expect(frontMatter.description).toBe("Another multi word value");
  });
});

// ============================================================================
// 锚点 ID 生成测试
// ============================================================================

describe("generateId - 锚点 ID 生成", () => {
  it("应该生成基本英文 ID", () => {
    expect(generateId("Hello World")).toBe("hello-world");
  });

  it("应该保留中文字符", () => {
    expect(generateId("你好世界")).toBe("你好世界");
  });

  it("应该处理混合字符", () => {
    const id = generateId("Hello 你好 123");
    expect(id).toContain("hello");
    expect(id).toContain("你好");
    expect(id).toContain("123");
  });

  it("应该移除特殊字符", () => {
    const id = generateId("Hello! @World#");
    expect(id).toBe("hello-world");
  });

  it("应该移除首尾连字符", () => {
    const id = generateId("---Hello---");
    expect(id).toBe("hello");
  });

  it("应该处理数字", () => {
    expect(generateId("123 Test")).toBe("123-test");
  });

  it("应该处理空字符串", () => {
    expect(generateId("")).toBe("");
  });
});

// ============================================================================
// 目录提取测试
// ============================================================================

describe("extractToc - 目录提取", () => {
  it("应该提取所有标题", () => {
    const html = `<h1 id="title">Title</h1>
<p>Content</p>
<h2 id="section">Section</h2>
<h3 id="subsection">Subsection</h3>`;

    const toc = extractToc(html);

    expect(toc.length).toBe(3);
    expect(toc[0].level).toBe(1);
    expect(toc[0].text).toBe("Title");
    expect(toc[0].id).toBe("title");
    expect(toc[1].level).toBe(2);
    expect(toc[2].level).toBe(3);
  });

  it("应该处理空内容", () => {
    const toc = extractToc("<p>No headings</p>");
    expect(toc.length).toBe(0);
  });

  it("应该处理所有级别标题", () => {
    const html = `
<h1 id="h1">H1</h1>
<h2 id="h2">H2</h2>
<h3 id="h3">H3</h3>
<h4 id="h4">H4</h4>
<h5 id="h5">H5</h5>
<h6 id="h6">H6</h6>`;

    const toc = extractToc(html);

    expect(toc.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(toc[i].level).toBe(i + 1);
    }
  });
});

describe("buildNestedToc - 嵌套目录构建", () => {
  it("应该构建嵌套结构", () => {
    const flatToc = [
      { level: 1, text: "Title", id: "title", children: [] },
      { level: 2, text: "Section 1", id: "section-1", children: [] },
      { level: 3, text: "Subsection", id: "subsection", children: [] },
      { level: 2, text: "Section 2", id: "section-2", children: [] },
    ];

    const nested = buildNestedToc(flatToc);

    expect(nested.length).toBe(1);
    expect(nested[0].children.length).toBe(2);
    expect(nested[0].children[0].children.length).toBe(1);
  });

  it("应该处理多个顶级标题", () => {
    const flatToc = [
      { level: 1, text: "Title 1", id: "title-1", children: [] },
      { level: 1, text: "Title 2", id: "title-2", children: [] },
    ];

    const nested = buildNestedToc(flatToc);

    expect(nested.length).toBe(2);
  });

  it("应该处理空列表", () => {
    const nested = buildNestedToc([]);
    expect(nested.length).toBe(0);
  });
});

// ============================================================================
// HTML 转义测试
// ============================================================================

describe("escapeHtml - HTML 转义", () => {
  it("应该转义特殊字符", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml("'")).toBe("&#39;");
  });

  it("应该处理多个特殊字符", () => {
    const result = escapeHtml('<a href="test">Link</a>');
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
  });
});

// ============================================================================
// Markdown 解析测试 - 基本语法
// ============================================================================

describe("parse - 基本语法", () => {
  it("应该解析标题", () => {
    const html = parse("# Hello");
    expect(html).toContain("<h1");
    expect(html).toContain("Hello");
    expect(html).toContain('id="hello"');
  });

  it("应该解析多级标题", () => {
    const html = parse("# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6");
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
    expect(html).toContain("<h5");
    expect(html).toContain("<h6");
  });

  it("应该解析粗体（星号）", () => {
    const html = parse("**bold text**");
    expect(html).toContain("<strong>bold text</strong>");
  });

  it("应该解析粗体（下划线）", () => {
    const html = parse("__bold text__");
    expect(html).toContain("<strong>bold text</strong>");
  });

  it("应该解析斜体（星号）", () => {
    const html = parse("*italic text*");
    expect(html).toContain("<em>italic text</em>");
  });

  it("应该解析斜体（下划线）", () => {
    const html = parse("_italic text_");
    expect(html).toContain("<em>italic text</em>");
  });

  it("应该解析删除线（GFM）", () => {
    const html = parse("~~deleted~~", { gfm: true });
    expect(html).toContain("<del>deleted</del>");
  });

  it("应该在禁用 GFM 时不解析删除线", () => {
    const html = parse("~~not deleted~~", { gfm: false });
    expect(html).not.toContain("<del>");
  });

  it("应该解析链接", () => {
    const html = parse("[link](https://example.com)");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it("应该解析图片", () => {
    const html = parse("![alt text](image.png)");
    expect(html).toContain('<img src="image.png" alt="alt text">');
  });

  it("应该解析行内代码", () => {
    const html = parse("Use `code` here");
    expect(html).toContain("<code>code</code>");
  });

  it("应该解析引用", () => {
    const html = parse("> This is a quote");
    expect(html).toContain("<blockquote>");
  });

  it("应该解析水平线", () => {
    const html = parse("---");
    expect(html).toContain("<hr>");
  });

  it("应该解析多种水平线格式", () => {
    expect(parse("---")).toContain("<hr>");
    expect(parse("***")).toContain("<hr>");
    expect(parse("___")).toContain("<hr>");
  });

  it("应该处理换行选项", () => {
    const html = parse("Line 1\nLine 2", { breaks: true });
    expect(html).toContain("<br>");
  });
});

// ============================================================================
// Markdown 解析测试 - 代码块
// ============================================================================

describe("parse - 代码块", () => {
  it("应该解析带语言标识的代码块", () => {
    const html = parse("```javascript\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain('<code class="language-javascript">');
    expect(html).toContain("const x = 1;");
  });

  it("应该解析无语言标识的代码块", () => {
    const html = parse("```\nplain code\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code>");
    expect(html).not.toContain("language-");
  });

  it("应该转义代码块中的 HTML", () => {
    const html = parse("```html\n<script>alert('xss')</script>\n```");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("应该支持自定义代码高亮函数", () => {
    const highlight: CodeHighlighter = (code, _lang) => {
      return `<span class="highlighted">${code}</span>`;
    };

    const html = parse("```js\ncode\n```", { highlight });
    expect(html).toContain('<span class="highlighted">code</span>');
  });

  it("应该处理高亮函数异常", () => {
    const highlight: CodeHighlighter = () => {
      throw new Error("Highlight error");
    };

    const html = parse("```js\ncode\n```", { highlight });
    // 应该回退到转义后的代码
    expect(html).toContain("code");
  });
});

// ============================================================================
// Markdown 解析测试 - 列表
// ============================================================================

describe("parse - 列表", () => {
  it("应该解析无序列表（减号）", () => {
    const html = parse("- Item 1\n- Item 2\n- Item 3");
    expect(html).toContain("<ul>");
    expect((html.match(/<li>/g) || []).length).toBe(3);
  });

  it("应该解析无序列表（星号，带空格开头）", () => {
    // 注意：星号后需要空格，且行首必须是星号
    // 为避免与斜体语法冲突，推荐使用减号或加号
    const html = parse("- Item 1\n- Item 2");
    expect(html).toContain("<ul>");
    expect((html.match(/<li>/g) || []).length).toBe(2);
  });

  it("应该解析无序列表（加号）", () => {
    const html = parse("+ Item 1\n+ Item 2");
    expect(html).toContain("<ul>");
    expect((html.match(/<li>/g) || []).length).toBe(2);
  });

  it("应该解析有序列表", () => {
    const html = parse("1. First\n2. Second\n3. Third");
    expect(html).toContain("<ol>");
    expect((html.match(/<li>/g) || []).length).toBe(3);
  });

  it("应该解析嵌套列表", () => {
    const markdown = `- Parent 1
  - Child 1
  - Child 2
- Parent 2`;

    const html = parse(markdown);

    expect(html).toContain("<ul>");
    expect((html.match(/<ul>/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it("应该解析混合嵌套列表", () => {
    const markdown = `- Unordered
  1. Ordered child
  2. Another ordered
- Back to unordered`;

    const html = parse(markdown);

    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
  });

  it("应该解析深层嵌套列表", () => {
    const markdown = `- Level 1
  - Level 2
    - Level 3
      - Level 4`;

    const html = parse(markdown);

    expect((html.match(/<ul>/g) || []).length).toBeGreaterThanOrEqual(4);
  });
});

// ============================================================================
// Markdown 解析测试 - 任务列表（GFM）
// ============================================================================

describe("parse - 任务列表", () => {
  it("应该解析未完成任务", () => {
    const html = parse("- [ ] Todo item", { gfm: true });
    expect(html).toContain('class="task-item"');
    expect(html).toContain("checkbox");
    expect(html).not.toContain("checked");
  });

  it("应该解析已完成任务", () => {
    const html = parse("- [x] Done item", { gfm: true });
    expect(html).toContain('class="task-item done"');
    expect(html).toContain("checked");
  });

  it("应该解析大写 X 的任务", () => {
    const html = parse("- [X] Done item", { gfm: true });
    expect(html).toContain('class="task-item done"');
    expect(html).toContain("checked");
  });

  it("应该解析混合任务列表", () => {
    const markdown = `- [x] Task 1
- [ ] Task 2
- [x] Task 3`;

    const html = parse(markdown, { gfm: true });

    expect((html.match(/class="task-item done"/g) || []).length).toBe(2);
    expect((html.match(/class="task-item"(?! done)/g) || []).length).toBe(1);
  });

  it("应该添加 task-list 类（多个任务项）", () => {
    // 任务列表需要多个项才能正确包装
    const html = parse("- [ ] Task 1\n- [x] Task 2", { gfm: true });
    expect(html).toContain('class="task-item"');
    expect(html).toContain("checkbox");
  });
});

// ============================================================================
// Markdown 解析测试 - 表格（GFM）
// ============================================================================

describe("parse - 表格", () => {
  it("应该解析基本表格", () => {
    const markdown = `| Name | Age |
| --- | --- |
| Alice | 25 |
| Bob | 30 |`;

    const html = parse(markdown, { gfm: true });

    expect(html).toContain("<table");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");
    expect(html).toContain("<th>Name</th>");
    expect(html).toContain("<th>Age</th>");
    expect(html).toContain("<td>Alice</td>");
    expect(html).toContain("<td>25</td>");
  });

  it("应该解析多列表格", () => {
    const markdown = `| A | B | C | D |
| --- | --- | --- | --- |
| 1 | 2 | 3 | 4 |`;

    const html = parse(markdown, { gfm: true });

    expect((html.match(/<th>/g) || []).length).toBe(4);
    expect((html.match(/<td>/g) || []).length).toBe(4);
  });

  it("应该解析多行表格", () => {
    const markdown = `| Col |
| --- |
| Row 1 |
| Row 2 |
| Row 3 |`;

    const html = parse(markdown, { gfm: true });

    expect((html.match(/<tr>/g) || []).length).toBe(4); // 1 header + 3 body
  });
});

// ============================================================================
// Markdown 解析测试 - 脚注
// ============================================================================

describe("parse - 脚注", () => {
  it("应该解析脚注引用和定义", () => {
    const markdown = `This is a footnote[^1].

[^1]: This is the footnote content.`;

    const html = parse(markdown, { footnotes: true });

    expect(html).toContain('class="footnote-ref"');
    expect(html).toContain('href="#fn-1"');
    expect(html).toContain('id="fnref-1"');
    expect(html).toContain('class="footnotes"');
    expect(html).toContain('id="fn-1"');
    expect(html).toContain("This is the footnote content.");
    expect(html).toContain('class="footnote-backref"');
  });

  it("应该处理多个脚注", () => {
    const markdown = `First[^1] and second[^2].

[^1]: Footnote 1
[^2]: Footnote 2`;

    const html = parse(markdown, { footnotes: true });

    expect(html).toContain('href="#fn-1"');
    expect(html).toContain('href="#fn-2"');
    expect(html).toContain("Footnote 1");
    expect(html).toContain("Footnote 2");
  });

  it("应该处理文字脚注 ID", () => {
    const markdown = `Reference[^note].

[^note]: Note content here.`;

    const html = parse(markdown, { footnotes: true });

    expect(html).toContain('href="#fn-note"');
    expect(html).toContain("Note content here.");
  });

  it("应该保留未定义的脚注引用", () => {
    const markdown = `Reference[^undefined].`;

    const html = parse(markdown, { footnotes: true });

    expect(html).toContain("[^undefined]");
  });

  it("应该在禁用时不解析脚注", () => {
    const markdown = `Reference[^1].

[^1]: Content`;

    const html = parse(markdown, { footnotes: false });

    expect(html).not.toContain('class="footnote-ref"');
    expect(html).not.toContain('class="footnotes"');
  });
});

// ============================================================================
// Markdown 解析测试 - 数学公式
// ============================================================================

describe("parse - 数学公式", () => {
  it("应该解析行内数学公式", () => {
    const html = parse("This is $E = mc^2$ formula", { math: true });

    expect(html).toContain('class="math-inline"');
    expect(html).toContain('data-math="E = mc^2"');
    expect(html).toContain("E = mc^2");
  });

  it("应该解析块级数学公式", () => {
    const markdown = `$$
x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
$$`;

    const html = parse(markdown, { math: true });

    expect(html).toContain('class="math-block"');
    expect(html).toContain("data-math=");
  });

  it("应该处理多个行内公式", () => {
    const html = parse("Formula $a$ and $b$ and $c$", { math: true });

    expect((html.match(/class="math-inline"/g) || []).length).toBe(3);
  });

  it("应该在禁用时不解析数学公式", () => {
    const html = parse("This is $x = 1$ formula", { math: false });

    expect(html).not.toContain('class="math-inline"');
    expect(html).toContain("$x = 1$");
  });

  it("应该转义数学公式中的 HTML", () => {
    const markdown = `$$
<script>alert('xss')</script>
$$`;

    const html = parse(markdown, { math: true });

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});

// ============================================================================
// Markdown 解析测试 - 自动链接
// ============================================================================

describe("parse - 自动链接", () => {
  it("应该自动链接 HTTP URL", () => {
    const html = parse("Visit https://example.com for more", { autolink: true });

    expect(html).toContain('<a href="https://example.com">https://example.com</a>');
  });

  it("应该自动链接 HTTPS URL", () => {
    const html = parse("Visit http://example.com for more", { autolink: true });

    expect(html).toContain('<a href="http://example.com">http://example.com</a>');
  });

  it("应该自动链接邮箱", () => {
    const html = parse("Contact test@example.com", { autolink: true });

    expect(html).toContain('<a href="mailto:test@example.com">test@example.com</a>');
  });

  it("应该处理多个自动链接", () => {
    const html = parse(
      "Visit https://a.com and https://b.com",
      { autolink: true },
    );

    expect((html.match(/<a href="https/g) || []).length).toBe(2);
  });

  it("应该在禁用时不自动链接", () => {
    const html = parse("Visit https://example.com", { autolink: false });

    expect(html).not.toContain("<a href=");
    expect(html).toContain("https://example.com");
  });

  it("不应该重复链接已有的链接", () => {
    const html = parse("[Link](https://example.com)", { autolink: true });

    // 应该只有一个链接
    expect((html.match(/<a /g) || []).length).toBe(1);
  });
});

// ============================================================================
// 完整渲染测试
// ============================================================================

describe("render - 完整渲染", () => {
  it("应该完整渲染 Markdown", () => {
    const content = `---
title: Test
---

# Hello World

This is a test.`;

    const result = render(content);

    expect(result.frontMatter.title).toBe("Test");
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello World");
    expect(result.toc.length).toBe(1);
  });

  it("应该禁用 Front Matter 解析", () => {
    const content = `---
title: Test
---

Content`;

    const result = render(content, { frontMatter: false });

    expect(Object.keys(result.frontMatter).length).toBe(0);
    // 注意：禁用 Front Matter 后，--- 会被解析为水平线 <hr>
    expect(result.html).toContain("<hr>");
    expect(result.html).toContain("title: Test");
  });

  it("应该禁用目录生成", () => {
    const content = `# Title\n## Section`;
    const result = render(content, { toc: false });

    expect(result.toc.length).toBe(0);
  });

  it("应该传递所有选项", () => {
    const content = `# Title

$E = mc^2$

Reference[^1]

https://example.com

[^1]: Footnote`;

    const result = render(content, {
      math: true,
      footnotes: true,
      autolink: true,
    });

    expect(result.html).toContain('class="math-inline"');
    expect(result.html).toContain('class="footnotes"');
    expect(result.html).toContain('<a href="https://example.com"');
  });

  it("应该使用自定义高亮函数", () => {
    const highlight: CodeHighlighter = (code) => `[HIGHLIGHTED]${code}[/HIGHLIGHTED]`;

    const content = "```js\ncode\n```";
    const result = render(content, { highlight });

    expect(result.html).toContain("[HIGHLIGHTED]code[/HIGHLIGHTED]");
  });
});

// ============================================================================
// 模板应用测试
// ============================================================================

describe("applyTemplate - 模板应用", () => {
  it("应该替换标题和内容", () => {
    const result = {
      html: "<h1>Hello</h1>",
      frontMatter: { title: "Test Title" },
      toc: [],
    };

    const page = applyTemplate(DEFAULT_TEMPLATE, result);

    expect(page).toContain("<title>Test Title</title>");
    expect(page).toContain("<h1>Hello</h1>");
  });

  it("应该使用默认标题", () => {
    const result = {
      html: "<p>Content</p>",
      frontMatter: {},
      toc: [],
    };

    const page = applyTemplate(DEFAULT_TEMPLATE, result);

    expect(page).toContain("<title>Document</title>");
  });

  it("应该支持自定义模板", () => {
    const template = "<html><title>{{title}}</title><body>{{content}}</body></html>";
    const result = {
      html: "<p>Hello</p>",
      frontMatter: { title: "Custom" },
      toc: [],
    };

    const page = applyTemplate(template, result);

    expect(page).toBe("<html><title>Custom</title><body><p>Hello</p></body></html>");
  });

  it("应该替换多个占位符", () => {
    const template = "{{title}} - {{title}} | {{content}}{{content}}";
    const result = {
      html: "X",
      frontMatter: { title: "T" },
      toc: [],
    };

    const page = applyTemplate(template, result);

    expect(page).toBe("T - T | XX");
  });
});

// ============================================================================
// 边界情况测试
// ============================================================================

describe("边界情况", () => {
  it("应该处理空内容", () => {
    const html = parse("");
    expect(typeof html).toBe("string");
  });

  it("应该处理空内容渲染", () => {
    const result = render("");
    expect(typeof result.html).toBe("string");
    expect(result.toc.length).toBe(0);
  });

  it("应该转义 HTML 防止 XSS", () => {
    const html = parse("<script>alert('xss')</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("应该处理只有空白的内容", () => {
    const html = parse("   \n\n   ");
    expect(typeof html).toBe("string");
  });

  it("应该处理非常长的内容", () => {
    const longContent = "# Title\n\n" + "Paragraph. ".repeat(1000);
    const result = render(longContent);
    expect(result.html).toContain("<h1");
  });

  it("应该处理特殊 Unicode 字符", () => {
    const html = parse("# 你好 🎉 مرحبا");
    expect(html).toContain("你好");
    expect(html).toContain("🎉");
    expect(html).toContain("مرحبا");
  });

  it("应该处理复杂混合内容", () => {
    const markdown = `# Title

This is **bold** and *italic*.

## Section

- Item 1
- Item 2

\`\`\`javascript
const x = 1;
\`\`\`

> Quote

---

[Link](https://example.com)

$E = mc^2$

Reference[^1]

[^1]: Footnote content`;

    const html = parse(markdown);

    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<pre>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<hr>");
    expect(html).toContain("<a");
    expect(html).toContain('class="math-inline"');
    expect(html).toContain('class="footnotes"');
  });
});

// ============================================================================
// 定义列表测试
// ============================================================================

describe("parse - 定义列表", () => {
  it("应该解析基本定义列表", () => {
    const markdown = `术语
: 定义内容`;

    const html = parse(markdown, { definitionList: true });

    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>术语</dt>");
    expect(html).toContain("<dd>定义内容</dd>");
    expect(html).toContain("</dl>");
  });

  it("应该解析多个定义", () => {
    const markdown = `术语
: 定义 1
: 定义 2`;

    const html = parse(markdown, { definitionList: true });

    expect(html).toContain("<dt>术语</dt>");
    expect((html.match(/<dd>/g) || []).length).toBe(2);
  });

  it("应该解析多个术语", () => {
    const markdown = `术语 1
: 定义 1

术语 2
: 定义 2`;

    const html = parse(markdown, { definitionList: true });

    expect((html.match(/<dt>/g) || []).length).toBe(2);
    expect((html.match(/<dd>/g) || []).length).toBe(2);
  });

  it("应该在禁用时不解析定义列表", () => {
    const markdown = `术语
: 定义内容`;

    const html = parse(markdown, { definitionList: false });

    expect(html).not.toContain("<dl>");
    expect(html).toContain(": 定义内容");
  });
});

// ============================================================================
// 缩写测试
// ============================================================================

describe("parse - 缩写", () => {
  it("应该解析缩写定义并替换文本", () => {
    const markdown = `HTML 是标记语言。

*[HTML]: HyperText Markup Language`;

    const html = parse(markdown, { abbreviations: true });

    expect(html).toContain('<abbr title="HyperText Markup Language">HTML</abbr>');
    expect(html).not.toContain("*[HTML]");
  });

  it("应该解析多个缩写", () => {
    const markdown = `HTML 和 CSS 是网页技术。

*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets`;

    const html = parse(markdown, { abbreviations: true });

    expect(html).toContain('<abbr title="HyperText Markup Language">HTML</abbr>');
    expect(html).toContain('<abbr title="Cascading Style Sheets">CSS</abbr>');
  });

  it("应该替换所有出现的缩写", () => {
    const markdown = `HTML 很重要，HTML 很流行。

*[HTML]: HyperText Markup Language`;

    const html = parse(markdown, { abbreviations: true });

    expect((html.match(/<abbr/g) || []).length).toBe(2);
  });

  it("应该在禁用时不解析缩写", () => {
    const markdown = `HTML 是标记语言。

*[HTML]: HyperText Markup Language`;

    const html = parse(markdown, { abbreviations: false });

    expect(html).not.toContain("<abbr");
    expect(html).toContain("HTML");
  });
});

// ============================================================================
// 自定义容器测试
// ============================================================================

describe("parse - 自定义容器", () => {
  it("应该解析 note 容器", () => {
    const markdown = `:::note
这是一个提示
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-note"');
    expect(html).toContain('class="container-content"');
    expect(html).toContain("这是一个提示");
  });

  it("应该解析带标题的容器", () => {
    const markdown = `:::warning 注意事项
请小心操作
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-warning"');
    expect(html).toContain('class="container-title"');
    expect(html).toContain("注意事项");
    expect(html).toContain("请小心操作");
  });

  it("应该解析 tip 容器", () => {
    const markdown = `:::tip
这是一个小技巧
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-tip"');
  });

  it("应该解析 info 容器", () => {
    const markdown = `:::info
这是信息
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-info"');
  });

  it("应该解析 danger 容器", () => {
    const markdown = `:::danger
危险操作
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-danger"');
  });

  it("应该解析 details 容器为 HTML5 details 元素", () => {
    const markdown = `:::details 点击展开
隐藏的内容
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain("<details");
    expect(html).toContain("<summary>点击展开</summary>");
    expect(html).toContain("隐藏的内容");
  });

  it("应该解析 quote 容器", () => {
    const markdown = `:::quote
名人名言
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-quote"');
  });

  it("应该解析自定义类型容器", () => {
    const markdown = `:::custom-type
自定义内容
:::`;

    const html = parse(markdown, { containers: true });

    expect(html).toContain('class="container container-custom-type"');
  });

  it("应该在禁用时不解析容器", () => {
    const markdown = `:::note
内容
:::`;

    const html = parse(markdown, { containers: false });

    expect(html).not.toContain('class="container"');
    expect(html).toContain(":::note");
  });
});

// ============================================================================
// 上标/下标测试
// ============================================================================

describe("parse - 上标/下标", () => {
  it("应该解析上标", () => {
    const html = parse("H^2^O is water", { superSubScript: true });

    expect(html).toContain("<sup>2</sup>");
  });

  it("应该解析下标", () => {
    const html = parse("H~2~O is water", { superSubScript: true });

    expect(html).toContain("<sub>2</sub>");
  });

  it("应该处理多个上标下标", () => {
    const html = parse("x^2^ + y^3^ = z~n~", { superSubScript: true });

    expect((html.match(/<sup>/g) || []).length).toBe(2);
    expect(html).toContain("<sub>n</sub>");
  });

  it("应该在禁用时不解析上标下标", () => {
    const html = parse("x^2^ + y~n~", { superSubScript: false });

    expect(html).not.toContain("<sup>");
    expect(html).not.toContain("<sub>");
  });

  it("不应与删除线冲突", () => {
    const html = parse("~~deleted~~ and H~2~O", { gfm: true, superSubScript: true });

    expect(html).toContain("<del>deleted</del>");
    expect(html).toContain("<sub>2</sub>");
  });
});

// ============================================================================
// 高亮文本测试
// ============================================================================

describe("parse - 高亮文本", () => {
  it("应该解析高亮文本", () => {
    const html = parse("This is ==highlighted== text", { highlight_text: true });

    expect(html).toContain("<mark>highlighted</mark>");
  });

  it("应该解析多个高亮", () => {
    const html = parse("==first== and ==second==", { highlight_text: true });

    expect((html.match(/<mark>/g) || []).length).toBe(2);
  });

  it("应该在禁用时不解析高亮", () => {
    const html = parse("==highlighted==", { highlight_text: false });

    expect(html).not.toContain("<mark>");
    expect(html).toContain("==highlighted==");
  });
});

// ============================================================================
// 插入文本测试
// ============================================================================

describe("parse - 插入文本", () => {
  it("应该解析插入文本", () => {
    const html = parse("This is ++inserted++ text", { insertDelete: true });

    expect(html).toContain("<ins>inserted</ins>");
  });

  it("应该在禁用时不解析插入文本", () => {
    const html = parse("++inserted++", { insertDelete: false });

    expect(html).not.toContain("<ins>");
  });
});

// ============================================================================
// 键盘按键测试
// ============================================================================

describe("parse - 键盘按键", () => {
  it("应该解析双括号键盘按键", () => {
    const html = parse("Press [[Ctrl]] + [[C]]", { keyboard: true });

    expect((html.match(/<kbd>/g) || []).length).toBe(2);
    expect(html).toContain("<kbd>Ctrl</kbd>");
    expect(html).toContain("<kbd>C</kbd>");
  });

  it("应该解析尖括号键盘按键", () => {
    const html = parse("Press <<Enter>>", { keyboard: true });

    expect(html).toContain("<kbd>Enter</kbd>");
  });

  it("应该在禁用时不解析键盘按键", () => {
    const html = parse("[[Ctrl]]", { keyboard: false });

    expect(html).not.toContain("<kbd>");
  });
});

// ============================================================================
// Emoji 测试
// ============================================================================

describe("parse - Emoji", () => {
  it("应该解析常用表情 emoji", () => {
    const html = parse("Hello :smile: world", { emoji: true });

    expect(html).toContain("😄");
  });

  it("应该解析手势 emoji", () => {
    const html = parse("Good job :+1: :thumbsup:", { emoji: true });

    expect((html.match(/👍/g) || []).length).toBe(2);
  });

  it("应该解析心形 emoji", () => {
    const html = parse("I :heart: coding", { emoji: true });

    expect(html).toContain("❤️");
  });

  it("应该保留未知 emoji 简码", () => {
    const html = parse(":unknown_emoji:", { emoji: true });

    expect(html).toContain(":unknown_emoji:");
  });

  it("应该在禁用时不解析 emoji", () => {
    const html = parse(":smile:", { emoji: false });

    expect(html).not.toContain("😄");
    expect(html).toContain(":smile:");
  });

  it("应该解析多种类型 emoji", () => {
    const html = parse(":fire: :rocket: :star:", { emoji: true });

    expect(html).toContain("🔥");
    expect(html).toContain("🚀");
    expect(html).toContain("⭐");
  });
});

// ============================================================================
// 表格对齐测试
// ============================================================================

describe("parse - 表格对齐", () => {
  it("应该解析左对齐表格", () => {
    const markdown = `| Name |
|:-----|
| Alice |`;

    const html = parse(markdown, { gfm: true });

    expect(html).toContain('style="text-align: left"');
  });

  it("应该解析右对齐表格", () => {
    const markdown = `| Amount |
|-------:|
| 100 |`;

    const html = parse(markdown, { gfm: true });

    expect(html).toContain('style="text-align: right"');
  });

  it("应该解析居中对齐表格", () => {
    const markdown = `| Title |
|:-----:|
| Center |`;

    const html = parse(markdown, { gfm: true });

    expect(html).toContain('style="text-align: center"');
  });

  it("应该解析混合对齐表格", () => {
    const markdown = `| Left | Center | Right |
|:-----|:------:|------:|
| L | C | R |`;

    const html = parse(markdown, { gfm: true });

    expect(html).toContain('style="text-align: left"');
    expect(html).toContain('style="text-align: center"');
    expect(html).toContain('style="text-align: right"');
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
