# @dreamer/markdown 示例

本目录包含 `@dreamer/markdown` 包的使用示例。

## 示例列表

| 文件 | 说明 |
|------|------|
| [basic.ts](./basic.ts) | 基础渲染、解析选项、自定义高亮 |
| [front-matter.ts](./front-matter.ts) | YAML Front Matter 解析 |
| [toc.ts](./toc.ts) | 目录生成和导航渲染 |
| [gfm.ts](./gfm.ts) | GFM 功能：表格、任务列表、删除线、自动链接 |
| [advanced.ts](./advanced.ts) | 高级功能：脚注、数学公式、容器、上下标等 |
| [table.ts](./table.ts) | 表格增强：排序、搜索、合并、响应式 |
| [test-document.md](./test-document.md) | 完整语法测试文档 |
| [generate-html.ts](./generate-html.ts) | 生成 HTML 测试页面 |

## 运行示例

```bash
# 运行基础示例
deno run examples/basic.ts

# 运行 Front Matter 示例
deno run examples/front-matter.ts

# 运行目录示例
deno run examples/toc.ts

# 运行 GFM 示例
deno run examples/gfm.ts

# 运行高级功能示例
deno run examples/advanced.ts

# 运行表格增强示例
deno run -A examples/table.ts

# 生成完整语法测试 HTML
deno run -A examples/generate-html.ts
# 然后在浏览器中打开 examples/test-document.html
```

## 功能概览

### 基础功能

- Markdown 解析和渲染
- Front Matter 解析（YAML）
- 目录自动生成
- 自定义代码高亮

### GFM 扩展

- 表格（支持对齐）
- 任务列表
- 删除线
- 自动链接
- 换行处理

### 表格增强

- 单元格合并（rowspan/colspan）
- 可排序表格（点击表头排序）
- 响应式表格（移动端横向滚动）
- 表格搜索/过滤
- 从数据自动生成表格

### 高级功能

- 脚注（悬浮预览）
- 数学公式（LaTeX）
- 自定义容器（info/warning/danger/tip/details）
- 缩写定义
- 上标/下标
- 高亮文本
- Emoji 表情
- 键盘按键
- 搜索关键词高亮
