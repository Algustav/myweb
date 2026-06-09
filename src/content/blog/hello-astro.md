---
title: "第一篇 Astro 博客"
description: "这是一篇示例文章，用来确认 Markdown 内容、文章列表和详情页都能正常工作。"
pubDate: 2026-06-09
tags: ["Astro", "博客"]
---

这是第一篇文章。你可以直接修改这个文件，或者复制它作为新文章的模板。

## 写文章的方式

在 `src/content/blog` 文件夹里新增 `.md` 文件。文件顶部的 frontmatter 会成为文章标题、摘要、日期和标签。

```md
---
title: "我的新文章"
description: "一句话摘要"
pubDate: 2026-06-09
tags: ["随笔"]
---
```

保存并提交到 GitHub 后，Cloudflare Pages 会自动构建并发布。
