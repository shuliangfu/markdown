/**
 * @module document
 *
 * 文档功能模块
 *
 * 支持：
 * - 文件包含/导入（@include）
 * - 变量/模板插值
 * - 条件渲染
 * - 术语表（Glossary）
 * - API 文档格式化
 * - 变更日志格式化
 *
 * 性能优化：使用预编译正则表达式
 */

import { escapeHtml, escapeRegExp } from "./utils.ts";

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** 文件包含正则 */
const INCLUDE_REGEX = /@include\(([^)]+)\)(?:\{([^}]+)\})?/g;

/** 行号范围正则 */
const LINES_RANGE_REGEX = /lines=(\d+)-(\d+)/;

/** 语言标识正则 */
const LANG_REGEX = /lang=(\w+)/;

/** 变量定义正则（行内） */
const DEFINE_INLINE_REGEX = /@define\(([^,]+),\s*([^)]+)\)/g;

/** 变量定义正则（块） */
const DEFINE_BLOCK_REGEX = /:::define\n([\s\S]*?):::/g;

/** 变量引用正则 */
const VARIABLE_REF_REGEX =
  /\{\{\s*([^}|]+)(?:\s*\|\s*default:\s*["']([^"']+)["'])?\s*\}\}/g;

/** 条件块正则 */
const CONDITIONAL_REGEX = /@if\(([^)]+)\)([\s\S]*?)(?:@else([\s\S]*?))?@endif/g;

/** 术语表正则 */
const GLOSSARY_REGEX = /:::glossary\n([\s\S]*?):::/g;

/** API 文档正则 */
const API_DOC_REGEX = /:::api\s+([^\n]+)\n([\s\S]*?):::/g;

/** API 参数正则 */
const API_PARAM_REGEX = /@param\s+(\w+)\s+(\S+)(\s+required)?\s*(.*)/g;

/** 变更日志正则 */
const CHANGELOG_REGEX = /:::changelog\s+([^\n]+)\n([\s\S]*?):::/g;

/** 变更日志项正则 */
const CHANGELOG_ITEM_REGEX = /-\s*\[(\w+)\]\s*(.*)/g;

// ============================================================================
// 文件包含
// ============================================================================

/**
 * 文件加载器类型
 */
export type FileLoader = (path: string) => Promise<string> | string;

/**
 * 解析文件包含指令
 *
 * 语法：
 * @include(./path/to/file.md)
 * @include(./code.ts){lines=1-10 lang=typescript}
 *
 * @param content - Markdown 内容
 * @param loader - 文件加载器
 * @returns 处理后的内容
 */
export async function parseIncludes(
  content: string,
  loader: FileLoader,
): Promise<string> {
  // 使用预编译正则
  const matches = [...content.matchAll(INCLUDE_REGEX)];

  for (const match of matches) {
    const [fullMatch, path, meta] = match;
    try {
      let includedContent = await loader(path.trim());

      // 处理行号范围（使用预编译正则）
      if (meta) {
        const linesMatch = meta.match(LINES_RANGE_REGEX);
        if (linesMatch) {
          const start = parseInt(linesMatch[1], 10) - 1;
          const end = parseInt(linesMatch[2], 10);
          const lines = includedContent.split("\n");
          includedContent = lines.slice(start, end).join("\n");
        }

        // 包装为代码块（使用预编译正则）
        const langMatch = meta.match(LANG_REGEX);
        if (langMatch) {
          includedContent = "```" + langMatch[1] + "\n" + includedContent +
            "\n```";
        }
      }

      content = content.replace(fullMatch, includedContent);
    } catch (error) {
      console.warn(`Failed to include file: ${path}`, error);
      content = content.replace(
        fullMatch,
        `<!-- Failed to include: ${escapeHtml(path)} -->`,
      );
    }
  }

  return content;
}

// ============================================================================
// 变量/模板插值
// ============================================================================

/**
 * 变量定义
 */
export type Variables = Record<string, string | number | boolean>;

/**
 * 定义变量
 *
 * 语法：
 * @define(varName, value)
 * :::define
 * version: 1.0.0
 * author: John
 * :::
 *
 * @param content - Markdown 内容
 * @returns 变量定义和处理后的内容
 */
