import assert from 'node:assert/strict';
import test from 'node:test';

const appearance = await import('../src/lib/appearance.ts');

test('主题在浅色与深色之间循环', () => {
  assert.equal(appearance.nextTheme('light'), 'dark');
  assert.equal(appearance.nextTheme('dark'), 'light');
});

test('字体按宋体、霞鹜文楷、思源黑体循环', () => {
  assert.equal(appearance.nextFont('song'), 'wenkai');
  assert.equal(appearance.nextFont('wenkai'), 'sans');
  assert.equal(appearance.nextFont('sans'), 'song');
});
