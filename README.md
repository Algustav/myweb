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

部署完成后访问：

```text
https://myweb.ganlei.com/admin/
```

后台使用 Decap CMS，会把文章保存到 `src/content/blog/`。登录发布需要在 GitHub 创建 OAuth App，并在 Cloudflare Pages 环境变量里配置：

```text
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```
