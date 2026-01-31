/**
 * 目录生成测试
 */

import { describe, expect, it } from "@dreamer/test";
import { extractToc, buildNestedToc, generateId } from "../src/mod.ts";

describe("generateId - 锚点 ID 生成", () => {
  it("应该生成基本英文 ID", () => {
    expect(generateId("Hello World")).toBe("hello-world");
  });

  it("应该保留中文字符", () => {
    expect(generateId("中文标题")).toBe("中文标题");
  });

  it("应该处理混合字符", () => {
    expect(generateId("Hello 世界")).toBe("hello-世界");
  });

  it("应该移除特殊字符", () => {
    expect(generateId("Hello! World?")).toBe("hello-world");
  });

  it("应该移除首尾连字符", () => {
    expect(generateId("  Hello World  ")).toBe("hello-world");
  });

  it("应该处理数字", () => {
    expect(generateId("Version 2.0")).toBe("version-20");
  });

  it("应该处理空字符串", () => {
    expect(generateId("")).toBe("");
  });
});

describe("extractToc - 目录提取", () => {
  it("应该提取所有标题", () => {
    const html =
      '<h1 id="title">Title</h1><h2 id="sub">Sub</h2><h3 id="deep">Deep</h3>';
    const toc = extractToc(html);

    expect(toc.length).toBe(3);
    expect(toc[0].level).toBe(1);
    expect(toc[0].text).toBe("Title");
    expect(toc[0].id).toBe("title");
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
      <h6 id="h6">H6</h6>
    `;
    const toc = extractToc(html);

    expect(toc.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(toc[i].level).toBe(i + 1);
    }
  });
});

describe("buildNestedToc - 嵌套目录构建", () => {
  it("应该构建嵌套结构", () => {
    const flat = [
      { level: 1, text: "Title", id: "title", children: [] },
      { level: 2, text: "Sub1", id: "sub1", children: [] },
      { level: 2, text: "Sub2", id: "sub2", children: [] },
      { level: 3, text: "Deep", id: "deep", children: [] },
    ];

    const nested = buildNestedToc(flat);

    expect(nested.length).toBe(1);
    expect(nested[0].children.length).toBe(2);
    expect(nested[0].children[1].children.length).toBe(1);
  });

  it("应该处理多个顶级标题", () => {
    const flat = [
      { level: 1, text: "Title1", id: "title1", children: [] },
      { level: 1, text: "Title2", id: "title2", children: [] },
    ];

    const nested = buildNestedToc(flat);
    expect(nested.length).toBe(2);
  });

  it("应该处理空列表", () => {
    const nested = buildNestedToc([]);
    expect(nested.length).toBe(0);
  });
});
