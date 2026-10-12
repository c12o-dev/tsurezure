export function getPostUrl(slug: string): string {
  return `/posts/${slug}/`
}

export function getWikiUrl(id: string): string {
  return `/wiki/${id}/`
}

/** Archive filtered by tag. The filter runs client-side; the page lists every post. */
export function getTagUrl(tag: string): string {
  return `/archive/?tag=${encodeURIComponent(tag.trim())}`
}

/** Archive filtered by category, or by "no category" for an empty one. */
export function getCategoryUrl(category: string | null | undefined): string {
  const name = category?.trim()
  return name ? `/archive/?category=${encodeURIComponent(name)}` : '/archive/?uncategorized=true'
}

/** Generated cover for a post without `image` (src/pages/cover/[slug].webp.ts). */
export function getGeneratedCoverUrl(slug: string): string {
  return `/cover/${slug}.webp`
}

/** Generated OG image (src/pages/og/[slug].png.ts). `site` is the site-wide image. */
export function getOgImageUrl(slug: string): string {
  return `/og/${slug}.png`
}
