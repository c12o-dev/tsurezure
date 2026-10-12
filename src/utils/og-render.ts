import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { html } from 'satori-html'
import { loadFonts } from './og-fonts'

/** Render an HTML string (inline styles only, Satori's subset of CSS) to a PNG. */
export async function renderPng(
  markup: string,
  size: { width: number; height: number },
  outputWidth = size.width,
): Promise<Buffer> {
  const strings = Object.assign([markup], { raw: [markup] }) as TemplateStringsArray
  const svg = await satori(html(strings), { ...size, fonts: await loadFonts() })
  return new Resvg(svg, { fitTo: { mode: 'width', value: outputWidth } }).render().asPng()
}
