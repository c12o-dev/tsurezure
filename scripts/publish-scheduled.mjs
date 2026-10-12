/*
 * Publish scheduled posts: every post with `draft: true`, `reviewed: true` and
 * a `published` date of today or earlier gets `draft: false`, and its
 * `reviewed` line is removed. Run daily by .github/workflows/publish-scheduled.yml.
 *
 *   node scripts/publish-scheduled.mjs [--dry-run]
 *
 * "Today" is the runner's local date; the workflow sets TZ (Asia/Tokyo by
 * default). Prints one `Published: <file>` line per post.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'src/content/posts'
const dryRun = process.argv.includes('--dry-run')
const today = new Date().toLocaleDateString('sv-SE')

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return markdownFiles(full)
    return entry.name.endsWith('.md') ? [full] : []
  })
}

const field = (frontmatter, key) =>
  frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]*?)["']?\\s*$`, 'm'))?.[1]

let count = 0
for (const file of markdownFiles(ROOT)) {
  const text = fs.readFileSync(file, 'utf8')
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) continue
  const frontmatter = match[1]
  if (field(frontmatter, 'draft') !== 'true' || field(frontmatter, 'reviewed') !== 'true') continue
  const published = field(frontmatter, 'published')?.slice(0, 10)
  if (!published || published > today) continue

  const updated = frontmatter
    .replace(/^draft:\s*true\s*$/m, 'draft: false')
    .replace(/^reviewed:\s*true\s*\r?\n?/m, '')
  if (!dryRun) fs.writeFileSync(file, text.replace(frontmatter, updated))
  console.log(`${dryRun ? 'Would publish' : 'Published'}: ${file}`)
  count++
}
if (count === 0) console.log('No posts to publish today.')
