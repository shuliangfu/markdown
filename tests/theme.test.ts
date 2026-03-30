/**
 * 主题功能测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  DARK_THEME,
  generateCSSVariables,
  getBaseThemeStyles,
  getFullThemeStyles,
  getGitHubTheme,
  getGitLabTheme,
  getMinimalTheme,
  getModernTheme,
  getPresetTheme,
  getPrintStyles,
  getThemeToggleScript,
  LIGHT_THEME,
  renderThemeToggle,
} from "../src/theme.ts";

describe("主题变量", () => {
  it("应该定义浅色主题变量", () => {
    expect(LIGHT_THEME).toBeDefined();
    expect(LIGHT_THEME.colorBackground).toBeDefined();
    expect(LIGHT_THEME.colorText).toBeDefined();
    expect(LIGHT_THEME.colorPrimary).toBeDefined();
  });

  it("应该定义深色主题变量", () => {
    expect(DARK_THEME).toBeDefined();
    expect(DARK_THEME.colorBackground).toBeDefined();
    expect(DARK_THEME.colorText).toBeDefined();
    expect(DARK_THEME.colorPrimary).toBeDefined();
  });
});

describe("CSS 变量生成", () => {
  it("应该生成 CSS 变量", () => {
    const css = generateCSSVariables(LIGHT_THEME);
    expect(css).toContain("--");
    expect(css).toContain("color");
  });
});

describe("基础主题样式", () => {
  it("应该返回基础样式", () => {
    const styles = getBaseThemeStyles();
    expect(styles).toContain(":root");
    expect(styles).toContain("--");
  });
});

describe("主题切换", () => {
  it("应该返回主题切换脚本", () => {
    const script = getThemeToggleScript();
    expect(script).toContain("theme");
    expect(script).toContain("localStorage");
  });

  it("应该渲染主题切换按钮", () => {
    const html = renderThemeToggle();
    expect(html).toContain("theme-toggle");
    expect(html).toContain("button");
  });
});

describe("打印样式", () => {
  it("应该返回打印样式", () => {
    const styles = getPrintStyles();
    expect(styles).toContain("@media print");
    expect(styles).toContain("page-break");
  });
});

describe("预设主题", () => {
  it("应该返回 GitHub 主题", () => {
    const theme = getGitHubTheme();
    expect(theme).toBeDefined();
    expect(theme.length).toBeGreaterThan(0);
  });

  it("应该返回 GitLab 主题", () => {
    const theme = getGitLabTheme();
    expect(theme).toBeDefined();
    expect(theme.length).toBeGreaterThan(0);
  });

  it("应该返回 Minimal 主题", () => {
    const theme = getMinimalTheme();
    expect(theme).toBeDefined();
    expect(theme.length).toBeGreaterThan(0);
  });

  it("应该返回 Modern 主题", () => {
    const theme = getModernTheme();
    expect(theme).toBeDefined();
    expect(theme.length).toBeGreaterThan(0);
  });

  it("应该通过名称获取预设主题", () => {
    expect(getPresetTheme("github")).toBe(getGitHubTheme());
    expect(getPresetTheme("gitlab")).toBe(getGitLabTheme());
    expect(getPresetTheme("minimal")).toBe(getMinimalTheme());
    expect(getPresetTheme("modern")).toBe(getModernTheme());
  });
});

describe("完整主题样式", () => {
  it("应该返回完整主题样式", () => {
    const styles = getFullThemeStyles({});
    expect(styles).toContain(":root");
    expect(styles).toContain("body");
  });

  it("应该支持指定预设主题", () => {
    const styles = getFullThemeStyles({ preset: "github" });
    expect(styles.length).toBeGreaterThan(0);
  });

  it("应该支持自定义变量", () => {
    const customVars = {
      colorPrimary: "#ff0000",
      colorBackground: "#ffffff",
    };
    const styles = getFullThemeStyles({ customVariables: customVars });
    expect(styles).toContain("#ff0000");
  });
});
