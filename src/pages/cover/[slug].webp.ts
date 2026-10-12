import type { APIRoute, GetStaticPaths } from 'astro'
import sharp from 'sharp'
import { og, site } from '../../config'
import { getSortedPosts, type Post } from '../../utils/content'
import { ART, artLayout, backgroundLayers, escapeHtml, pickGlyph } from '../../utils/cover-art'
import { formatDate } from '../../utils/date'
import { renderPng } from '../../utils/og-render'

/**
 * Generated list and feature covers for posts without an `image`. Laid out at
 * 1600×900 and shipped as a 1280×720 WebP (the largest display is the ~680px
 * featured card at 2x). No title text: the card shows the title right below.
 */
const W = 1600
const H = 900
const INSET = 40
const OUTPUT_WIDTH = 1280

export const getStaticPaths = (async () => {
  const posts = await getSortedPosts()
  return posts
    .filter((post) => !post.data.image)
    .map((post) => ({ params: { slug: post.id }, props: { post } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post }
  const { title, category, published } = post.data
  const layout = artLayout(post.id)
  const glyph = escapeHtml(pickGlyph(title, og.fallbackGlyph))
  const kicker = escapeHtml(
    [category?.toUpperCase(), formatDate(published)].filter(Boolean).join(' · '),
  )
  const glyphLeft = Math.round(W * (0.06 + layout.glyphShift))

  const png = await renderPng(
    `
    <div style="display:flex; position:relative; width:${W}px; height:${H}px; background:${ART.bg}; overflow:hidden; font-family:'Zen Kaku';">
      ${backgroundLayers(layout, W, H, INSET)}
      <div style="position:absolute; left:${glyphLeft}px; top:-40px; display:flex; font-family:'Shippori'; font-weight:700; font-size:880px; line-height:1; letter-spacing:-0.04em; color:rgba(${ART.fg},0.11);">${glyph}</div>
      <div style="position:absolute; left:${INSET + 44}px; top:${INSET + 40}px; display:flex; align-items:center; font-family:'JetBrains Mono','Zen Kaku'; font-size:28px; letter-spacing:0.12em; color:rgba(${ART.fg},0.62);">
        <div style="display:flex; width:12px; height:12px; border-radius:6px; background:rgb(${ART.accent}); margin-right:20px;"></div>
        ${kicker}
      </div>
      <div style="position:absolute; right:${INSET + 44}px; bottom:${INSET + 34}px; display:flex; font-family:'Shippori'; font-weight:700; font-size:40px; color:rgba(${ART.fg},0.72);">${escapeHtml(site.title)}</div>
    </div>
  `,
    { width: W, height: H },
    OUTPUT_WIDTH,
  )
  const webp = await sharp(png).webp({ quality: 78, effort: 6 }).toBuffer()

  return new Response(new Uint8Array(webp), { headers: { 'Content-Type': 'image/webp' } })
}
