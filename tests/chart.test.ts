/**
 * 图表与可视化测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  getChartStyles,
  getMathScript,
  getMermaidScript,
  parseMermaid,
  parseMindmap,
  restoreMermaid,
  restoreMindmap,
} from "../src/chart.ts";

describe("Mermaid 图表", () => {
  it("应该解析 Mermaid 代码块", () => {
    const content = "```mermaid\ngraph TD\n  A --> B\n```";
    const { content: processed, charts } = parseMermaid(content);

    expect(charts.length).toBe(1);
    expect(charts[0]).toContain('class="mermaid"');
    expect(charts[0]).toContain("graph TD");
    expect(processed).toContain("\x00MERMAID0\x00");
  });

  it("应该恢复 Mermaid 占位符", () => {
    const html = "<p>\x00MERMAID0\x00</p>";
    const charts = ['<div class="mermaid">graph</div>'];
    const result = restoreMermaid(html, charts);

    expect(result).toContain('class="mermaid"');
    expect(result).not.toContain("\x00MERMAID0\x00");
  });

  it("应该处理多个 Mermaid 图表", () => {
    const content = "```mermaid\ngraph A\n```\n\n```mermaid\ngraph B\n```";
    const { charts } = parseMermaid(content);

    expect(charts.length).toBe(2);
  });
});

describe("思维导图", () => {
  it("应该解析思维导图", () => {
    const content = "```mindmap\n# 中心\n## 分支1\n## 分支2\n```";
    const { charts } = parseMindmap(content);

    expect(charts.length).toBe(1);
    expect(charts[0]).toContain('class="mindmap"');
    expect(charts[0]).toContain("中心");
  });

  it("应该恢复思维导图占位符", () => {
    const html = "<p>\x00MINDMAP0\x00</p>";
    const charts = ['<ul class="mindmap">...</ul>'];
    const result = restoreMindmap(html, charts);

    expect(result).toContain('class="mindmap"');
  });

  it("应该解析嵌套思维导图", () => {
    const content = "```mindmap\n# Root\n## Branch\n### Leaf\n```";
    const { charts } = parseMindmap(content);

    expect(charts[0]).toContain("mindmap-level-1");
    expect(charts[0]).toContain("mindmap-level-2");
    expect(charts[0]).toContain("mindmap-level-3");
  });
});

describe("数学公式脚本", () => {
  it("应该生成 KaTeX 脚本", () => {
    const script = getMathScript("katex");
    expect(script).toContain("katex");
    // 使用自定义渲染脚本，查询 .math-block 和 .math-inline 元素
    expect(script).toContain("math-block");
    expect(script).toContain("math-inline");
    expect(script).toContain("katex.render");
  });

  it("应该生成 MathJax 脚本", () => {
    const script = getMathScript("mathjax");
    expect(script).toContain("MathJax");
  });
});

describe("图表样式和脚本", () => {
  it("应该返回图表样式", () => {
    const styles = getChartStyles();
    expect(styles).toContain(".mermaid-container");
    expect(styles).toContain(".mindmap");
  });

  it("应该返回 Mermaid 脚本", () => {
    const script = getMermaidScript();
    expect(script).toContain("mermaid");
    expect(script).toContain("initialize");
  });
});
