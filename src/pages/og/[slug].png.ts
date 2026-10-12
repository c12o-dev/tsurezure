import type { APIRoute, GetStaticPaths } from 'astro'
import { loadDefaultJapaneseParser } from 'budoux'
import { og, site } from '../../config'
import { getSortedPosts, type Post } from '../../utils/content'
import { ART, artLayout, backgroundLayers, escapeHtml, pickGlyph } from '../../utils/cover-art'
import { formatDate } from '../../utils/date'
import { renderPng } from '../../utils/og-render'

/**
 * OG images, 1200×630: /og/<slug>.png for each post, and /og/site.png for
 * every other page. The title is set in Shippori Mincho and broken at BudouX
 * phrase boundaries, so Japanese titles never split mid-word.
 */
const W = 1200
const H = 630
const PAD = 80
const INSET = 28
const TEXT_WIDTH = 760

export const getStaticPaths = (async () => {
  const posts = await getSortedPosts()
  return [
    ...posts.map((post) => ({ params: { slug: post.id }, props: { post } })),
    { params: { slug: 'site' }, props: { post: undefined } },
  ]
}) satisfies GetStaticPaths

const parser = loadDefaultJapaneseParser()

/** Width in em: full-width characters count 1, ASCII about half. */
function estimateWidth(text: string): number {
  let width = 0
  for (const ch of text) width += ch.charCodeAt(0) > 0x7f ? 1 : 0.55
  return width
}

function splitTitle(title: string, fontSize: number): string[] {
  const maxUnits = (TEXT_WIDTH / fontSize) * 0.98
  const lines: string[] = []
  let current = ''
  for (const phrase of parser.parse(title)) {
    const next = current + phrase
    if (estimateWidth(next) > maxUnits && current.length > 0) {
      lines.push(current)
      current = phrase.trimStart()
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function describe(post: Post | undefined) {
  if (!post) return { key: 'site', title: site.subtitle, kicker: og.kicker, glyph: og.glyph }
  const { title, category, published } = post.data
  return {
    key: post.id,
    title,
    kicker: [category?.toUpperCase(), formatDate(published)].filter(Boolean).join(' · '),
    glyph: pickGlyph(title, og.fallbackGlyph),
  }
}

export const GET: APIRoute = async ({ props }) => {
  const input = describe((props as { post: Post | undefined }).post)
  const layout = artLayout(input.key)
  const length = input.title.length
  const fontSize = length > 40 ? 50 : length > 28 ? 56 : length > 16 ? 62 : 68
  const titleLines = splitTitle(input.title, fontSize)
    .slice(0, 4)
    .map((line) => `<div style="display:flex;">${escapeHtml(line)}</div>`)
    .join('')

  const png = await renderPng(
    `
    <div style="display:flex; position:relative; width:${W}px; height:${H}px; background:${ART.bg}; overflow:hidden; font-family:'Zen Kaku';">
      ${backgroundLayers({ ...layout, glowX: Math.max(layout.glowX, 70) }, W, H, INSET)}
      <div style="position:absolute; right:${-30 - Math.round(layout.glyphShift * 400)}px; top:-70px; display:flex; font-family:'Shippori'; font-weight:700; font-size:600px; line-height:1; letter-spacing:-0.04em; color:rgba(${ART.fg},0.09);">${escapeHtml(input.glyph)}</div>
      <div style="position:absolute; left:${PAD}px; top:${PAD}px; width:${TEXT_WIDTH}px; height:${H - PAD * 2}px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; align-items:center; font-family:'JetBrains Mono','Zen Kaku'; font-size:20px; letter-spacing:0.12em; color:rgba(${ART.fg},0.62);">
          <div style="display:flex; width:10px; height:10px; border-radius:5px; background:rgb(${ART.accent}); margin-right:16px;"></div>
          ${escapeHtml(input.kicker)}
        </div>
        <div style="display:flex; flex-direction:column; font-family:'Shippori'; font-weight:700; font-size:${fontSize}px; line-height:1.32; color:rgb(${ART.fg});">
          ${titleLines}
        </div>
        <div style="display:flex; align-items:center; font-family:'Shippori'; font-weight:700; font-size:28px; color:rgba(${ART.fg},0.78);">
          ${escapeHtml(site.title)}
          <div style="display:flex; font-family:'JetBrains Mono'; font-weight:500; font-size:16px; letter-spacing:0.08em; color:rgba(${ART.fg},0.45); margin-left:20px;">${escapeHtml(og.domainLabel)}</div>
        </div>
      </div>
    </div>
  `,
    { width: W, height: H },
  )

  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
