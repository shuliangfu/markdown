/**
 * @module components
 *
 * 布局组件模块
 *
 * 支持：
 * - 多列布局
 * - 标签页（Tabs）
 * - 折叠面板/手风琴（Accordion）
 * - 时间线（Timeline）
 * - 卡片组件
 * - 步骤条（Steps）
 *
 * 性能优化：使用预编译正则表达式
 */

import { escapeHtml } from "./utils.ts";

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** 多列布局正则 */
const COLUMNS_REGEX = /:::columns(?:\s+(\d+))?\n([\s\S]*?)\n:::\s*$/gm;

/** 列项正则 */
const COLUMN_ITEM_REGEX = /:::column\s*\n([\s\S]*?)(?=:::column|:::$|$)/g;

/** 标签页正则 */
const TABS_REGEX = /:::tabs\n([\s\S]*?):::/g;

/** 手风琴正则 */
const ACCORDION_REGEX = /:::accordion\n([\s\S]*?):::/g;

/** 时间线正则 */
const TIMELINE_REGEX = /:::timeline\n([\s\S]*?):::/g;

/** 卡片正则 */
const CARD_REGEX = /:::card(?:\s+([^\n]+))?\n([\s\S]*?):::/g;

/** 卡片网格正则 */
const CARD_GRID_REGEX = /:::card-grid(?:\s+cols=(\d+))?\n([\s\S]*?):::/g;

/** 步骤条正则 */
const STEPS_REGEX = /:::steps\n([\s\S]*?):::/g;

// ============================================================================
// 多列布局
// ============================================================================

/**
 * 解析多列布局
 *
 * 语法：
 * ::: columns
 * ::: column
 * 第一列内容
 * :::
 * ::: column
 * 第二列内容
 * :::
 * :::
 */
export function parseColumns(content: string): string {
  // 解析 columns 容器（使用预编译正则）
  // 结束标记必须是行首的 ::: （避免匹配到 :::column）
  return content.replace(
    COLUMNS_REGEX,
    (_, cols, innerContent) => {
      const columnCount = cols ? parseInt(cols, 10) : 0;
      const columns = parseColumnItems(innerContent);

      if (columns.length === 0) return "";

      const colCount = columnCount || columns.length;
      const columnsHtml = columns
        .map((col) => `<div class="column">${col}</div>`)
        .join("");

      return `<div class="columns columns-${colCount}">${columnsHtml}</div>`;
    },
  );
}

/**
 * 解析列项（使用预编译正则）
 *
 * 支持语法：
 * :::column
 * 内容
 * :::column
 * 内容
 */
function parseColumnItems(content: string): string[] {
  const columns: string[] = [];
  // 重置正则 lastIndex
  COLUMN_ITEM_REGEX.lastIndex = 0;

  let match;
  while ((match = COLUMN_ITEM_REGEX.exec(content)) !== null) {
    const col = match[1].trim();
    if (col) {
      columns.push(col);
    }
  }

  return columns;
}

// ============================================================================
// 标签页
// ============================================================================

/**
 * 标签页项
 */
export interface TabItem {
  label: string;
  content: string;
  id?: string;
}

/**
 * 解析标签页
 *
 * 语法：
 * ::: tabs
 * @tab 标签1
 * 内容1
 * @tab 标签2
 * 内容2
 * :::
 */
export function parseTabs(content: string): string {
  let tabGroupId = 0;

  // 使用预编译正则
  return content.replace(TABS_REGEX, (_, innerContent) => {
    const tabs = parseTabItems(innerContent);
    if (tabs.length === 0) return "";

    const groupId = tabGroupId++;
    return renderTabs(tabs, groupId);
  });
}

/**
 * 解析标签项
 */
function parseTabItems(content: string): TabItem[] {
  const tabs: TabItem[] = [];
  const parts = content.split(/@tab\s+/);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;

    const label = part.slice(0, newlineIndex).trim();
    const tabContent = part.slice(newlineIndex + 1).trim();

    tabs.push({ label, content: tabContent });
  }

  return tabs;
}

