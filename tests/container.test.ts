/**
 * 自定义容器测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  extractContainers,
  restoreContainers,
  getContainerStyles,
} from "../src/container.ts";

describe("容器提取", () => {
  it("应该提取 info 容器", () => {
    const content = `
:::info
这是一条信息
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
  });

  it("应该提取 warning 容器", () => {
    const content = `
:::warning
警告信息
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
  });

  it("应该提取 danger 容器", () => {
    const content = `
:::danger
危险操作
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
  });

  it("应该提取 tip 容器", () => {
    const content = `
:::tip
小提示
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
  });

  it("应该提取 note 容器", () => {
    const content = `
:::note
注意事项
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
  });

  it("应该提取带标题的容器", () => {
    const content = `
:::info 自定义标题
容器内容
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(1);
    expect(containers[0]).toContain("自定义标题");
  });

  it("应该提取多个容器", () => {
    const content = `
:::info
信息 1
:::

:::warning
警告 1
:::
    `.trim();
    const { containers } = extractContainers(content);
    expect(containers.length).toBe(2);
  });
});

describe("容器恢复", () => {
  it("应该恢复容器为 HTML", () => {
    const content = `
:::info
测试内容
:::
    `.trim();
    const { content: extracted, containers } = extractContainers(content);
    const result = restoreContainers(extracted, containers);
    expect(result).toContain("container");
    expect(result).toContain("info");
    expect(result).toContain("测试内容");
  });

  it("应该渲染容器标题", () => {
    const content = `
:::tip 提示标题
提示内容
:::
    `.trim();
    const { content: extracted, containers } = extractContainers(content);
    const result = restoreContainers(extracted, containers);
    expect(result).toContain("提示标题");
  });
});

describe("容器样式", () => {
  it("应该返回容器样式", () => {
    const styles = getContainerStyles();
    expect(styles).toContain(".container");
    expect(styles).toContain("info");
    expect(styles).toContain("warning");
    expect(styles).toContain("danger");
    expect(styles).toContain("tip");
    expect(styles).toContain("note");
  });
});