export function parseVariableDefinitions(content: string): {
  variables: Variables;
  content: string;
} {
  const variables: Variables = {};

  // 解析单行定义（使用预编译正则）
  content = content.replace(DEFINE_INLINE_REGEX, (_, name, value) => {
    variables[name.trim()] = value.trim();
    return "";
  });

  // 解析块定义（使用预编译正则）
  content = content.replace(DEFINE_BLOCK_REGEX, (_, block) => {
    const lines = block.trim().split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const name = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        variables[name] = value;
      }
    }
    return "";
  });

  return { variables, content };
}

/**
 * 应用变量插值
 *
 * 语法：
 * {{varName}}
 * {{ varName | default: "默认值" }}
 *
 * @param content - Markdown 内容
 * @param variables - 变量定义
 * @returns 处理后的内容
 */
export function applyVariables(content: string, variables: Variables): string {
  // 使用预编译正则
  return content.replace(VARIABLE_REF_REGEX, (_, name, defaultValue) => {
    const varName = name.trim();
    if (varName in variables) {
      return escapeHtml(String(variables[varName]));
    }
    return defaultValue || `{{${varName}}}`;
  });
}

// ============================================================================
// 条件渲染
// ============================================================================

/**
 * 解析条件渲染
 *
 * 语法：
 * @if(condition)
 * 条件为真时显示的内容
 * @endif
 *
 * @if(version >= 2.0)
 * 新版本内容
 * @else
 * 旧版本内容
 * @endif
 *
 * @param content - Markdown 内容
 * @param variables - 变量定义
 * @returns 处理后的内容
 */
export function parseConditional(
  content: string,
  variables: Variables,
): string {
  // 使用预编译正则
  return content.replace(
    CONDITIONAL_REGEX,
    (_, condition, ifContent, elseContent) => {
      const result = evaluateCondition(condition, variables);
      return result ? ifContent.trim() : (elseContent?.trim() || "");
    },
  );
}

/**
 * 评估条件表达式
 */
function evaluateCondition(condition: string, variables: Variables): boolean {
  // 简单条件：变量名
  const trimmed = condition.trim();

  // 检查是否是简单变量
  if (trimmed in variables) {
    return !!variables[trimmed];
  }

  // 比较操作符
  const compareMatch = trimmed.match(/^(\w+)\s*(>=|<=|>|<|==|!=)\s*(.+)$/);
  if (compareMatch) {
    const [, varName, op, value] = compareMatch;
    const varValue = variables[varName];
    const compareValue = parseValue(value.trim());

    switch (op) {
      case ">=":
        return Number(varValue) >= Number(compareValue);
      case "<=":
        return Number(varValue) <= Number(compareValue);
      case ">":
        return Number(varValue) > Number(compareValue);
      case "<":
        return Number(varValue) < Number(compareValue);
      case "==":
        return String(varValue) === String(compareValue);
      case "!=":
        return String(varValue) !== String(compareValue);
    }
  }

  // 否定
  if (trimmed.startsWith("!")) {
    return !variables[trimmed.slice(1).trim()];
  }

  return false;
}

/**
 * 解析值
 */
