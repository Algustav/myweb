---
title: "我的博客发布流程"
description: "用 GitHub 管理源码，用 Cloudflare Pages 自动部署静态博客。"
pubDate: 2026-06-09
tags: ["部署", "Cloudflare"]
---

这个博客的发布流程很简单：

1. 在本地写 Markdown。
2. 提交并推送到 GitHub。
3. Cloudflare Pages 监听 GitHub 仓库变化。
4. 每次 push 后自动运行 `npm run build`。
5. 把生成的 `dist` 目录发布到全球 CDN。

## 后续可以加的功能

可以逐步增加 RSS、站内搜索、文章分类、评论系统和访问统计。第一版先保持静态和稳定。
