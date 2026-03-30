/**
 * @module meta
 *
 * 元信息模块
 *
 * 支持：
 * - 阅读时间估算
 * - 字数统计
 * - 最后更新时间
 * - 作者/贡献者信息
 */

import { escapeHtml } from "./utils.ts";

// ============================================================================
// 阅读时间估算
// ============================================================================

/**
 * 阅读时间选项
 */
export interface ReadingTimeOptions {
  /** 每分钟阅读字数（中文，默认 300） */
  wordsPerMinuteCN?: number;
  /** 每分钟阅读字数（英文，默认 200） */
  wordsPerMinuteEN?: number;
  /** 是否包含代码块阅读时间 */
  includeCode?: boolean;
  /** 代码块每分钟阅读行数 */
  codePerMinute?: number;
}

/**
 * 阅读时间结果
 */
export interface ReadingTimeResult {
  /** 预计阅读时间（分钟） */
  minutes: number;
  /** 字数统计 */
  words: number;
  /** 中文字数 */
  chineseWords: number;
  /** 英文单词数 */
  englishWords: number;
  /** 代码行数 */
  codeLines: number;
  /** 格式化的阅读时间 */
  text: string;
}

/**
 * 估算阅读时间
 *
 * @param content - Markdown 内容
 * @param options - 选项
 * @returns 阅读时间结果
 */