function parseValue(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  // 去除引号
  if (value.startsWith('"') || value.startsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}

// ============================================================================
// 术语表
// ============================================================================

/**
 * 术语定义
 */
export interface GlossaryTerm {
  term: string;
  definition: string;
  aliases?: string[];
}

/**
 * 解析术语表
 *
 * 语法：
 * :::glossary
 * API
 * : Application Programming Interface
 * : 应用程序编程接口
 *
 * SDK
 * : Software Development Kit
 * :::
 */
export function parseGlossary(content: string): {
  terms: GlossaryTerm[];
  content: string;
} {
  const terms: GlossaryTerm[] = [];

  // 使用预编译正则
  content = content.replace(GLOSSARY_REGEX, (_, block) => {
    const lines = block.trim().split("\n");
    let currentTerm: GlossaryTerm | null = null;

    for (const line of lines) {
      if (line.startsWith(":")) {
        // 定义行
        if (currentTerm) {
          const def = line.slice(1).trim();
          if (!currentTerm.definition) {
            currentTerm.definition = def;
          } else {
            if (!currentTerm.aliases) currentTerm.aliases = [];
            currentTerm.aliases.push(def);
          }
        }
      } else if (line.trim()) {
        // 术语行
        if (currentTerm) {
          terms.push(currentTerm);
        }
        currentTerm = { term: line.trim(), definition: "" };
      }
    }

    if (currentTerm) {
      terms.push(currentTerm);
    }

    return `<!-- glossary: ${terms.length} terms -->`;
  });

  return { terms, content };
}

/**
 * 渲染术语表
 */
export function renderGlossary(terms: GlossaryTerm[]): string {
  if (terms.length === 0) return "";

  const sortedTerms = [...terms].sort((a, b) => a.term.localeCompare(b.term));

  const termsHtml = sortedTerms
    .map(
      (term) => `
        <dt id="glossary-${
        escapeHtml(term.term.toLowerCase().replace(/\s+/g, "-"))
      }">${escapeHtml(term.term)}</dt>
        <dd>${escapeHtml(term.definition)}</dd>
        ${
        term.aliases?.map((a) =>
          `<dd class="glossary-alias">${escapeHtml(a)}</dd>`
        ).join("") || ""
      }
      `,
    )
    .join("");

  return `<section class="glossary"><h2>术语表</h2><dl class="glossary-list">${termsHtml}</dl></section>`;
}

/**
 * 自动链接术语
 */
export function linkGlossaryTerms(
  content: string,
  terms: GlossaryTerm[],
): string {
  for (const term of terms) {
    const id = term.term.toLowerCase().replace(/\s+/g, "-");
    // 使用导入的 escapeRegExp 函数
    const regex = new RegExp(
      `\\b(${escapeRegExp(term.term)})\\b(?![^<]*>)`,
      "gi",
    );
    content = content.replace(
      regex,
      `<a href="#glossary-${escapeHtml(id)}" class="glossary-link" title="${
        escapeHtml(term.definition)
      }">$1</a>`,
    );
  }
  return content;
}

// ============================================================================
// API 文档格式化
// ============================================================================

/**
 * API 参数
 */
export interface ApiParam {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

/**
 * 解析 API 文档
 *
 * 语法：
 * :::api method=GET path="/users/:id"
 * @param id string required 用户 ID
 * @param fields string[] 返回字段
 * @returns User 用户对象
 * :::
 */
export function parseApiDoc(content: string): string {
  // 使用预编译正则
  return content.replace(API_DOC_REGEX, (_, meta, body) => {
    const method = meta.match(/method=(\w+)/)?.[1] || "GET";
    const path = meta.match(/path=["']([^"']+)["']/)?.[1] || "";

    const params: ApiParam[] = [];

    // 解析参数（使用预编译正则）
    body.replace(
      API_PARAM_REGEX,
      (
        _match: string,
        name: string,
        type: string,
        required: string,
        desc: string,
      ) => {
        params.push({
          name,
          type,
          required: !!required,
          description: desc.trim(),
        });
        return "";
      },
    );

    return renderApiDoc(method, path, params);
  });
}

/**
 * 渲染 API 文档
 */
function renderApiDoc(
  method: string,
  path: string,
  params: ApiParam[],
): string {
  const methodClass = `api-method api-${method.toLowerCase()}`;

  const paramsHtml = params.length > 0
    ? `<table class="api-params">
          <thead><tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
          <tbody>
            ${
      params
        .map(
          (p) =>
            `<tr><td><code>${escapeHtml(p.name)}</code></td><td><code>${
              escapeHtml(p.type)
            }</code></td><td>${p.required ? "✓" : ""}</td><td>${
              escapeHtml(p.description)
            }</td></tr>`,
        )
        .join("")
    }
          </tbody>
        </table>`
    : "";

  return `<div class="api-doc">
    <div class="api-header">
      <span class="${methodClass}">${method}</span>
      <code class="api-path">${escapeHtml(path)}</code>
    </div>
    ${paramsHtml}
  </div>`;
}

// ============================================================================
// 变更日志格式化
// ============================================================================

/**
 * 变更项
 */
export interface ChangelogItem {
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
  description: string;
}

/**
 * 解析变更日志
 *
 * 语法：
 * :::changelog version="1.0.0" date="2024-01-01"
 * - [Added] 新功能
 * - [Fixed] 修复问题
 * - [Changed] 变更内容
 * :::
 */
export function parseChangelog(content: string): string {
  // 使用预编译正则
  return content.replace(CHANGELOG_REGEX, (_, meta, body) => {
    const version = meta.match(/version=["']?([^"'\s]+)["']?/)?.[1] || "";
    const date = meta.match(/date=["']?([^"'\s]+)["']?/)?.[1] || "";

    const items: ChangelogItem[] = [];

    // 使用预编译正则
    body.replace(
      CHANGELOG_ITEM_REGEX,
      (_match: string, type: string, desc: string) => {
        items.push({
          type: type.toLowerCase() as ChangelogItem["type"],
          description: desc.trim(),
        });
        return "";
      },
    );

    return renderChangelog(version, date, items);
  });
}

/**
 * 渲染变更日志
 */
function renderChangelog(
  version: string,
  date: string,
  items: ChangelogItem[],
): string {
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item.description);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const typeLabels: Record<string, string> = {
    added: "新增",
    changed: "变更",
    deprecated: "废弃",
    removed: "移除",
    fixed: "修复",
    security: "安全",
  };

  const groupsHtml = Object.entries(groupedItems)
    .map(
      ([type, descs]) => `
        <div class="changelog-group changelog-${type}">
          <h4 class="changelog-type">${typeLabels[type] || type}</h4>
          <ul>
            ${descs.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
          </ul>
        </div>
      `,
    )
    .join("");

  return `<section class="changelog-entry" id="changelog-${version}">
    <h3 class="changelog-version">
      <span class="version-number">${escapeHtml(version)}</span>
      ${date ? `<span class="version-date">${escapeHtml(date)}</span>` : ""}
    </h3>
    ${groupsHtml}
  </section>`;
}

// ============================================================================
// 文档样式
// ============================================================================

/**
 * 获取文档样式
 */
export function getDocumentStyles(): string {
  return `
/* 术语表 */
.glossary { margin: 32px 0; }
.glossary-list { margin: 0; }
.glossary-list dt {
  font-weight: bold;
  margin-top: 16px;
  color: #1976d2;
}
.glossary-list dd { margin-left: 24px; margin-bottom: 8px; }
.glossary-alias { font-style: italic; color: #666; }
.glossary-link {
  text-decoration: underline dotted;
  color: inherit;
}
.glossary-link:hover { color: #1976d2; }

/* API 文档 */
.api-doc {
  margin: 16px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
.api-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}
.api-method {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.85em;
}
.api-get { background: #61affe; color: #fff; }
.api-post { background: #49cc90; color: #fff; }
.api-put { background: #fca130; color: #fff; }
.api-delete { background: #f93e3e; color: #fff; }
.api-patch { background: #50e3c2; color: #fff; }
.api-path { font-size: 1em; }
.api-params { width: 100%; border-collapse: collapse; }
.api-params th, .api-params td {
  padding: 8px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.api-params th { background: #fafafa; }

/* 变更日志 */
.changelog-entry { margin: 24px 0; }
.changelog-version {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.version-number {
  font-size: 1.2em;
  padding: 4px 12px;
  background: #e3f2fd;
  border-radius: 4px;
}
.version-date { color: #666; font-size: 0.9em; font-weight: normal; }
.changelog-group { margin: 12px 0; }
.changelog-type {
  font-size: 0.9em;
  margin-bottom: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
.changelog-added .changelog-type { background: #c8e6c9; color: #2e7d32; }
.changelog-changed .changelog-type { background: #fff3e0; color: #e65100; }
.changelog-deprecated .changelog-type { background: #f5f5f5; color: #616161; }
.changelog-removed .changelog-type { background: #ffebee; color: #c62828; }
.changelog-fixed .changelog-type { background: #e3f2fd; color: #1565c0; }
.changelog-security .changelog-type { background: #fce4ec; color: #c2185b; }
.changelog-group ul { margin: 0; padding-left: 24px; }
.changelog-group li { margin: 4px 0; }
`;
}
