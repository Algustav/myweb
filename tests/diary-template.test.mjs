import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const stylesheet = async (html) => {
  const href = html.match(/<link rel="stylesheet" href="([^"]+\.css)">/)?.[1];
  assert.ok(href, '页面应加载构建出的样式表');
  return readFile(new URL(`../dist${href}`, import.meta.url), 'utf8');
};

test('首页是单栏日记信息流', async () => {
  const home = await page('index.html');

  assert.match(home, /Algustav 的日记本/);
  assert.match(home, /class="entry"/);
  assert.doesNotMatch(home, /Personal notes \/ web \/ product \/ life/);
});

test('文章页支持 Kindle 阅读排版', async () => {
  const article = await page('blog/hello-astro/index.html');
  const css = await stylesheet(article);

  assert.match(article, /class="reading-page"/);
  assert.match(css, /--reading-width: 680px/);
  assert.match(css, /line-height:1\.9/);
  assert.match(css, /padding-left:28px/);
  assert.match(css, /padding-right:28px/);
});

test('文章归档按日期输出紧凑条目', async () => {
  const archive = await page('blog/index.html');

  assert.match(archive, /class="archive-entry"/);
  assert.match(archive, /2026\/08\/24/);
  assert.match(archive, /付鹏 2024 年汇丰分享/);
  assert.match(archive, /readlater/);
});
