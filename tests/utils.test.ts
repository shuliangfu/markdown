/**
 * 工具函数测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  escapeHtml,
  escapeRegExp,
  generateId,
  isUrlSafe,
  sanitizeUrl,
} from "../src/utils.ts";

describe("HTML 转义", () => {
  it("应该转义 &", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("应该转义 <", () => {
    expect(escapeHtml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("应该转义 >", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("应该转义双引号", () => {
    expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
  });

  it("应该转义单引号", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("应该转义多个特殊字符", () => {
    const input = '<script>alert("XSS")</script>';
    const result = escapeHtml(input);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).not.toContain('"');
  });

  it("应该保留普通文本", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });

  it("应该处理空字符串", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("应该处理中文文本", () => {
    expect(escapeHtml("你好世界")).toBe("你好世界");
  });
});

describe("正则转义", () => {
  it("应该转义特殊正则字符", () => {
    expect(escapeRegExp(".")).toBe("\\.");
    expect(escapeRegExp("*")).toBe("\\*");
    expect(escapeRegExp("+")).toBe("\\+");
    expect(escapeRegExp("?")).toBe("\\?");
    expect(escapeRegExp("^")).toBe("\\^");
    expect(escapeRegExp("$")).toBe("\\$");
    expect(escapeRegExp("{")).toBe("\\{");
    expect(escapeRegExp("}")).toBe("\\}");
    expect(escapeRegExp("(")).toBe("\\(");
    expect(escapeRegExp(")")).toBe("\\)");
    expect(escapeRegExp("[")).toBe("\\[");
    expect(escapeRegExp("]")).toBe("\\]");
    expect(escapeRegExp("|")).toBe("\\|");
    expect(escapeRegExp("\\")).toBe("\\\\");
  });

  it("应该转义复杂模式", () => {
    const pattern = "file.*.txt";
    const escaped = escapeRegExp(pattern);
    expect(escaped).toBe("file\\.\\*\\.txt");
  });

  it("应该保留普通字符", () => {
    expect(escapeRegExp("abc123")).toBe("abc123");
  });
});

describe("ID 生成", () => {
  it("应该生成有效的 ID", () => {
    const id = generateId("Hello World");
    expect(id).toBe("hello-world");
  });

  it("应该处理中文", () => {
    const id = generateId("你好世界");
    expect(id).toContain("你好世界");
  });

  it("应该移除特殊字符", () => {
    const id = generateId("Hello! @World#");
    expect(id).not.toContain("!");
    expect(id).not.toContain("@");
    expect(id).not.toContain("#");
  });

  it("应该转换为小写", () => {
    const id = generateId("UPPERCASE");
    expect(id).toBe("uppercase");
  });

  it("应该处理连续空格", () => {
    const id = generateId("a   b   c");
    expect(id).toBe("a-b-c");
  });

  it("应该处理连字符", () => {
    const id = generateId("hello-world");
    expect(id).toBe("hello-world");
  });

  it("应该移除首尾空格", () => {
    const id = generateId("  trimmed  ");
    expect(id).toBe("trimmed");
  });

  it("应该处理数字", () => {
    const id = generateId("Section 1.2.3");
    expect(id).toContain("1");
    expect(id).toContain("2");
    expect(id).toContain("3");
  });
});

describe("URL 安全", () => {
  it("应该放行 http/https 协议", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("http://example.com/path")).toBe(
      "http://example.com/path",
    );
  });

  it("应该放行相对路径与锚点", () => {
    expect(sanitizeUrl("/relative/path")).toBe("/relative/path");
    expect(sanitizeUrl("#anchor")).toBe("#anchor");
    expect(sanitizeUrl("page.html")).toBe("page.html");
  });

  it("应该拦截 javascript: 协议", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("应该拦截 vbscript:/data:/file: 协议", () => {
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("");
    expect(sanitizeUrl("data:text/html,<script>")).toBe("");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
  });

  it("应该拦截大小写混合的危险协议", () => {
    expect(sanitizeUrl("JaVaScRiPt:alert(1)")).toBe("");
    expect(sanitizeUrl("JavaScript:alert(1)")).toBe("");
  });

  it("回归：应拦截含 \\t \\n \\r 的 javascript: 绕过", () => {
    // 浏览器导航前会剥离 \t \n \r，故 java\nscript: 会变 javascript:
    expect(sanitizeUrl("java\nscript:alert(1)")).toBe("");
    expect(sanitizeUrl("java\tscript:alert(1)")).toBe("");
    expect(sanitizeUrl("java\rscript:alert(1)")).toBe("");
    expect(sanitizeUrl("java\r\nscript:alert(1)")).toBe("");
    expect(sanitizeUrl("jav\t\n\rascript:alert(1)")).toBe("");
  });

  it("回归：含 \\t \\n \\r 的合法 URL 应放行（剥离换行后仍合法）", () => {
    // 协议本身不含换行，换行出现在路径中，剥离后仍是 https，且返回值不含换行
    expect(sanitizeUrl("https://example.com/a\nb")).toBe(
      "https://example.com/ab",
    );
    expect(sanitizeUrl("https://example.com/a\tb")).toBe(
      "https://example.com/ab",
    );
  });

  it("应该处理空字符串", () => {
    expect(sanitizeUrl("")).toBe("");
    expect(isUrlSafe("")).toBe(false);
  });

  it("isUrlSafe 应与 sanitizeUrl 判定一致", () => {
    expect(isUrlSafe("https://example.com")).toBe(true);
    expect(isUrlSafe("javascript:alert(1)")).toBe(false);
    expect(isUrlSafe("java\nscript:alert(1)")).toBe(false);
    expect(isUrlSafe("/relative")).toBe(true);
  });
});
