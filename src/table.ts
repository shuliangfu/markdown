/**
 * @module table
 *
 * 表格解析模块
 *
 * 支持功能：
 * - 基础 GFM 表格
 * - 对齐语法（左对齐、居中、右对齐）
 * - 单元格合并（rowspan/colspan）
 * - 可排序表格
 * - 响应式表格
 * - 表格搜索/过滤
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 表格对齐方式
 */
export type TableAlignment = "left" | "center" | "right" | null;

/**
 * 表格增强选项
 */
export interface TableEnhanceOptions {
  /** 是否启用响应式（默认 true） */
  responsive?: boolean;
  /** 是否启用排序（默认 false） */
  sortable?: boolean;
  /** 是否启用搜索（默认 false） */
  searchable?: boolean;
  /** 搜索占位符文本 */
  searchPlaceholder?: string;
  /** 是否显示斑马条纹（默认 true） */
  striped?: boolean;
  /** 是否启用悬停高亮（默认 true） */
  hover?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 表格标题 */
  caption?: string;
}

/**
 * 单元格信息
 */
interface CellInfo {
  /** 内容 */
  content: string;
  /** 对齐方式 */
  align?: TableAlignment;
  /** 横向合并 */
  colspan?: number;
  /** 纵向合并 */
  rowspan?: number;
  /** 是否被合并（跳过渲染） */
  merged?: boolean;
}

/**
 * 表格数据
 */
export interface TableData {
  /** 表头 */
  headers: CellInfo[];
  /** 表体行 */
  rows: CellInfo[][];
  /** 对齐方式 */
  alignments: TableAlignment[];
  /** 增强选项 */
  options: TableEnhanceOptions;
}

// ============================================================================
// 表格对齐解析
// ============================================================================

/**
 * 解析表格对齐标记
 *
 * @param alignCell - 对齐标记单元格
 * @returns 对齐方式（left/center/right/null）
 *
 * @example
 * ```typescript
 * parseTableAlignment(":---"); // "left"
 * parseTableAlignment("---:"); // "right"
 * parseTableAlignment(":---:"); // "center"
 * parseTableAlignment("---"); // null
 * ```
 */
export function parseTableAlignment(alignCell: string): TableAlignment {
  const trimmed = alignCell.trim();
  const hasLeftColon = trimmed.startsWith(":");
  const hasRightColon = trimmed.endsWith(":");

  if (hasLeftColon && hasRightColon) {
    return "center";
  } else if (hasRightColon) {
    return "right";
  } else if (hasLeftColon) {
    return "left";
  }
  return null;
}

// ============================================================================
// 单元格合并解析
// ============================================================================

/**
 * 解析单元格内容，检测合并标记
 *
 * 合并语法：
 * - `||` 横向合并（合并到左边的单元格）
 * - `^^` 纵向合并（合并到上面的单元格）
 * - `>` 或 `>>` 也可表示横向合并
 *
 * @param content - 单元格内容
 * @returns 解析后的内容和合并类型
 */
export function parseCellMerge(content: string): {
  content: string;
  mergeRight: boolean;
  mergeDown: boolean;
} {
  const trimmed = content.trim();

  // 检测横向合并标记
  if (trimmed === "||" || trimmed === ">" || trimmed === ">>") {
    return { content: "", mergeRight: true, mergeDown: false };
  }

  // 检测纵向合并标记
  if (trimmed === "^^" || trimmed === "^") {
    return { content: "", mergeRight: false, mergeDown: true };
  }

  return { content: trimmed, mergeRight: false, mergeDown: false };
}

/**
 * 处理表格单元格合并
 *
 * @param rows - 原始行数据
 * @returns 处理后的行数据（包含 rowspan/colspan）
 */