/**
 * 渲染标签页
 */
function renderTabs(tabs: TabItem[], groupId: number): string {
  const tabsHtml = tabs
    .map(
      (tab, i) =>
        `<button type="button" class="tab-btn${
          i === 0 ? " active" : ""
        }" data-tab="tab-${groupId}-${i}" onclick="switchTab(this)">${
          escapeHtml(tab.label)
        }</button>`,
    )
    .join("");

  const panelsHtml = tabs
    .map(
      (tab, i) =>
        `<div class="tab-panel${
          i === 0 ? " active" : ""
        }" data-panel="tab-${groupId}-${i}">${tab.content}</div>`,
    )
    .join("");

  return `<div class="tabs"><div class="tab-list">${tabsHtml}</div><div class="tab-panels">${panelsHtml}</div></div>`;
}

// ============================================================================
// 折叠面板/手风琴
// ============================================================================

/**
 * 解析折叠面板
 *
 * 语法：
 * ::: accordion
 * @item 标题1
 * 内容1
 * @item 标题2
 * 内容2
 * :::
 */
export function parseAccordion(content: string): string {
  let accordionId = 0;

  // 使用预编译正则
  return content.replace(ACCORDION_REGEX, (_, innerContent) => {
    const items = parseAccordionItems(innerContent);
    if (items.length === 0) return "";

    const id = accordionId++;
    return renderAccordion(items, id);
  });
}

/**
 * 解析折叠项
 */
function parseAccordionItems(content: string): TabItem[] {
  const items: TabItem[] = [];
  const parts = content.split(/@item\s+/);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;

    const label = part.slice(0, newlineIndex).trim();
    const itemContent = part.slice(newlineIndex + 1).trim();

    items.push({ label, content: itemContent });
  }

  return items;
}

/**
 * 渲染折叠面板
 */
function renderAccordion(items: TabItem[], groupId: number): string {
  const itemsHtml = items
    .map(
      (item, i) =>
        `<details class="accordion-item" id="accordion-${groupId}-${i}">
          <summary class="accordion-header">${escapeHtml(item.label)}</summary>
          <div class="accordion-content">${item.content}</div>
        </details>`,
    )
    .join("");

  return `<div class="accordion">${itemsHtml}</div>`;
}

// ============================================================================
// 时间线
// ============================================================================

/**
 * 时间线项
 */
export interface TimelineItem {
  time?: string;
  title: string;
  content: string;
  icon?: string;
  color?: string;
}

/**
 * 解析时间线
 *
 * 语法：
 * ::: timeline
 * @event 2024-01-01 | 事件标题
 * 事件内容
 * @event 2024-02-01 | 另一个事件
 * 内容
 * :::
 */
export function parseTimeline(content: string): string {
  // 使用预编译正则
  return content.replace(TIMELINE_REGEX, (_, innerContent) => {
    const items = parseTimelineItems(innerContent);
    if (items.length === 0) return "";
    return renderTimeline(items);
  });
}

/**
 * 解析时间线项
 */
function parseTimelineItems(content: string): TimelineItem[] {
  const items: TimelineItem[] = [];
  const parts = content.split(/@event\s+/);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;

    const headerLine = part.slice(0, newlineIndex).trim();
    const itemContent = part.slice(newlineIndex + 1).trim();

    // 解析 time | title
    const pipeIndex = headerLine.indexOf("|");
    let time = "";
    let title = headerLine;

    if (pipeIndex !== -1) {
      time = headerLine.slice(0, pipeIndex).trim();
      title = headerLine.slice(pipeIndex + 1).trim();
    }

    items.push({ time, title, content: itemContent });
  }

  return items;
}

/**
 * 渲染时间线
 */
function renderTimeline(items: TimelineItem[]): string {
  const itemsHtml = items
    .map(
      (item) =>
        `<div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            ${
          item.time
            ? `<div class="timeline-time">${escapeHtml(item.time)}</div>`
            : ""
        }
            <div class="timeline-title">${escapeHtml(item.title)}</div>
            <div class="timeline-body">${item.content}</div>
          </div>
        </div>`,
    )
    .join("");

  return `<div class="timeline">${itemsHtml}</div>`;
}

