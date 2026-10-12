import { toString as textContent } from 'mdast-util-to-string'

const MAX_LENGTH = 120

/**
 * Adds `excerpt` to `remarkPluginFrontmatter`: the text of the first
 * paragraphs, cut at about 120 characters. Used where a post has no
 * `description`.
 */
export function remarkExcerpt() {
  return (tree, file) => {
    let text = ''
    for (const node of tree.children) {
      if (node.type !== 'paragraph') continue
      text += (text ? ' ' : '') + textContent(node).replace(/\s+/g, ' ').trim()
      if (text.length >= MAX_LENGTH) break
    }
    file.data.astro.frontmatter.excerpt =
      text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH).trimEnd()}…` : text
  }
}
