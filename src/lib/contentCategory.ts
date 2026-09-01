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
