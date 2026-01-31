/**
 * @module interactive
 *
 * 交互功能模块
 *
 * 支持：
 * - 脚注悬浮预览
 * - 锚点平滑滚动
 * - 搜索关键词高亮
 * - 目录树导航（带激活状态）
 */

import type { TocItem } from "./types.ts";
import { escapeHtml } from "./utils.ts";

// ============================================================================
// 脚注悬浮预览
// ============================================================================

/**
 * 增强脚注支持悬浮预览
 *
 * @param html - HTML 内容
 * @returns 增强后的 HTML
 */
export function enhanceFootnotes(html: string): string {
  // 提取脚注内容
  const footnoteContents = new Map<string, string>();

  html.replace(
    /<li id="fn-([^"]+)">([^<]+)/g,
    (_, id, content) => {
      footnoteContents.set(id, content.trim());
      return "";
    }
  );

  // 增强脚注引用
  return html.replace(
    /<sup class="footnote-ref"><a href="#fn-([^"]+)"([^>]*)>([^<]+)<\/a><\/sup>/g,
    (_, id, attrs, text) => {
      const content = footnoteContents.get(id) || "";
      return `<sup class="footnote-ref footnote-hover" data-footnote="${escapeHtml(content)}"><a href="#fn-${id}"${attrs}>${text}</a><span class="footnote-tooltip">${escapeHtml(content)}</span></sup>`;
    }
  );
}

// ============================================================================
// 锚点平滑滚动
// ============================================================================

/**
 * 生成平滑滚动脚本
 */
export function getSmoothScrollScript(): string {
  return `
<script>
// 平滑滚动到锚点
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // 更新 URL
        history.pushState(null, null, this.getAttribute('href'));
      }
    });
  });
});
</script>`;
}

// ============================================================================
// 搜索关键词高亮
// ============================================================================

/**
 * 高亮搜索关键词
 *
 * @param html - HTML 内容
 * @param keywords - 关键词列表
 * @param options - 选项
 * @returns 高亮后的 HTML
 */
export function highlightKeywords(
  html: string,
  keywords: string[],
  options: {
    /** 是否区分大小写 */
    caseSensitive?: boolean;
    /** 高亮类名 */
    className?: string;
    /** 高亮标签 */
    tag?: string;
  } = {}
): string {
  const { caseSensitive = false, className = "search-highlight", tag = "mark" } = options;

  for (const keyword of keywords) {
    if (!keyword.trim()) continue;

    const flags = caseSensitive ? "g" : "gi";
    // 避免在标签内替换
    const regex = new RegExp(
      `(?<![<][^>]*)\\b(${escapeRegExpForSearch(keyword)})\\b(?![^<]*[>])`,
      flags
    );

    html = html.replace(
      regex,
      `<${tag} class="${className}">$1</${tag}>`
    );
  }

  return html;
}

/**
 * 转义正则表达式特殊字符（用于搜索）
 */
