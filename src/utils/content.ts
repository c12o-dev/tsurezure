import { type CollectionEntry, getCollection } from 'astro:content'
import { features, wiki as wikiConfig } from '../config'

export type Post = CollectionEntry<'posts'>
export type WikiPage = CollectionEntry<'wiki'>

/** Drafts are visible in `pnpm dev` and hidden from production builds. */
const published = ({ data }: { data: { draft: boolean } }) => !import.meta.env.PROD || !data.draft

const byDateDesc = (a: Date, b: Date) => b.getTime() - a.getTime()

/** Posts, newest first. */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', published)
  return posts.sort((a, b) => byDateDesc(a.data.published, b.data.published))
}

/** The posts before and after `slug` in a newest-first list. */
export function getAdjacentPosts(
  posts: Post[],
  slug: string,
): { newer: Post | undefined; older: Post | undefined } {
  const i = posts.findIndex((post) => post.id === slug)
  return { newer: i > 0 ? posts[i - 1] : undefined, older: i >= 0 ? posts[i + 1] : undefined }
}

export type Count = { name: string; count: number }

function countBy(values: string[]): Count[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Tags with post counts, alphabetical. */
export function getTags(posts: Post[]): Count[] {
  return countBy(posts.flatMap((post) => post.data.tags))
}

/** Categories with post counts, alphabetical. Posts without one are left out. */
export function getCategories(posts: Post[]): Count[] {
  return countBy(posts.map((post) => post.data.category?.trim() ?? '').filter(Boolean))
}

/** `web/http-cache` → `web`. */
export function wikiTopic(id: string): string {
  return id.split('/')[0] ?? id
}

/** Display name for a wiki topic folder. */
export function topicLabel(topic: string): string {
  return wikiConfig.topics[topic] ?? topic
}

/** Wiki pages, most recently updated first. Empty when `features.wiki` is off. */
export async function getSortedWiki(): Promise<WikiPage[]> {
  if (!features.wiki) return []
  const pages = await getCollection('wiki', published)
  return pages.sort((a, b) => byDateDesc(a.data.updated, b.data.updated))
}

export type WikiTopicGroup = { topic: string; entries: WikiPage[]; updated: Date }

/** Wiki pages grouped by topic, the most recently updated topic first. */
export async function getWikiByTopic(): Promise<WikiTopicGroup[]> {
  const groups = new Map<string, WikiPage[]>()
  for (const page of await getSortedWiki()) {
    const topic = wikiTopic(page.id)
    groups.set(topic, [...(groups.get(topic) ?? []), page])
  }
  return [...groups].map(([topic, entries]) => ({
    topic,
    entries,
    updated: entries[0].data.updated,
  }))
}
