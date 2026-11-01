import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(80).max(165),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['control', 'ansiedad', 'ereccion', 'habitos', 'pareja']),
    keyword: z.string(),
    tags: z.array(z.string()).default([]),
    // true = rascunho: não aparece no blog, só em /previa/<slug>/ (sem indexar)
    draft: z.boolean().default(false),
    sources: z
      .array(z.object({ name: z.string(), url: z.string().url() }))
      .min(2),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
  }),
});

export const collections = { posts };
