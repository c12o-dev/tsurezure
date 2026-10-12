import { describe, expect, it } from 'vitest'
import { type RelationPost, selectRelatedAndRecent } from './post-relations'

// Helper: build a post. `pub` is a day offset; larger = newer.
function post(slug: string, tags: string[], day: number): RelationPost {
  return {
    slug,
    data: {
      title: slug,
      tags,
      published: new Date(2026, 0, day),
    },
  }
}

// Sorted by published desc, like getSortedPostsList returns.
const posts: RelationPost[] = [
  post('current', ['astro', 'seo'], 20),
  post('a', ['astro', 'seo'], 19), // shares 2 tags
  post('b', ['astro'], 18), // shares 1 tag
  post('c', ['seo'], 17), // shares 1 tag
  post('d', ['cloudflare'], 16), // shares 0
  post('e', ['unrelated'], 15), // shares 0
]

describe('selectRelatedAndRecent', () => {
  it('excludes the current post from both blocks', () => {
    const { related, recent } = selectRelatedAndRecent(posts, 'current', ['astro', 'seo'])
    expect(related.map((p) => p.slug)).not.toContain('current')
    expect(recent.map((p) => p.slug)).not.toContain('current')
  })

  it('ranks related by shared-tag count desc, ties broken by newer first', () => {
    const { related } = selectRelatedAndRecent(posts, 'current', ['astro', 'seo'])
    // a shares 2 (top). b and c share 1 each; b (day18) newer than c (day17).
    expect(related.map((p) => p.slug)).toEqual(['a', 'b', 'c'])
  })

  it('fills recent for a tag-thin post and never duplicates related', () => {
    const { related, recent } = selectRelatedAndRecent(
      posts,
      'current',
      ['nonexistent'], // no shared tags -> related empty
    )
    expect(related).toEqual([])
    // recent = latest others, current excluded
    expect(recent.map((p) => p.slug)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('de-dups: a post chosen as related is not repeated in recent', () => {
    const { related, recent } = selectRelatedAndRecent(posts, 'current', ['astro', 'seo'])
    const relatedSlugs = new Set(related.map((p) => p.slug))
    for (const r of recent) {
      expect(relatedSlugs.has(r.slug)).toBe(false)
    }
  })

  it('respects relatedMax and recentMax', () => {
    const { related, recent } = selectRelatedAndRecent(posts, 'current', ['astro', 'seo'], {
      relatedMax: 1,
      recentMax: 2,
    })
    expect(related.map((p) => p.slug)).toEqual(['a'])
    expect(recent).toHaveLength(2)
  })
})