// ============================================================================
// 卡片组件
// ============================================================================

/**
 * 卡片选项
 */
export interface CardOptions {
  title?: string;
  image?: string;
  link?: string;
  icon?: string;
}

/**
 * 解析卡片
 *
 * 语法：
 * ::: card title="标题" image="url" link="url"
 * 卡片内容
 * :::
 */
export function parseCards(content: string): string {
  // 使用预编译正则
  return content.replace(CARD_REGEX, (_, meta, cardContent) => {
    const options = meta ? parseCardMeta(meta) : {};
    return renderCard(cardContent.trim(), options);
  });
}

/**
 * 解析卡片元信息
 */
function parseCardMeta(meta: string): CardOptions {
  const options: CardOptions = {};

  const titleMatch = meta.match(/title=["']([^"']+)["']/);
  if (titleMatch) options.title = titleMatch[1];

  const imageMatch = meta.match(/image=["']([^"']+)["']/);
  if (imageMatch) options.image = imageMatch[1];

  const linkMatch = meta.match(/link=["']([^"']+)["']/);
  if (linkMatch) options.link = linkMatch[1];

  const iconMatch = meta.match(/icon=["']([^"']+)["']/);
  if (iconMatch) options.icon = iconMatch[1];

  return options;
}

/**
 * 渲染卡片
 */
function renderCard(content: string, options: CardOptions): string {
  const { title, image, link, icon } = options;

  let html = '<div class="card">';

  if (image) {
    html += `<div class="card-image"><img src="${escapeHtml(image)}" alt="${
      escapeHtml(title || "")
    }"></div>`;
  }

  html += '<div class="card-body">';

  if (title) {
    const iconHtml = icon ? `<span class="card-icon">${icon}</span>` : "";
    html += `<div class="card-title">${iconHtml}${escapeHtml(title)}</div>`;
  }

  html += `<div class="card-content">${content}</div>`;
  html += "</div>";

  if (link) {
    html = `<a href="${escapeHtml(link)}" class="card-link">${html}</a>`;
  }

  html += "</div>";

  return html;
}

/**
 * 解析卡片网格
 *
 * 语法：
 * ::: card-grid cols=3
 * ... cards ...
 * :::
 */
export function parseCardGrid(content: string): string {
  // 使用预编译正则
  return content.replace(CARD_GRID_REGEX, (_, cols, gridContent) => {
    const columnCount = cols ? parseInt(cols, 10) : 3;
    return `<div class="card-grid grid-${columnCount}">${gridContent}</div>`;
  });
}

// ============================================================================
// 步骤条
// ============================================================================

/**
 * 步骤项
 */
export interface StepItem {
  title: string;
  content: string;
  status?: "done" | "active" | "pending";
}

/**
 * 解析步骤条
 *
 * 语法：
 * ::: steps
 * @step 步骤1
 * 内容1
 * @step 步骤2 [active]
 * 内容2
 * :::
 */
export function parseSteps(content: string): string {
  // 使用预编译正则
  return content.replace(STEPS_REGEX, (_, innerContent) => {
    const steps = parseStepItems(innerContent);
    if (steps.length === 0) return "";
    return renderSteps(steps);
  });
}

/**
 * 解析步骤项
 */
function parseStepItems(content: string): StepItem[] {
  const steps: StepItem[] = [];
  const parts = content.split(/@step\s+/);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;

    let title = part.slice(0, newlineIndex).trim();
    const stepContent = part.slice(newlineIndex + 1).trim();

    // 解析状态
    let status: StepItem["status"] = "pending";
    if (title.includes("[done]")) {
      status = "done";
      title = title.replace("[done]", "").trim();
    } else if (title.includes("[active]")) {
      status = "active";
      title = title.replace("[active]", "").trim();
    }

    steps.push({ title, content: stepContent, status });
  }

  // 自动设置状态
  let foundActive = false;
  for (const step of steps) {
    if (step.status === "active") {
      foundActive = true;
    } else if (!foundActive && step.status === "pending") {
      step.status = "done";
    }
  }

  return steps;
}

