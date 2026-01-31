/**
 * 表格解析测试
 *
 * 包含功能：
 * - 基础表格解析
 * - 表格对齐
 * - 单元格合并（rowspan/colspan）
 * - 可排序表格
 * - 响应式表格
 * - 表格搜索/过滤
 */

import { describe, expect, it } from "@dreamer/test";
import {
  parseTableAlignment,
  parseTable,
  parseEnhancedTable,
  restoreEnhancedTable,
  parseTableOptions,
  parseCellMerge,
  processCellMerge,
  generateTableHtml,
  createTable,
  createTableFromData,
  getTableStyles,
  getTableScript,
} from "../src/table.ts";

describe("表格对齐解析", () => {
  it("应该解析左对齐", () => {
    expect(parseTableAlignment(":---")).toBe("left");
    expect(parseTableAlignment(":----")).toBe("left");
  });

  it("应该解析右对齐", () => {
    expect(parseTableAlignment("---:")).toBe("right");
    expect(parseTableAlignment("----:")).toBe("right");
  });

  it("应该解析居中对齐", () => {
    expect(parseTableAlignment(":---:")).toBe("center");
    expect(parseTableAlignment(":----:")).toBe("center");
  });

  it("应该解析默认对齐", () => {
    // 没有冒号时返回 null
    const result = parseTableAlignment("---");
    expect(result).toBeNull();
  });
});

