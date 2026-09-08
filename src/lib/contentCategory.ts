export const RESERVED_CATEGORY_TAGS = ['blog', 'moments', 'readlater'] as const;

export type ContentCategory = (typeof RESERVED_CATEGORY_TAGS)[number] | 'pieces';

type TaggedPost = {
  data: {
    kind?: ContentCategory;
    tags: string[];
  };
};

export function getPostCategory(post: TaggedPost): ContentCategory {
  return post.data.kind
    ?? RESERVED_CATEGORY_TAGS.find((tag) => post.data.tags.includes(tag))
    ?? 'pieces';
}

export function postBelongsToCategory(post: TaggedPost, category: ContentCategory) {
  if (category === 'pieces') {
    return !RESERVED_CATEGORY_TAGS.some((tag) => post.data.tags.includes(tag));
  }

  return post.data.tags.includes(category);
}

export function filterPostsByCategory<T extends TaggedPost>(posts: T[], category: ContentCategory) {
  return posts.filter((post) => postBelongsToCategory(post, category));
}
