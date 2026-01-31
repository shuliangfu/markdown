/**
 * @fileoverview GFM (GitHub Flavored Markdown) 功能示例
 *
 * 展示 GFM 扩展功能：表格、任务列表、删除线、自动链接等
 */

import { render } from "../src/mod.ts";

// ============================================================================
// 表格
// ============================================================================

console.log("=== GFM 表格 ===\n");

const tableMarkdown = `
## 表格示例

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |
| 王五 | 28 | 广州 |

### 带对齐的表格

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 文本 | 文本 | 文本 |
| 左 | 中 | 右 |
`;

const tableResult = render(tableMarkdown, { gfm: true });
console.log("表格 HTML:");
console.log(tableResult.html);

// ============================================================================
// 任务列表
// ============================================================================

console.log("\n=== GFM 任务列表 ===\n");

const taskListMarkdown = `
## 待办事项

- [x] 完成需求分析
- [x] 编写技术方案
- [ ] 开发功能模块
- [ ] 编写单元测试
- [ ] 代码审查
- [ ] 部署上线

### 嵌套任务

- [x] 项目初始化
  - [x] 创建仓库
  - [x] 配置 CI/CD
  - [ ] 编写 README
- [ ] 功能开发
  - [ ] 用户模块
  - [ ] 订单模块
`;

const taskResult = render(taskListMarkdown, { gfm: true });
console.log("任务列表 HTML:");
console.log(taskResult.html);

// ============================================================================
// 删除线
// ============================================================================

console.log("\n=== GFM 删除线 ===\n");

const strikethroughMarkdown = `
## 删除线示例

这是 ~~被删除的文本~~，这是正常文本。

~~整行被删除~~

价格：~~¥199~~ ¥99
`;

const strikeResult = render(strikethroughMarkdown, { gfm: true });
console.log("删除线 HTML:");
console.log(strikeResult.html);

// ============================================================================
// 自动链接
// ============================================================================

console.log("\n=== GFM 自动链接 ===\n");

const autoLinkMarkdown = `
## 自动链接

访问我们的网站：https://example.com

联系邮箱：support@example.com

GitHub 仓库：https://github.com/user/repo

带参数的链接：https://example.com/search?q=test&page=1
`;

const autoLinkResult = render(autoLinkMarkdown, {
  gfm: true,
  autolink: true,
});
console.log("自动链接 HTML:");
console.log(autoLinkResult.html);

// ============================================================================
// 换行处理
// ============================================================================

console.log("\n=== GFM 换行 ===\n");

const breaksMarkdown = `
## 换行示例

这是第一行
这是第二行
这是第三行

上面的换行会被转换为 <br> 标签。
`;

// 启用 breaks 选项
const breaksResult = render(breaksMarkdown, {
  gfm: true,
  breaks: true,
});
console.log("启用 breaks 的 HTML:");
console.log(breaksResult.html);

// 不启用 breaks
const noBreaksResult = render(breaksMarkdown, {
  gfm: true,
  breaks: false,
});
console.log("\n不启用 breaks 的 HTML:");
console.log(noBreaksResult.html);

// ============================================================================
// 综合示例
// ============================================================================

console.log("\n=== GFM 综合示例 ===\n");

const fullGfmMarkdown = `
# 项目进度报告

## 概述

项目地址：https://github.com/example/project

联系我们：team@example.com

## 功能进度

| 功能 | 状态 | 负责人 |
|------|:----:|--------|
| 用户认证 | ✅ | 张三 |
| 数据存储 | ✅ | 李四 |
| API 接口 | 🚧 | 王五 |
| 前端界面 | ❌ | 待定 |

## 任务清单

- [x] 需求分析
- [x] 技术选型
- [x] 数据库设计
- [ ] 后端开发
  - [x] 用户模块
  - [ ] 订单模块
  - [ ] 支付模块
- [ ] 前端开发
- [ ] 测试
- [ ] 部署

## 变更记录

- ~~v0.1: 使用 MongoDB~~ → v0.2: 改用 PostgreSQL
- ~~旧的 API 设计~~ → 新的 RESTful 设计
`;

const fullResult = render(fullGfmMarkdown, {
  gfm: true,
  breaks: true,
  autolink: true,
});

console.log("完整 GFM 渲染结果:");
console.log(fullResult.html);
