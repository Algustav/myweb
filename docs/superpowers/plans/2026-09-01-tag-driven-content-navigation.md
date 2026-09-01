# Tag-Driven Content Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Blog, Moments, Read Later, and Pieces navigation and filtered archive pages while preserving a mixed homepage feed and fixing narrow-screen header/footer gutters.

**Architecture:** Keep the existing Astro `blog` collection as the single source of content. A small pure helper owns reserved-tag classification, a shared Astro component renders every category archive, and four route pages supply filtered posts. The existing base layout remains responsible for navigation and responsive gutters.

**Tech Stack:** Astro 5, TypeScript, Markdown content collections, Node.js test runner, Cloudflare Pages static output

**Spec:** `docs/superpowers/specs/2026-09-01-tag-driven-content-navigation-design.md`

## Global Constraints

- Keep all posts in the existing `blog` content collection.
- Use exact lowercase reserved tags `blog`, `moments`, and `readlater`.
- Assign posts with none of those reserved tags to Pieces without requiring a `pieces` tag.
- Permit a post to appear in multiple category archives when it has multiple reserved tags.
- Preserve article detail URLs as `/blog/<slug>/`.
- Keep the homepage as a reverse-chronological mixed feed of all posts.
- Keep Read Later source attribution in the existing `description` field; add no source field.
- Add no database, client-side search, new CMS, or new dependency.
- On narrow screens, the header and footer content and divider lines use the same 28px horizontal gutter as the body content.

---

### Task 1: Centralize reserved-tag classification

**Files:**

- Create: `src/lib/contentCategory.ts`
- Create: `tests/content-category.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces: `RESERVED_CATEGORY_TAGS` as the readonly tuple `['blog', 'moments', 'readlater']`.
- Produces: `ContentCategory` as `'blog' | 'moments' | 'readlater' | 'pieces'`.
- Produces: `postBelongsToCategory(post, category): boolean` for any post containing `data.tags: string[]`.
- Produces: `filterPostsByCategory(posts, category): T[]`, preserving input order and allowing overlap between reserved categories.

- [ ] **Step 1: Write failing classification tests**

Create `tests/content-category.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

const { filterPostsByCategory, postBelongsToCategory } = await import('../src/lib/contentCategory.ts');

const post = (id, tags) => ({ id, data: { tags } });

test('三个保留标签分别形成对应分类', () => {
  assert.equal(postBelongsToCategory(post('a', ['blog', 'AI']), 'blog'), true);
  assert.equal(postBelongsToCategory(post('b', ['moments']), 'moments'), true);
  assert.equal(postBelongsToCategory(post('c', ['readlater']), 'readlater'), true);
});

test('没有保留标签的文章归入 Pieces', () => {
  assert.equal(postBelongsToCategory(post('a', ['行动']), 'pieces'), true);
  assert.equal(postBelongsToCategory(post('b', []), 'pieces'), true);
  assert.equal(postBelongsToCategory(post('c', ['blog']), 'pieces'), false);
  assert.equal(postBelongsToCategory(post('d', ['pieces']), 'pieces'), true);
});

test('多个保留标签允许文章出现在多个分类中', () => {
  const posts = [post('shared', ['blog', 'moments']), post('only-blog', ['blog'])];

  assert.deepEqual(filterPostsByCategory(posts, 'blog').map(({ id }) => id), ['shared', 'only-blog']);
  assert.deepEqual(filterPostsByCategory(posts, 'moments').map(({ id }) => id), ['shared']);
});
```

- [ ] **Step 2: Register and run the test to verify failure**

Change `package.json` so `test:template` runs the new test as well:

```json
"test:template": "npm run build && node --test tests/content-category.test.mjs tests/diary-template.test.mjs tests/appearance.test.mjs"
```

Run: `node --test tests/content-category.test.mjs`

Expected: FAIL because `src/lib/contentCategory.ts` does not exist.

- [ ] **Step 3: Implement the classification helper**

Create `src/lib/contentCategory.ts`:

```ts
export const RESERVED_CATEGORY_TAGS = ['blog', 'moments', 'readlater'] as const;

