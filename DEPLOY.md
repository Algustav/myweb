# 部署到 GitHub + Cloudflare Pages

## 1. 创建 GitHub 仓库

建议仓库名：

```text
personal-astro-blog
```

如果你想用 GitHub Pages 的用户名主页形式，也可以叫：

```text
Algustav.github.io
```

但如果你准备用 Cloudflare Pages 托管，仓库名不需要特殊格式。

## 2. 推送代码

这台环境暂时没有 `git` 命令。你可以在装好 Git 后进入本目录执行：

```bash
git init
git add .
git commit -m "Initial Astro blog"
git branch -M main
git remote add origin https://github.com/Algustav/personal-astro-blog.git
git push -u origin main
```

## 3. 连接 Cloudflare Pages

进入 Cloudflare Dashboard：

```text
Workers & Pages -> Create application -> Pages -> Connect to Git
```

选择你的 GitHub 仓库，然后设置：

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
Node.js version: 24
```

## 4. 设置正式域名

部署成功后，Cloudflare 会给你一个 `*.pages.dev` 预览域名。

如果你有自己的域名：

1. 在 Cloudflare Pages 项目里打开 Custom domains。
2. 添加 `yourdomain.com` 或 `www.yourdomain.com`。
3. 按 Cloudflare 提示添加 DNS 记录。
4. 把 `astro.config.mjs` 里的 `site` 改成你的正式域名。

## 5. 更新博客

以后发布文章只需要：

1. 在 `src/content/blog/` 新增 Markdown 文件。
2. 提交并 push 到 GitHub。
3. Cloudflare Pages 自动部署。