function escapeRegExpForSearch(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 生成搜索高亮脚本
 *
 * 使用 TreeWalker 遍历文本节点，避免 innerHTML XSS 风险
 */
export function getSearchHighlightScript(): string {
  return `<script>
function highlightSearch(keyword) {
  if (!keyword) { clearHighlight(); return; }
  // 安全检查：限制关键词长度，防止 ReDoS
  if (keyword.length > 100) { keyword = keyword.slice(0, 100); }
  
  var content = document.querySelector('.markdown-body, article, main, body');
  if (!content) return;
  
  // 转义正则特殊字符
  var escaped = keyword.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
  var regex = new RegExp('(' + escaped + ')', 'gi');
  
  // 使用 TreeWalker 遍历文本节点，避免 innerHTML XSS
  var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
  var textNodes = [];
  var node;
  while (node = walker.nextNode()) {
    if (regex.test(node.textContent)) {
      textNodes.push(node);
      regex.lastIndex = 0; // 重置正则状态
    }
  }
  
  // 高亮文本节点
  textNodes.forEach(function(textNode) {
    var text = textNode.textContent;
    var parts = text.split(regex);
    if (parts.length <= 1) return;
    
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // 普通文本
        if (parts[i]) fragment.appendChild(document.createTextNode(parts[i]));
      } else {
        // 匹配的关键词
        var mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = parts[i];
        fragment.appendChild(mark);
      }
    }
    textNode.parentNode.replaceChild(fragment, textNode);
  });
}
function clearHighlight() {
  document.querySelectorAll('.search-highlight').forEach(function(el) {
    el.parentNode.replaceChild(document.createTextNode(el.textContent), el);
  });
}
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || params.get('search');
  if (query) { highlightSearch(query); }
});
<\/script>`;
}

// ============================================================================
// 目录树导航
// ============================================================================

/**
 * 渲染目录树导航
 *
 * @param toc - 目录结构
 * @param options - 选项
 * @returns HTML 字符串
 */
export function renderTocNavigation(
  toc: TocItem[],
  options: {
    /** 最大深度 */
    maxDepth?: number;
    /** 是否可折叠 */
    collapsible?: boolean;
    /** 是否显示编号 */
    numbered?: boolean;
    /** CSS 类名 */
    className?: string;
  } = {}
): string {
  const {
    maxDepth = 3,
    collapsible = false,
    numbered = false,
    className = "toc-nav",
  } = options;

  const counter = [0, 0, 0, 0, 0, 0];

  function renderItems(items: TocItem[], depth: number): string {
    if (depth > maxDepth || items.length === 0) return "";

    const itemsHtml = items
      .map((item, _index) => {
        // 更新计数器
        counter[depth - 1]++;
        for (let i = depth; i < 6; i++) counter[i] = 0;

        const number = numbered
          ? `<span class="toc-number">${counter.slice(0, depth).filter(n => n > 0).join(".")}</span>`
          : "";

        const childrenHtml = renderItems(item.children, depth + 1);
        const hasChildren = item.children.length > 0;

        if (collapsible && hasChildren) {
          return `<li class="toc-item toc-level-${depth}">
            <details>
              <summary>
                <a href="#${item.id}" class="toc-link" data-toc-id="${item.id}">${number}${escapeHtml(item.text)}</a>
              </summary>
              ${childrenHtml}
            </details>
          </li>`;
        }

        return `<li class="toc-item toc-level-${depth}">
          <a href="#${item.id}" class="toc-link" data-toc-id="${item.id}">${number}${escapeHtml(item.text)}</a>
          ${childrenHtml}
        </li>`;
      })
      .join("");

    return `<ul class="toc-list">${itemsHtml}</ul>`;
  }

  const tocHtml = renderItems(toc, 1);
  return `<nav class="${className}">${tocHtml}</nav>`;
}

/**
 * 生成目录激活状态脚本
 */
export function getTocActiveScript(): string {
  return `
<script>
// 目录激活状态
document.addEventListener('DOMContentLoaded', function() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'));
  
  if (tocLinks.length === 0 || headings.length === 0) return;
  
  function updateActiveLink() {
    const scrollPos = window.scrollY + 100;
    let activeId = headings[0]?.id;
    
    for (const heading of headings) {
      if (heading.offsetTop <= scrollPos) {
        activeId = heading.id;
      }
    }
    
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.tocId === activeId) {
        link.classList.add('active');
        // 确保可见
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();
});
</script>`;
}

// ============================================================================
// 返回顶部
// ============================================================================

/**
 * 渲染返回顶部按钮
 */
export function renderBackToTop(): string {
  return `<button type="button" class="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="返回顶部">↑</button>`;
}

/**
 * 生成返回顶部脚本
 */
export function getBackToTopScript(): string {
  return `
<script>
// 返回顶部按钮显示/隐藏
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
});
</script>`;
}

// ============================================================================
// 阅读进度条
// ============================================================================

/**
 * 渲染阅读进度条
 */
export function renderReadingProgress(): string {
  return `<div class="reading-progress"><div class="reading-progress-bar"></div></div>`;
}

/**
 * 生成阅读进度条脚本
 */
export function getReadingProgressScript(): string {
  return `
<script>
// 阅读进度条
document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.querySelector('.reading-progress-bar');
  if (!progressBar) return;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  });
});
</script>`;
}

// ============================================================================
// 交互样式
// ============================================================================

/**
 * 获取交互功能样式
 */
export function getInteractiveStyles(): string {
  return `
/* 脚注悬浮预览 */
.footnote-hover {
  position: relative;
  cursor: pointer;
}
.footnote-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #333;
  color: #fff;
  font-size: 0.85em;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 300px;
  z-index: 100;
}
.footnote-hover:hover .footnote-tooltip {
  display: block;
}
.footnote-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
}

/* 搜索高亮 */
.search-highlight {
  background: #fff59d;
  padding: 0 2px;
  border-radius: 2px;
}

/* 目录导航 */
.toc-nav {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}
.toc-list { list-style: none; padding-left: 0; margin: 0; }
.toc-list .toc-list { padding-left: 16px; margin-top: 4px; }
.toc-item { margin: 4px 0; }
.toc-link {
  display: block;
  padding: 4px 8px;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9em;
}
.toc-link:hover { background: #e0e0e0; color: #333; }
.toc-link.active {
  background: #2196f3;
  color: #fff;
}
.toc-number {
  margin-right: 8px;
  color: #999;
}

/* 返回顶部 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2196f3;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 20px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 1000;
}
.back-to-top.visible {
  opacity: 1;
  visibility: visible;
}
.back-to-top:hover {
  background: #1976d2;
  transform: translateY(-2px);
}

/* 阅读进度条 */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e0e0e0;
  z-index: 1001;
}
.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #4caf50);
  width: 0;
  transition: width 0.1s;
}
`;
}
