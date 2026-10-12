/*
 * Create a post or a wiki page from a template, dated today.
 *
 *   pnpm new post <slug>            → src/content/posts/<slug>/index.md
 *   pnpm new wiki <topic>/<page>    → src/content/wiki/<topic>/<page>.md
 *
 * Names are kebab-case. Existing files are never overwritten: a wiki page
 * grows in place, so the script points at it instead.
 */
import fs from 'node:fs'
import path from 'node:path'

const [kind, name] = process.argv.slice(2).filter((arg) => arg !== '--')
const today = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time

const kinds = {
  post: {
    pattern: /^[a-z0-9-]+$/,
    example: 'my-first-post',
    file: (n) => path.join('src/content/posts', n, 'index.md'),
    template: (n) => `---
title: ${n}
published: ${today}
description: ''
tags: []
category: ''
# Drafts render in \`pnpm dev\` only. Set reviewed: true to publish on \`published\`
# with .github/workflows/publish-scheduled.yml.
draft: true
reviewed: false
---

`,
  },
  wiki: {
    pattern: /^[a-z0-9-]+\/[a-z0-9-]+$/,
    example: 'web/cache-control',
    file: (n) => path.join('src/content/wiki', `${n}.md`),
    template: (n) => `---
title: ${n.split('/')[1]}
summary: ''
tags: []
created: ${today}
updated: ${today}
sources: []
---

`,
  },
}

const spec = kinds[kind]
if (!spec || !name || !spec.pattern.test(name)) {
  console.error(`Usage:
  pnpm new post <slug>            e.g. pnpm new post ${kinds.post.example}
  pnpm new wiki <topic>/<page>    e.g. pnpm new wiki ${kinds.wiki.example}`)
  process.exit(1)
}

const file = spec.file(name)
if (fs.existsSync(file)) {
  console.error(`Already exists: ${file}`)
  process.exit(1)
}
fs.mkdirSync(path.dirname(file), { recursive: true })
fs.writeFileSync(file, spec.template(name))
console.log(`Created ${file}`)
