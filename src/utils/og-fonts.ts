import fs from 'node:fs/promises'

// Static woff files for Satori (it cannot read woff2 or variable fonts).
// The "japanese" subsets already include Latin; registering a separate Latin
// file under the same name shadows them and kanji render as .notdef.
const FONT_FILES = {
  sansRegular:
    './node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-400-normal.woff',
  sansBold:
    './node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-700-normal.woff',
  serifBold:
    './node_modules/@fontsource/shippori-mincho-b1/files/shippori-mincho-b1-japanese-700-normal.woff',
  mono: './node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff',
} as const

type SatoriFont = {
  name: string
  data: Buffer
  weight: 400 | 500 | 700
  style: 'normal'
}

let cache: SatoriFont[] | null = null

export async function loadFonts(): Promise<SatoriFont[]> {
  if (cache) return cache
  const entries = Object.entries(FONT_FILES) as [keyof typeof FONT_FILES, string][]
  const data = Object.fromEntries(
    await Promise.all(entries.map(async ([k, p]) => [k, await fs.readFile(p)] as const)),
  ) as Record<keyof typeof FONT_FILES, Buffer>
  cache = [
    { name: 'Zen Kaku', data: data.sansRegular, weight: 400, style: 'normal' },
    { name: 'Zen Kaku', data: data.sansBold, weight: 700, style: 'normal' },
    { name: 'Shippori', data: data.serifBold, weight: 700, style: 'normal' },
    { name: 'JetBrains Mono', data: data.mono, weight: 500, style: 'normal' },
  ]
  return cache
}
