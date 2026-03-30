/**
 * 媒体支持测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  getMediaStyles,
  parseAudio,
  parseIframe,
  parseImageMeta,
  parseVideo,
  renderAudio,
  renderBilibili,
  renderIframe,
  renderImage,
  renderLocalVideo,
  renderYouTube,
} from "../src/media.ts";

describe("图片元信息解析", () => {
  it("应该解析尺寸", () => {
    const options = parseImageMeta("=300x200");
    expect(options.width).toBe("300px");
    expect(options.height).toBe("200px");
  });

  it("应该解析标题", () => {
    const options = parseImageMeta('caption="图片说明"');
    expect(options.caption).toBe("图片说明");
  });

  it("应该解析懒加载", () => {
    const options = parseImageMeta("lazy");
    expect(options.lazy).toBe(true);
  });

  it("应该解析灯箱", () => {
    const options = parseImageMeta("lightbox");
    expect(options.lightbox).toBe(true);
  });

  it("应该解析对齐", () => {
    expect(parseImageMeta("left").align).toBe("left");
    expect(parseImageMeta("center").align).toBe("center");
    expect(parseImageMeta("right").align).toBe("right");
  });
});

describe("图片渲染", () => {
  it("应该渲染基本图片", () => {
    const html = renderImage("test.jpg", "测试");
    expect(html).toContain('src="test.jpg"');
    expect(html).toContain('alt="测试"');
  });

  it("应该渲染懒加载图片", () => {
    const html = renderImage("test.jpg", "测试", { lazy: true });
    expect(html).toContain('loading="lazy"');
  });

  it("应该渲染带标题的图片", () => {
    const html = renderImage("test.jpg", "测试", { caption: "图片说明" });
    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption>");
    expect(html).toContain("图片说明");
  });

  it("应该渲染灯箱图片", () => {
    const html = renderImage("test.jpg", "测试", { lightbox: true });
    expect(html).toContain("lightbox-image");
    // 安全优化：使用 data 属性代替内联 onclick
    expect(html).toContain('data-lightbox="true"');
  });
});

describe("视频解析", () => {
  it("应该解析 YouTube 视频", () => {
    const content = "@[youtube](dQw4w9WgXcQ)";
    const html = parseVideo(content);
    expect(html).toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("应该解析 Bilibili 视频", () => {
    const content = "@[bilibili](BV1xx411c7mD)";
    const html = parseVideo(content);
    expect(html).toContain("bilibili.com/player");
    expect(html).toContain("BV1xx411c7mD");
  });

  it("应该解析本地视频", () => {
    const content = "@[video](video.mp4)";
    const html = parseVideo(content);
    expect(html).toContain("<video");
    expect(html).toContain('src="video.mp4"');
  });
});

describe("视频渲染", () => {
  it("应该渲染 YouTube 视频", () => {
    const html = renderYouTube("dQw4w9WgXcQ");
    expect(html).toContain("<iframe");
    expect(html).toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("应该渲染带参数的 YouTube 视频", () => {
    const html = renderYouTube("dQw4w9WgXcQ", { autoplay: true, start: 30 });
    expect(html).toContain("autoplay=1");
    expect(html).toContain("start=30");
  });

  it("应该渲染 Bilibili 视频", () => {
    const html = renderBilibili("BV1xx411c7mD");
    expect(html).toContain("<iframe");
    expect(html).toContain("bilibili.com");
  });

  it("应该渲染本地视频", () => {
    const html = renderLocalVideo("video.mp4");
    expect(html).toContain("<video");
    expect(html).toContain("controls");
  });

  it("应该渲染带选项的本地视频", () => {
    const html = renderLocalVideo("video.mp4", {
      autoplay: true,
      muted: true,
      loop: true,
    });
    expect(html).toContain("autoplay");
    expect(html).toContain("muted");
    expect(html).toContain("loop");
  });
});

describe("音频解析和渲染", () => {
  it("应该解析音频", () => {
    const content = "@[audio](audio.mp3)";
    const html = parseAudio(content);
    expect(html).toContain("<audio");
    expect(html).toContain('src="audio.mp3"');
  });

  it("应该渲染音频", () => {
    const html = renderAudio("audio.mp3");
    expect(html).toContain("<audio");
    expect(html).toContain("controls");
  });

  it("应该渲染带标题的音频", () => {
    const html = renderAudio("audio.mp3", { title: "歌曲名" });
    expect(html).toContain("歌曲名");
    expect(html).toContain("audio-title");
  });
});

describe("iframe 解析和渲染", () => {
  it("应该解析 iframe", () => {
    const content = "@[iframe](https://example.com)";
    const html = parseIframe(content);
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://example.com"');
  });

  it("应该渲染 iframe", () => {
    const html = renderIframe("https://example.com");
    expect(html).toContain("<iframe");
    expect(html).toContain("iframe-container");
  });

  it("应该渲染带尺寸的 iframe", () => {
    const html = renderIframe("https://example.com", {
      width: "800",
      height: "600",
    });
    expect(html).toContain('width="800"');
    expect(html).toContain('height="600"');
  });
});

describe("媒体样式", () => {
  it("应该返回媒体样式", () => {
    const styles = getMediaStyles();
    expect(styles).toContain(".image-figure");
    expect(styles).toContain(".video-container");
    expect(styles).toContain(".audio-container");
    expect(styles).toContain(".iframe-container");
    expect(styles).toContain(".lightbox");
  });
});
