import { toString as textContent } from 'mdast-util-to-string'
import readingTime from 'reading-time'

/**
 * Adds `words` and `minutes` to the frontmatter that `render()` returns as
 * `remarkPluginFrontmatter`. reading-time counts each CJK character as a word,
 * so for Japanese `words` is close to the character count.
 */
export function remarkReadingTime() {
  return (tree, file) => {
    const stats = readingTime(textContent(tree))
    const frontmatter = file.data.astro.frontmatter
    frontmatter.words = stats.words
    frontmatter.minutes = Math.max(1, Math.round(stats.minutes))
  }
}
