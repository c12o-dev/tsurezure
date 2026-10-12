// Shared art direction for generated covers (/cover) and OG images (/og).
// Near-black ground, an amber glow whose position is derived from
// the slug, and a giant serif glyph taken from the title. Pure functions only
// so the glyph / layout rules stay unit testable.

export function slugHash(slug: string): number {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

const KANJI = /\p{Script=Han}/u
const KATAKANA = /\p{Script=Katakana}/u
const LATIN = /[A-Za-z]/

/**
 * Pick the glyph that represents a title: the first kanji, katakana or latin
 * letter. Hiragana (particles), digits and symbols are skipped. Returns
 * `fallback` (`og.fallbackGlyph` in src/config.ts) when the title has none.
 */
export function pickGlyph(title: string, fallback: string): string {
  for (const ch of title) {
    if (KANJI.test(ch) || KATAKANA.test(ch) || LATIN.test(ch)) return ch
  }
  return fallback
}

export type ArtLayout = {
  /** Glow centre, percent of width / height. */
  glowX: number
  glowY: number
  /** Glyph horizontal offset as a fraction of the canvas width. */
  glyphShift: number
}

/** Deterministic per-slug variation: glow within the upper-right quadrant ±15%. */
export function artLayout(slug: string): ArtLayout {
  const h = slugHash(slug)
  const a = (h & 0xff) / 255
  const b = ((h >>> 8) & 0xff) / 255
  const c = ((h >>> 16) & 0xff) / 255
  return {
    glowX: Math.round(62 + (a - 0.5) * 30),
    glowY: Math.round(24 + (b - 0.5) * 30),
    glyphShift: Number(((c - 0.5) * 0.12).toFixed(3)),
  }
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export const ART = {
  bg: '#0B0B0C',
  fg: '244,243,239',
  accent: '232,180,88',
} as const

/** Background layers shared by cover and OG: ground, glow, inset frame. */
export function backgroundLayers(layout: ArtLayout, w: number, h: number, inset: number): string {
  return `
		<div style="position:absolute; left:0; top:0; width:${w}px; height:${h}px; display:flex; background-image: radial-gradient(60% 70% at ${layout.glowX}% ${layout.glowY}%, rgba(${ART.accent},0.24), rgba(${ART.accent},0.06) 45%, rgba(${ART.accent},0) 72%);"></div>
		<div style="position:absolute; left:0; top:0; width:${w}px; height:${h}px; display:flex; background-image: linear-gradient(180deg, rgba(11,11,12,0) 55%, rgba(11,11,12,0.65) 100%);"></div>
		<div style="position:absolute; left:${inset}px; top:${inset}px; width:${w - inset * 2}px; height:${h - inset * 2}px; display:flex; border:1px solid rgba(${ART.fg},0.07); border-radius:6px;"></div>
	`
}