describe("表格解析", () => {
  it("应该解析简单表格", () => {
    const content = `
| 标题 1 | 标题 2 |
| --- | --- |
| 单元格 1 | 单元格 2 |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain("<table");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
    expect(html).toContain("标题 1");
    expect(html).toContain("单元格 1");
  });

  it("应该解析带对齐的表格", () => {
    const content = `
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 左 | 中 | 右 |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain('text-align: left');
    expect(html).toContain('text-align: center');
    expect(html).toContain('text-align: right');
  });

  it("应该解析多行表格", () => {
    const content = `
| A | B |
| --- | --- |
| 1 | 2 |
| 3 | 4 |
| 5 | 6 |
    `.trim();
    const html = parseTable(content);
    expect(html.match(/<tr>/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("应该处理空单元格", () => {
    const content = `
| A | B |
| --- | --- |
|  | 值 |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain("<td");
    expect(html).toContain("值");
  });

  it("应该处理包含特殊字符的表格", () => {
    const content = `
| 特殊字符 | 值 |
| --- | --- |
| \`代码\` | **粗体** |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain("代码");
    expect(html).toContain("粗体");
  });

  it("应该处理不等列数的行", () => {
    const content = `
| A | B | C |
| --- | --- | --- |
| 1 | 2 |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain("<table");
  });
});

describe("表格样式", () => {
  it("应该生成带样式类的表格", () => {
    const content = `
| A | B |
| --- | --- |
| 1 | 2 |
    `.trim();
    const html = parseTable(content);
    expect(html).toContain("<table");
  });
});

// ============================================================================
// 单元格合并测试
// ============================================================================

describe("单元格合并标记解析", () => {
  it("应该识别横向合并标记 ||", () => {
    const result = parseCellMerge("||");
    expect(result.mergeRight).toBe(true);
    expect(result.mergeDown).toBe(false);
    expect(result.content).toBe("");
  });

  it("应该识别横向合并标记 >", () => {
    const result = parseCellMerge(">");
    expect(result.mergeRight).toBe(true);
    expect(result.mergeDown).toBe(false);
  });

  it("应该识别横向合并标记 >>", () => {
    const result = parseCellMerge(">>");
    expect(result.mergeRight).toBe(true);
    expect(result.mergeDown).toBe(false);
  });

  it("应该识别纵向合并标记 ^^", () => {
    const result = parseCellMerge("^^");
    expect(result.mergeRight).toBe(false);
    expect(result.mergeDown).toBe(true);
    expect(result.content).toBe("");
  });

  it("应该识别纵向合并标记 ^", () => {
    const result = parseCellMerge("^");
    expect(result.mergeRight).toBe(false);
    expect(result.mergeDown).toBe(true);
  });

  it("应该处理普通内容", () => {
    const result = parseCellMerge("普通文本");
    expect(result.mergeRight).toBe(false);
    expect(result.mergeDown).toBe(false);
    expect(result.content).toBe("普通文本");
  });

  it("应该处理带空格的内容", () => {
    const result = parseCellMerge("  内容  ");
    expect(result.content).toBe("内容");
  });
});

describe("单元格合并处理", () => {
  it("应该处理横向合并", () => {
    const rows = [
      ["A", "||", "||"],
      ["1", "2", "3"],
    ];
    const result = processCellMerge(rows);

    // 第一行第一个单元格应该有 colspan=3
    expect(result[0][0].colspan).toBe(3);
    expect(result[0][1].merged).toBe(true);
    expect(result[0][2].merged).toBe(true);
  });

  it("应该处理纵向合并", () => {
    const rows = [
      ["A", "B"],
      ["^^", "C"],
      ["^^", "D"],
    ];
    const result = processCellMerge(rows);

    // 第一行第一个单元格应该有 rowspan=3
    expect(result[0][0].rowspan).toBe(3);
    expect(result[1][0].merged).toBe(true);
    expect(result[2][0].merged).toBe(true);
  });

  it("应该处理混合合并", () => {
    const rows = [
      ["A", "||"],
      ["^^", "B"],
    ];
    const result = processCellMerge(rows);

    // A 横向合并
    expect(result[0][0].colspan).toBe(2);
    // A 纵向合并
    expect(result[0][0].rowspan).toBe(2);
  });
});

// ============================================================================
// 表格选项解析测试
// ============================================================================

describe("表格选项解析", () => {
  it("应该解析 sortable 选项", () => {
    const options = parseTableOptions("sortable");
    expect(options.sortable).toBe(true);
  });

  it("应该解析 searchable 选项", () => {
    const options = parseTableOptions("searchable");
    expect(options.searchable).toBe(true);
  });

  it("应该解析多个布尔选项", () => {
    const options = parseTableOptions("sortable, searchable, striped, hover");
    expect(options.sortable).toBe(true);
    expect(options.searchable).toBe(true);
    expect(options.striped).toBe(true);
    expect(options.hover).toBe(true);
  });

  it("应该解析否定选项", () => {
    const options = parseTableOptions("no-responsive, no-striped, no-hover");
    expect(options.responsive).toBe(false);
    expect(options.striped).toBe(false);
    expect(options.hover).toBe(false);
  });

  it("应该解析 caption 选项", () => {
    const options = parseTableOptions('caption="用户列表"');
    expect(options.caption).toBe("用户列表");
  });

  it("应该解析 caption 选项（单引号）", () => {
    const options = parseTableOptions("caption='产品目录'");
    expect(options.caption).toBe("产品目录");
  });

  it("应该解析 class 选项", () => {
    const options = parseTableOptions('class="my-table custom"');
    expect(options.className).toBe("my-table custom");
  });

  it("应该解析 placeholder 选项", () => {
    const options = parseTableOptions('placeholder="搜索..."');
    expect(options.searchPlaceholder).toBe("搜索...");
  });

  it("应该解析复杂选项组合", () => {
    const options = parseTableOptions(
      'sortable, searchable, caption="数据表", class="data-table"'
    );
    expect(options.sortable).toBe(true);
    expect(options.searchable).toBe(true);
    expect(options.caption).toBe("数据表");
    expect(options.className).toBe("data-table");
  });
});

// ============================================================================
// 增强表格解析测试
// ============================================================================

describe("增强表格解析", () => {
  it("应该解析带选项注释的表格", () => {
    const content = `
<!-- table: sortable, searchable -->
| A | B |
| --- | --- |
| 1 | 2 |
    `.trim();
    // parseEnhancedTable 返回占位符，需要 restoreEnhancedTable 恢复
    const placeholder = parseEnhancedTable(content);
    const html = restoreEnhancedTable(placeholder);

    expect(html).toContain("md-table-sortable");
    expect(html).toContain("md-table-searchable");
    expect(html).toContain("md-table-search-input");
    expect(html).toContain("data-sort-col");
  });

  it("应该解析带标题的表格", () => {
    const content = `
<!-- table: caption="测试表格" -->
| A | B |
| --- | --- |
| 1 | 2 |
    `.trim();
    // parseEnhancedTable 返回占位符，需要 restoreEnhancedTable 恢复
    const placeholder = parseEnhancedTable(content);
    const html = restoreEnhancedTable(placeholder);

    expect(html).toContain("<caption>测试表格</caption>");
  });

  it("应该保留普通表格（无选项注释由 parse 函数处理）", () => {
    const content = `
| A | B |
| --- | --- |
| 1 | 2 |
    `.trim();
    // parseEnhancedTable 只处理带 <!-- table: options --> 的表格
    // 普通表格保持原样，由 parse() 函数处理
    const result = parseEnhancedTable(content);

    // 普通表格应该保持 Markdown 格式，不被转换
    expect(result).toContain("| A | B |");
  });
});

// ============================================================================
// 表格 HTML 生成测试
// ============================================================================

describe("表格 HTML 生成", () => {
  it("应该生成响应式包装", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }, { content: "B" }],
      rows: [[{ content: "1" }, { content: "2" }]],
      alignments: [null, null],
      options: { responsive: true },
    });

    expect(html).toContain('class="md-table-responsive"');
  });

  it("应该生成斑马条纹类", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }],
      rows: [[{ content: "1" }]],
      alignments: [null],
      options: { striped: true },
    });

    expect(html).toContain("md-table-striped");
  });

  it("应该生成悬停类", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }],
      rows: [[{ content: "1" }]],
      alignments: [null],
      options: { hover: true },
    });

    expect(html).toContain("md-table-hover");
  });

  it("应该生成排序属性", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }, { content: "B" }],
      rows: [[{ content: "1" }, { content: "2" }]],
      alignments: [null, null],
      options: { sortable: true },
    });

    expect(html).toContain("md-table-sortable");
    expect(html).toContain('data-sort-col="0"');
    expect(html).toContain('data-sort-col="1"');
    expect(html).toContain('data-sort-dir="none"');
    expect(html).toContain('class="sort-icon"');
  });

  it("应该生成搜索框", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }],
      rows: [[{ content: "1" }]],
      alignments: [null],
      options: { searchable: true, searchPlaceholder: "搜索..." },
    });

    expect(html).toContain("md-table-search");
    expect(html).toContain("md-table-search-input");
    expect(html).toContain('placeholder="搜索..."');
  });

  it("应该生成自定义类名", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }],
      rows: [[{ content: "1" }]],
      alignments: [null],
      options: { className: "my-custom-table" },
    });

    expect(html).toContain("my-custom-table");
  });

  it("应该生成表格标题", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }],
      rows: [[{ content: "1" }]],
      alignments: [null],
      options: { caption: "数据表格" },
    });

    expect(html).toContain("<caption>数据表格</caption>");
  });

  it("应该生成对齐样式", () => {
    const html = generateTableHtml({
      headers: [
        { content: "左", align: "left" },
        { content: "中", align: "center" },
        { content: "右", align: "right" },
      ],
      rows: [
        [
          { content: "1", align: "left" },
          { content: "2", align: "center" },
          { content: "3", align: "right" },
        ],
      ],
      alignments: ["left", "center", "right"],
      options: {},
    });

    expect(html).toContain('style="text-align: left"');
    expect(html).toContain('style="text-align: center"');
    expect(html).toContain('style="text-align: right"');
  });

  it("应该生成合并属性", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }, { content: "B" }],
      rows: [
        [
          { content: "合并", colspan: 2, rowspan: 1 },
          { content: "", merged: true },
        ],
      ],
      alignments: [null, null],
      options: {},
    });

    expect(html).toContain('colspan="2"');
  });

  it("应该跳过被合并的单元格", () => {
    const html = generateTableHtml({
      headers: [{ content: "A" }, { content: "B" }],
      rows: [
        [
          { content: "合并", colspan: 2 },
          { content: "被跳过", merged: true },
        ],
      ],
      alignments: [null, null],
      options: {},
    });

    expect(html).not.toContain("被跳过");
  });
});

