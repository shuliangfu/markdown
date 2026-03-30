/**
 * 文本增强测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  getTextStyles,
  parseAttributes,
  parseBadge,
  parseBlockquoteAttribution,
  parseButton,
  parseProgress,
  parseRuby,
  parseSpecialMarks,
  parseTag,
  parseTextDirection,
} from "../src/text.ts";

describe("Ruby 注音", () => {
  it("应该解析 Ruby 注音（花括号语法）", () => {
    const content = "{汉字}(hàn zì)";
    const html = parseRuby(content);
    expect(html).toContain("<ruby>");
    expect(html).toContain("汉字");
    expect(html).toContain("<rp>(</rp><rt>hàn zì</rt><rp>)</rp>");
  });

  it("应该解析 Ruby 注音（双括号语法）", () => {
    const content = "[[日本語]](にほんご)";
    const html = parseRuby(content);
    expect(html).toContain("<ruby>");
    expect(html).toContain("日本語");
    expect(html).toContain("にほんご");
  });

  it("应该处理多个 Ruby 注音", () => {
    const content = "{日本語}(にほんご)和{中文}(zhōng wén)";
    const html = parseRuby(content);
    expect(html).toContain("にほんご");
    expect(html).toContain("zhōng wén");
  });
});

describe("自定义属性", () => {
  it("应该解析行内元素属性", () => {
    // 语法：[文本]{#id .class}
    const content = "[文本内容]{#my-id .highlight}";
    const html = parseAttributes(content);
    expect(html).toContain('id="my-id"');
    expect(html).toContain('class="highlight"');
    expect(html).toContain("<span");
  });

  it("应该解析多个 class 属性", () => {
    const content = "[文本]{.class1 .class2}";
    const html = parseAttributes(content);
    expect(html).toContain('class="class1 class2"');
  });
});

describe("徽章", () => {
  it("应该解析徽章", () => {
    // 语法: :badge[文本]
    const content = ":badge[新功能]";
    const html = parseBadge(content);
    expect(html).toContain("badge");
    expect(html).toContain("新功能");
  });

  it("应该解析带类型的徽章", () => {
    // 语法: :badge[文本]{type=success}
    const content = ":badge[成功]{type=success}";
    const html = parseBadge(content);
    expect(html).toContain("badge-success");
    expect(html).toContain("成功");
  });

  it("应该支持不同徽章类型", () => {
    expect(parseBadge(":badge[信息]{type=info}")).toContain("badge-info");
    expect(parseBadge(":badge[警告]{type=warning}")).toContain("badge-warning");
    expect(parseBadge(":badge[错误]{type=danger}")).toContain("badge-danger");
  });
});

describe("标签", () => {
  it("应该解析标签", () => {
    // 语法: :tag[标签名]
    const content = ":tag[标签内容]";
    const html = parseTag(content);
    expect(html).toContain("tag");
    expect(html).toContain("标签内容");
  });

  it("应该解析带颜色的标签", () => {
    // 语法: :tag[标签名]{color=#ff0000}
    const content = ":tag[蓝色标签]{color=#0000ff}";
    const html = parseTag(content);
    expect(html).toContain("tag");
    expect(html).toContain("background-color: #0000ff");
  });
});

describe("按钮", () => {
  it("应该解析按钮", () => {
    // 语法: :button[文本](url)
    const content = ":button[点击我](https://example.com)";
    const html = parseButton(content);
    expect(html).toContain("btn");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("点击我");
  });

  it("应该解析带样式的按钮", () => {
    // 语法: :button[文本](url){type=primary}
    const content = ":button[提交](https://example.com){type=primary}";
    const html = parseButton(content);
    expect(html).toContain("btn-primary");
    expect(html).toContain("提交");
  });

  it("应该解析带尺寸的按钮", () => {
    const content = ":button[大按钮](url){size=large}";
    const html = parseButton(content);
    expect(html).toContain("btn-large");
  });
});

describe("进度条", () => {
  it("应该解析进度条", () => {
    // 语法: :progress[75%]
    const content = ":progress[75%]";
    const html = parseProgress(content);
    expect(html).toContain("progress-bar");
    expect(html).toContain("width: 75%");
  });

  it("应该解析带标签的进度条", () => {
    // 语法: :progress[50%]{label="完成度"}
    const content = ':progress[50%]{label="完成度"}';
    const html = parseProgress(content);
    expect(html).toContain("完成度");
    expect(html).toContain("progress-label");
  });

  it("应该解析带颜色的进度条", () => {
    // 语法: :progress[80%]{color=green}
    const content = ":progress[80%]{color=green}";
    const html = parseProgress(content);
    expect(html).toContain("background-color: green");
  });
});

describe("文本方向", () => {
  it("应该解析从右到左文本", () => {
    // 语法: :rtl[文本]
    const content = ":rtl[مرحبا]";
    const html = parseTextDirection(content);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("مرحبا");
  });

  it("应该解析从左到右文本", () => {
    // 语法: :ltr[文本]
    const content = ":ltr[Hello]";
    const html = parseTextDirection(content);
    expect(html).toContain('dir="ltr"');
  });

  it("应该解析 RTL 块", () => {
    const content = ":::rtl\nعربي\n:::";
    const html = parseTextDirection(content);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("block-rtl");
  });
});

describe("引用出处", () => {
  it("应该解析引用出处", () => {
    // 引用需要已经是 HTML 格式
    const content = "<blockquote>这是一段引用\n— 作者名</blockquote>";
    const html = parseBlockquoteAttribution(content);
    expect(html).toContain("blockquote-footer");
    expect(html).toContain("作者名");
  });
});

describe("特殊标记", () => {
  it("应该解析危险标记", () => {
    // 语法: !!危险文本!!
    const content = "!!危险操作!!";
    const html = parseSpecialMarks(content);
    expect(html).toContain("mark-danger");
    expect(html).toContain("危险操作");
  });

  it("应该解析疑问标记", () => {
    // 语法: ??待确认??
    const content = "??待确认内容??";
    const html = parseSpecialMarks(content);
    expect(html).toContain("mark-question");
  });

  it("应该解析重要标记", () => {
    // 语法: ##重要##
    const content = "##重要信息##";
    const html = parseSpecialMarks(content);
    expect(html).toContain("mark-important");
  });
});

describe("文本样式", () => {
  it("应该返回文本样式", () => {
    const styles = getTextStyles();
    expect(styles).toContain(".badge");
    expect(styles).toContain(".tag");
    expect(styles).toContain(".btn");
    expect(styles).toContain(".progress-bar");
    expect(styles).toContain(".text-rtl");
    expect(styles).toContain(".mark-danger");
  });
});
