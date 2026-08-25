# 极简日记模板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Astro 博客模板改为适合 Kindle 长文阅读的极简单栏日记本。

**Architecture:** 保留内容集合、路由与 Decap CMS；只调整现有布局、首页、文章条目和文章详情模板。Node 内置测试检查关键模板标记，Astro 生产构建检查最终站点生成。

**Tech Stack:** Astro 5、TypeScript、Node.js 内置测试运行器、CSS。

**Spec:** `docs/superpowers/specs/2026-08-25-diary-template-design.md`

## Global Constraints

- 不修改 Markdown 内容模型、Decap CMS、GitHub OAuth 或 Cloudflare Pages 配置。
- 首页介绍不超过两行，文章按现有日期逻辑倒序展示。
- 不使用卡片、阴影、双栏、悬浮动效、装饰图片或新依赖。
- 正文最大宽度约 680px；窄屏正文约 19px，行距约 1.9。

---

### Task 1: 建立模板回归测试

**Files:**
- Create: `tests/diary-template.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: 首页、文章条目、全局布局和文章页模板源文件。
- Produces: `npm run test:template`，断言 `diary-intro`、`diary-feed`、`entry`、`reading-page`、`--reading-width: 680px` 与 `line-height: 1.9`。

- [ ] **Step 1: 写出失败测试**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('首页是单栏日记信息流', async () => {
  assert.match(await source('src/pages/index.astro'), /class="diary-intro"/);
  assert.match(await source('src/pages/index.astro'), /class="diary-feed"/);
  assert.match(await source('src/components/PostCard.astro'), /class="entry"/);
});

test('文章页支持 Kindle 阅读排版', async () => {
  assert.match(await source('src/pages/blog/[...slug].astro'), /class="reading-page"/);
  const layout = await source('src/layouts/BaseLayout.astro');
  assert.match(layout, /--reading-width: 680px/);
  assert.match(layout, /line-height: 1\.9/);
});
```

- [ ] **Step 2: 运行 `node --test tests/diary-template.test.mjs`，确认断言因标记缺失而失败。**
- [ ] **Step 3: 在 `package.json` 增加 `"test:template": "node --test tests/diary-template.test.mjs"`。**
- [ ] **Step 4: 运行 `npm.cmd run test:template`，确认仍为预期失败。**

### Task 2: 改造首页与全局日记视觉

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/PostCard.astro`

**Interfaces:**
- Consumes: Task 1 中的首页结构契约。
- Produces: `diary-intro`、`diary-feed`、`entry` 三个语义类名与单栏暖白主题。

- [ ] **Step 1: 首页使用 `diary-intro`，文字为“Algustav 的日记本”及一行说明；将文章列表改为 `diary-feed`。**
- [ ] **Step 2: `PostCard.astro` 使用 `entry` 文章条目，仅输出日期、标题、摘要、可选标签。**
- [ ] **Step 3: 全局 CSS 定义 `--page`、`--ink`、`--muted`、`--line` 与 `--reading-width: 680px`；删除格纹背景、阴影、卡片和双栏样式。**
- [ ] **Step 4: 运行 `npm.cmd run test:template`，确认首页测试通过而文章页测试仍失败。**

### Task 3: 改造全文阅读页并验证

**Files:**
- Modify: `src/pages/blog/[...slug].astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `--reading-width` 与共用主题变量。
- Produces: `reading-page` 阅读容器；窄屏正文 19px、1.9 行距。

- [ ] **Step 1: 用 `reading-page` 包裹文章，保留日期、标题、摘要与 `Content` 正文。**
- [ ] **Step 2: 为 `.reading-page` 设置最大宽度为 `var(--reading-width)`；为 `.article-content` 设置 1.9 行距，并在 `max-width: 720px` 时设置 19px 字号。**
- [ ] **Step 3: 运行 `npm.cmd run test:template`，确认两个测试均通过。**
- [ ] **Step 4: 运行 `npm.cmd run build`，确认 Astro 能生成全部路由。**
- [ ] **Step 5: 提交 `package.json`、测试文件和四个 Astro 模板，提交信息为 `feat: redesign blog as a minimal diary`。**