// ============================================================================
// createTable 测试
// ============================================================================

describe("createTable 函数", () => {
  it("应该创建基础表格", () => {
    const html = createTable(["A", "B"], [["1", "2"], ["3", "4"]]);

    expect(html).toContain("<table");
    expect(html).toContain("<th>A</th>");
    expect(html).toContain("<th>B</th>");
    expect(html).toContain("<td>1</td>");
    expect(html).toContain("<td>2</td>");
    expect(html).toContain("<td>3</td>");
    expect(html).toContain("<td>4</td>");
  });

  it("应该应用默认选项", () => {
    const html = createTable(["A"], [["1"]]);

    expect(html).toContain("md-table-responsive");
    expect(html).toContain("md-table-striped");
    expect(html).toContain("md-table-hover");
  });

  it("应该支持自定义选项", () => {
    const html = createTable(["A"], [["1"]], {
      sortable: true,
      caption: "测试表",
    });

    expect(html).toContain("md-table-sortable");
    expect(html).toContain("<caption>测试表</caption>");
  });

  it("应该处理空数据", () => {
    const html = createTable(["A", "B"], []);

    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody></tbody>");
  });
});

// ============================================================================
// createTableFromData 测试
// ============================================================================

describe("createTableFromData 函数", () => {
  it("应该从对象数组创建表格", () => {
    const data = [
      { name: "张三", age: 25 },
      { name: "李四", age: 30 },
    ];
    const html = createTableFromData(data as unknown as Record<string, unknown>[]);

    expect(html).toContain("<th>name</th>");
    expect(html).toContain("<th>age</th>");
    expect(html).toContain("<td>张三</td>");
    expect(html).toContain("<td>25</td>");
  });

  it("应该支持自定义列定义", () => {
    const data = [
      { name: "张三", age: 25 },
    ];
    const html = createTableFromData(
      data as unknown as Record<string, unknown>[],
      [
        { key: "name", label: "姓名" },
        { key: "age", label: "年龄", align: "right" },
      ]
    );

    expect(html).toContain("<th>姓名</th>");
    expect(html).toContain('<th style="text-align: right"');
    expect(html).toContain("年龄");
  });

  it("应该处理空数据", () => {
    const html = createTableFromData([]);

    expect(html).toContain("暂无数据");
  });

  it("应该支持选项", () => {
    const data = [{ id: 1 }];
    const html = createTableFromData(
      data as unknown as Record<string, unknown>[],
      undefined,
      { sortable: true, caption: "ID 列表" }
    );

    expect(html).toContain("md-table-sortable");
    expect(html).toContain("<caption>ID 列表</caption>");
  });
});