export function estimateReadingTime(
  content: string,
  options: ReadingTimeOptions = {},
): ReadingTimeResult {
  const {
    wordsPerMinuteCN = 300,
    wordsPerMinuteEN = 200,
    includeCode = true,
    codePerMinute = 50,
  } = options;

  // 移除代码块并统计代码行数
  let codeLines = 0;
  let textContent = content.replace(/```[\s\S]*?```/g, (match) => {
    codeLines += match.split("\n").length - 2;
    return "";
  });

  // 移除 HTML 标签
  textContent = textContent.replace(/<[^>]+>/g, "");

  // 统计中文字数
  const chineseMatches = textContent.match(/[\u4e00-\u9fa5]/g);
  const chineseWords = chineseMatches?.length || 0;

  // 统计英文单词数
  const englishMatches = textContent.match(/[a-zA-Z]+/g);
  const englishWords = englishMatches?.length || 0;

  // 计算阅读时间
  let minutes = chineseWords / wordsPerMinuteCN +
    englishWords / wordsPerMinuteEN;

  if (includeCode && codeLines > 0) {
    minutes += codeLines / codePerMinute;
  }

  // 至少 1 分钟
  minutes = Math.max(1, Math.ceil(minutes));

  // 总字数
  const words = chineseWords + englishWords;

  // 格式化文本
  let text: string;
  if (minutes < 60) {
    text = `${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    text = mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  }

  return {
    minutes,
    words,
    chineseWords,
    englishWords,
    codeLines,
    text,
  };
}

/**
 * 渲染阅读时间
 */
export function renderReadingTime(result: ReadingTimeResult): string {
  return `<span class="reading-time" title="${result.words} 字">
    <span class="reading-time-icon">⏱</span>
    <span class="reading-time-text">约 ${result.text}阅读</span>
  </span>`;
}

// ============================================================================
// 字数统计
// ============================================================================

/**
 * 字数统计结果
 */
export interface WordCountResult {
  /** 总字数 */
  total: number;
  /** 中文字数 */
  chinese: number;
  /** 英文单词数 */
  english: number;
  /** 数字数量 */
  numbers: number;
  /** 标点符号数量 */
  punctuation: number;
  /** 段落数 */
  paragraphs: number;
  /** 行数 */
  lines: number;
  /** 代码行数 */
  codeLines: number;
}

/**
 * 统计字数
 *
 * @param content - Markdown 内容
 * @returns 字数统计结果
 */
export function countWords(content: string): WordCountResult {
  // 统计代码行数
  let codeLines = 0;
  let textContent = content.replace(/```[\s\S]*?```/g, (match) => {
    codeLines += match.split("\n").length - 2;
    return "";
  });

  // 移除 HTML 标签
  textContent = textContent.replace(/<[^>]+>/g, "");

  // 统计中文字数
  const chineseMatches = textContent.match(/[\u4e00-\u9fa5]/g);
  const chinese = chineseMatches?.length || 0;

  // 统计英文单词数
  const englishMatches = textContent.match(/[a-zA-Z]+/g);
  const english = englishMatches?.length || 0;

  // 统计数字
  const numberMatches = textContent.match(/\d+/g);
  const numbers = numberMatches?.length || 0;

  // 统计标点符号
  const punctuationMatches = textContent.match(
    /[，。！？；：、""''（）【】《》…—,.!?;:'"()\[\]]/g,
  );
  const punctuation = punctuationMatches?.length || 0;

  // 统计段落数
  const paragraphs = textContent.split(/\n\n+/).filter((p) => p.trim()).length;

  // 统计行数
  const lines = textContent.split("\n").length;

  return {
    total: chinese + english,
    chinese,
    english,
    numbers,
    punctuation,
    paragraphs,
    lines,
    codeLines,
  };
}

/**
 * 渲染字数统计
 */
export function renderWordCount(result: WordCountResult): string {
  return `<span class="word-count" title="中文 ${result.chinese} 字 + 英文 ${result.english} 词">
    <span class="word-count-icon">📝</span>
    <span class="word-count-text">${result.total.toLocaleString()} 字</span>
  </span>`;
}

// ============================================================================
// 最后更新时间
// ============================================================================

/**
 * 更新时间选项
 */
export interface UpdateTimeOptions {
  /** 日期格式 */
  format?: "full" | "date" | "relative";
  /** 语言 */
  locale?: string;
}

/**
 * 格式化更新时间
 *
 * @param date - 日期
 * @param options - 选项
 * @returns 格式化后的时间字符串
 */
export function formatUpdateTime(
  date: Date | string,
  options: UpdateTimeOptions = {},
): string {
  const { format = "full", locale = "zh-CN" } = options;
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    return formatRelativeTime(d);
  }

  const formatOptions: Intl.DateTimeFormatOptions = format === "date"
    ? { year: "numeric", month: "long", day: "numeric" }
    : {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

  return d.toLocaleDateString(locale, formatOptions);
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffWeeks < 4) return `${diffWeeks} 周前`;
  if (diffMonths < 12) return `${diffMonths} 个月前`;
  return `${diffYears} 年前`;
}

/**
 * 渲染更新时间
 */
export function renderUpdateTime(
  date: Date | string,
  options: UpdateTimeOptions = {},
): string {
  const formattedTime = formatUpdateTime(date, options);
  const d = typeof date === "string" ? new Date(date) : date;

  return `<time class="update-time" datetime="${d.toISOString()}" title="${d.toLocaleString()}">
    <span class="update-time-icon">🕐</span>
    <span class="update-time-text">更新于 ${formattedTime}</span>
  </time>`;
}

// ============================================================================
// 作者/贡献者信息
// ============================================================================

/**
 * 作者信息
 */
export interface Author {
  /** 姓名 */
  name: string;
  /** 邮箱 */
  email?: string;
  /** 头像 URL */
  avatar?: string;
  /** 个人主页 */
  url?: string;
  /** 角色 */
  role?: string;
}

/**
 * 解析作者信息
 *
 * 语法：
 * :::authors
 * - name: 张三
 *   email: zhangsan@example.com
 *   avatar: https://example.com/avatar.jpg
 *   role: 主要作者
 * - name: 李四
 *   role: 贡献者
 * :::
 */
export function parseAuthors(content: string): {
  authors: Author[];
  content: string;
} {
  const authors: Author[] = [];

  content = content.replace(
    /:::authors\s*\n([\s\S]*?):::/g,
    (_, block) => {
      // 支持两种格式：
      // 1. 每个作者用 "- " 开头
      // 2. 简单的 key: value 格式（单个作者）
      const trimmedBlock = block.trim();

      // 检查是否使用列表格式
      if (trimmedBlock.startsWith("-")) {
        // 分割为多个作者项，处理开头的 "- "
        const items = trimmedBlock.split(/^-\s+|\n-\s+/m).filter((
          item: string,
        ) => item.trim());

        for (const item of items) {
          const author: Author = { name: "" };
          const lines = item.split("\n");

          for (const line of lines) {
            const colonIndex = line.indexOf(":");
            if (colonIndex === -1) continue;

            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();

            switch (key) {
              case "name":
                author.name = value;
                break;
              case "email":
                author.email = value;
                break;
              case "avatar":
                author.avatar = value;
                break;
              case "url":
                author.url = value;
                break;
              case "role":
                author.role = value;
                break;
            }
          }

          if (author.name) {
            authors.push(author);
          }
        }
      } else {
        // 简单格式：直接解析 key: value
        const author: Author = { name: "" };
        const lines = trimmedBlock.split("\n");

        for (const line of lines) {
          const colonIndex = line.indexOf(":");
          if (colonIndex === -1) continue;

          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();

          switch (key) {
            case "name":
              author.name = value;
              break;
            case "email":
              author.email = value;
              break;
            case "avatar":
              author.avatar = value;
              break;
            case "url":
              author.url = value;
              break;
            case "role":
              author.role = value;
              break;
          }
        }

        if (author.name) {
          authors.push(author);
        }
      }

      return `<!-- authors: ${authors.length} -->`;
    },
  );

  return { authors, content };
}

/**
 * 渲染作者信息
 */
export function renderAuthors(authors: Author[]): string {
  if (authors.length === 0) return "";

  const authorsHtml = authors
    .map((author) => {
      const avatarHtml = author.avatar
        ? `<img class="author-avatar" src="${escapeHtml(author.avatar)}" alt="${
          escapeHtml(author.name)
        }">`
        : `<span class="author-avatar author-avatar-placeholder">${
          author.name.charAt(0)
        }</span>`;

      const nameHtml = author.url
        ? `<a href="${escapeHtml(author.url)}" class="author-name">${
          escapeHtml(author.name)
        }</a>`
        : `<span class="author-name">${escapeHtml(author.name)}</span>`;

      const roleHtml = author.role
        ? `<span class="author-role">${escapeHtml(author.role)}</span>`
        : "";

      const emailHtml = author.email
        ? `<a href="mailto:${escapeHtml(author.email)}" class="author-email">${
          escapeHtml(author.email)
        }</a>`
        : "";

      return `<div class="author">
        ${avatarHtml}
        <div class="author-info">
          ${nameHtml}
          ${roleHtml}
          ${emailHtml}
        </div>
      </div>`;
    })
    .join("");

  return `<div class="authors">${authorsHtml}</div>`;
}

