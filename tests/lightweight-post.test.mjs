import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, parse as parsePath } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

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

test('只有正文的轻量内容可以构建并显示在首页、归档、文章页和 RSS', async () => {
  const fixture = `---
kind: moments
tags:
  - moments
---
只写正文的轻量记录，**不需要标题**。
`;

  await writeFile(fixturePath, fixture, 'utf8');
  try {
    const result = spawnSync(process.execPath, [findAstroCli(projectRoot), 'build', '--root', projectRoot], {
      cwd: projectRoot,
      encoding: 'utf8'
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const home = await readFile(join(projectRoot, 'dist', 'index.html'), 'utf8');
    const archive = await readFile(join(projectRoot, 'dist', 'moments', 'index.html'), 'utf8');
    const article = await readFile(
      join(projectRoot, 'dist', 'blog', parsePath(fixtureName).name, 'index.html'),
      'utf8'
    );
    const feed = await readFile(join(projectRoot, 'dist', 'rss.xml'), 'utf8');

    const lightweightCard = home.match(/<article class="entry entry--lightweight">([\s\S]*?)<\/article>/)?.[1] ?? '';
    assert.match(lightweightCard, /只写正文的轻量记录，<strong>不需要标题<\/strong>。/);
    assert.doesNotMatch(lightweightCard, /<h2>/);
    assert.match(archive, /只写正文的轻量记录，不需要标题。/);
    assert.match(article, /只写正文的轻量记录，<strong>不需要标题<\/strong>。/);
    assert.doesNotMatch(article, /<h1>/);
    assert.match(feed, /<title>只写正文的轻量记录，不需要标题。<\/title>/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});
