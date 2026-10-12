import { visit } from 'unist-util-visit'

/**
 * Turns ```mermaid code blocks into <pre class="mermaid"> for the client-side
 * renderer (src/scripts/mermaid.ts). Runs before Expressive Code, so the block
 * never gets syntax highlighting.
 */
export default function rehypeMermaid() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      const code = codeChild(node, 'language-mermaid')
      if (!code || !parent || index === undefined) return
      parent.children[index] = {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: textOf(code) }],
      }
    })
  }
}

/** The <code class="language-…"> inside a <pre>, if `node` is such a block. */
export function codeChild(node, className) {
  if (node.tagName !== 'pre' || node.children.length !== 1) return undefined
  const code = node.children[0]
  const classes = code.type === 'element' ? code.properties?.className : undefined
  return code.tagName === 'code' && Array.isArray(classes) && classes.includes(className)
    ? code
    : undefined
}

export function textOf(node) {
  if (node.type === 'text') return node.value
  return Array.isArray(node.children) ? node.children.map(textOf).join('') : ''
}
