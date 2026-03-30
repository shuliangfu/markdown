/**
 * 元信息测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  countWords,
  estimateReadingTime,
  extractDocumentMeta,
  formatUpdateTime,
  getMetaStyles,
  parseAuthors,
  renderAuthors,
  renderDocumentMeta,
  renderReadingTime,
  renderUpdateTime,
  renderWordCount,
} from "../src/meta.ts";

describe("阅读时间估算", () => {
  it("应该估算中文阅读时间", () => {
    const content = "这是一段测试文本。".repeat(100); // 约900字
    const result = estimateReadingTime(content, { wordsPerMinuteCN: 300 });
    expect(result.minutes).toBeGreaterThan(0);
    expect(result.text).toContain("分钟");
  });

  it("应该估算英文阅读时间", () => {
    const content = "This is a test. ".repeat(100); // 约400词
    const result = estimateReadingTime(content, {
      wordsPerMinuteEN: 200,
    });
    expect(result.minutes).toBeGreaterThan(0);
  });

  it("应该渲染阅读时间", () => {
    const result = estimateReadingTime("测试文本内容", {});
    const html = renderReadingTime(result);
    expect(html).toContain("reading-time");
  });
});

describe("字数统计", () => {
  it("应该统计中文字数", () => {
    const content = "这是中文测试文本";
    const result = countWords(content);
    expect(result.chinese).toBe(8);
  });

  it("应该统计英文单词数", () => {
    const content = "This is an English test";
    const result = countWords(content);
    expect(result.english).toBe(5);
  });

  it("应该统计混合文本", () => {
    const content = "Hello 你好 World 世界";
    const result = countWords(content);
    expect(result.chinese).toBe(4);
    expect(result.english).toBe(2);
    expect(result.total).toBe(6);
  });

  it("应该渲染字数统计", () => {
    const result = countWords("测试文本 test content");
    const html = renderWordCount(result);
    expect(html).toContain("word-count");
  });
});

describe("更新时间", () => {
  it("应该格式化日期", () => {
    const date = new Date("2024-01-15");
    const result = formatUpdateTime(date);
    expect(result).toContain("2024");
  });

  it("应该渲染更新时间", () => {
    const html = renderUpdateTime(new Date("2024-01-15"));
    expect(html).toContain("update-time");
    expect(html).toContain("2024");
  });
});

describe("作者信息", () => {
  it("应该解析单个作者", () => {
    // 语法: :::authors...:::
    // 每个作者项用 "- " 开头，属性用换行和 key: value 格式
    const content = `:::authors
- name: 张三
email: zhang@example.com
:::`;
    const { authors } = parseAuthors(content);
    expect(authors.length).toBe(1);
    expect(authors[0].name).toBe("张三");
  });

  it("应该渲染作者列表", () => {
    const authors = [
      { name: "张三", email: "zhang@example.com" },
      { name: "李四", avatar: "avatar.jpg" },
    ];
    const html = renderAuthors(authors);
    expect(html).toContain("authors");
    expect(html).toContain("张三");
    expect(html).toContain("李四");
  });
});

describe("文档元信息", () => {
  it("应该提取文档元信息", () => {
    const content = `
---
title: 测试文档
description: 这是描述
author: 作者名
date: 2024-01-15
tags:
  - tag1
  - tag2
---

# 内容标题

这是正文内容。
    `.trim();
    const meta = extractDocumentMeta(content);
    expect(meta).toBeDefined();
    expect(meta.readingTime).toBeDefined();
    expect(meta.wordCount).toBeDefined();
  });

  it("应该渲染文档元信息", () => {
    const meta = extractDocumentMeta("这是一段测试文档内容。");
    const html = renderDocumentMeta(meta);
    expect(html).toContain("document-meta");
  });
});

describe("元信息样式", () => {
  it("应该返回元信息样式", () => {
    const styles = getMetaStyles();
    expect(styles).toContain(".reading-time");
    expect(styles).toContain(".word-count");
    expect(styles).toContain(".update-time");
    expect(styles).toContain(".authors");
    expect(styles).toContain(".document-meta");
  });
});
