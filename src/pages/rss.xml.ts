import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPostDate } from '../lib/postDate';

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()
  );

  return rss({
    title: 'Al的记事本',
    description: '记录正在发生的事，也留住那些以后还想重新读到的想法。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: getPostDate(post),
      link: `/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      categories: post.data.tags,
      content: post.body
    }))
  });
}
