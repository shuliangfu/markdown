/**
 * @module media
 *
 * 媒体支持模块
 *
 * 支持：
 * - 图片标题/说明（figure/figcaption）
 * - 图片懒加载
 * - 图片缩放/灯箱效果
 * - 视频嵌入（YouTube、Bilibili 等）
 * - 音频播放器
 * - iframe 嵌入
 *
 * 安全增强：
 * - URL 验证和清理
 * - 防止 XSS 攻击
 */

import { escapeHtml, sanitizeUrl } from "./utils.ts";

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** 图片尺寸正则 */
const IMAGE_SIZE_REGEX = /=(\d+)?x(\d+)?/;

/** 图片标题正则 */
const IMAGE_CAPTION_REGEX = /caption=["']([^"']+)["']/;

/** 增强图片正则 */
const ENHANCED_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** YouTube 嵌入语法正则（预编译） */
const YOUTUBE_EMBED_REGEX = /@\[youtube\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** Bilibili 嵌入语法正则（预编译） */
const BILIBILI_EMBED_REGEX = /@\[bilibili\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** Vimeo 嵌入语法正则（预编译） */
const VIMEO_EMBED_REGEX = /@\[vimeo\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** 本地视频语法正则（预编译） */
const LOCAL_VIDEO_REGEX = /@\[video\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** 音频语法正则（预编译） */
const AUDIO_EMBED_REGEX = /@\[audio\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** iframe 语法正则（预编译） */
const IFRAME_EMBED_REGEX = /@\[iframe\]\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** 视频元信息解析正则（预编译） */
const VIDEO_META_WIDTH_REGEX = /width=["']?(\d+(?:px|%)?)/;
const VIDEO_META_HEIGHT_REGEX = /height=["']?(\d+(?:px|%)?)/;
const VIDEO_META_START_REGEX = /start=(\d+)/;
const VIDEO_META_TITLE_REGEX = /title=["']([^"']+)["']/;

/** 音频元信息解析正则（预编译） */
const AUDIO_META_TITLE_REGEX = /title=["']([^"']+)["']/;

/** iframe 元信息解析正则（预编译） */
const IFRAME_META_SANDBOX_REGEX = /sandbox=["']([^"']+)["']/;

// ============================================================================
// 图片增强
// ============================================================================

/**
 * 图片选项
 */
export interface ImageOptions {
  /** 是否懒加载 */
  lazy?: boolean;
  /** 图片标题 */
  caption?: string;
  /** 图片宽度 */
  width?: string;
  /** 图片高度 */
  height?: string;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  /** 是否启用灯箱 */
  lightbox?: boolean;
}

/**
 * 解析图片扩展语法（性能优化版）
 *
 * 使用预编译正则表达式
 *
 * 语法：
 * ![alt](url "title" =widthxheight)
 * ![alt](url){caption="说明" lazy lightbox}
 */
export function parseImageMeta(meta: string): ImageOptions {
  const options: ImageOptions = {};

  if (!meta) return options;

  // 解析尺寸 =widthxheight（使用预编译正则）
  const sizeMatch = meta.match(IMAGE_SIZE_REGEX);
  if (sizeMatch) {
    if (sizeMatch[1]) options.width = sizeMatch[1] + "px";
    if (sizeMatch[2]) options.height = sizeMatch[2] + "px";
  }

  // 解析标题（使用预编译正则）
  const captionMatch = meta.match(IMAGE_CAPTION_REGEX);
  if (captionMatch) {
    options.caption = captionMatch[1];
  }

  // 解析其他选项
  if (meta.includes("lazy")) options.lazy = true;
  if (meta.includes("lightbox")) options.lightbox = true;
  if (meta.includes("left")) options.align = "left";
  if (meta.includes("center")) options.align = "center";
  if (meta.includes("right")) options.align = "right";

  return options;
}

/**
 * 解析增强图片（使用预编译正则）
 *
 * 语法：
 * ![alt](url){options}
 */
export function parseEnhancedImages(content: string): string {
  return content.replace(
    ENHANCED_IMAGE_REGEX,
    (_, alt, url, meta) => {
      const options = meta ? parseImageMeta(meta) : {};
      return renderImage(url, alt, options);
    }
  );
}

/**
 * 渲染增强图片（安全增强版）
 *
 * 添加 URL 安全检查，防止 XSS
 */
export function renderImage(
  src: string,
  alt: string,
  options: ImageOptions = {}
): string {
  const { lazy = false, caption, width, height, align, lightbox = false } = options;

  // URL 安全检查
  const safeSrc = sanitizeUrl(src);
  if (!safeSrc) {
    return `<!-- Invalid image URL: ${escapeHtml(src)} -->`;
  }

  // 构建图片属性
  const attrs: string[] = [`src="${escapeHtml(safeSrc)}"`, `alt="${escapeHtml(alt || "")}"`];
  if (lazy) attrs.push('loading="lazy"');
  if (width) attrs.push(`width="${escapeHtml(width)}"`);
  if (height) attrs.push(`height="${escapeHtml(height)}"`);
  if (lightbox) attrs.push('class="lightbox-image" data-lightbox="true"');

  const img = `<img ${attrs.join(" ")}>`;

  // 如果有标题，使用 figure
  if (caption) {
    const alignClass = align ? ` align-${align}` : "";
    return `<figure class="image-figure${alignClass}">${img}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  }

  // 如果有对齐
  if (align) {
    return `<div class="image-container align-${align}">${img}</div>`;
  }

  return img;
}

// ============================================================================
// 视频嵌入
// ============================================================================

/**
 * 视频平台
 */
export type VideoPlatform = "youtube" | "bilibili" | "vimeo" | "local";

/**
 * 视频选项
 */
export interface VideoOptions {
  /** 视频平台 */
  platform?: VideoPlatform;
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 是否循环 */
  loop?: boolean;
  /** 起始时间（秒） */
  start?: number;
  /** 标题 */
  title?: string;
}

/**
 * 解析视频嵌入（使用预编译正则）
 *
 * 语法：
 * @[youtube](videoId)
 * @[bilibili](bvid)
 * @[video](url){options}
 */
export function parseVideo(content: string): string {
  // YouTube（使用预编译正则）
  content = content.replace(
    YOUTUBE_EMBED_REGEX,
    (_, videoId, meta) => {
      const options = meta ? parseVideoMeta(meta) : {};
      return renderYouTube(videoId.trim(), options);
    }
  );

  // Bilibili（使用预编译正则）
  content = content.replace(
    BILIBILI_EMBED_REGEX,
    (_, bvid, meta) => {
      const options = meta ? parseVideoMeta(meta) : {};
      return renderBilibili(bvid.trim(), options);
    }
  );

  // Vimeo（使用预编译正则）
  content = content.replace(
    VIMEO_EMBED_REGEX,
    (_, videoId, meta) => {
      const options = meta ? parseVideoMeta(meta) : {};
      return renderVimeo(videoId.trim(), options);
    }
  );

  // 本地视频（使用预编译正则）
  content = content.replace(
    LOCAL_VIDEO_REGEX,
    (_, url, meta) => {
      const options = meta ? parseVideoMeta(meta) : {};
      return renderLocalVideo(url.trim(), options);
    }
  );

  return content;
}

/**
 * 解析视频元信息（使用预编译正则）
 */
function parseVideoMeta(meta: string): VideoOptions {
  const options: VideoOptions = {};

  if (!meta) return options;

  // 使用预编译正则
  const widthMatch = meta.match(VIDEO_META_WIDTH_REGEX);
  if (widthMatch) options.width = widthMatch[1];

  const heightMatch = meta.match(VIDEO_META_HEIGHT_REGEX);
  if (heightMatch) options.height = heightMatch[1];

  const startMatch = meta.match(VIDEO_META_START_REGEX);
  if (startMatch) options.start = parseInt(startMatch[1], 10);

  const titleMatch = meta.match(VIDEO_META_TITLE_REGEX);
  if (titleMatch) options.title = titleMatch[1];

  if (meta.includes("autoplay")) options.autoplay = true;
  if (meta.includes("muted")) options.muted = true;
  if (meta.includes("loop")) options.loop = true;

  return options;
}

/** 视频 ID 验证正则（仅允许安全字符） */
const SAFE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

/** Bilibili BV 号验证正则 */
const SAFE_BVID_REGEX = /^(BV[a-zA-Z0-9]+|av\d+)$/;

/**
 * 验证视频 ID 是否安全
 *
 * @param videoId - 视频 ID
 * @returns 是否安全
 */
function isVideoIdSafe(videoId: string): boolean {
  return SAFE_VIDEO_ID_REGEX.test(videoId);
}

/**
 * 渲染 YouTube 视频（安全增强版）
 *
 * 添加视频 ID 验证，防止注入
 */
export function renderYouTube(videoId: string, options: VideoOptions = {}): string {
  // 验证视频 ID
  if (!isVideoIdSafe(videoId)) {
    return `<!-- Invalid YouTube video ID -->`;
  }

  const { width = "100%", height = "400", autoplay = false, start = 0, title } = options;

  let src = `https://www.youtube.com/embed/${videoId}`;
  const params: string[] = [];
  if (autoplay) params.push("autoplay=1");
  if (start > 0 && Number.isInteger(start)) params.push(`start=${start}`);
  if (params.length > 0) src += "?" + params.join("&");

  const safeWidth = escapeHtml(String(width));
  const safeHeight = escapeHtml(String(height));
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ' title="YouTube Video"';

  return `<div class="video-container video-youtube"><iframe width="${safeWidth}" height="${safeHeight}" src="${src}"${titleAttr} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

/**
 * 渲染 Bilibili 视频（安全增强版）
 *
 * 添加 BV 号验证，防止注入
 */
export function renderBilibili(bvid: string, options: VideoOptions = {}): string {
  // 验证 BV 号
  if (!SAFE_BVID_REGEX.test(bvid)) {
    return `<!-- Invalid Bilibili video ID -->`;
  }

  const { width = "100%", height = "400", title } = options;

  const src = `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`;
  const safeWidth = escapeHtml(String(width));
  const safeHeight = escapeHtml(String(height));
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ' title="Bilibili Video"';

  return `<div class="video-container video-bilibili"><iframe width="${safeWidth}" height="${safeHeight}" src="${src}"${titleAttr} frameborder="0" allowfullscreen scrolling="no"></iframe></div>`;
}

/**
 * 渲染 Vimeo 视频（安全增强版）
 *
 * 添加视频 ID 验证，防止注入
 */
export function renderVimeo(videoId: string, options: VideoOptions = {}): string {
  // 验证视频 ID（Vimeo 使用纯数字 ID）
  if (!/^\d+$/.test(videoId)) {
    return `<!-- Invalid Vimeo video ID -->`;
  }

  const { width = "100%", height = "400", autoplay = false, title } = options;

  let src = `https://player.vimeo.com/video/${videoId}`;
  if (autoplay) src += "?autoplay=1";

  const safeWidth = escapeHtml(String(width));
  const safeHeight = escapeHtml(String(height));
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ' title="Vimeo Video"';

  return `<div class="video-container video-vimeo"><iframe width="${safeWidth}" height="${safeHeight}" src="${src}"${titleAttr} frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
}

/**
 * 渲染本地视频（安全增强版）
 *
 * 添加 URL 安全检查
 */
export function renderLocalVideo(src: string, options: VideoOptions = {}): string {
  // URL 安全检查
  const safeSrc = sanitizeUrl(src);
  if (!safeSrc) {
    return `<!-- Invalid video URL -->`;
  }

  const { width = "100%", height, autoplay = false, muted = false, loop = false, title } =
    options;

  const attrs: string[] = [`src="${escapeHtml(safeSrc)}"`, "controls"];
  if (width) attrs.push(`width="${escapeHtml(String(width))}"`);
  if (height) attrs.push(`height="${escapeHtml(String(height))}"`);
  if (autoplay) attrs.push("autoplay");
  if (muted) attrs.push("muted");
  if (loop) attrs.push("loop");
  if (title) attrs.push(`title="${escapeHtml(title)}"`);

  return `<div class="video-container video-local"><video ${attrs.join(" ")}>您的浏览器不支持视频播放</video></div>`;
}

// ============================================================================
// 音频播放器
// ============================================================================

/**
 * 音频选项
 */
export interface AudioOptions {
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 是否循环 */
  loop?: boolean;
  /** 标题 */
  title?: string;
}

/**
 * 解析音频嵌入（使用预编译正则）
 *
 * 语法：
 * @[audio](url){options}
 */
export function parseAudio(content: string): string {
  return content.replace(
    AUDIO_EMBED_REGEX,
    (_, url, meta) => {
      const options = meta ? parseAudioMeta(meta) : {};
      return renderAudio(url.trim(), options);
    }
  );
}

/**
 * 解析音频元信息（使用预编译正则）
 */
function parseAudioMeta(meta: string): AudioOptions {
  const options: AudioOptions = {};

  if (!meta) return options;

  // 使用预编译正则
  const titleMatch = meta.match(AUDIO_META_TITLE_REGEX);
  if (titleMatch) options.title = titleMatch[1];

  if (meta.includes("autoplay")) options.autoplay = true;
  if (meta.includes("loop")) options.loop = true;

  return options;
}

/**
 * 渲染音频播放器（安全增强版）
 *
 * 添加 URL 安全检查
 */
export function renderAudio(src: string, options: AudioOptions = {}): string {
  // URL 安全检查
  const safeSrc = sanitizeUrl(src);
  if (!safeSrc) {
    return `<!-- Invalid audio URL -->`;
  }

  const { autoplay = false, loop = false, title } = options;

  const attrs: string[] = [`src="${escapeHtml(safeSrc)}"`, "controls"];
  if (autoplay) attrs.push("autoplay");
  if (loop) attrs.push("loop");

  const titleHtml = title ? `<div class="audio-title">${escapeHtml(title)}</div>` : "";

  return `<div class="audio-container">${titleHtml}<audio ${attrs.join(" ")}>您的浏览器不支持音频播放</audio></div>`;
}

// ============================================================================
// iframe 嵌入
// ============================================================================

/**
 * iframe 选项
 */
export interface IframeOptions {
  width?: string;
  height?: string;
  title?: string;
  sandbox?: string;
}

/**
 * 解析 iframe 嵌入（使用预编译正则）
 *
 * 语法：
 * @[iframe](url){options}
 */
export function parseIframe(content: string): string {
  return content.replace(
    IFRAME_EMBED_REGEX,
    (_, url, meta) => {
      const options = meta ? parseIframeMeta(meta) : {};
      return renderIframe(url.trim(), options);
    }
  );
}

/**
 * 解析 iframe 元信息（使用预编译正则）
 */
function parseIframeMeta(meta: string): IframeOptions {
  const options: IframeOptions = {};

  if (!meta) return options;

  // 使用预编译正则
  const widthMatch = meta.match(VIDEO_META_WIDTH_REGEX);
  if (widthMatch) options.width = widthMatch[1];

  const heightMatch = meta.match(VIDEO_META_HEIGHT_REGEX);
  if (heightMatch) options.height = heightMatch[1];

  const titleMatch = meta.match(VIDEO_META_TITLE_REGEX);
  if (titleMatch) options.title = titleMatch[1];

  const sandboxMatch = meta.match(IFRAME_META_SANDBOX_REGEX);
  if (sandboxMatch) options.sandbox = sandboxMatch[1];

  return options;
}

/**
 * 渲染 iframe（安全增强版）
 *
 * 添加 URL 安全检查和默认 sandbox 属性
 */
export function renderIframe(src: string, options: IframeOptions = {}): string {
  // URL 安全检查
  const safeSrc = sanitizeUrl(src);
  if (!safeSrc) {
    return `<!-- Invalid iframe URL -->`;
  }

  const { width = "100%", height = "400", title, sandbox } = options;

  const attrs: string[] = [
    `src="${escapeHtml(safeSrc)}"`,
    `width="${escapeHtml(String(width))}"`,
    `height="${escapeHtml(String(height))}"`,
    'frameborder="0"',
  ];

  if (title) attrs.push(`title="${escapeHtml(title)}"`);

  // 默认添加 sandbox 属性以增强安全性
  // 允许脚本和同源访问，但限制其他危险功能
  const safeboxValue = sandbox || "allow-scripts allow-same-origin";
  attrs.push(`sandbox="${escapeHtml(safeboxValue)}"`);

  return `<div class="iframe-container"><iframe ${attrs.join(" ")}></iframe></div>`;
}

// ============================================================================
// 媒体样式
// ============================================================================

/**
 * 获取媒体样式
 */
export function getMediaStyles(): string {
  return `
/* 图片增强 */
.image-figure {
  margin: 16px 0;
  text-align: center;
}
.image-figure img { max-width: 100%; height: auto; }
.image-figure figcaption {
  margin-top: 8px;
  color: #666;
  font-size: 0.9em;
  font-style: italic;
}
.image-container { margin: 16px 0; }
.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }

/* 灯箱效果 */
.lightbox-image { cursor: zoom-in; transition: transform 0.2s; }
.lightbox-image:hover { transform: scale(1.02); }
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}
.lightbox-overlay img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* 视频容器 */
.video-container {
  position: relative;
  margin: 16px 0;
  overflow: hidden;
  border-radius: 4px;
}
.video-container iframe,
.video-container video {
  max-width: 100%;
}

/* 音频容器 */
.audio-container {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}
.audio-title {
  margin-bottom: 8px;
  font-weight: bold;
}
.audio-container audio { width: 100%; }

/* iframe 容器 */
.iframe-container {
  margin: 16px 0;
  border-radius: 4px;
  overflow: hidden;
}
.iframe-container iframe { border: none; }
`;
}

/**
 * 获取灯箱脚本
 */
export function getLightboxScript(): string {
  return `
<script>
function openLightbox(img) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '">';
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}
</script>`;
}
