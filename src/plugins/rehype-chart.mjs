import { h } from 'hastscript'
import { visit } from 'unist-util-visit'
import YAML from 'yaml'
import { renderChart } from '../utils/chart-svg.ts'
import { codeChild, textOf } from './rehype-mermaid.mjs'

/**
 * Turns ```chart code blocks (YAML) into a static <figure> with an inline SVG
 * drawn at build time — no runtime JS, styled by tokens.css variables.
 *
 * Runs before astro-expressive-code (like rehype-mermaid) so
 * the block never receives syntax highlighting.
 *
 * ```chart
 * type: bar            # bar | column | line
 * title: 1日あたりの上限
 * unit: /日
 * scale: log           # linear (default) | log
 * caption: 出典など
 * data:                # single series
 *   - [読み取り, 5000000]
 * ```
 * Multi-series: `labels: [...]` + `series: [{ name, values: [...] }]`.
 *
 * `labels` are the words for the accessible table (`ui.chart` in src/config.ts).
 */
export default function rehypeChart({ labels } = {}) {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      const code = codeChild(node, 'language-chart')
      if (!code || !parent || index === undefined) return
      let spec
      try {
        spec = YAML.parse(textOf(code))
      } catch (error) {
        parent.children[index] = errorNode(`chart: YAML を読めません (${error.message})`)
        return
      }
      try {
        parent.children[index] = renderChart(spec, labels)
      } catch (error) {
        parent.children[index] = errorNode(`chart: ${error.message}`)
      }
    })
  }
}

function errorNode(message) {
  return h('div', { class: 'chart-error', role: 'alert' }, message)
}
