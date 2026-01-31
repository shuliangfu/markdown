/**
 * 列表解析测试
 */

import { describe, expect, it } from "@dreamer/test";
import { parseNestedLists, parseDefinitionList } from "../src/list.ts";

describe("嵌套列表", () => {
  it("应该解析简单无序列表", () => {
    const content = `
- 项目 1
- 项目 2
- 项目 3
    `.trim();
    const html = parseNestedLists(content, true);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("项目 1");
  });

  it("应该解析嵌套无序列表", () => {
    const content = `
- 一级项目
  - 二级项目
    - 三级项目
    `.trim();
    const html = parseNestedLists(content, true);
    expect(html).toContain("<ul>");
    expect(html).toContain("一级项目");
    expect(html).toContain("二级项目");
    expect(html).toContain("三级项目");
  });

  it("应该解析有序列表", () => {
    const content = `
1. 第一项
2. 第二项
3. 第三项
    `.trim();
    const html = parseNestedLists(content, true);
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>");
    expect(html).toContain("第一项");
  });

  it("应该解析嵌套有序列表", () => {
    const content = `
1. 一级
   1. 二级
      1. 三级
    `.trim();
    const html = parseNestedLists(content, true);
    expect(html).toContain("<ol>");
    expect(html).toContain("一级");
    expect(html).toContain("二级");
  });

  it("应该解析混合列表", () => {
    const content = `
- 无序项目
  1. 有序子项目
  2. 有序子项目 2
    `.trim();
    const html = parseNestedLists(content, true);
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
  });
});

describe("定义列表", () => {
  it("应该解析简单定义列表", () => {
    const content = `
术语
: 定义内容
    `.trim();
    const html = parseDefinitionList(content);
    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>");
    expect(html).toContain("<dd>");
    expect(html).toContain("术语");
    expect(html).toContain("定义内容");
  });

  it("应该解析多个定义项", () => {
    const content = `
HTML
: HyperText Markup Language

CSS
: Cascading Style Sheets
    `.trim();
    const html = parseDefinitionList(content);
    expect(html).toContain("HTML");
    expect(html).toContain("HyperText Markup Language");
    expect(html).toContain("CSS");
    expect(html).toContain("Cascading Style Sheets");
  });

  it("应该解析多行定义", () => {
    const content = `
API
: Application Programming Interface
: 用于软件组件交互的接口
    `.trim();
    const html = parseDefinitionList(content);
    expect(html).toContain("API");
    expect(html.match(/<dd>/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("应该保留定义中的格式", () => {
    const content = `
代码示例
: 使用 \`console.log()\` 输出
    `.trim();
    const html = parseDefinitionList(content);
    expect(html).toContain("console.log()");
  });
});
