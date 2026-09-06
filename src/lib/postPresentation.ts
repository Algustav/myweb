export type PostKind = 'blog' | 'moments' | 'readlater' | 'pieces';

type PresentablePost = {
  body?: string;
  data: {
    title?: string;
    description?: string;
    kind?: PostKind;
  };
};

const toPlainText = (markdown = '') => markdown
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/^\s*[#>*+-]+\s*/gm, '')
  .replace(/[*_~]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const truncate = (value: string, length: number) => (
  value.length <= length ? value : `${value.slice(0, length).trimEnd()}…`
);

export const isLightweightPost = (post: PresentablePost) => (
  post.data.kind === 'moments' || post.data.kind === 'pieces'
);

export const getPostTitle = (post: PresentablePost) => {
  const bodyTitle = truncate(toPlainText(post.body), 48) || '未命名记录';
  return isLightweightPost(post) ? bodyTitle : post.data.title?.trim() || bodyTitle;
};

export const getPostDescription = (post: PresentablePost) => {
  const bodyDescription = truncate(toPlainText(post.body), 140);
  return isLightweightPost(post) ? bodyDescription : post.data.description?.trim() || bodyDescription;
};