export type ContentCategory = (typeof RESERVED_CATEGORY_TAGS)[number] | 'pieces';

type TaggedPost = {
  data: {
    tags: string[];
  };
};

export function postBelongsToCategory(post: TaggedPost, category: ContentCategory) {
  if (category === 'pieces') {
    return !RESERVED_CATEGORY_TAGS.some((tag) => post.data.tags.includes(tag));
  }

  return post.data.tags.includes(category);
}

export function filterPostsByCategory<T extends TaggedPost>(posts: T[], category: ContentCategory) {
  return posts.filter((post) => postBelongsToCategory(post, category));
}
```

- [ ] **Step 4: Run the focused tests**

Run: `node --test tests/content-category.test.mjs`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the classification unit**

```bash
git add package.json src/lib/contentCategory.ts tests/content-category.test.mjs
git commit -m "feat: add tag-driven content classification" -- package.json src/lib/contentCategory.ts tests/content-category.test.mjs
```

---

### Task 2: Add the four filtered archive pages

**Files:**

- Create: `src/components/ArchiveList.astro`
- Modify: `src/pages/blog/index.astro`
- Create: `src/pages/moments/index.astro`
- Create: `src/pages/readlater/index.astro`
- Create: `src/pages/pieces/index.astro`
- Modify: `tests/diary-template.test.mjs`

**Interfaces:**

- Consumes: `filterPostsByCategory(posts, category)` from Task 1.
- Produces: `ArchiveList.astro` props `{ kicker: string; title: string; posts: CollectionEntry<'blog'>[]; emptyMessage: string }`.
- Produces: static archive routes `/blog/`, `/moments/`, `/readlater/`, and `/pieces/`.

- [ ] **Step 1: Write failing archive integration tests**

Replace the existing `文章归档按日期输出紧凑条目` test in `tests/diary-template.test.mjs` with:

```js
test('四个分类页按标签输出紧凑归档', async () => {
  const blog = await page('blog/index.html');
  const moments = await page('moments/index.html');
  const readlater = await page('readlater/index.html');
  const pieces = await page('pieces/index.html');

  assert.match(blog, /class="archive-list"/);
  assert.match(moments, /class="archive-list"/);
  assert.match(readlater, /付鹏 2024 年汇丰分享/);
  assert.doesNotMatch(readlater, /突然我悟了，要做什么不要等/);
  assert.match(pieces, /突然我悟了，要做什么不要等/);
  assert.doesNotMatch(pieces, /付鹏 2024 年汇丰分享/);
  assert.match(readlater, /2026\/08\/24/);
});
```

- [ ] **Step 2: Run the production test command to verify failure**

Run: `npm run test:template`

Expected: FAIL when the test tries to read the missing Moments, Read Later, or Pieces pages.

- [ ] **Step 3: Extract the common archive renderer**

Create `src/components/ArchiveList.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { getPostDate } from '../lib/postDate';

interface Props {
  kicker: string;
  title: string;
  posts: CollectionEntry<'blog'>[];
  emptyMessage: string;
}

const { kicker, title, posts, emptyMessage } = Astro.props;
const formatDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}/${value('month')}/${value('day')}`;
};
---

<section class="archive-intro">
  <p class="kicker">{kicker}</p>
  <h1>{title}</h1>
</section>
<section class="archive-list" aria-label={`${title}文章列表`}>
  {posts.length === 0 && <p class="archive-empty">{emptyMessage}</p>}
  {posts.map((post) => {
    const slug = post.id.replace(/\.(md|mdx)$/, '');
    return (
      <p class="archive-entry">
        <time datetime={getPostDate(post).toISOString()}>{formatDate(getPostDate(post))}</time>
        <span aria-hidden="true"> - </span>
        <a href={`/blog/${slug}/`}>{post.data.title}</a>
      </p>
    );
  })}
</section>
```

Add an empty-state rule beside the existing archive styles in `src/layouts/BaseLayout.astro`:

```css
.archive-empty { margin: 0; padding: 24px 0; color: var(--muted); }
```

- [ ] **Step 4: Implement the Blog archive using the shared component**

