# Personal Astro Blog

这是一个适合部署到 Cloudflare Pages 的 Astro 静态博客。

## 本地运行

```bash
npm install
npm run dev
```

## 新增文章

在 `src/content/blog/` 下新增 Markdown 文件：

```md
---
title: "文章标题"
description: "文章摘要"
pubDate: 2026-06-09
tags: ["随笔"]
---

正文内容。
```

## Cloudflare Pages 配置

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`

绑定域名前，建议把 `astro.config.mjs` 里的 `site` 改成你的正式域名。

## 博客后台

### Labs 实验室

网站 `/labs/` 自动展示 `src/content/labs/` 中的项目。后台选择「实验室 → 新建项目」，填写项目名、简介、头图和日期；`labs` 分类自动设置。体验地址和正文至少填写一项，填写地址时直接打开项目，留空则进入 `/labs/项目标识/` 正文详情页。站内体验地址以 `/` 开头，外部地址使用完整的 `https://` 网址。

排序值越大越靠前，相同时按发布日期倒序。保存发布后由 Cloudflare Pages 自动构建更新展厅；删除项目内容也会同步移除卡片。项目内容与日记文章分开存放，不会进入博客列表或 RSS。交互项目本身仍需独立制作，后台负责它的展示资料与入口。

部署完成后访问：

```text
https://myweb.ganlei.com/admin/
```

后台使用 Decap CMS，会把文章保存到 `src/content/blog/`。登录发布需要在 GitHub 创建 OAuth App，并在 Cloudflare Pages 环境变量里配置：

```text
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```