export function processCellMerge(rows: string[][]): CellInfo[][] {
  const result: CellInfo[][] = [];

  // 第一遍：初始化所有单元格
  for (let r = 0; r < rows.length; r++) {
    const row: CellInfo[] = [];
    for (let c = 0; c < rows[r].length; c++) {
      const { content, mergeRight, mergeDown } = parseCellMerge(rows[r][c]);
      row.push({
        content,
        colspan: 1,
        rowspan: 1,
        merged: mergeRight || mergeDown,
      });
    }
    result.push(row);
  }

  // 第二遍：处理横向合并
  for (let r = 0; r < rows.length; r++) {
    for (let c = rows[r].length - 1; c >= 0; c--) {
      const { mergeRight } = parseCellMerge(rows[r][c]);
      if (mergeRight && c > 0) {
        // 找到左边未合并的单元格
        let targetCol = c - 1;
        while (targetCol >= 0 && result[r][targetCol].merged) {
          targetCol--;
        }
        if (targetCol >= 0) {
          result[r][targetCol].colspan! += 1;
        }
      }
    }
  }

  // 第三遍：处理纵向合并
  for (let r = rows.length - 1; r >= 0; r--) {
    for (let c = 0; c < rows[r].length; c++) {
      const { mergeDown } = parseCellMerge(rows[r][c]);
      if (mergeDown && r > 0) {
        // 找到上边未合并的单元格
        let targetRow = r - 1;
        while (targetRow >= 0 && result[targetRow][c]?.merged) {
          targetRow--;
        }
        if (targetRow >= 0 && result[targetRow][c]) {
          result[targetRow][c].rowspan! += 1;
        }
      }
    }
  }

  return result;
}

// ============================================================================
// 表格解析
// ============================================================================

/**
 * 解析表格（GFM）
 *
 * 支持对齐语法：
 * - `:---` 左对齐
 * - `:---:` 居中对齐
 * - `---:` 右对齐
 *
 * @param html - HTML 字符串
 * @param options - 增强选项
 * @returns 处理后的 HTML
 *
 * @example
 * ```typescript
 * const markdown = `| Header |
 * |:---:|
 * | Cell |`;
 * const html = parseTable(markdown);
 * ```
 */
export function parseTable(
  html: string,
  options: TableEnhanceOptions = {},
): string {
  // 默认选项
  const opts: TableEnhanceOptions = {
    responsive: true,
    sortable: false,
    searchable: false,
    searchPlaceholder: "搜索表格...",
    striped: true,
    hover: true,
    ...options,
  };

  // 匹配表格（包含对齐行）
  // 修复：最后一行可以没有换行符，但使用非贪婪匹配
  const tableRegex =
    /^\|(.+)\|\s*\n\|([-:\s|]+)\|\s*\n((?:\|.+\|[ \t]*\n?)+)/gm;

  return html.replace(tableRegex, (_, headerRow, alignRow, bodyRows) => {
    // 解析对齐方式
    const alignCells = alignRow.split("|").filter((c: string) => c.trim());
    const alignments = alignCells.map((cell: string) =>
      parseTableAlignment(cell)
    );

    // 解析表头
    const headers = headerRow
      .split("|")
      .map((h: string) => h.trim())
      .filter(Boolean);

    // 解析表体
    const rowsRaw = bodyRows.trim().split("\n");
    const bodyData: string[][] = rowsRaw.map((row: string) =>
      row
        .split("|")
        .map((c: string) => c.trim())
        .filter(Boolean)
    );

    // 处理单元格合并
    const processedRows = processCellMerge(bodyData);

    // 生成表格 HTML
    return generateTableHtml(
      {
        headers: headers.map((h: string, i: number) => ({
          content: h,
          align: alignments[i],
        })),
        rows: processedRows.map((row) =>
          row.map((cell, i) => ({
            ...cell,
            align: alignments[i],
          }))
        ),
        alignments,
        options: opts,
      },
    );
  });
}

// ============================================================================
// HTML 生成
// ============================================================================

/**
 * 生成表格 HTML
 *
 * @param data - 表格数据
 * @returns HTML 字符串
 */
