import { visit } from 'unist-util-visit'

/**
 * Renders the Markdown directives (remark-directive syntax) used in posts:
 *
 *   :::note / :::tip / :::important / :::warning / :::caution   admonitions
 *   :::note[Custom title]                                        … with a title
 *   ::github{repo="owner/repo"}                                  GitHub card
 *   ::googlemap{url="…" title="…" addr="…" image="…"}            map card
 *   :::photo{title="…"} ![alt](./a.jpg) :::                      photo card
 *   :::photosm{title="…"} … :::                                  small photo card
 *   ::::photorow … ::::                                          photo cards side by side
 *   :spoiler[text]                                               hidden until hover
 *
 * GitHub-style `> [!NOTE]` blocks become the same admonitions through
 * remark-github-admonitions-to-directives, which runs first. Each node is
 * rewritten in place with `data.hName` / `hProperties` / `hChildren`, which
 * mdast-util-to-hast turns into elements; class names match
 * src/styles/directives.css. Unknown directives are put back as plain text,
 * so a stray `:word` in prose survives.
 */
export function remarkDirectives() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!isDirective(node)) return
      const render = RENDERERS[node.name]
      if (render && render.kind === node.type) {
        render.fn(node)
      } else if (parent && index !== undefined) {
        parent.children.splice(index, 1, ...asText(node))
        return index
      }
    })
  }
}

const ADMONITIONS = ['note', 'tip', 'important', 'warning', 'caution']

const RENDERERS = {
  ...Object.fromEntries(
    ADMONITIONS.map((type) => [
      type,
      { kind: 'containerDirective', fn: (n) => admonition(n, type) },
    ]),
  ),
  github: { kind: 'leafDirective', fn: githubCard },
  googlemap: { kind: 'leafDirective', fn: mapCard },
  photo: { kind: 'containerDirective', fn: (n) => photoCard(n, ['card-photo']) },
  photosm: { kind: 'containerDirective', fn: (n) => photoCard(n, ['card-photo', 'photo-sm']) },
  photorow: {
    kind: 'containerDirective',
    fn: (n) => element(n, 'div', { className: ['photo-row'] }),
  },
  spoiler: { kind: 'textDirective', fn: (n) => element(n, 'span', { className: ['spoiler'] }) },
}

function isDirective(node) {
  return (
    node.type === 'containerDirective' ||
    node.type === 'leafDirective' ||
    node.type === 'textDirective'
  )
}

function element(node, tagName, properties = {}, children) {
  node.data = { ...node.data, hName: tagName, hProperties: properties }
  if (children) node.data.hChildren = children
}

/** A wrapper node with its own tag, for nesting mdast children inside new elements. */
function wrap(tagName, className, children) {
  return {
    type: 'directiveWrapper',
    data: { hName: tagName, hProperties: { className: [className] } },
    children,
  }
}

const h = (tagName, className, children = []) => ({
  type: 'element',
  tagName,
  properties: className ? { className: [className] } : {},
  children: typeof children === 'string' ? [{ type: 'text', value: children }] : children,
})

/** The `[label]` of a container directive, removed from its children. */
function takeLabel(node) {
  const first = node.children[0]
  if (first?.data?.directiveLabel) {
    node.children.shift()
    return first.children
  }
  return undefined
}

function admonition(node, type) {
  const label = takeLabel(node)
  const title = label
    ? wrap('span', 'bdm-title', [wrap('div', 'bdm-label', label)])
    : wrap('span', 'bdm-title', [{ type: 'text', value: type.toUpperCase() }])
  node.children.unshift(title)
  element(node, 'blockquote', { className: ['admonition', `bdm-${type}`] })
}

/** The card is static HTML; src/scripts/github-card.ts fills it from the GitHub API. */
function githubCard(node) {
  const repo = node.attributes?.repo ?? ''
  const [owner, name] = repo.split('/')
  if (!owner || !name) return invalid(node, '::github needs repo="owner/repo"')
  element(
    node,
    'a',
    {
      className: ['card-github', 'fetch-waiting', 'no-styling'],
      href: `https://github.com/${repo}`,
      target: '_blank',
      rel: 'noopener',
      dataRepo: repo,
    },
    [
      h('div', 'gc-titlebar', [
        h('div', 'gc-titlebar-left', [
          h('div', 'gc-owner', [
            {
              ...h('div', 'gc-avatar'),
              properties: { className: ['gc-avatar'], dataField: 'avatar' },
            },
            h('div', 'gc-user', owner),
          ]),
          h('div', 'gc-divider', '/'),
          h('div', 'gc-repo', name),
        ]),
        h('div', 'github-logo'),
      ]),
      field('div', 'gc-description', 'description', ' '),
      h('div', 'gc-infobar', [
        field('div', 'gc-stars', 'stars', '0'),
        field('div', 'gc-forks', 'forks', '0'),
        field('div', 'gc-license', 'license', ' '),
        field('span', 'gc-language', 'language', ' '),
      ]),
    ],
  )
}

function field(tagName, className, name, placeholder) {
  return {
    ...h(tagName, className, placeholder),
    properties: { className: [className], dataField: name },
  }
}

function mapCard(node) {
  const { url, title, addr, image } = node.attributes ?? {}
  if (!url) return invalid(node, '::googlemap needs url="…"')
  const picture = image
    ? {
        type: 'element',
        tagName: 'img',
        properties: { className: ['map-image'], src: image, alt: '', loading: 'lazy' },
        children: [],
      }
    : h('div', 'map-pin')
  element(
    node,
    'a',
    {
      className: ['card-google-map', 'no-styling'],
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    [
      h('div', 'map-left', [picture]),
      h('div', 'map-right', [
        h('div', 'map-info', [
          h('div', 'map-title', title || 'Google Maps'),
          h('div', 'map-addr', addr ?? ''),
          h('div', 'map-url', url),
        ]),
      ]),
    ],
  )
}

function photoCard(node, classNames) {
  const title = node.attributes?.title
  // `:::photo ![alt](a.jpg) :::` parses as one paragraph; unwrap it.
  const only = node.children.length === 1 ? node.children[0] : undefined
  const content = only?.type === 'paragraph' ? only.children : node.children
  node.children = [wrap('div', 'photo-frame', content)]
  if (title) node.children.push(wrap('div', 'photo-title', [{ type: 'text', value: title }]))
  element(node, 'div', { className: classNames })
}

function invalid(node, message) {
  console.warn(`[remark-directives] ${message}`)
  element(node, 'div', { className: ['hidden'] }, [{ type: 'text', value: message }])
}

/** Restore an unknown directive as the text it was written as. */
function asText(node) {
  const prefix = { textDirective: ':', leafDirective: '::', containerDirective: ':::' }[node.type]
  const attributes = Object.entries(node.attributes ?? {})
    .map(([key, value]) => (value ? `${key}="${value}"` : key))
    .join(' ')
  const name = { type: 'text', value: `${prefix}${node.name}` }
  const attrs = attributes ? [{ type: 'text', value: `{${attributes}}` }] : []
  if (node.type === 'containerDirective') {
    return [{ type: 'paragraph', children: [name, ...attrs] }, ...node.children]
  }
  const label =
    node.children.length > 0
      ? [{ type: 'text', value: '[' }, ...node.children, { type: 'text', value: ']' }]
      : []
  const inline = [name, ...label, ...attrs]
  return node.type === 'textDirective' ? inline : [{ type: 'paragraph', children: inline }]
}
