import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'yaml'

/**
 * Maps `/posts/<slug>/` and `/wiki/<topic>/<page>/` to their last modified
 * date (`updated`, else `published` / `created`) for the sitemap. Reads the
 * frontmatter directly because astro.config runs before the content layer.
 * Slugs follow the glob loader: the `slug` field, else the slugified path
 * without `/index.md` or `.md`.
 */
export function contentLastmod() {
  return {
    ...collect('src/content/posts', '/posts/', (d) => d.updated ?? d.published),
    ...collect('src/content/wiki', '/wiki/', (d) => d.updated ?? d.created),
  }
}

function collect(base, prefix, pick) {
  const map = {}
  for (const file of markdownFiles(base)) {
    const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match) continue
    let data
    try {
      data = parse(match[1]) ?? {}
    } catch {
      continue
    }
    if (data.draft === true) continue
    const date = new Date(pick(data))
    if (Number.isNaN(date.getTime())) continue
    const slug = data.slug ?? pathSlug(relative(base, file))
    map[`${prefix}${slug}/`] = date.toISOString()
  }
  return map
}

/** Approximates the glob loader's github-slugger ids: `My Post/index.md` → `my-post`. */
function pathSlug(path) {
  return path
    .replace(/\.md$/, '')
    .split(/[\\/]/)
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s/g, '-'),
    )
    .join('/')
    .replace(/\/index$/, '')
}

function markdownFiles(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  })
}