export function generateTableHtml(data: TableData): string {
  const { headers, rows, options } = data;

  // 构建 class
  const classes: string[] = ["md-table"];
  if (options.striped) classes.push("md-table-striped");
  if (options.hover) classes.push("md-table-hover");
  if (options.sortable) classes.push("md-table-sortable");
  if (options.searchable) classes.push("md-table-searchable");
  if (options.className) classes.push(options.className);

  // 生成唯一 ID
  const tableId = `table-${Math.random().toString(36).substring(2, 8)}`;

  // 表头 HTML
  const headerHtml = headers
    .map((h, i) => {
      const style = h.align ? ` style="text-align: ${h.align}"` : "";
      const sortAttr = options.sortable
        ? ` data-sort-col="${i}" data-sort-dir="none"`
        : "";
      const sortIcon = options.sortable
        ? '<span class="sort-icon"></span>'
        : "";
      return `<th${style}${sortAttr}>${h.content}${sortIcon}</th>`;
    })
    .join("");

  // 表体 HTML
  const bodyHtml = rows
    .map((row) => {
      const cellsHtml = row
        .map((cell) => {
          // 跳过被合并的单元格
          if (cell.merged) return "";

          const style = cell.align ? ` style="text-align: ${cell.align}"` : "";
          const colspanAttr = cell.colspan && cell.colspan > 1
            ? ` colspan="${cell.colspan}"`
            : "";
          const rowspanAttr = cell.rowspan && cell.rowspan > 1
            ? ` rowspan="${cell.rowspan}"`
            : "";

          return `<td${style}${colspanAttr}${rowspanAttr}>${cell.content}</td>`;
        })
        .join("");
      return `<tr>${cellsHtml}</tr>`;
    })
    .join("");

  // 表格标题
  const captionHtml = options.caption
    ? `<caption>${options.caption}</caption>`
    : "";

  // 基础表格
  let tableHtml = `<table id="${tableId}" class="${
    classes.join(" ")
  }">${captionHtml}<thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;

  // 添加搜索框
  if (options.searchable) {
    const searchHtml = `<div class="md-table-search">
  <input type="text" class="md-table-search-input" data-table="${tableId}" placeholder="${options.searchPlaceholder}" aria-label="搜索表格">
</div>`;
    tableHtml = searchHtml + tableHtml;
  }

  // 响应式包装
  if (options.responsive) {
    tableHtml = `<div class="md-table-responsive">${tableHtml}</div>`;
  }

  // 确保表格后有换行，避免与后续内容合并
  return tableHtml + "\n";
}

// ============================================================================
// 增强表格解析（带选项语法）
// ============================================================================

/**
 * 解析增强表格语法
 *
 * 支持在表格前添加选项行：
 * ```markdown
 * <!-- table: sortable, searchable, caption="用户列表" -->
 * | Name | Age |
 * |:-----|----:|
 * | Tom  | 18  |
 * ```
 *
 * @param markdown - Markdown 字符串
 * @returns 包含占位符的内容
 */

/** 增强表格占位符存储，用于在 parse() 处理前保护已生成的 HTML */
const enhancedTablePlaceholders: Map<string, string> = new Map();

export function parseEnhancedTable(markdown: string): string {
  // 清空之前的占位符
  enhancedTablePlaceholders.clear();

  // 只匹配带选项注释的表格，不处理普通表格
  const optionsTableRegex =
    /<!--\s*table:\s*([^>]+)\s*-->\s*\n(\|.+\|\s*\n\|[-:\s|]+\|\s*\n(?:\|.+\|\s*\n?)+)/gm;

  let index = 0;
  return markdown.replace(optionsTableRegex, (_, optionsStr, tableMarkdown) => {
    // 解析选项
    const options = parseTableOptions(optionsStr);

    // 解析表格并生成增强 HTML
    const html = parseTable(tableMarkdown, options);

    // 生成唯一占位符，使用不会被 Markdown 解析的格式
    // 避免使用下划线和星号等 Markdown 语法字符
    // 前后添加换行确保占位符作为独立块被解析
    const placeholderId = `ENHANCEDTABLEPLACEHOLDER${index++}END`;
    enhancedTablePlaceholders.set(placeholderId, html);

    // 返回带换行的占位符，确保它是独立的块
    return `\n${placeholderId}\n`;
  });
}

/**
 * 恢复增强表格 HTML
 * 将占位符替换回实际的 HTML
 * 同时移除可能包裹占位符的 <p> 标签
 *
 * @param content - 包含占位符的内容
 * @returns 恢复后的 HTML
 */
export function restoreEnhancedTable(content: string): string {
  let result = content;
  for (const [placeholder, html] of enhancedTablePlaceholders) {
    // 占位符可能被 <p> 标签包裹，需要同时移除
    const wrappedRegex = new RegExp(`<p>${placeholder}</p>`, "g");
    result = result.replace(wrappedRegex, html);
    // 也处理没有被 <p> 包裹的情况
    result = result.replace(placeholder, html);
  }
  return result;
}

/**
 * 解析表格选项字符串
 *
 * @param optionsStr - 选项字符串，如 "sortable, searchable, caption='用户列表'"
 * @returns 解析后的选项
 */
export function parseTableOptions(optionsStr: string): TableEnhanceOptions {
  const options: TableEnhanceOptions = {};

  // 解析布尔选项
  if (/\bsortable\b/i.test(optionsStr)) options.sortable = true;
  if (/\bsearchable\b/i.test(optionsStr)) options.searchable = true;
  if (/\bresponsive\b/i.test(optionsStr)) options.responsive = true;
  if (/\bstriped\b/i.test(optionsStr)) options.striped = true;
  if (/\bhover\b/i.test(optionsStr)) options.hover = true;
  if (/\bno-responsive\b/i.test(optionsStr)) options.responsive = false;
  if (/\bno-striped\b/i.test(optionsStr)) options.striped = false;
  if (/\bno-hover\b/i.test(optionsStr)) options.hover = false;

  // 解析字符串选项
  const captionMatch = optionsStr.match(/caption\s*=\s*["']([^"']+)["']/i);
  if (captionMatch) options.caption = captionMatch[1];

  const classMatch = optionsStr.match(/class\s*=\s*["']([^"']+)["']/i);
  if (classMatch) options.className = classMatch[1];

  const placeholderMatch = optionsStr.match(
    /placeholder\s*=\s*["']([^"']+)["']/i,
  );
  if (placeholderMatch) options.searchPlaceholder = placeholderMatch[1];

  return options;
}

// ============================================================================
// 表格样式
// ============================================================================

/**
 * 获取表格增强样式
 *
 * @returns CSS 样式字符串
 */
export function getTableStyles(): string {
  return `
/* 响应式表格容器 */
.md-table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

/* 移动端滚动提示 */
@media (max-width: 768px) {
  .md-table-responsive {
    position: relative;
  }
  .md-table-responsive::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 30px;
    background: linear-gradient(to right, transparent, rgba(0,0,0,0.05));
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .md-table-responsive.has-scroll::after {
    opacity: 1;
  }
}

/* 基础表格样式 */
.md-table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
  line-height: 1.5;
}

