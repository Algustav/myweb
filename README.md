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
