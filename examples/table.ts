/**
 * @fileoverview 表格增强功能示例
 *
 * 演示 @dreamer/markdown 的表格增强功能：
 * - 基础表格解析
 * - 单元格合并（rowspan/colspan）
 * - 可排序表格
 * - 响应式表格
 * - 表格搜索/过滤
 *
 * 运行命令：deno run -A examples/table.ts
 */

import {
  createTable,
  createTableFromData,
  getTableScript,
  getTableStyles,
  parseEnhancedTable,
  parseTable,
  type TableEnhanceOptions,
} from "../src/mod.ts";

// ============================================================================
// 基础表格解析
// ============================================================================

console.log("=== 基础表格解析 ===\n");

// 标准 GFM 表格
const basicMarkdown = `
| 姓名 | 年龄 | 城市 |
|:-----|:----:|-----:|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |
| 王五 | 28   | 广州 |
`;

console.log("输入 Markdown:");
console.log(basicMarkdown);

const basicHtml = parseTable(basicMarkdown);
console.log("输出 HTML:");
console.log(basicHtml);
console.log();

// ============================================================================
// 带选项的表格
// ============================================================================

console.log("=== 带选项的表格 ===\n");

// 启用排序和搜索
const options: TableEnhanceOptions = {
  sortable: true,
  searchable: true,
  searchPlaceholder: "搜索用户...",
  caption: "用户列表",
};

const sortableHtml = parseTable(basicMarkdown, options);
console.log("可排序可搜索表格:");
console.log(sortableHtml);
console.log();

// ============================================================================
// 增强语法表格
// ============================================================================

console.log("=== 增强语法表格 ===\n");

// 使用注释定义选项
const enhancedMarkdown = `
<!-- table: sortable, searchable, caption="产品列表" -->
| 产品 | 价格 | 库存 |
|:-----|-----:|:----:|
| 手机 | 2999 | 100  |
| 电脑 | 5999 | 50   |
| 平板 | 1999 | 200  |
`;

console.log("增强语法 Markdown:");
console.log(enhancedMarkdown);

const enhancedHtml = parseEnhancedTable(enhancedMarkdown);
console.log("输出 HTML:");
console.log(enhancedHtml);
console.log();

// ============================================================================
// 单元格合并
// ============================================================================

console.log("=== 单元格合并 ===\n");

// 横向合并示例
console.log("横向合并 (使用 || 标记):");
const colspanMarkdown = `
| 分类 | 周一 | 周二 | 周三 |
|:-----|:----:|:----:|:----:|
| 上午 | 数学 | ||   | ||   |
| 下午 | 语文 | 英语 | 体育 |
`;
console.log(colspanMarkdown);
console.log("解释：第一行的数学会横跨 3 列\n");

// 纵向合并示例
console.log("纵向合并 (使用 ^^ 标记):");
const rowspanMarkdown = `
| 部门 | 员工 | 职位 |
|:-----|:----:|:-----|
| 技术部 | 张三 | 工程师 |
| ^^   | 李四 | 经理   |
| 销售部 | 王五 | 销售   |
`;
console.log(rowspanMarkdown);
console.log("解释：技术部会纵向跨 2 行\n");

// ============================================================================
// 使用 createTable 创建表格
// ============================================================================

console.log("=== 使用 createTable 创建表格 ===\n");

const tableHtml = createTable(
  ["功能", "状态", "描述"],
  [
    ["响应式", "✅", "移动端自动横向滚动"],
    ["排序", "✅", "点击表头排序"],
    ["搜索", "✅", "实时过滤表格内容"],
    ["合并", "✅", "支持 rowspan/colspan"],
  ],
  {
    sortable: true,
    caption: "表格功能列表",
  },
);

console.log("createTable 输出:");
console.log(tableHtml);
console.log();

// ============================================================================
// 使用 createTableFromData 从数据创建表格
// ============================================================================

console.log("=== 使用 createTableFromData 从数据创建表格 ===\n");

// 用户数据
const users = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "编辑" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "用户" },
] as const;

const dataTableHtml = createTableFromData(
  users as unknown as Record<string, unknown>[],
  [
    { key: "id", label: "ID", align: "center" },
    { key: "name", label: "姓名" },
    { key: "email", label: "邮箱" },
    { key: "role", label: "角色", align: "center" },
  ],
  {
    sortable: true,
    searchable: true,
    searchPlaceholder: "搜索用户...",
  },
);

console.log("createTableFromData 输出:");
console.log(dataTableHtml);
console.log();

// ============================================================================
// 获取样式和脚本
// ============================================================================

console.log("=== 样式和脚本 ===\n");

const styles = getTableStyles();
console.log("表格样式（前 500 字符）:");
console.log(styles.substring(0, 500) + "...\n");

const script = getTableScript();
console.log("表格脚本（前 500 字符）:");
console.log(script.substring(0, 500) + "...\n");

// ============================================================================
// 完整 HTML 页面示例
// ============================================================================

console.log("=== 完整 HTML 页面示例 ===\n");

const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>表格增强示例</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #333; }
    ${styles}
  </style>
</head>
<body>
  <h1>表格增强示例</h1>
  
  <h2>可排序可搜索表格</h2>
  ${dataTableHtml}
  
  <h2>基础表格</h2>
  ${tableHtml}
  
  <script>
    ${script}
  </script>
</body>
</html>`;

console.log("完整 HTML 页面已生成");
console.log("页面长度:", fullHtml.length, "字符");
console.log();

// 保存示例文件
const outputPath = "./examples/table-demo.html";
try {
  await Deno.writeTextFile(outputPath, fullHtml);
  console.log(`已保存到: ${outputPath}`);
  console.log("可以在浏览器中打开查看效果");
} catch (error) {
  console.log("保存失败:", (error as Error).message);
}

console.log("\n=== 示例运行完成 ===");
