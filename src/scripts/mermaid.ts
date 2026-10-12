/**
 * Client-side Mermaid. The module is fetched only on pages that contain
 * `pre.mermaid` (emitted by src/plugins/rehype-mermaid.mjs).
 */
const nodes = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid'))
if (nodes.length > 0) {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(name).trim()
  import('mermaid').then(async ({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
      themeVariables: {
        background: token('--bg-1'),
        primaryColor: token('--bg-2'),
        primaryTextColor: token('--fg-1'),
        primaryBorderColor: token('--line-2'),
        lineColor: token('--accent'),
        edgeLabelBackground: token('--bg-1'),
        fontFamily: token('--font-sans'),
      },
    })
    await mermaid.run({ nodes })
  })
}
