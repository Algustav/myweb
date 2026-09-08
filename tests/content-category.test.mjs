import assert from 'node:assert/strict';
import test from 'node:test';

const { filterPostsByCategory, getPostCategory, postBelongsToCategory } = await import('../src/lib/contentCategory.ts');

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

test('首页为每篇文章选择一个栏目', () => {
  assert.equal(getPostCategory({ data: { kind: 'blog', tags: ['blog'] } }), 'blog');
  assert.equal(getPostCategory({ data: { kind: 'moments', tags: ['moments'] } }), 'moments');
  assert.equal(getPostCategory({ data: { kind: 'readlater', tags: ['readlater'] } }), 'readlater');
  assert.equal(getPostCategory({ data: { kind: 'pieces', tags: [] } }), 'pieces');
});
