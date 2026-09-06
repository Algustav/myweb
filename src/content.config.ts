import { defineCollection, z } from 'astro:content';

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

export const collections = { blog };