.md-table th,
.md-table td {
  padding: 12px 16px;
  border: 1px solid #e1e4e8;
  text-align: left;
}

.md-table th {
  background: #f6f8fa;
  font-weight: 600;
  white-space: nowrap;
}

/* 斑马条纹 */
.md-table-striped tbody tr:nth-child(2n) {
  background: #f6f8fa;
}

/* 悬停高亮 */
.md-table-hover tbody tr:hover {
  background: #f0f4f8;
}

/* 可排序表格 */
.md-table-sortable th {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 24px;
}

.md-table-sortable th:hover {
  background: #e8ecf0;
}

.md-table-sortable .sort-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border: 5px solid transparent;
  opacity: 0.3;
}

.md-table-sortable th[data-sort-dir="none"] .sort-icon {
  border-top-color: #666;
  border-bottom-color: #666;
  border-top-width: 4px;
  border-bottom-width: 4px;
  margin-top: -4px;
}

.md-table-sortable th[data-sort-dir="asc"] .sort-icon {
  border-bottom-color: #333;
  opacity: 1;
}

.md-table-sortable th[data-sort-dir="desc"] .sort-icon {
  border-top-color: #333;
  opacity: 1;
  margin-top: 4px;
}

/* 搜索框 */
.md-table-search {
  margin-bottom: 12px;
}

