import { defineCollection, z } from 'astro:content';
import { normalizeLabsCover } from './lib/labsCover';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    kind: z.enum(['blog', 'moments', 'readlater', 'pieces']).optional(),
    tags: z.array(z.string()).default([])
  })
});

const labs = defineCollection({
  type: 'content',
  schema: z.object({
    kind: z.literal('labs').default('labs'),
    tags: z.array(z.string()).default(['labs']),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    cover: z.string().trim().min(1).transform(normalizeLabsCover),
    projectUrl: z.string().trim().default('').refine(
      (value) => !value || /^(\/(?!\/)|https?:\/\/)[^\s\\]+$/i.test(value),
      '体验地址须为站内路径或完整的 http(s) 网址'
    ),
    pubDate: z.coerce.date(),
    order: z.coerce.number().default(0)
  })
});

export const collections = { blog, labs };
