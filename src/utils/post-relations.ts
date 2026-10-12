// Pure selection logic for the "related / recent" block under a post, kept
// out of the page so the ordering/dedup/fallback rules can be unit-tested.
// `posts` is expected to be sorted newest first (as getSortedPosts returns).

export interface RelationPost {
  slug: string
  data: {
    title: string
    tags?: string[]
    published: Date | string | number
  }
}

export interface RelationOptions {
  relatedMax?: number
  recentMax?: number
}

export interface RelationResult<T extends RelationPost> {
  related: T[]
  recent: T[]
}

/**
 * Select related and recent posts for a given article.
 *
 * Rules:
 *  1. The current post is never included (self-exclusion).
 *  2. Related = posts sharing ≥1 tag, ranked by shared-tag count desc,
 *     ties broken by newer published date.
 *  3. Recent = latest posts, excluding the current post AND anything already
 *     chosen as related (de-dup), so a tag-thin post still gets links.
 */
export function selectRelatedAndRecent<T extends RelationPost>(
  posts: T[],
  currentSlug: string,
  tags: string[] = [],
  options: RelationOptions = {},
): RelationResult<T> {
  const relatedMax = options.relatedMax ?? 5
  const recentMax = options.recentMax ?? 5

  const others = posts.filter((post) => post.slug !== currentSlug)

  const tagSet = new Set(tags)
  const related = others
    .map((post) => ({
      post,
      score: (post.data.tags ?? []).filter((t) => tagSet.has(t)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.post.data.published).getTime() - new Date(a.post.data.published).getTime()
    })
    .slice(0, relatedMax)
    .map((entry) => entry.post)

  const relatedSlugs = new Set(related.map((post) => post.slug))
  const recent = others.filter((post) => !relatedSlugs.has(post.slug)).slice(0, recentMax)

  return { related, recent }
}
