import { definePlugin, type ExpressiveCodePlugin } from 'astro-expressive-code'
import { h, s } from 'hastscript'

// Material Symbols "content_copy" and "check", 960-unit viewBox.
const COPY =
  'M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z'
const CHECK = 'M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z'

const icon = (className: string, d: string) =>
  s(
    'svg',
    { viewBox: '0 -960 960 960', className: ['copy-btn-icon', className], 'aria-hidden': 'true' },
    [s('path', { d })],
  )

/**
 * Appends a copy button to every code block. The click handler lives in
 * src/scripts/copy-code.ts (one delegated listener), so no inline script is
 * emitted. Replaces Expressive Code's own button, which is turned off in
 * astro.config.mjs.
 */
export function pluginCopyButton(label: string): ExpressiveCodePlugin {
  return definePlugin({
    name: 'Copy button',
    hooks: {
      postprocessRenderedBlock: ({ renderData }) => {
        const pre = findPre(renderData.blockAst)
        pre?.children.push(
          h('button', { type: 'button', className: ['copy-btn'], 'aria-label': label }, [
            icon('copy-icon', COPY),
            icon('success-icon', CHECK),
          ]),
        )
      },
    },
  })
}

type Node = { type: string; tagName?: string; children?: Node[] }

function findPre<T extends Node>(node: T): (T & { children: Node[] }) | undefined {
  if (node.type === 'element' && node.tagName === 'pre') return node as T & { children: Node[] }
  for (const child of node.children ?? []) {
    const found = findPre(child)
    if (found) return found as T & { children: Node[] }
  }
  return undefined
}