// ============================================================================
// 文档元信息
// ============================================================================

/**
 * 文档元信息
 */
export interface DocumentMeta {
  /** 阅读时间 */
  readingTime: ReadingTimeResult;
  /** 字数统计 */
  wordCount: WordCountResult;
  /** 更新时间 */
  updateTime?: Date;
  /** 作者列表 */
  authors: Author[];
}

/**
 * 提取文档元信息
 */
export function extractDocumentMeta(
  content: string,
  updateTime?: Date | string,
): DocumentMeta {
  const readingTime = estimateReadingTime(content);
  const wordCount = countWords(content);
  const { authors } = parseAuthors(content);

  return {
    readingTime,
    wordCount,
    updateTime: updateTime
      ? (typeof updateTime === "string" ? new Date(updateTime) : updateTime)
      : undefined,
    authors,
  };
}

/**
 * 渲染文档元信息
 */
export function renderDocumentMeta(meta: DocumentMeta): string {
  const parts: string[] = [];

  parts.push(renderReadingTime(meta.readingTime));
  parts.push(renderWordCount(meta.wordCount));

  if (meta.updateTime) {
    parts.push(renderUpdateTime(meta.updateTime));
  }

  return `<div class="document-meta">${parts.join("")}</div>`;
}

// ============================================================================
// 元信息样式
// ============================================================================

/**
 * 获取元信息样式
 */
export function getMetaStyles(): string {
  return `
/* 文档元信息 */
.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
}

/* 阅读时间 */
.reading-time, .word-count, .update-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 作者信息 */
.authors {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
}
.author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.author-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2196f3;
  color: #fff;
  font-weight: bold;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-weight: bold;
  text-decoration: none;
  color: inherit;
}
.author-name:hover { color: #2196f3; }
.author-role {
  font-size: 0.85em;
  color: #666;
}
.author-email {
  font-size: 0.85em;
  color: #2196f3;
}
`;
}
