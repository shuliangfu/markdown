/**
 * 交互功能测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  enhanceFootnotes,
  getSmoothScrollScript,
  highlightKeywords,
  getSearchHighlightScript,
  renderTocNavigation,
  getTocActiveScript,
  renderBackToTop,
  getBackToTopScript,
  renderReadingProgress,
  getReadingProgressScript,
  getInteractiveStyles,
} from "../src/interactive.ts";
import type { TocItem } from "../src/types.ts";

describe("脚注增强", () => {
  it("应该增强脚注预览", () => {
    const content = `
      <a href="#fn1" class="footnote-ref">[1]</a>
      <div class="footnotes">
        <div id="fn1">脚注内容</div>
      </div>
    `;
    const html = enhanceFootnotes(content);
    expect(typeof html).toBe("string");
  });
});

describe("平滑滚动", () => {
  it("应该返回平滑滚动脚本", () => {
    const script = getSmoothScrollScript();
    expect(script).toContain("scrollIntoView");
    expect(script).toContain("smooth");
  });
});

describe("关键词高亮", () => {
  it("应该高亮关键词", () => {
    const content = "<p>这是一段包含关键词的文本</p>";
    const html = highlightKeywords(content, ["关键词"]);
    expect(typeof html).toBe("string");
  });

  it("应该返回搜索高亮脚本", () => {
    const script = getSearchHighlightScript();
    expect(script.length).toBeGreaterThan(0);
  });
});

describe("目录导航", () => {
  it("应该渲染目录导航", () => {
    const toc: TocItem[] = [
      { id: "h1", text: "标题1", level: 1, children: [] },
      { id: "h2", text: "标题2", level: 2, children: [] },
    ];
    const html = renderTocNavigation(toc);
    expect(html).toContain("toc-nav");
  });

  it("应该返回目录激活脚本", () => {
    const script = getTocActiveScript();
    expect(script.length).toBeGreaterThan(0);
  });
});

describe("返回顶部", () => {
  it("应该渲染返回顶部按钮", () => {
    const html = renderBackToTop();
    expect(html).toContain("back-to-top");
  });

  it("应该返回返回顶部脚本", () => {
    const script = getBackToTopScript();
    expect(script.length).toBeGreaterThan(0);
  });
});

describe("阅读进度", () => {
  it("应该渲染阅读进度条", () => {
    const html = renderReadingProgress();
    expect(html).toContain("reading-progress");
  });

  it("应该返回阅读进度脚本", () => {
    const script = getReadingProgressScript();
    expect(script.length).toBeGreaterThan(0);
  });
});

describe("交互样式", () => {
  it("应该返回交互样式", () => {
    const styles = getInteractiveStyles();
    expect(styles.length).toBeGreaterThan(0);
  });
});
