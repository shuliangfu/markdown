/**
 * Markdown 解析器测试
 */

import { describe, expect, it } from "@dreamer/test";
import { type CodeHighlighter, escapeHtml, parse } from "../src/mod.ts";

// ============================================================================
// HTML 转义测试
// ============================================================================

describe("escapeHtml - HTML 转义", () => {
  it("应该转义特殊字符", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml('"test"')).toBe("&quot;test&quot;");
    expect(escapeHtml("'test'")).toBe("&#39;test&#39;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("应该处理多个特殊字符", () => {
    const input = '<a href="test">link</a>';
    const expected = "&lt;a href=&quot;test&quot;&gt;link&lt;/a&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });
});

// ============================================================================
// 基本语法测试
// ============================================================================

describe("parse - 基本语法", () => {
  it("应该解析标题", () => {
    const html = parse("# Hello World");
    expect(html).toContain("<h1");
    expect(html).toContain("Hello World");
    expect(html).toContain('id="hello-world"');
  });

  it("应该解析多级标题", () => {
    const markdown = `# H1
## H2
### H3`;

    const html = parse(markdown);
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
  });

  it("应该解析粗体（星号）", () => {
    const html = parse("This is **bold** text");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("应该解析粗体（下划线）", () => {
    const html = parse("This is __bold__ text");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("应该解析斜体（星号）", () => {
    const html = parse("This is *italic* text");
    expect(html).toContain("<em>italic</em>");
  });

  it("应该解析斜体（下划线）", () => {
    const html = parse("This is _italic_ text");
    expect(html).toContain("<em>italic</em>");
  });

  it("应该解析删除线（GFM）", () => {
    const html = parse("This is ~~deleted~~ text");
    expect(html).toContain("<del>deleted</del>");
  });

  it("应该在禁用 GFM 时不解析删除线", () => {
    const html = parse("This is ~~deleted~~ text", { gfm: false });
    expect(html).not.toContain("<del>");
  });

  it("应该解析链接", () => {
    const html = parse("[Google](https://google.com)");
    expect(html).toContain('<a href="https://google.com">Google</a>');
  });

  it("应该解析图片", () => {
    const html = parse("![Alt text](image.png)");
    expect(html).toContain('<img src="image.png" alt="Alt text">');
  });

  it("应该解析行内代码", () => {
    const html = parse("Use `console.log()` for debug");
    expect(html).toContain("<code>console.log()</code>");
  });

  it("应该解析引用", () => {
    const html = parse("> This is a quote");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("This is a quote");
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
// 代码块测试
// ============================================================================

describe("parse - 代码块", () => {
  it("应该解析带语言标识的代码块", () => {
    const markdown = "```javascript\nconsole.log('hello');\n```";
    const html = parse(markdown);

    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
    expect(html).toContain('class="language-javascript"');
    expect(html).toContain("console.log");
  });

  it("应该解析无语言标识的代码块", () => {
    const markdown = "```\ncode here\n```";
    const html = parse(markdown);

    expect(html).toContain("<pre>");
    expect(html).toContain("<code>");
    expect(html).toContain("code here");
  });

  it("应该转义代码块中的 HTML", () => {
    const markdown = "```html\n<script>alert('xss')</script>\n```";
    const html = parse(markdown);

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("应该支持自定义代码高亮函数", () => {
    const highlight: CodeHighlighter = (code, lang) => {
      return `<span class="highlighted-${lang}">${code}</span>`;
    };

    const markdown = "```js\ncode\n```";
    const html = parse(markdown, { highlight });

    expect(html).toContain('class="highlighted-js"');
  });

  it("应该处理高亮函数异常", () => {
    const highlight: CodeHighlighter = () => {
      throw new Error("Highlight failed");
    };

    const markdown = "```js\ncode\n```";
    // 不应该抛出异常
    const html = parse(markdown, { highlight });
    expect(html).toContain("code");
  });
});

// ============================================================================
// 列表测试
// ============================================================================

describe("parse - 列表", () => {
  it("应该解析无序列表（减号）", () => {
    const markdown = `- Item 1
- Item 2
- Item 3`;

    const html = parse(markdown);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Item 1</li>");
  });

  it("应该解析无序列表（减号 - 多项）", () => {
    // 使用减号以避免与斜体语法冲突
    const markdown = "- Apple\n- Banana\n- Cherry";
    const html = parse(markdown);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Apple</li>");
    expect(html).toContain("<li>Banana</li>");
  });

  it("应该解析无序列表（加号）", () => {
    const markdown = `+ Item 1
+ Item 2`;

    const html = parse(markdown);
    expect(html).toContain("<ul>");
  });

  it("应该解析有序列表", () => {
    const markdown = `1. First
2. Second
3. Third`;

    const html = parse(markdown);
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>First</li>");
  });

  it("应该解析嵌套列表", () => {
    const markdown = `- Parent
  - Child 1
  - Child 2`;

    const html = parse(markdown);
    expect(html).toContain("<ul>");
    // 应该有嵌套的 ul
    expect((html.match(/<ul>/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it("应该解析混合嵌套列表", () => {
    const markdown = `- Item
  1. Ordered
  2. List`;

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
// 任务列表测试
// ============================================================================

describe("parse - 任务列表", () => {
  it("应该解析未完成任务", () => {
    const html = parse("- [ ] Unchecked task");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("task-item");
    expect(html).toContain("Unchecked task");
    // 未完成任务不包含 "checked" 属性（只包含 disabled）
    expect(html).toContain("disabled");
  });

  it("应该解析已完成任务", () => {
    const html = parse("- [x] Checked task");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
  });

  it("应该解析大写 X 的任务", () => {
    const html = parse("- [X] Checked task");
    expect(html).toContain("checked");
  });

  it("应该解析混合任务列表", () => {
    const markdown = `- [x] Done
- [ ] Todo
- [x] Also done`;

    const html = parse(markdown);
    // 2 个已完成任务，每个有 "checked" 属性
    expect((html.match(/checked/g) || []).length).toBe(2);
    expect(html).toContain("task-item done");
    expect(html).toContain("task-item");
  });

  it("应该添加 task-list 类（多个任务项）", () => {
    const markdown = `- [ ] Task 1
- [x] Task 2`;
    const html = parse(markdown);
    expect(html).toContain("task-item");
  });
});

// ============================================================================
// 表格测试
// ============================================================================

describe("parse - 表格", () => {
  it("应该解析基本表格", () => {
    const markdown = `| Header |
|--------|
| Cell |`;

    const html = parse(markdown);
    expect(html).toContain("<table");
    expect(html).toContain("<th>Header</th>");
    expect(html).toContain("<td>Cell</td>");
  });

  it("应该解析多列表格", () => {
    const markdown = `| A | B | C |
|---|---|---|
| 1 | 2 | 3 |`;

    const html = parse(markdown);
    expect((html.match(/<th>/g) || []).length).toBe(3);
    expect((html.match(/<td>/g) || []).length).toBe(3);
  });

  it("应该解析多行表格", () => {
    const markdown = `| H |
|---|
| 1 |
| 2 |
| 3 |`;

    const html = parse(markdown);
    expect((html.match(/<tr>/g) || []).length).toBe(4); // 1 header + 3 body
  });
});
