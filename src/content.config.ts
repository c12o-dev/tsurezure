import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Posts: src/content/posts/<folder>/index.md (or any *.md). The URL is
 * /posts/<slug>/, where <slug> is the `slug` frontmatter field if present,
 * otherwise the file path. Images next to the file can be referenced
 * relatively, including the `image` cover.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** Drafts render in `pnpm dev` only. */
      draft: z.boolean().default(false),
      /**
       * Scheduled publishing: a draft with `reviewed: true` is published by
       * .github/workflows/publish-scheduled.yml once `published` is reached.
       */
      reviewed: z.boolean().default(false),
      description: z.string().default(''),
      /** Cover image. Without one, a cover is generated from the title. */
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      category: z.string().nullish(),
      /** Overrides `site.lang` for this post. */
      lang: z.string().optional(),
    }),
})

/**
 * Wiki: src/content/wiki/<topic>/<page>.md → /wiki/<topic>/<page>/.
 * Topic display names live in `wiki.topics` (src/config.ts).
 */
const wiki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wiki' }),
  schema: z.object({
    title: z.string(),
    /** One-sentence summary, shown in a box under the title and in lists. */
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
    /** Reference URLs, listed under the page. */
    sources: z.array(z.string()).default([]),
    /** URL of a post that grew out of this page. */
    publishedTo: z.string().optional(),
  }),
})

/** Free-form pages rendered by a fixed route, e.g. about.md → /about/. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({}),
})

export const collections = { posts, wiki, pages }
