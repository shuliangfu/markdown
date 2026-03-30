/**
 * @module theme
 *
 * 样式主题模块
 *
 * 支持：
 * - 暗色模式支持
 * - 打印优化样式
 * - 自定义主题变量
 * - GitHub/GitLab 风格主题
 */

// ============================================================================
// 主题类型
// ============================================================================

/**
 * 主题类型
 */
export type ThemeType = "light" | "dark" | "auto";

/**
 * 预设主题
 */
export type PresetTheme =
  | "default"
  | "github"
  | "gitlab"
  | "minimal"
  | "modern";

/**
 * 主题变量
 */
export interface ThemeVariables {
  // 颜色
  colorPrimary?: string;
  colorSecondary?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorDanger?: string;
  colorInfo?: string;

  // 文本
  colorText?: string;
  colorTextMuted?: string;
  colorTextLight?: string;

  // 背景
  colorBackground?: string;
  colorBackgroundSecondary?: string;
  colorBackgroundCode?: string;

  // 边框
  colorBorder?: string;
  colorBorderLight?: string;

  // 链接
  colorLink?: string;
  colorLinkHover?: string;

  // 代码
  colorCodeText?: string;
  colorCodeBackground?: string;

  // 字体
  fontFamily?: string;
  fontFamilyMono?: string;
  fontSize?: string;
  lineHeight?: string;

  // 间距
  spacing?: string;
  borderRadius?: string;

  // 其他
  maxWidth?: string;
}

// ============================================================================
// 默认主题变量
// ============================================================================

/**
 * 亮色主题变量
 */
export const LIGHT_THEME: ThemeVariables = {
  colorPrimary: "#2196f3",
  colorSecondary: "#607d8b",
  colorSuccess: "#4caf50",
  colorWarning: "#ff9800",
  colorDanger: "#f44336",
  colorInfo: "#00bcd4",

  colorText: "#333",
  colorTextMuted: "#666",
  colorTextLight: "#999",

  colorBackground: "#fff",
  colorBackgroundSecondary: "#f8f9fa",
  colorBackgroundCode: "#f4f4f4",

  colorBorder: "#ddd",
  colorBorderLight: "#eee",

  colorLink: "#0066cc",
  colorLinkHover: "#004499",

  colorCodeText: "#333",
  colorCodeBackground: "#f4f4f4",

  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMono:
    "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  fontSize: "16px",
  lineHeight: "1.6",

  spacing: "16px",
  borderRadius: "4px",

  maxWidth: "800px",
};

/**
 * 暗色主题变量
 */
export const DARK_THEME: ThemeVariables = {
  colorPrimary: "#64b5f6",
  colorSecondary: "#90a4ae",
  colorSuccess: "#81c784",
  colorWarning: "#ffb74d",
  colorDanger: "#e57373",
  colorInfo: "#4dd0e1",

  colorText: "#e0e0e0",
  colorTextMuted: "#9e9e9e",
  colorTextLight: "#757575",

  colorBackground: "#1e1e1e",
  colorBackgroundSecondary: "#2d2d2d",
  colorBackgroundCode: "#2d2d2d",

  colorBorder: "#444",
  colorBorderLight: "#333",

  colorLink: "#64b5f6",
  colorLinkHover: "#90caf9",

  colorCodeText: "#e0e0e0",
  colorCodeBackground: "#2d2d2d",

  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMono:
    "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  fontSize: "16px",
  lineHeight: "1.6",

  spacing: "16px",
  borderRadius: "4px",

  maxWidth: "800px",
};

// ============================================================================
// CSS 变量生成
// ============================================================================

/**
 * 生成 CSS 变量
 */