.md-table-search-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.md-table-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.md-table-search-input::placeholder {
  color: #9ca3af;
}

/* 无匹配结果 */
.md-table tbody tr.no-match {
  display: none;
}

/* 空状态 */
.md-table-empty {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
}

/* 表格标题 */
.md-table caption {
  padding: 8px 16px;
  font-weight: 600;
  text-align: left;
  caption-side: top;
  color: #374151;
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .md-table th,
  .md-table td {
    border-color: #30363d;
  }
  
  .md-table th {
    background: #21262d;
  }
  
  .md-table-striped tbody tr:nth-child(2n) {
    background: #161b22;
  }
  
  .md-table-hover tbody tr:hover {
    background: #1f242b;
  }
  
  .md-table-sortable th:hover {
    background: #292e36;
  }
  
  .md-table-search-input {
    background: #0d1117;
    border-color: #30363d;
    color: #c9d1d9;
  }
  
  .md-table-search-input:focus {
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
  }
  
  .md-table caption {
    color: #c9d1d9;
  }
}
`;
}

// ============================================================================
// 表格交互脚本
// ============================================================================

/**
 * 获取表格增强脚本
 *
 * @returns JavaScript 代码字符串
 */
export function getTableScript(): string {
  return `
(function() {
  'use strict';
  
  // 初始化所有表格
  function initTables() {
    // 响应式滚动检测
    document.querySelectorAll('.md-table-responsive').forEach(function(container) {
      function checkScroll() {
        var hasScroll = container.scrollWidth > container.clientWidth;
        container.classList.toggle('has-scroll', hasScroll);
      }
      checkScroll();
      window.addEventListener('resize', checkScroll);
    });
    
    // 可排序表格
    document.querySelectorAll('.md-table-sortable').forEach(function(table) {
      initSortable(table);
    });
    
    // 可搜索表格
    document.querySelectorAll('.md-table-search-input').forEach(function(input) {
      initSearchable(input);
    });
  }
  
  // 初始化排序功能
  function initSortable(table) {
    var headers = table.querySelectorAll('th[data-sort-col]');
    
    headers.forEach(function(header) {
      header.addEventListener('click', function() {
        var col = parseInt(header.dataset.sortCol);
        var dir = header.dataset.sortDir;
        
        // 切换排序方向
        var newDir = dir === 'asc' ? 'desc' : 'asc';
        
        // 重置其他列
        headers.forEach(function(h) {
          h.dataset.sortDir = 'none';
        });
        header.dataset.sortDir = newDir;
        
        // 排序
        sortTable(table, col, newDir);
      });
    });
  }
  
  // 表格排序
  function sortTable(table, col, dir) {
    var tbody = table.querySelector('tbody');
    var rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort(function(a, b) {
      var aVal = getCellValue(a, col);
      var bVal = getCellValue(b, col);
      
      // 尝试数字排序
      var aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
      var bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return dir === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // 字符串排序
      return dir === 'asc' 
        ? aVal.localeCompare(bVal, 'zh-CN')
        : bVal.localeCompare(aVal, 'zh-CN');
    });
    
    // 重新插入行
    rows.forEach(function(row) {
      tbody.appendChild(row);
    });
  }
  
  // 获取单元格值
  function getCellValue(row, col) {
    var cells = row.querySelectorAll('td');
    var actualCol = 0;
    
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var colspan = parseInt(cell.getAttribute('colspan')) || 1;
      
      if (actualCol <= col && col < actualCol + colspan) {
        return cell.textContent.trim();
      }
      actualCol += colspan;
    }
    
    return '';
  }
  
  // 初始化搜索功能
  function initSearchable(input) {
    var tableId = input.dataset.table;
    var table = document.getElementById(tableId);
    if (!table) return;
    
    var tbody = table.querySelector('tbody');
    var rows = tbody.querySelectorAll('tr');
    
    input.addEventListener('input', function() {
      var query = input.value.toLowerCase().trim();
      var hasMatch = false;
      
      rows.forEach(function(row) {
        var text = row.textContent.toLowerCase();
        var match = !query || text.includes(query);
        row.classList.toggle('no-match', !match);
        if (match) hasMatch = true;
      });
      
      // 显示无结果提示
      var emptyRow = tbody.querySelector('.md-table-empty-row');
      if (!hasMatch && !emptyRow) {
        var colCount = table.querySelector('thead tr').children.length;
        emptyRow = document.createElement('tr');
        emptyRow.className = 'md-table-empty-row';
        emptyRow.innerHTML = '<td colspan="' + colCount + '" class="md-table-empty">无匹配结果</td>';
        tbody.appendChild(emptyRow);
      } else if (hasMatch && emptyRow) {
        emptyRow.remove();
      }
    });
  }
  
  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTables);
  } else {
    initTables();
  }
})();
`;
}

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 创建简单表格 HTML
 *
 * @param headers - 表头数组
 * @param rows - 数据行数组
 * @param options - 增强选项
 * @returns HTML 字符串
 *
 * @example
 * ```typescript
 * const html = createTable(
 *   ["姓名", "年龄", "城市"],
 *   [
 *     ["张三", "25", "北京"],
 *     ["李四", "30", "上海"],
 *   ],
 *   { sortable: true }
 * );
 * ```
 */
export function createTable(
  headers: string[],
  rows: string[][],
  options: TableEnhanceOptions = {},
): string {
  return generateTableHtml({
    headers: headers.map((h) => ({ content: h })),
    rows: rows.map((row) => row.map((cell) => ({ content: cell }))),
    alignments: headers.map(() => null),
    options: {
      responsive: true,
      striped: true,
      hover: true,
      ...options,
    },
  });
}

/**
 * 从对象数组创建表格
 *
 * @param data - 对象数组
 * @param columns - 列定义（可选，默认使用第一个对象的键）
 * @param options - 增强选项
 * @returns HTML 字符串
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: "张三", age: 25, city: "北京" },
 *   { name: "李四", age: 30, city: "上海" },
 * ];
 *
 * const html = createTableFromData(users, [
 *   { key: "name", label: "姓名" },
 *   { key: "age", label: "年龄", align: "right" },
 *   { key: "city", label: "城市" },
 * ]);
 * ```
 */
export function createTableFromData<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string; align?: TableAlignment }[],
  options: TableEnhanceOptions = {},
): string {
  if (data.length === 0) {
    return '<div class="md-table-empty">暂无数据</div>';
  }

  // 自动生成列定义
  const cols = columns ||
    (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
      align: null as TableAlignment,
    }));

  return generateTableHtml({
    headers: cols.map((c) => ({ content: c.label, align: c.align })),
    rows: data.map((item) =>
      cols.map((c) => ({
        content: String(item[c.key] ?? ""),
        align: c.align,
      }))
    ),
    alignments: cols.map((c) => c.align || null),
    options: {
      responsive: true,
      striped: true,
      hover: true,
      ...options,
    },
  });
}
