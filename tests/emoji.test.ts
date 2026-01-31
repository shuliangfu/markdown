/**
 * Emoji 简码测试
 */

import { describe, expect, it } from "@dreamer/test";
import { EMOJI_MAP, getEmoji, parseEmoji } from "../src/emoji.ts";

describe("Emoji 映射表", () => {
  it("应该包含常用表情", () => {
    expect(EMOJI_MAP.smile).toBeDefined();
    expect(EMOJI_MAP.heart).toBeDefined();
    expect(EMOJI_MAP.thumbsup).toBeDefined();
  });

  it("应该包含正确的 emoji 字符", () => {
    expect(EMOJI_MAP.smile).toBe("😄");
    expect(EMOJI_MAP.heart).toBe("❤️");
    expect(EMOJI_MAP.star).toBe("⭐");
  });
});

describe("Emoji 获取", () => {
  it("应该返回对应的 emoji", () => {
    expect(getEmoji("smile")).toBe("😄");
    expect(getEmoji("heart")).toBe("❤️");
    expect(getEmoji("fire")).toBe("🔥");
  });

  it("应该返回 undefined 当简码不存在", () => {
    const unknown = getEmoji("unknown_emoji_code");
    expect(unknown).toBeUndefined();
  });

  it("应该忽略大小写", () => {
    expect(getEmoji("SMILE")).toBe("😄");
    expect(getEmoji("Heart")).toBe("❤️");
  });
});

describe("Emoji 解析", () => {
  it("应该解析单个 emoji 简码", () => {
    const content = "Hello :smile:";
    const result = parseEmoji(content);
    expect(result).toBe("Hello 😄");
  });

  it("应该解析多个 emoji 简码", () => {
    const content = ":heart: :star: :fire:";
    const result = parseEmoji(content);
    expect(result).toContain("❤️");
    expect(result).toContain("⭐");
    expect(result).toContain("🔥");
  });

  it("应该保留未知简码", () => {
    const content = "Hello :unknown_code:";
    const result = parseEmoji(content);
    expect(result).toBe("Hello :unknown_code:");
  });

  it("应该正确解析常用 emoji", () => {
    expect(parseEmoji(":grinning:")).toBe("😀");
    expect(parseEmoji(":joy:")).toBe("😂");
    expect(parseEmoji(":thumbsup:")).toBe("👍");
    expect(parseEmoji(":thumbsdown:")).toBe("👎");
    expect(parseEmoji(":clap:")).toBe("👏");
    expect(parseEmoji(":wave:")).toBe("👋");
  });

  it("应该解析天气和自然 emoji", () => {
    expect(parseEmoji(":sunny:")).toBe("☀️");
    expect(parseEmoji(":cloud:")).toBe("☁️");
    expect(parseEmoji(":rainbow:")).toBe("🌈");
  });

  it("应该解析食物 emoji", () => {
    expect(parseEmoji(":apple:")).toBe("🍎");
    expect(parseEmoji(":pizza:")).toBe("🍕");
    expect(parseEmoji(":coffee:")).toBe("☕");
  });

  it("应该解析动物 emoji", () => {
    // 注意：dog 映射为 🐶 而不是 🐕
    expect(parseEmoji(":dog:")).toBe("🐶");
    expect(parseEmoji(":cat:")).toBe("🐱");
    expect(parseEmoji(":bird:")).toBe("🐦");
  });

  it("应该解析符号 emoji", () => {
    expect(parseEmoji(":check:")).toBe("✅");
    expect(parseEmoji(":x:")).toBe("❌");
    expect(parseEmoji(":warning:")).toBe("⚠️");
  });

  it("应该在文本中正确解析", () => {
    const content = "任务完成 :check: 很好 :thumbsup:";
    const result = parseEmoji(content);
    expect(result).toContain("✅");
    expect(result).toContain("👍");
  });

  it("应该处理连续的 emoji", () => {
    const content = ":fire::fire::fire:";
    const result = parseEmoji(content);
    expect(result).toBe("🔥🔥🔥");
  });
});