export function generateCSSVariables(variables: ThemeVariables): string {
  const lines: string[] = [];

  if (variables.colorPrimary) {
    lines.push(`--color-primary: ${variables.colorPrimary};`);
  }
  if (variables.colorSecondary) {
    lines.push(`--color-secondary: ${variables.colorSecondary};`);
  }
  if (variables.colorSuccess) {
    lines.push(`--color-success: ${variables.colorSuccess};`);
  }
  if (variables.colorWarning) {
    lines.push(`--color-warning: ${variables.colorWarning};`);
  }
  if (variables.colorDanger) {
    lines.push(`--color-danger: ${variables.colorDanger};`);
  }
  if (variables.colorInfo) lines.push(`--color-info: ${variables.colorInfo};`);

  if (variables.colorText) lines.push(`--color-text: ${variables.colorText};`);
  if (variables.colorTextMuted) {
    lines.push(`--color-text-muted: ${variables.colorTextMuted};`);
  }
  if (variables.colorTextLight) {
    lines.push(`--color-text-light: ${variables.colorTextLight};`);
  }

  if (variables.colorBackground) {
    lines.push(`--color-bg: ${variables.colorBackground};`);
  }
  if (variables.colorBackgroundSecondary) {
    lines.push(`--color-bg-secondary: ${variables.colorBackgroundSecondary};`);
  }
  if (variables.colorBackgroundCode) {
    lines.push(`--color-bg-code: ${variables.colorBackgroundCode};`);
  }

  if (variables.colorBorder) {
    lines.push(`--color-border: ${variables.colorBorder};`);
  }
  if (variables.colorBorderLight) {
    lines.push(`--color-border-light: ${variables.colorBorderLight};`);
  }

  if (variables.colorLink) lines.push(`--color-link: ${variables.colorLink};`);
  if (variables.colorLinkHover) {
    lines.push(`--color-link-hover: ${variables.colorLinkHover};`);
  }

  if (variables.colorCodeText) {
    lines.push(`--color-code-text: ${variables.colorCodeText};`);
  }
  if (variables.colorCodeBackground) {
    lines.push(`--color-code-bg: ${variables.colorCodeBackground};`);
  }

  if (variables.fontFamily) {
    lines.push(`--font-family: ${variables.fontFamily};`);
  }
  if (variables.fontFamilyMono) {
    lines.push(`--font-family-mono: ${variables.fontFamilyMono};`);
  }
  if (variables.fontSize) lines.push(`--font-size: ${variables.fontSize};`);
  if (variables.lineHeight) {
    lines.push(`--line-height: ${variables.lineHeight};`);
  }

  if (variables.spacing) lines.push(`--spacing: ${variables.spacing};`);
  if (variables.borderRadius) {
    lines.push(`--border-radius: ${variables.borderRadius};`);
  }

  if (variables.maxWidth) lines.push(`--max-width: ${variables.maxWidth};`);

  return lines.join("\n  ");
}

// ============================================================================
// 主题样式
// ============================================================================

/**
 * 获取基础主题样式
 */
export function getBaseThemeStyles(): string {
  return `
/* CSS 变量定义 */
:root {
  ${generateCSSVariables(LIGHT_THEME)}
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    ${generateCSSVariables(DARK_THEME)}
  }
}

[data-theme="dark"] {
  ${generateCSSVariables(DARK_THEME)}
}

/* 基础样式 */
body {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  color: var(--color-text);
  background: var(--color-bg);
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--spacing);
}

a { color: var(--color-link); }
a:hover { color: var(--color-link-hover); }

code {
  font-family: var(--font-family-mono);
  background: var(--color-bg-code);
  color: var(--color-code-text);
  padding: 2px 4px;
  border-radius: var(--border-radius);
}

pre {
  background: var(--color-bg-code);
  padding: var(--spacing);
  border-radius: var(--border-radius);
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid var(--color-border);
  margin: 0;
  padding-left: var(--spacing);
  color: var(--color-text-muted);
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing) 0;
}

th, td {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

th {
  background: var(--color-bg-secondary);
}

hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: calc(var(--spacing) * 2) 0;
}
`;
}

/**
 * 获取暗色模式切换脚本
 */
export function getThemeToggleScript(): string {
  return `
<script>
// 主题切换
function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.dataset.theme = 'dark';
  }
}

initTheme();

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  }
});
</script>`;
}

/**
 * 渲染主题切换按钮
 */
export function renderThemeToggle(): string {
  return `<button type="button" class="theme-toggle" onclick="toggleTheme()" aria-label="切换主题">
    <span class="theme-toggle-light">🌙</span>
    <span class="theme-toggle-dark">☀️</span>
  </button>`;
}

// ============================================================================
// 打印样式
// ============================================================================

/**
 * 获取打印优化样式
 */
