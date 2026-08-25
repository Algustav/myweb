import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('首页是单栏日记信息流', async () => {
  const home = await page('index.html');

  assert.match(home, /Algustav 的日记本/);
  assert.match(home, /class="entry"/);
  assert.doesNotMatch(home, /Personal notes \/ web \/ product \/ life/);
});

test('文章页支持 Kindle 阅读排版', async () => {
  const article = await page('blog/hello-astro/index.html');

  assert.match(article, /class="reading-page"/);
  assert.match(article, /--reading-width: 680px/);
  assert.match(article, /line-height:1\.9/);
});
