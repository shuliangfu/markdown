/**
 * 布局组件测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  getComponentScript,
  getComponentStyles,
  parseAccordion,
  parseCards,
  parseColumns,
  parseSteps,
  parseTabs,
  parseTimeline,
} from "../src/components.ts";

describe("多栏布局", () => {
  it("应该解析两栏布局", () => {
    // 语法：:::columns + :::column 子元素
    const content = `:::columns
:::column
左边内容
:::column
右边内容
:::`;
    const html = parseColumns(content);
    expect(html).toContain("columns");
    expect(html).toContain("column");
    expect(html).toContain("左边内容");
    expect(html).toContain("右边内容");
  });

  it("应该解析三栏布局", () => {
    const content = `:::columns
:::column
第一栏
:::column
第二栏
:::column
第三栏
:::`;
    const html = parseColumns(content);
    expect(html).toContain("columns");
    expect(html).toContain("第一栏");
    expect(html).toContain("第二栏");
    expect(html).toContain("第三栏");
  });
});

describe("标签页", () => {
  it("应该解析标签页", () => {
    // 语法：:::tabs + @tab 标签
    const content = `:::tabs
@tab Tab 1
内容 1
@tab Tab 2
内容 2
:::`;
    const html = parseTabs(content);
    expect(html).toContain("tabs");
    expect(html).toContain("tab-btn");
    expect(html).toContain("Tab 1");
    expect(html).toContain("Tab 2");
    expect(html).toContain("内容 1");
  });

  it("应该渲染第一个标签为激活状态", () => {
    const content = `:::tabs
@tab 标签1
内容1
@tab 标签2
内容2
:::`;
    const html = parseTabs(content);
    expect(html).toContain('class="tab-btn active"');
    expect(html).toContain('class="tab-panel active"');
  });
});

describe("手风琴", () => {
  it("应该解析手风琴", () => {
    // 语法：:::accordion + @item 标题
    const content = `:::accordion
@item 标题 1
内容 1
@item 标题 2
内容 2
:::`;
    const html = parseAccordion(content);
    expect(html).toContain("accordion");
    expect(html).toContain("accordion-item");
    expect(html).toContain("标题 1");
    expect(html).toContain("标题 2");
    expect(html).toContain("内容 1");
  });
});

describe("时间线", () => {
  it("应该解析时间线", () => {
    // 语法：:::timeline + @event 时间 | 标题
    const content = `:::timeline
@event 2024-01-01 | 事件 1
事件内容 1
@event 2024-02-01 | 事件 2
事件内容 2
:::`;
    const html = parseTimeline(content);
    expect(html).toContain("timeline");
    expect(html).toContain("timeline-item");
    expect(html).toContain("2024-01-01");
    expect(html).toContain("事件 1");
    expect(html).toContain("事件内容 1");
  });

  it("应该解析没有时间的事件", () => {
    const content = `:::timeline
@event 只有标题
内容
:::`;
    const html = parseTimeline(content);
    expect(html).toContain("timeline");
    expect(html).toContain("只有标题");
  });
});

describe("卡片", () => {
  it("应该解析卡片", () => {
    // 语法：:::card title="标题" image="url"
    const content = `:::card title="卡片标题" image="image.jpg"
卡片内容
:::`;
    const html = parseCards(content);
    expect(html).toContain("card");
    expect(html).toContain("卡片标题");
    expect(html).toContain("image.jpg");
    expect(html).toContain("卡片内容");
  });

  it("应该解析带链接的卡片", () => {
    const content = `:::card title="标题" link="https://example.com"
内容
:::`;
    const html = parseCards(content);
    expect(html).toContain("card");
    expect(html).toContain('href="https://example.com"');
  });
});

describe("步骤条", () => {
  it("应该解析步骤", () => {
    // 语法：:::steps + @step 步骤
    const content = `:::steps
@step 步骤 1
描述 1
@step 步骤 2
描述 2
:::`;
    const html = parseSteps(content);
    expect(html).toContain("steps");
    expect(html).toContain("step");
    expect(html).toContain("step-number");
    expect(html).toContain("步骤 1");
    expect(html).toContain("步骤 2");
  });

  it("应该解析带状态的步骤", () => {
    const content = `:::steps
@step 已完成 [done]
完成的步骤
@step 进行中 [active]
当前步骤
@step 待办
未来步骤
:::`;
    const html = parseSteps(content);
    expect(html).toContain("step-done");
    expect(html).toContain("step-active");
    expect(html).toContain("step-pending");
  });
});

describe("组件样式和脚本", () => {
  it("应该返回组件样式", () => {
    const styles = getComponentStyles();
    expect(styles).toContain(".tabs");
    expect(styles).toContain(".accordion");
    expect(styles).toContain(".timeline");
    expect(styles).toContain(".card");
    expect(styles).toContain(".steps");
    expect(styles).toContain(".columns");
  });

  it("应该返回组件脚本", () => {
    const script = getComponentScript();
    expect(script).toContain("switchTab");
    expect(script).toContain("<script>");
  });
});
