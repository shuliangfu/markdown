/**
 * Front Matter 解析测试
 */

import { describe, expect, it } from "@dreamer/test";
import { parseFrontMatter } from "../src/mod.ts";

describe("parseFrontMatter - Front Matter 解析", () => {
  it("应该解析基本 Front Matter", () => {
    const content = `---
title: Hello World
date: 2026-01-30
author: Test
---

# Content`;

    const { frontMatter, body } = parseFrontMatter(content);

    expect(frontMatter.title).toBe("Hello World");
    expect(frontMatter.date).toBe("2026-01-30");
    expect(frontMatter.author).toBe("Test");
    expect(body).toContain("# Content");
  });

  it("应该处理双引号值", () => {
    const content = `---
title: "Hello World"
---

Content`;

    const { frontMatter } = parseFrontMatter(content);
    expect(frontMatter.title).toBe("Hello World");
  });

  it("应该处理单引号值", () => {
    const content = `---
title: 'Hello World'
---

Content`;

    const { frontMatter } = parseFrontMatter(content);
    expect(frontMatter.title).toBe("Hello World");
  });

  it("应该处理数组", () => {
    const content = `---
tags: [a, b, c]
---

Content`;

    const { frontMatter } = parseFrontMatter(content);
    expect(frontMatter.tags).toEqual(["a", "b", "c"]);
  });

  it("应该处理无 Front Matter 的内容", () => {
    const content = "# No Front Matter";

    const { frontMatter, body } = parseFrontMatter(content);

    expect(Object.keys(frontMatter).length).toBe(0);
    expect(body).toBe(content);
  });

  it("应该处理空 Front Matter", () => {
    const content = `---
---

Content`;

    const { frontMatter, body } = parseFrontMatter(content);
    expect(Object.keys(frontMatter).length).toBe(0);
    expect(body).toContain("Content");
  });

  it("应该处理多行值", () => {
    const content = `---
title: Multi
description: Line Value
---

Content`;

    const { frontMatter } = parseFrontMatter(content);
    expect(frontMatter.title).toBe("Multi");
    expect(frontMatter.description).toBe("Line Value");
  });
});