// ============================================================================
// 样式和脚本测试
// ============================================================================

describe("表格样式", () => {
  it("应该返回 CSS 样式", () => {
    const styles = getTableStyles();

    expect(styles).toContain(".md-table-responsive");
    expect(styles).toContain(".md-table");
    expect(styles).toContain(".md-table-striped");
    expect(styles).toContain(".md-table-hover");
    expect(styles).toContain(".md-table-sortable");
    expect(styles).toContain(".md-table-search");
  });

  it("应该包含响应式媒体查询", () => {
    const styles = getTableStyles();

    expect(styles).toContain("@media");
    expect(styles).toContain("max-width: 768px");
  });

  it("应该包含暗色主题样式", () => {
    const styles = getTableStyles();

    expect(styles).toContain("prefers-color-scheme: dark");
  });
});

describe("表格脚本", () => {
  it("应该返回 JavaScript 代码", () => {
    const script = getTableScript();

    expect(script).toContain("function");
    expect(script).toContain("initTables");
  });

  it("应该包含排序功能", () => {
    const script = getTableScript();

    expect(script).toContain("initSortable");
    expect(script).toContain("sortTable");
    expect(script).toContain("data-sort-col");
  });

  it("应该包含搜索功能", () => {
    const script = getTableScript();

    expect(script).toContain("initSearchable");
    expect(script).toContain("md-table-search-input");
  });

  it("应该包含响应式检测", () => {
    const script = getTableScript();

    expect(script).toContain("md-table-responsive");
    expect(script).toContain("scrollWidth");
  });
});

// ============================================================================
// 集成测试
// ============================================================================

describe("表格增强集成测试", () => {
  it("应该正确解析完整的增强表格", () => {
    const markdown = `
<!-- table: sortable, searchable, caption="用户数据" -->
| 姓名 | 年龄 | 城市 |
|:-----|:----:|-----:|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |
    `.trim();

    // parseEnhancedTable 返回占位符，需要 restoreEnhancedTable 恢复
    const placeholder = parseEnhancedTable(markdown);
    const html = restoreEnhancedTable(placeholder);

    // 验证基本结构
    expect(html).toContain("<table");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");

    // 验证选项
    expect(html).toContain("md-table-sortable");
    expect(html).toContain("md-table-searchable");
    expect(html).toContain("<caption>用户数据</caption>");

    // 验证对齐
    expect(html).toContain('text-align: left');
    expect(html).toContain('text-align: center');
    expect(html).toContain('text-align: right');

    // 验证内容
    expect(html).toContain("张三");
    expect(html).toContain("北京");
  });

  it("应该生成可用的完整 HTML", () => {
    const tableHtml = createTable(
      ["功能", "状态"],
      [["排序", "✅"], ["搜索", "✅"]],
      { sortable: true }
    );

    const styles = getTableStyles();
    const script = getTableScript();

    // 验证所有部分都存在
    expect(tableHtml.length).toBeGreaterThan(0);
    expect(styles.length).toBeGreaterThan(0);
    expect(script.length).toBeGreaterThan(0);

    // 验证 ID 一致性
    const idMatch = tableHtml.match(/id="(table-[^"]+)"/);
    expect(idMatch).not.toBeNull();
  });
});
