/**
 * @module list
 *
 * 列表解析模块
 */

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================

/** 无序列表项正则 */
const UNORDERED_LIST_REGEX = /^(\s*)([-*+])\s+(.+)$/;
/** 有序列表项正则 */
const ORDERED_LIST_REGEX = /^(\s*)(\d+)\.\s+(.+)$/;
/** 任务列表项正则 */
const TASK_LIST_REGEX = /^\[([xX\s]?)\]\s+(.+)$/;

// ============================================================================
// 嵌套列表解析
// ============================================================================

/**
 * 解析嵌套列表
 *
 * 支持：
 * - 无序列表（-、*、+）
 * - 有序列表（1.、2.、...）
 * - 任务列表（- [ ]、- [x]）
 * - 多级嵌套
 *
 * @param html - HTML 字符串
 * @param gfm - 是否启用 GFM
 * @returns 处理后的 HTML
 */
export function parseNestedLists(html: string, gfm: boolean): string {
  const lines = html.split("\n");
  const result: string[] = [];
  const listStack: { type: "ul" | "ol"; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 匹配无序列表项（支持缩进）- 使用预编译正则
    const unorderedMatch = line.match(UNORDERED_LIST_REGEX);
    // 匹配有序列表项（支持缩进）- 使用预编译正则
    const orderedMatch = line.match(ORDERED_LIST_REGEX);

    if (unorderedMatch || orderedMatch) {
      const indent = (unorderedMatch || orderedMatch)![1].length;
      const content = (unorderedMatch || orderedMatch)![3];
      const listType: "ul" | "ol" = unorderedMatch ? "ul" : "ol";

      // 检查是否是任务列表项 - 使用预编译正则
      let listItem: string;
      if (gfm && unorderedMatch) {
        const taskMatch = content.match(TASK_LIST_REGEX);
        if (taskMatch) {
          const checked = taskMatch[1].toLowerCase() === "x";
          const taskContent = taskMatch[2];
          listItem = checked
            ? `<li class="task-item done"><input type="checkbox" checked disabled> ${taskContent}</li>`
            : `<li class="task-item"><input type="checkbox" disabled> ${taskContent}</li>`;
        } else {
          listItem = `<li>${content}</li>`;
        }
      } else {
        listItem = `<li>${content}</li>`;
      }

      // 管理列表栈
      if (listStack.length === 0) {
        // 开始新列表
        const className = gfm && listItem.includes("task-item")
          ? ' class="task-list"'
          : "";
        result.push(`<${listType}${className}>`);
        listStack.push({ type: listType, indent });
      } else {
        const currentLevel = listStack[listStack.length - 1];

        if (indent > currentLevel.indent) {
          // 进入更深层级
          const className = gfm && listItem.includes("task-item")
            ? ' class="task-list"'
            : "";
          result.push(`<${listType}${className}>`);
          listStack.push({ type: listType, indent });
        } else if (indent < currentLevel.indent) {
          // 返回更浅层级
          while (
            listStack.length > 0 &&
            listStack[listStack.length - 1].indent > indent
          ) {
            const closed = listStack.pop()!;
            result.push(`</${closed.type}>`);
          }

          // 如果类型不同，需要关闭并重新开始
          if (
            listStack.length > 0 &&
            listStack[listStack.length - 1].type !== listType
          ) {
            const closed = listStack.pop()!;
            result.push(`</${closed.type}>`);
            const className = gfm && listItem.includes("task-item")
              ? ' class="task-list"'
              : "";
            result.push(`<${listType}${className}>`);
            listStack.push({ type: listType, indent });
          }
        } else if (currentLevel.type !== listType) {
          // 同级但类型不同
          const closed = listStack.pop()!;
          result.push(`</${closed.type}>`);
          const className = gfm && listItem.includes("task-item")
            ? ' class="task-list"'
            : "";
          result.push(`<${listType}${className}>`);
          listStack.push({ type: listType, indent });
        }
      }

      result.push(listItem);
    } else {
      // 非列表项，关闭所有打开的列表
      while (listStack.length > 0) {
        const closed = listStack.pop()!;
        result.push(`</${closed.type}>`);
      }
      result.push(line);
    }
  }

  // 关闭剩余的列表
  while (listStack.length > 0) {
    const closed = listStack.pop()!;
    result.push(`</${closed.type}>`);
  }

  return result.join("\n");
}

// ============================================================================
// 定义列表解析
// ============================================================================

/**
 * 解析定义列表
 *
 * 语法：
 * ```
 * 术语
 * : 定义内容
 *
 * 另一个术语
 * : 定义 1
 * : 定义 2
 * ```
 *
 * @param html - HTML 字符串
 * @returns 处理后的 HTML
 */
export function parseDefinitionList(html: string): string {
  const lines = html.split("\n");
  const result: string[] = [];
  let inDefinitionList = false;
  let currentTerm = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || "";

    // 检查是否是定义项（以 : 开头的行）
    const definitionMatch = line.match(/^:\s+(.+)$/);

    if (definitionMatch) {
      // 这是一个定义
      if (!inDefinitionList) {
        // 开始新的定义列表
        result.push("<dl>");
        inDefinitionList = true;
      }

      // 如果有待处理的术语，先输出它
      if (currentTerm) {
        result.push(`<dt>${currentTerm}</dt>`);
        currentTerm = "";
      }

      result.push(`<dd>${definitionMatch[1]}</dd>`);
    } else if (
      nextLine.match(/^:\s+/) &&
      line.trim() &&
      !line.match(/^[#<>|\-*+\d]/)
    ) {
      // 当前行是术语（下一行是定义）
      if (!inDefinitionList) {
        result.push("<dl>");
        inDefinitionList = true;
      }

      // 如果有之前的术语未输出，先输出
      if (currentTerm) {
        result.push(`<dt>${currentTerm}</dt>`);
      }

      currentTerm = line.trim();
    } else {
      // 非定义列表内容
      if (inDefinitionList) {
        // 输出剩余的术语并关闭列表
        if (currentTerm) {
          result.push(`<dt>${currentTerm}</dt>`);
          currentTerm = "";
        }
        result.push("</dl>");
        inDefinitionList = false;
      }
      result.push(line);
    }
  }

  // 关闭未闭合的定义列表
  if (inDefinitionList) {
    if (currentTerm) {
      result.push(`<dt>${currentTerm}</dt>`);
    }
    result.push("</dl>");
  }

  return result.join("\n");
}
