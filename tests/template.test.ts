/**
 * 模板功能测试
 */

import { describe, expect, it } from "@dreamer/test";
import { applyTemplate, DEFAULT_TEMPLATE, createTemplate } from "../src/template.ts";
import type { MarkdownResult } from "../src/types.ts";

describe("默认模板", () => {
  it("应该包含基本 HTML 结构", () => {
    expect(DEFAULT_TEMPLATE).toContain("<!DOCTYPE html>");
    expect(DEFAULT_TEMPLATE).toContain("<html");
    expect(DEFAULT_TEMPLATE).toContain("<head>");
    expect(DEFAULT_TEMPLATE).toContain("<body>");
  });

  it("应该包含标题占位符", () => {
    expect(DEFAULT_TEMPLATE).toContain("{{title}}");
  });

  it("应该包含内容占位符", () => {
    expect(DEFAULT_TEMPLATE).toContain("{{content}}");
  });
});

describe("模板应用", () => {
  it("应该替换标题", () => {
    const result: MarkdownResult = {
      html: "",
      frontMatter: { title: "测试标题" },
      toc: [],
    };
    const html = applyTemplate(DEFAULT_TEMPLATE, result);
    expect(html).toContain("测试标题");
  });

  it("应该替换内容", () => {
    const result: MarkdownResult = {
      html: "<p>测试内容</p>",
      frontMatter: {},
      toc: [],
    };
    const html = applyTemplate(DEFAULT_TEMPLATE, result);
    expect(html).toContain("<p>测试内容</p>");
  });
});

describe("自定义模板", () => {
  it("应该创建自定义模板", () => {
    const template = createTemplate({
      css: ".custom { color: red; }",
    });
    expect(template).toContain(".custom { color: red; }");
  });

  it("应该支持自定义 head 内容", () => {
    const template = createTemplate({
      head: '<link rel="stylesheet" href="custom.css">',
    });
    expect(template).toContain("custom.css");
  });

  it("应该支持 body 前后置内容", () => {
    const template = createTemplate({
      bodyPrefix: "<header>Header</header>",
      bodySuffix: "<footer>Footer</footer>",
    });
    expect(template).toContain("<header>Header</header>");
    expect(template).toContain("<footer>Footer</footer>");
  });
});
