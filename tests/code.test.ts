/**
 * 代码增强测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  getCodeStyles,
  parseCodeMeta,
  parseDiff,
  parseFileTree,
  parseHighlightLines,
  renderCodeBlock,
  restoreDiff,
} from "../src/code.ts";

describe("代码块元信息解析", () => {
  it("应该解析高亮行", () => {
    const options = parseCodeMeta("js {1,3-5}");
    expect(options.highlightLines).toBe("1,3-5");
  });

  it("应该解析文件名", () => {
    const options = parseCodeMeta('filename="app.js"');
    expect(options.filename).toBe("app.js");
  });

  it("应该解析行号选项", () => {
    const options = parseCodeMeta("lineNumbers");
    expect(options.lineNumbers).toBe(true);
  });

  it("应该解析起始行号", () => {
    const options = parseCodeMeta("startLine=10");
    expect(options.startLine).toBe(10);
  });

  it("应该解析复制按钮", () => {
    const options = parseCodeMeta("copy");
    expect(options.copyButton).toBe(true);
  });

  it("应该解析可折叠", () => {
    const options = parseCodeMeta("collapsible");
    expect(options.collapsible).toBe(true);
  });
});

describe("高亮行范围解析", () => {
  it("应该解析单行", () => {
    const lines = parseHighlightLines("1");
    expect(lines.has(1)).toBe(true);
  });

  it("应该解析多行", () => {
    const lines = parseHighlightLines("1,3,5");
    expect(lines.has(1)).toBe(true);
    expect(lines.has(3)).toBe(true);
    expect(lines.has(5)).toBe(true);
    expect(lines.has(2)).toBe(false);
  });

  it("应该解析范围", () => {
    const lines = parseHighlightLines("1-3");
    expect(lines.has(1)).toBe(true);
    expect(lines.has(2)).toBe(true);
    expect(lines.has(3)).toBe(true);
  });

  it("应该解析混合范围", () => {
    const lines = parseHighlightLines("1,3-5,7");
    expect(lines.has(1)).toBe(true);
    expect(lines.has(2)).toBe(false);
    expect(lines.has(3)).toBe(true);
    expect(lines.has(4)).toBe(true);
    expect(lines.has(5)).toBe(true);
    expect(lines.has(6)).toBe(false);
    expect(lines.has(7)).toBe(true);
  });
});

describe("代码块渲染", () => {
  it("应该渲染基本代码块", () => {
    const html = renderCodeBlock("const x = 1;", "js");
    expect(html).toContain("code-container");
    expect(html).toContain("const x = 1;");
  });

  it("应该渲染带行号的代码块", () => {
    const html = renderCodeBlock("line1\nline2", "js", { lineNumbers: true });
    expect(html).toContain("line-number");
    expect(html).toContain("with-line-numbers");
  });

  it("应该渲染带高亮行的代码块", () => {
    const html = renderCodeBlock("line1\nline2\nline3", "js", {
      highlightLines: "2",
    });
    expect(html).toContain("highlighted");
  });

  it("应该渲染带文件名的代码块", () => {
    const html = renderCodeBlock("code", "js", { filename: "app.js" });
    expect(html).toContain("app.js");
    expect(html).toContain("code-filename");
  });

  it("应该渲染可折叠的代码块", () => {
    const html = renderCodeBlock("code", "js", { collapsible: true });
    expect(html).toContain("<details");
    expect(html).toContain("code-collapsible");
  });
});

describe("Diff 高亮", () => {
  it("应该解析 Diff 代码块", () => {
    const content = "```diff\n+ added\n- removed\n```";
    const { diffs } = parseDiff(content);

    expect(diffs.length).toBe(1);
    expect(diffs[0]).toContain("diff-add");
    expect(diffs[0]).toContain("diff-remove");
  });

  it("应该恢复 Diff 占位符", () => {
    const html = "<p>\x00DIFF0\x00</p>";
    const diffs = ['<pre class="code-diff">...</pre>'];
    const result = restoreDiff(html, diffs);

    expect(result).toContain("code-diff");
  });

  it("应该处理普通行", () => {
    const content = "```diff\n  normal line\n```";
    const { diffs } = parseDiff(content);

    expect(diffs[0]).toContain("diff-normal");
  });

  it("应该处理信息行", () => {
    const content = "```diff\n@@ -1,3 +1,3 @@\n```";
    const { diffs } = parseDiff(content);

    expect(diffs[0]).toContain("diff-info");
  });
});

describe("文件树", () => {
  it("应该解析文件树", () => {
    const content = "```filetree\nsrc/\n  app.ts\n```";
    const { trees } = parseFileTree(content);

    expect(trees.length).toBe(1);
    expect(trees[0]).toContain("filetree");
    expect(trees[0]).toContain("src");
  });

  it("应该解析文件夹和文件", () => {
    const content = "```filetree\nsrc/\n  index.ts\npackage.json\n```";
    const { trees } = parseFileTree(content);

    expect(trees[0]).toContain("filetree-folder");
    expect(trees[0]).toContain("filetree-file");
  });

  it("应该高亮文件", () => {
    const content = "```filetree\nsrc/\n  app.ts *\n```";
    const { trees } = parseFileTree(content);

    expect(trees[0]).toContain("highlighted");
  });
});

describe("代码样式", () => {
  it("应该返回代码样式", () => {
    const styles = getCodeStyles();
    expect(styles).toContain(".code-container");
    expect(styles).toContain(".line-number");
    expect(styles).toContain(".code-diff");
    expect(styles).toContain(".filetree");
  });
});