/**
 * 渲染步骤条
 */
function renderSteps(steps: StepItem[]): string {
  const stepsHtml = steps
    .map(
      (step, i) =>
        `<div class="step step-${step.status}">
          <div class="step-number">${i + 1}</div>
          <div class="step-content">
            <div class="step-title">${escapeHtml(step.title)}</div>
            <div class="step-body">${step.content}</div>
          </div>
        </div>`,
    )
    .join("");

  return `<div class="steps">${stepsHtml}</div>`;
}

// ============================================================================
// 组件样式
// ============================================================================

/**
 * 获取组件样式
 */
export function getComponentStyles(): string {
  return `
/* 多列布局 */
.columns { display: flex; gap: 16px; margin: 16px 0; }
.column { flex: 1; }
.columns-2 .column { flex: 0 0 calc(50% - 8px); }
.columns-3 .column { flex: 0 0 calc(33.33% - 11px); }
.columns-4 .column { flex: 0 0 calc(25% - 12px); }
@media (max-width: 768px) {
  .columns { flex-direction: column; }
  .column { flex: none; width: 100%; }
}

/* 标签页 */
.tabs { margin: 16px 0; border: 1px solid #ddd; border-radius: 4px; }
.tab-list { display: flex; background: #f4f4f4; border-bottom: 1px solid #ddd; }
.tab-btn {
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: #666;
}
.tab-btn.active { background: #fff; color: #333; border-bottom: 2px solid #2196f3; }
.tab-btn:hover { color: #333; }
.tab-panels { padding: 16px; }
.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* 折叠面板 */
.accordion { margin: 16px 0; }
.accordion-item { border: 1px solid #ddd; margin-bottom: -1px; }
.accordion-item:first-child { border-radius: 4px 4px 0 0; }
.accordion-item:last-child { border-radius: 0 0 4px 4px; margin-bottom: 0; }
.accordion-header {
  padding: 12px 16px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: bold;
}
.accordion-header:hover { background: #f0f0f0; }
.accordion-content { padding: 16px; }

/* 时间线 */
.timeline { position: relative; padding-left: 30px; margin: 16px 0; }
.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}
.timeline-item { position: relative; padding-bottom: 24px; }
.timeline-marker {
  position: absolute;
  left: -26px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2196f3;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #ddd;
}
.timeline-time { font-size: 0.85em; color: #666; margin-bottom: 4px; }
.timeline-title { font-weight: bold; margin-bottom: 8px; }

/* 卡片 */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-link { text-decoration: none; color: inherit; display: block; }
.card-image img { width: 100%; height: auto; display: block; }
.card-body { padding: 16px; }
.card-title { font-size: 1.1em; font-weight: bold; margin-bottom: 8px; }
.card-icon { margin-right: 8px; }

/* 卡片网格 */
.card-grid { display: grid; gap: 16px; margin: 16px 0; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 768px) {
  .card-grid { grid-template-columns: 1fr; }
}

/* 步骤条 */
.steps { margin: 16px 0; }
.step { display: flex; margin-bottom: 24px; }
.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
}
.step-done .step-number { background: #4caf50; color: #fff; }
.step-active .step-number { background: #2196f3; color: #fff; }
.step-pending .step-number { background: #ddd; color: #666; }
.step-title { font-weight: bold; margin-bottom: 4px; }
.step-done .step-title { color: #4caf50; }
.step-active .step-title { color: #2196f3; }
`;
}

/**
 * 获取组件脚本
 */
export function getComponentScript(): string {
  return `
<script>
// 切换标签页
function switchTab(btn) {
  const tabs = btn.closest('.tabs');
  const tabId = btn.dataset.tab;
  
  tabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  tabs.querySelector('[data-panel="' + tabId + '"]').classList.add('active');
}
</script>`;
}
