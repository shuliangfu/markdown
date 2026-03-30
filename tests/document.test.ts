/**
 * 文档功能测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  applyVariables,
  getDocumentStyles,
  linkGlossaryTerms,
  parseApiDoc,
  parseChangelog,
  parseConditional,
  parseGlossary,
  parseVariableDefinitions,
  renderGlossary,
} from "../src/document.ts";

describe("变量定义", () => {
  it("应该解析单行变量定义", () => {
    // 语法: @define(varName, value)
    const content = `@define(name, 张三)
@define(version, 1.0.0)
Hello {{name}}!`;
    const { variables, content: result } = parseVariableDefinitions(content);
    expect(variables.name).toBe("张三");
    expect(variables.version).toBe("1.0.0");
    expect(result).not.toContain("@define");
  });

  it("应该解析块变量定义", () => {
    // 语法: :::define...:::
    const content = `:::define
name: 李四
version: 2.0.0
:::
Hello {{name}}!`;
    const { variables, content: result } = parseVariableDefinitions(content);
    expect(variables.name).toBe("李四");
    expect(variables.version).toBe("2.0.0");
    expect(result).not.toContain(":::define");
  });
});

describe("变量应用", () => {
  it("应该替换变量", () => {
    const content = "欢迎 {{name}}，版本 {{version}}";
    const variables = { name: "用户", version: "2.0" };
    const result = applyVariables(content, variables);
    expect(result).toBe("欢迎 用户，版本 2.0");
  });

  it("应该保留未定义变量", () => {
    const content = "{{defined}} 和 {{undefined}}";
    const result = applyVariables(content, { defined: "值" });
    expect(result).toBe("值 和 {{undefined}}");
  });

  it("应该使用默认值", () => {
    const content = '{{name | default: "默认名称"}}';
    const result = applyVariables(content, {});
    expect(result).toBe("默认名称");
  });
});

describe("条件渲染", () => {
  it("应该渲染满足条件的内容", () => {
    // 语法: @if(condition)...@endif
    const content = `@if(version >= 2.0)
新功能说明
@endif`;
    const result = parseConditional(content, { version: 2.5 });
    expect(result).toContain("新功能说明");
  });

  it("应该不渲染不满足条件的内容", () => {
    const content = `@if(version >= 2.0)
新功能说明
@endif`;
    const result = parseConditional(content, { version: 1.5 });
    expect(result).not.toContain("新功能说明");
  });

  it("应该支持字符串比较", () => {
    const content = `@if(env == "production")
生产环境配置
@endif`;
    const result = parseConditional(content, { env: "production" });
    expect(result).toContain("生产环境配置");
  });

  it("应该支持布尔条件", () => {
    const content = `@if(enabled)
启用的功能
@endif`;
    const result = parseConditional(content, { enabled: true });
    expect(result).toContain("启用的功能");
  });

  it("应该支持 else 分支", () => {
    const content = `@if(premium)
高级功能
@else
免费功能
@endif`;
    const result = parseConditional(content, { premium: false });
    expect(result).toContain("免费功能");
    expect(result).not.toContain("高级功能");
  });
});

describe("术语表", () => {
  it("应该解析术语表", () => {
    // 语法: :::glossary...:::
    const content = `:::glossary
API
: Application Programming Interface
:::`;
    const { terms, content: result } = parseGlossary(content);
    expect(terms.length).toBeGreaterThan(0);
    expect(terms[0].term).toBe("API");
    expect(result).not.toContain(":::glossary");
  });

  it("应该渲染术语列表", () => {
    const terms = [
      { term: "HTML", definition: "HyperText Markup Language" },
      { term: "CSS", definition: "Cascading Style Sheets" },
    ];
    const html = renderGlossary(terms);
    expect(html).toContain("glossary");
    expect(html).toContain("HTML");
    expect(html).toContain("HyperText Markup Language");
  });

  it("应该链接术语到定义", () => {
    const content = "<p>使用 HTML 构建网页</p>";
    const terms = [{ term: "HTML", definition: "HyperText Markup Language" }];
    const result = linkGlossaryTerms(content, terms);
    expect(result).toContain("glossary-link");
  });
});

describe("API 文档", () => {
  it("应该解析 API 文档", () => {
    // 语法: :::api method=GET path="/users"
    const content = `:::api method=GET path="/users"
@param page number 页码
:::`;
    const html = parseApiDoc(content);
    expect(html).toContain("api");
    expect(html).toContain("GET");
    expect(html).toContain("/users");
  });
});

describe("更新日志", () => {
  it("应该解析更新日志", () => {
    // 语法: :::changelog version="1.0.0" date="2024-01-01"
    const content = `:::changelog version="1.0.0" date="2024-01-01"
- [Added] 新功能
- [Fixed] 修复问题
:::`;
    const html = parseChangelog(content);
    expect(html).toContain("changelog");
    expect(html).toContain("1.0.0");
  });
});

describe("文档样式", () => {
  it("应该返回文档样式", () => {
    const styles = getDocumentStyles();
    expect(styles).toContain(".glossary");
    expect(styles).toContain(".api-doc");
    expect(styles).toContain(".changelog");
  });
});
