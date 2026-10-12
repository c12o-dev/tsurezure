import { describe, expect, it } from 'vitest'
import { artLayout, escapeHtml, pickGlyph, slugHash } from './cover-art'

describe('pickGlyph', () => {
  it('takes the first latin letter', () => {
    expect(pickGlyph('Cloudflare を無料枠だけで運用する', 'T')).toBe('C')
    expect(pickGlyph('ruff の最小構成', 'T')).toBe('r')
  })
  it('takes kanji and katakana', () => {
    expect(pickGlyph('競馬の話', 'T')).toBe('競')
    expect(pickGlyph('「パンダ」で始まる', 'T')).toBe('パ')
  })
  it('skips hiragana, digits and symbols', () => {
    expect(pickGlyph('なぜ 2026 年に書くのか', 'T')).toBe('年')
    expect(pickGlyph('「」・123', 'T')).toBe('T')
  })
})

describe('artLayout', () => {
  it('is deterministic and bounded', () => {
    for (const slug of ['a', 'cloudflare-free-tier-guide', 'fstring', 'x'.repeat(80)]) {
      const l = artLayout(slug)
      expect(artLayout(slug)).toEqual(l)
      expect(l.glowX).toBeGreaterThanOrEqual(47)
      expect(l.glowX).toBeLessThanOrEqual(77)
      expect(l.glowY).toBeGreaterThanOrEqual(9)
      expect(l.glowY).toBeLessThanOrEqual(39)
      expect(Math.abs(l.glyphShift)).toBeLessThanOrEqual(0.06)
    }
  })
  it('varies between slugs', () => {
    expect(slugHash('a')).not.toBe(slugHash('b'))
  })
})

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml(`<a href="x">&</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })
})