export function getPrintStyles(): string {
  return `
@media print {
  /* 基础打印样式 */
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
    max-width: none;
    padding: 0;
    margin: 0;
  }

  /* 隐藏不需要打印的元素 */
  .no-print,
  .theme-toggle,
  .back-to-top,
  .reading-progress,
  .toc-nav,
  nav,
  .code-copy-btn {
    display: none !important;
  }

  /* 链接处理 */
  a {
    color: #000;
    text-decoration: underline;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  a[href^="#"]::after {
    content: "";
  }

  /* 代码块 */
  pre {
    background: #f4f4f4 !important;
    border: 1px solid #ddd;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  code {
    background: #f4f4f4 !important;
  }

  /* 图片 */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }

  /* 表格 */
  table {
    page-break-inside: avoid;
  }

  th {
    background: #f4f4f4 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* 标题 */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  /* 段落 */
  p {
    orphans: 3;
    widows: 3;
  }

  /* 分页 */
  .page-break {
    page-break-after: always;
  }

  .page-break-before {
    page-break-before: always;
  }

  /* 页眉页脚 */
  @page {
    margin: 2cm;
  }

  @page :first {
    margin-top: 3cm;
  }
}
`;
}

// ============================================================================
// 预设主题
// ============================================================================

/**
 * 获取 GitHub 风格主题
 */
export function getGitHubTheme(): string {
  return `
/* GitHub 风格主题 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body h1 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-body pre code {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa;
}
`;
}

/**
 * 获取 GitLab 风格主题
 */
export function getGitLabTheme(): string {
  return `
/* GitLab 风格主题 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 16px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body h1 { font-size: 1.75em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body h3 { font-size: 1.25em; }

.markdown-body code {
  padding: 0 4px;
  font-size: 90%;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.markdown-body pre {
  padding: 8px 12px;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.markdown-body pre code {
  padding: 0;
  border: none;
  background: transparent;
}

.markdown-body blockquote {
  padding: 8px 24px;
  color: #666;
  background-color: #fafafa;
  border-left: 3px solid #1068bf;
}

.markdown-body table th {
  background-color: #fafafa;
}
`;
}

/**
 * 获取极简主题
 */
export function getMinimalTheme(): string {
  return `
/* 极简主题 */
.markdown-body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  line-height: 1.8;
  max-width: 680px;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  font-family: -apple-system, sans-serif;
  font-weight: 700;
}

.markdown-body h1 { font-size: 2em; margin-top: 2em; }
.markdown-body h2 { font-size: 1.5em; margin-top: 1.5em; }
.markdown-body h3 { font-size: 1.2em; margin-top: 1.2em; }

.markdown-body a { color: #111; }
.markdown-body a:hover { background-color: #ff0; }

.markdown-body code {
  font-family: "SFMono-Regular", Menlo, monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  padding: 1.5em;
  background: #f9f9f9;
}

.markdown-body blockquote {
  font-style: italic;
  border-left: 2px solid #111;
}

.markdown-body img {
  max-width: 100%;
  margin: 2em 0;
}
`;
}

/**
 * 获取现代主题
 */
export function getModernTheme(): string {
  return `
/* 现代主题 */
.markdown-body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.7;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  font-weight: 700;
  letter-spacing: -0.02em;
}

.markdown-body h1 {
  font-size: 2.5em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.markdown-body a {
  color: #667eea;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.markdown-body a:hover {
  border-bottom-color: #667eea;
}

.markdown-body code {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 6px;
  padding: 2px 8px;
}

.markdown-body pre {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.markdown-body pre code {
  background: transparent;
  color: #e0e0e0;
}

.markdown-body blockquote {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4fd 100%);
  border-left: 4px solid #667eea;
  border-radius: 0 8px 8px 0;
  padding: 16px 20px;
}

.markdown-body table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.markdown-body th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
`;
}

// ============================================================================
// 主题样式选择
// ============================================================================

/**
 * 获取预设主题样式
 */
export function getPresetTheme(theme: PresetTheme): string {
  switch (theme) {
    case "github":
      return getGitHubTheme();
    case "gitlab":
      return getGitLabTheme();
    case "minimal":
      return getMinimalTheme();
    case "modern":
      return getModernTheme();
    default:
      return getBaseThemeStyles();
  }
}

/**
 * 获取完整主题样式（包含基础样式、暗色模式、打印样式）
 */
export function getFullThemeStyles(options: {
  preset?: PresetTheme;
  customVariables?: ThemeVariables;
  includePrint?: boolean;
} = {}): string {
  const { preset = "default", customVariables, includePrint = true } = options;

  let styles = getBaseThemeStyles();

  if (preset !== "default") {
    styles += getPresetTheme(preset);
  }

  if (customVariables) {
    styles += `\n:root {\n  ${generateCSSVariables(customVariables)}\n}\n`;
  }

  if (includePrint) {
    styles += getPrintStyles();
  }

  return styles;
}
