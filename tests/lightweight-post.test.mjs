import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, parse as parsePath } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { getPostDate } from '../src/lib/postDate.ts';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const fixtureName = '20991231-235959-lightweight-test.md';
const fixturePath = join(projectRoot, 'src', 'content', 'blog', fixtureName);

function findAstroCli(start) {
  let directory = start;
  while (true) {
    const candidate = join(directory, 'node_modules', 'astro', 'astro.js');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(directory);
    if (parent === directory) throw new Error('找不到 Astro CLI');
    directory = parent;
  }
}

function buildProject() {
  return spawnSync(process.execPath, [findAstroCli(projectRoot), 'build', '--root', projectRoot], {
    cwd: projectRoot,
    encoding: 'utf8'
  });
}

test('后台的时刻和碎片只要求填写正文', async () => {
  const config = parseYaml(await readFile(join(projectRoot, 'public', 'admin', 'config.yml'), 'utf8'));
  const collections = Object.fromEntries(config.collections.map((collection) => [collection.name, collection]));

  assert.deepEqual(Object.keys(collections), ['blog', 'moments', 'readlater', 'pieces']);
  for (const name of ['moments', 'pieces']) {
    const collection = collections[name];
    const visibleFields = collection.fields
      .filter((field) => field.widget !== 'hidden')
      .map((field) => field.name);
    assert.deepEqual(visibleFields, ['body']);
    assert.equal(collection.identifier_field, 'body');
    assert.equal(collection.slug, '{{year}}{{month}}{{day}}-{{hour}}{{minute}}{{second}}');
  }

  for (const name of ['blog', 'readlater']) {
    const visibleFields = collections[name].fields
      .filter((field) => field.widget !== 'hidden')
      .map((field) => field.name);
    assert.deepEqual(visibleFields, ['title', 'description', 'pubDate', 'tags', 'body']);
  }
});

test('秒级文件名保留轻量内容的实际创建时间', () => {
  const date = getPostDate({ id: '20260906-153045.md', data: {} });
  assert.equal(date.toISOString(), '2026-09-06T07:30:45.000Z');

  const moduleUrl = new URL('../src/lib/postDate.ts', import.meta.url).href;
  const utcResult = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--input-type=module', '--eval', `import { getPostDate } from '${moduleUrl}'; console.log(getPostDate({ id: '20260906-153045.md', data: {} }).toISOString());`],
    { encoding: 'utf8', env: { ...process.env, TZ: 'UTC' } }
  );
  assert.equal(utcResult.status, 0, utcResult.stderr);
  assert.equal(utcResult.stdout.trim(), '2026-09-06T07:30:45.000Z');
});

test('只有正文的轻量内容可以构建并显示在首页、归档、文章页和 RSS', async () => {
  const fixture = `---
kind: pieces
title: 不应显示的旧标题
description: 不应显示的旧摘要
tags: []
---
只写正文的轻量记录，**不需要标题**。

- 第一项
- 第二项
`;

  await writeFile(fixturePath, fixture, 'utf8');
  let cleanupResult;
  try {
    const result = buildProject();
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const home = await readFile(join(projectRoot, 'dist', 'index.html'), 'utf8');
    const archive = await readFile(join(projectRoot, 'dist', 'pieces', 'index.html'), 'utf8');
    const article = await readFile(
      join(projectRoot, 'dist', 'blog', parsePath(fixtureName).name, 'index.html'),
      'utf8'
    );
    const feed = await readFile(join(projectRoot, 'dist', 'rss.xml'), 'utf8');
    const lightweightRow = home.match(/<p class="archive-entry home-post-entry">([\s\S]*?)<\/p>/)?.[1] ?? '';
    assert.match(lightweightRow, /只写正文的轻量记录，不需要标题。 第一项 第二项/);
    assert.doesNotMatch(lightweightRow, /<h2>|<strong>/);
    assert.doesNotMatch(lightweightRow, /不应显示的旧标题|不应显示的旧摘要/);
    assert.match(lightweightRow, /class="category-pill" href="\/pieces\/">碎片<\/a>/);
    assert.match(archive, /只写正文的轻量记录，不需要标题。/);
    assert.doesNotMatch(archive, /不应显示的旧标题/);
    assert.match(article, /只写正文的轻量记录，<strong>不需要标题<\/strong>。/);
    assert.doesNotMatch(article, /<h1>/);
    assert.doesNotMatch(article, /不应显示的旧标题|不应显示的旧摘要/);
    assert.match(feed, /<title>只写正文的轻量记录，不需要标题。 第一项 第二项<\/title>/);
    assert.doesNotMatch(feed, /不应显示的旧标题|不应显示的旧摘要/);
  } finally {
    await rm(fixturePath, { force: true });
    cleanupResult = buildProject();
  }
  assert.equal(cleanupResult.status, 0, `${cleanupResult.stdout}\n${cleanupResult.stderr}`);
  const cleanHome = await readFile(join(projectRoot, 'dist', 'index.html'), 'utf8');
  assert.doesNotMatch(cleanHome, /只写正文的轻量记录/);
  assert.equal(existsSync(join(projectRoot, 'dist', 'blog', parsePath(fixtureName).name)), false);
});