Replace `src/pages/blog/index.astro` with:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArchiveList from '../../components/ArchiveList.astro';
import { getCollection } from 'astro:content';
import { filterPostsByCategory } from '../../lib/contentCategory';
import { getPostDate } from '../../lib/postDate';

const posts = filterPostsByCategory(await getCollection('blog'), 'blog').sort(
  (a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()
);
---

<BaseLayout title="Blog - Algustav">
  <ArchiveList kicker="原创长文" title="Blog" posts={posts} emptyMessage="还没有 Blog 文章。" />
</BaseLayout>
```

- [ ] **Step 5: Implement Moments, Read Later, and Pieces pages**

Create `src/pages/moments/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArchiveList from '../../components/ArchiveList.astro';
import { getCollection } from 'astro:content';
import { filterPostsByCategory } from '../../lib/contentCategory';
import { getPostDate } from '../../lib/postDate';

const posts = filterPostsByCategory(await getCollection('blog'), 'moments').sort(
  (a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()
);
---

<BaseLayout title="Moments - Algustav">
  <ArchiveList kicker="即时想法与生活片段" title="Moments" posts={posts} emptyMessage="还没有 Moments。" />
</BaseLayout>
```

Create `src/pages/readlater/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArchiveList from '../../components/ArchiveList.astro';
import { getCollection } from 'astro:content';
import { filterPostsByCategory } from '../../lib/contentCategory';
import { getPostDate } from '../../lib/postDate';

const posts = filterPostsByCategory(await getCollection('blog'), 'readlater').sort(
  (a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()
);
---

<BaseLayout title="Read Later - Algustav">
  <ArchiveList kicker="阅读收藏" title="Read Later" posts={posts} emptyMessage="还没有 Read Later 文章。" />
</BaseLayout>
```

Create `src/pages/pieces/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArchiveList from '../../components/ArchiveList.astro';
import { getCollection } from 'astro:content';
import { filterPostsByCategory } from '../../lib/contentCategory';
import { getPostDate } from '../../lib/postDate';

const posts = filterPostsByCategory(await getCollection('blog'), 'pieces').sort(
  (a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()
);
---

<BaseLayout title="Pieces - Algustav">
  <ArchiveList kicker="零散记录" title="Pieces" posts={posts} emptyMessage="还没有 Pieces。" />
</BaseLayout>
```

- [ ] **Step 6: Build and run the archive tests**

Run: `npm run test:template`

Expected: the four category pages exist; Read Later contains the known `readlater` post; Pieces contains the known post without a reserved tag; all tests PASS.

- [ ] **Step 7: Commit the archive pages**

```bash
git add src/components/ArchiveList.astro src/layouts/BaseLayout.astro src/pages/blog/index.astro src/pages/moments/index.astro src/pages/readlater/index.astro src/pages/pieces/index.astro tests/diary-template.test.mjs
git commit -m "feat: add filtered content archives" -- src/components/ArchiveList.astro src/layouts/BaseLayout.astro src/pages/blog/index.astro src/pages/moments/index.astro src/pages/readlater/index.astro src/pages/pieces/index.astro tests/diary-template.test.mjs
```

---

### Task 3: Update navigation and restore narrow-screen gutters

**Files:**

- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/diary-template.test.mjs`

**Interfaces:**

- Consumes: the four archive routes created in Task 2.
- Produces: navigation links to Home, Blog, Moments, Read Later, Pieces, and About.
- Produces: 28px horizontal header/footer content gutters and inset divider lines on narrow screens.

- [ ] **Step 1: Write failing navigation and gutter tests**

Add to `tests/diary-template.test.mjs`:

```js
test('主导航包含四个内容分类入口', async () => {
  const home = await page('index.html');

  assert.match(home, /href="\/blog\/">Blog<\/a>/);
  assert.match(home, /href="\/moments\/">Moments<\/a>/);
  assert.match(home, /href="\/readlater\/">Read Later<\/a>/);
  assert.match(home, /href="\/pieces\/">Pieces<\/a>/);
});

test('窄屏页眉和页脚保留正文边距及内缩分割线', async () => {
  const home = await page('index.html');
  const css = await stylesheet(home);

  assert.match(css, /\.site-header[^}]*padding-left:28px[^}]*padding-right:28px/);
  assert.match(css, /\.site-footer[^}]*padding-left:28px[^}]*padding-right:28px/);
  assert.match(css, /\.site-header:after[^}]*left:28px[^}]*right:28px/);
  assert.match(css, /\.site-footer:before[^}]*left:28px[^}]*right:28px/);
});
```

- [ ] **Step 2: Run the test command to verify failure**

Run: `npm run test:template`

Expected: FAIL because the new links and inset divider pseudo-elements are absent.

- [ ] **Step 3: Update the primary navigation**

Replace the navigation element in `src/layouts/BaseLayout.astro` with:

```astro
<nav aria-label="主导航">
  <a href="/">首页</a>
  <a href="/blog/">Blog</a>
  <a href="/moments/">Moments</a>
  <a href="/readlater/">Read Later</a>
  <a href="/pieces/">Pieces</a>
  <a href="/about/">关于</a>
</nav>
```

- [ ] **Step 4: Fix header/footer padding without overriding horizontal gutters**

In `src/layouts/BaseLayout.astro`, replace the header and footer shorthand padding/border declarations with side-safe properties and inset pseudo-elements:

```css
.site-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 30px;
  padding-bottom: 22px;
}

.site-header::after {
  position: absolute;
  right: 28px;
  bottom: 0;
  left: 28px;
  border-bottom: 1px solid var(--line);
  content: '';
}

.site-footer {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 28px;
  padding-bottom: 44px;
  color: var(--muted);
  font-size: 0.84rem;
}

.site-footer::before {
  position: absolute;
  top: 0;
  right: 28px;
  left: 28px;
  border-top: 1px solid var(--line);
  content: '';
}
```

Make the expanded navigation wrap safely in the existing narrow-screen media query:

```css
nav { display: flex; flex-wrap: wrap; gap: 8px 16px; color: var(--muted); font-size: 0.95rem; }

@media (max-width: 720px) {
  .site-header { align-items: flex-start; flex-direction: column; }
  .header-actions { width: 100%; align-items: flex-start; justify-content: space-between; }
  .header-actions nav { min-width: 0; }
  .appearance-controls { flex: none; }
}
```

- [ ] **Step 5: Run the full automated verification**

Run: `npm run test:template`

Expected: the production build succeeds and every Node test passes.

- [ ] **Step 6: Inspect the built site at narrow and wide widths**

Run: `npm run dev -- --host 127.0.0.1`

Verify at approximately 375px and 714px widths:

- Brand, navigation, appearance controls, and footer text do not touch either viewport edge.
- Header/footer divider lines begin and end at the same 28px inset as the content.
- Six navigation links wrap without overlapping the appearance controls.
- Homepage remains a mixed feed.
- Blog, Moments, Read Later, and Pieces pages show compact lists and open articles at `/blog/<slug>/`.

Verify at approximately 1280px width that the centered 680px reading column and desktop navigation remain intact.

- [ ] **Step 7: Commit navigation and responsive layout**

```bash
git add src/layouts/BaseLayout.astro tests/diary-template.test.mjs
git commit -m "fix: align responsive site chrome with content" -- src/layouts/BaseLayout.astro tests/diary-template.test.mjs
```

---

### Task 4: Final regression verification

**Files:**

- Verify only; no planned source changes.

**Interfaces:**

- Consumes: all deliverables from Tasks 1–3.
- Produces: a verified static build ready for the existing Cloudflare Pages deployment flow.

- [ ] **Step 1: Run the complete test suite from a clean build**

Run: `npm run test:template`

Expected: Astro production build succeeds and all content-category, archive, RSS, appearance, navigation, and gutter tests PASS.

- [ ] **Step 2: Check the working tree without altering user files**

Run: `git status --short`

Expected: only pre-existing user changes may remain (`src/content/blog/20260825-test从vscode发布.md` and `ebook-clean-work/` at plan-writing time). Do not add, remove, or commit those paths.

- [ ] **Step 3: Review the final diff for scope**

Run: `git diff HEAD~3 -- src package.json tests`

Expected: changes are limited to classification, archive pages, navigation, responsive gutters, and their tests; no content post is modified.
