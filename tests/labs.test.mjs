import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parse } from 'yaml';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('实验室配置与展厅读取同一内容目录，首页保留独立入口', async () => {
  const config = parse(await read('public/admin/config.yml'));
  const labs = config.collections.find(c => c.name === 'labs');
  assert.equal(labs.folder, 'src/content/labs');
  assert.equal(labs.fields.find(f => f.name === 'kind').default, 'labs');
  assert.equal(labs.fields.find(f => f.name === 'projectUrl').required, false);
  const listing = await read('dist/labs/index.html');
  assert.match(listing, /href="\/7habits\/"/);
  assert.match(listing, /七个习惯/);
  assert.match(await read('dist/index.html'), /href="\/labs\/">Labs/);
  assert.doesNotMatch(await read('dist/index.html'), /class="home-post-link"[^>]*>七个习惯/);
});

test('后台阻止空项目和危险地址，允许外链、站内地址及纯正文', async () => {
  let handler;
  vm.runInNewContext(await read('public/admin/labs-validation.js'), { CMS: { registerEventListener: event => { handler = event.handler; } } });
  const entry = (values, collection = 'labs') => {
    const data = { get: key => values[key], set(key, value) { values[key] = value; return this; } };
    return { get: key => key === 'collection' ? collection : data };
  };
  assert.throws(() => handler({ entry: entry({ body: '  ', projectUrl: '' }) }), /至少填写一项/);
  for (const projectUrl of ['javascript:alert(1)', '//example.com', '/\\example.com']) {
    assert.throws(() => handler({ entry: entry({ projectUrl }) }), /http/);
  }
  for (const values of [{ projectUrl: '/7habits/' }, { projectUrl: 'https://example.com/' }, { body: '项目说明' }]) {
    assert.doesNotThrow(() => handler({ entry: entry(values) }));
  }
  assert.doesNotThrow(() => handler({ entry: entry({}, 'blog') }));
});
