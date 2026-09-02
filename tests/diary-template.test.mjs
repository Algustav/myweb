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
  assert.match(css, /\.article-content img\{display:block;max-width:100%;height:auto/);
});

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

test('RSS 订阅源输出文章、正文与标签', async () => {
  const feed = await page('rss.xml');
  const home = await page('index.html');

  assert.match(feed, /<rss version="2\.0"/);
  assert.match(feed, /<link>https:\/\/myweb\.ganlei\.com\/blog\/20260825-%E4%B8%BA%E4%BB%80%E4%B9%88%E4%BC%9A%E7%BB%8F%E5%B8%B8%E8%A7%89%E5%BE%97%E7%BC%BA%E4%B9%8F%E6%84%8F%E4%B9%89%E6%84%9F\/<\/link>/);
  assert.match(feed, /<category>readlater<\/category>/);
  assert.match(feed, /当越来越自由/);
  assert.match(home, /rel="alternate" type="application\/rss\+xml" href="\/rss\.xml"/);
});

test('主导航以中文显示四个内容分类入口', async () => {
  const home = await page('index.html');

  assert.match(home, /href="\/blog\/">博客<\/a>/);
  assert.match(home, /href="\/moments\/">时刻<\/a>/);
  assert.match(home, /href="\/readlater\/">文摘<\/a>/);
  assert.match(home, /href="\/pieces\/">碎片<\/a>/);
});

test('页眉第一行并排显示站点标题和阅读外观按钮，菜单独占第二行', async () => {
  const home = await page('index.html');
  const css = await stylesheet(home);
  const headerTop = home.indexOf('class="header-top"');
  const brand = home.indexOf('class="brand"');
  const appearanceControls = home.indexOf('class="appearance-controls"');
  const navigation = home.indexOf('<nav aria-label="主导航">');

  assert.ok(headerTop >= 0, '页眉应包含第一行容器');
  assert.ok(headerTop < brand && brand < appearanceControls && appearanceControls < navigation);
  assert.match(css, /\.site-header\{[^}]*flex-direction:column[^}]*align-items:stretch/);
  assert.match(css, /\.header-top\{[^}]*display:flex[^}]*justify-content:space-between/);
});

test('窄屏页眉和页脚保留正文边距及内缩分割线', async () => {
  const home = await page('index.html');
  const css = await stylesheet(home);

  assert.match(css, /\.site-header[^}]*padding-left:28px[^}]*padding-right:28px/);
  assert.match(css, /\.site-footer[^}]*padding-left:28px[^}]*padding-right:28px/);
  assert.doesNotMatch(css, /\.site-header\{[^}]*padding:30px 0 22px/);
  assert.doesNotMatch(css, /\.site-footer\{[^}]*padding:28px 0 44px/);
  assert.match(css, /\.site-header::?after[^}]*left:28px[^}]*right:28px/);
  assert.match(css, /\.site-footer::?before[^}]*left:28px[^}]*right:28px/);
});
