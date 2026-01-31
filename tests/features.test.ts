/**
 * Markdown 扩展功能测试
 * 包括：脚注、数学公式、自动链接、定义列表、缩写、自定义容器等
 */

import { describe, expect, it } from "@dreamer/test";
import { parse } from "../src/mod.ts";

// ============================================================================
// 脚注测试
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
    expect(html).toContain('id="fn-1"');
    expect(html).toContain('id="fn-2"');
  });

  it("应该处理文字脚注 ID", () => {
    const markdown = `Reference[^note].

[^note]: Note content.`;

    const html = parse(markdown, { footnotes: true });
    expect(html).toContain('href="#fn-note"');
  });

  it("应该保留未定义的脚注引用", () => {
    const html = parse("Reference[^undefined]", { footnotes: true });
    expect(html).toContain("[^undefined]");
  });

  it("应该在禁用时不解析脚注", () => {
    const markdown = `Text[^1].

[^1]: Note`;

    const html = parse(markdown, { footnotes: false });
    expect(html).not.toContain('class="footnote-ref"');
  });
});

// ============================================================================
// 数学公式测试
// ============================================================================

describe("parse - 数学公式", () => {
  it("应该解析行内数学公式", () => {
    const html = parse("This is $E = mc^2$ formula", { math: true });
    expect(html).toContain('class="math-inline"');
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
    const html = parse("$a$ and $b$ and $c$", { math: true });
    expect((html.match(/math-inline/g) || []).length).toBe(3);
  });

  it("应该在禁用时不解析数学公式", () => {
    const html = parse("$formula$", { math: false });
    expect(html).not.toContain("math-inline");
  });

  it("应该转义数学公式中的 HTML", () => {
    const html = parse("$$<script>alert(1)</script>$$", { math: true });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

// ============================================================================
// 自动链接测试
// ============================================================================

describe("parse - 自动链接", () => {
  it("应该自动链接 HTTP URL", () => {
    const html = parse("Visit http://example.com today", { autolink: true });
    expect(html).toContain('<a href="http://example.com">');
  });

  it("应该自动链接 HTTPS URL", () => {
    const html = parse("Visit https://example.com", { autolink: true });
    expect(html).toContain('<a href="https://example.com">');
  });

  it("应该自动链接邮箱", () => {
    const html = parse("Contact test@example.com", { autolink: true });
    expect(html).toContain('<a href="mailto:test@example.com">');
  });

  it("应该处理多个自动链接", () => {
    const html = parse("http://a.com and http://b.com", { autolink: true });
    expect((html.match(/<a href=/g) || []).length).toBe(2);
  });

  it("应该在禁用时不自动链接", () => {
    const html = parse("http://example.com", { autolink: false });
    expect(html).not.toContain('<a href="http://example.com">');
  });

  it("不应该重复链接已有的链接", () => {
    const html = parse("[Link](http://example.com)", { autolink: true });
    // 应该只有一个 a 标签
    expect((html.match(/<a href=/g) || []).length).toBe(1);
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
    const html = parse("x^2^ is squared", { superSubScript: true });
    expect(html).toContain("<sup>2</sup>");
  });

  it("应该解析下标", () => {
    const html = parse("H~2~O is water", { superSubScript: true });
    expect(html).toContain("<sub>2</sub>");
  });

  it("应该处理多个上标下标", () => {
    const html = parse("x^2^ + y^2^ = r^2^", { superSubScript: true });
    expect((html.match(/<sup>/g) || []).length).toBe(3);
  });

  it("应该在禁用时不解析上标下标", () => {
    const html = parse("x^2^", { superSubScript: false });
    expect(html).not.toContain("<sup>");
  });

  it("不应与删除线冲突", () => {
    const html = parse("~~deleted~~", { superSubScript: true, gfm: true });
    expect(html).toContain("<del>deleted</del>");
    expect(html).not.toContain("<sub>");
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
    const html = parse("==one== and ==two==", { highlight_text: true });
    expect((html.match(/<mark>/g) || []).length).toBe(2);
  });

  it("应该在禁用时不解析高亮", () => {
    const html = parse("==text==", { highlight_text: false });
    expect(html).not.toContain("<mark>");
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
    const html = parse("++text++", { insertDelete: false });
    expect(html).not.toContain("<ins>");
  });
});

// ============================================================================
// 键盘按键测试
// ============================================================================

describe("parse - 键盘按键", () => {
  it("应该解析双括号键盘按键", () => {
    const html = parse("Press [[Ctrl]] + [[C]]", { keyboard: true });
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
    const html = parse(":smile:", { emoji: true });
    expect(html).toContain("😄");
  });

  it("应该解析手势 emoji", () => {
    const html = parse(":+1: :thumbsup:", { emoji: true });
    expect(html).toContain("👍");
  });

  it("应该解析心形 emoji", () => {
    const html = parse(":heart:", { emoji: true });
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
    const html = parse(":fire: :star: :rocket:", { emoji: true });
    expect(html).toContain("🔥");
    expect(html).toContain("⭐");
    expect(html).toContain("🚀");
  });
});

// ============================================================================
// 表格对齐测试
// ============================================================================

describe("parse - 表格对齐", () => {
  it("应该解析左对齐表格", () => {
    const markdown = `| Header |
|:-------|
| Cell |`;

    const html = parse(markdown);
    expect(html).toContain('style="text-align: left"');
  });

  it("应该解析右对齐表格", () => {
    const markdown = `| Header |
|-------:|
| Cell |`;

    const html = parse(markdown);
    expect(html).toContain('style="text-align: right"');
  });

  it("应该解析居中对齐表格", () => {
    const markdown = `| Header |
|:------:|
| Cell |`;

    const html = parse(markdown);
    expect(html).toContain('style="text-align: center"');
  });

  it("应该解析混合对齐表格", () => {
    const markdown = `| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |`;

    const html = parse(markdown);
    expect(html).toContain('style="text-align: left"');
    expect(html).toContain('style="text-align: center"');
    expect(html).toContain('style="text-align: right"');
  });
});
