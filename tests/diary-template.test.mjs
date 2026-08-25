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
  const article = await page('blog/20260824-付鹏-2024-年汇丰分享/index.html');
  const css = await stylesheet(article);

  assert.match(article, /class="reading-page"/);
  assert.match(css, /--reading-width: 680px/);
  assert.match(css, /line-height:1\.9/);
  assert.match(css, /padding-left:28px/);
  assert.match(css, /padding-right:28px/);
  assert.match(css, /--reading-font:\s*Arial, Helvetica, sans-serif/);
  assert.match(css, /\.article-content\{font-size:19px/);
});

test('文章归档按日期输出紧凑条目', async () => {
  const archive = await page('blog/index.html');

  assert.match(archive, /class="archive-entry"/);
  assert.match(archive, /2026\/08\/24/);
  assert.match(archive, /付鹏 2024 年汇丰分享/);
  assert.match(archive, /readlater/);
});

test('RSS 订阅源输出文章、正文与标签', async () => {
  const feed = await page('rss.xml');
  const home = await page('index.html');

  assert.match(feed, /<rss version="2\.0"/);
  assert.match(feed, /<link>https:\/\/myweb\.ganlei\.com\/blog\/20260825-%E4%B8%BA%E4%BB%80%E4%B9%88%E4%BC%9A%E7%BB%8F%E5%B8%B8%E8%A7%89%E5%BE%97%E7%BC%BA%E4%B9%8F%E6%84%8F%E4%B9%89%E6%84%9F\/<\/link>/);
  assert.match(feed, /<category>readlater<\/category>/);
  assert.match(feed, /当越来越自由/);
  assert.match(home, /rel="alternate" type="application\/rss\+xml" href="\/rss\.xml"/);
});
