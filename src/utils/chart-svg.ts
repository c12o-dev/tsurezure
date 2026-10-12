// Build-time chart renderer for the ```chart directive (see rehype-chart.mjs).
// Pure functions over a small spec; emits a hast <figure> with inline SVG and
// a visually hidden table for screen readers. Kept free of DOM/astro imports so
// it is unit testable.

import type { Element } from 'hast'
import { h, s } from 'hastscript'

export type ChartType = 'bar' | 'column' | 'line'

export interface ChartSpec {
  type?: ChartType
  title?: string
  caption?: string
  unit?: string
  scale?: 'linear' | 'log'
  /** Single series: [label, value] pairs. */
  data?: [string, number][]
  /** Multi series. */
  labels?: (string | number)[]
  series?: { name: string; values: number[] }[]
  /** Max value override (linear only). */
  max?: number
}

type Series = { name: string; values: number[] }
type Normalized = {
  type: ChartType
  title: string
  caption: string
  unit: string
  scale: 'linear' | 'log'
  labels: string[]
  series: Series[]
  max?: number
}

const W = 720
const FONT = 12
const MAX_SERIES = 4

export function normalize(spec: ChartSpec): Normalized {
  if (!spec || typeof spec !== 'object') throw new Error('spec が空です')
  const type = spec.type ?? 'bar'
  if (!['bar', 'column', 'line'].includes(type))
    throw new Error(`type "${type}" は未対応です (bar | column | line)`)
  let labels: string[]
  let series: Series[]
  if (spec.data) {
    if (!Array.isArray(spec.data) || spec.data.some((d) => !Array.isArray(d) || d.length < 2))
      throw new Error('data は [ラベル, 値] の配列にしてください')
    labels = spec.data.map((d) => String(d[0]))
    series = [{ name: spec.title ?? '', values: spec.data.map((d) => Number(d[1])) }]
  } else if (spec.labels && spec.series) {
    labels = spec.labels.map(String)
    series = spec.series.slice(0, MAX_SERIES).map((s) => ({
      name: String(s.name ?? ''),
      values: s.values.map(Number),
    }))
    for (const s of series) {
      if (s.values.length !== labels.length)
        throw new Error(`series "${s.name}" の値の数が labels と一致しません`)
    }
  } else {
    throw new Error('data か labels + series が必要です')
  }
  if (labels.length === 0) throw new Error('データが空です')
  const scale = spec.scale === 'log' ? 'log' : 'linear'
  for (const s of series) {
    for (const v of s.values) {
      if (!Number.isFinite(v)) throw new Error('数値でない値があります')
      if (scale === 'log' && v <= 0) throw new Error('log スケールでは 0 以下の値を描けません')
    }
  }
  return {
    type,
    title: spec.title ?? '',
    caption: spec.caption ?? '',
    unit: spec.unit ?? '',
    scale,
    labels,
    series,
    max: spec.max,
  }
}

// ---------- scales ----------

export function niceMax(max: number): number {
  if (max <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(max))
  const m = max / exp
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10
  return nice * exp
}

export function linearTicks(max: number): number[] {
  const top = niceMax(max)
  const step = top / (top / 10 ** Math.floor(Math.log10(top)) <= 2.5 ? 5 : 4)
  const ticks: number[] = []
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Number(v.toPrecision(12)))
  return ticks
}

export function logTicks(min: number, max: number): number[] {
  const lo = Math.floor(Math.log10(min))
  const hi = Math.ceil(Math.log10(max))
  const ticks: number[] = []
  for (let e = lo; e <= hi; e++) ticks.push(10 ** e)
  return ticks
}

export function formatNumber(v: number, unit = ''): string {
  const abs = Math.abs(v)
  let s: string
  if (abs >= 1e8) s = `${trim(v / 1e8)}億`
  else if (abs >= 1e4) s = `${trim(v / 1e4)}万`
  else s = Number.isInteger(v) ? v.toLocaleString('ja-JP') : trim(v)
  return s + unit
}
function trim(n: number): string {
  return String(Number(n.toFixed(2)))
}

// ---------- renderers (hast SVG via hastscript's `s`) ----------

const f = (v: number) => Number(v.toFixed(1))

/** Words used in the accessible table and the figure label (`ui.chart` in src/config.ts). */
export type ChartLabels = { item: string; value: string; fallbackTitle: string }

const DEFAULT_LABELS: ChartLabels = { item: 'Item', value: 'Value', fallbackTitle: 'Chart' }

export function renderChart(spec: ChartSpec, labels: ChartLabels = DEFAULT_LABELS): Element {
  const n = normalize(spec)
  const svg =
    n.type === 'bar' ? renderBar(n) : n.type === 'column' ? renderColumn(n) : renderLine(n)
  const table = h(
    'table',
    { class: 'sr-only' },
    h(
      'thead',
      h('tr', h('th', labels.item), ...n.series.map((sr) => h('th', sr.name || labels.value))),
    ),
    h(
      'tbody',
      ...n.labels.map((l, i) =>
        h(
          'tr',
          h('th', { scope: 'row' }, l),
          ...n.series.map((sr) => h('td', formatNumber(sr.values[i], n.unit))),
        ),
      ),
    ),
  )
  const children: (Element | null)[] = [
    n.title ? h('p', { class: 'chart__title mono-label' }, n.title) : null,
    n.series.length > 1 ? renderLegend(n) : null,
    svg,
    table,
    n.caption ? h('figcaption', { class: 'chart__caption' }, n.caption) : null,
  ]
  return h(
    'figure',
    {
      class: `chart chart--${n.type}${n.scale === 'log' ? ' chart--log' : ''}`,
      role: 'group',
      'aria-label': n.title || labels.fallbackTitle,
    },
    ...children.filter((c): c is Element => c !== null),
  )
}

function renderLegend(n: Normalized): Element {
  return h(
    'ul',
    { class: 'chart__legend' },
    ...n.series.map((sr, i) =>
      h('li', h('span', { class: `chart__swatch is-s${i}`, 'aria-hidden': 'true' }), sr.name),
    ),
  )
}

function valueScale(
  n: Normalized,
  length: number,
): { pos: (v: number) => number; ticks: number[] } {
  const all = n.series.flatMap((sr) => sr.values)
  const max = n.max ?? Math.max(...all)
  if (n.scale === 'log') {
    const min = Math.min(...all)
    const ticks = logTicks(min, max)
    const lo = Math.log10(ticks[0])
    const hi = Math.log10(ticks[ticks.length - 1])
    return { pos: (v) => ((Math.log10(v) - lo) / (hi - lo)) * length, ticks }
  }
  const ticks = linearTicks(max)
  const top = ticks[ticks.length - 1]
  return { pos: (v) => (v / top) * length, ticks }
}

function svgRoot(H: number, children: Element[]): Element {
  return s(
    'svg',
    {
      class: 'chart__svg',
      viewBox: `0 0 ${W} ${H}`,
      width: W,
      height: H,
      'aria-hidden': 'true',
      focusable: 'false',
    },
    ...children,
  )
}
const line = (cls: string, x1: number, y1: number, x2: number, y2: number) =>
  s('line', { class: cls, x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) })
const text = (cls: string, x: number, y: number, value: string, anchor?: string) =>
  s(
    'text',
    {
      class: cls,
      x: f(x),
      y: f(y),
      ...(anchor ? { 'text-anchor': anchor } : {}),
    },
    value,
  )

function renderBar(n: Normalized): Element {
  const multi = n.series.length > 1
  const rowH = multi ? 14 * n.series.length + 10 : 30
  const labelW = Math.min(240, Math.max(...n.labels.map((l) => l.length)) * FONT * 0.92 + 16)
  const left = labelW
  const right = 84
  const top = 8
  const bottom = 30
  const plotW = W - left - right
  const H = top + n.labels.length * rowH + bottom
  const { pos, ticks } = valueScale(n, plotW)
  const out: Element[] = []
  for (const t of ticks) {
    const x = left + pos(t)
    out.push(line('chart__grid', x, top, x, H - bottom))
    out.push(text('chart__tick', x, H - bottom + 18, formatNumber(t), 'middle'))
  }
  n.labels.forEach((label, i) => {
    const y0 = top + i * rowH
    out.push(text('chart__label', left - 12, y0 + rowH / 2 + 4, label, 'end'))
    n.series.forEach((sr, si) => {
      const bh = multi ? 12 : 16
      const y = multi ? y0 + 5 + si * 14 : y0 + (rowH - bh) / 2
      const w = Math.max(2, pos(sr.values[i]))
      out.push(
        s('rect', {
          class: `chart__bar is-s${si}`,
          x: f(left),
          y: f(y),
          width: f(w),
          height: bh,
          rx: 3,
        }),
      )
      if (!multi)
        out.push(
          text('chart__value', left + w + 8, y + bh / 2 + 4, formatNumber(sr.values[i], n.unit)),
        )
    })
  })
  out.push(line('chart__axis', left, top, left, H - bottom))
  return svgRoot(H, out)
}

function renderColumn(n: Normalized): Element {
  const left = 56
  const right = 12
  const top = 12
  const bottom = 44
  const H = 320
  const plotW = W - left - right
  const plotH = H - top - bottom
  const { pos, ticks } = valueScale(n, plotH)
  const group = plotW / n.labels.length
  const gap = Math.min(24, group * 0.3)
  const bw = (group - gap) / n.series.length
  const out: Element[] = []
  for (const t of ticks) {
    const y = H - bottom - pos(t)
    out.push(line('chart__grid', left, y, W - right, y))
    out.push(text('chart__tick', left - 8, y + 4, formatNumber(t), 'end'))
  }
  n.labels.forEach((label, i) => {
    const x0 = left + i * group + gap / 2
    n.series.forEach((sr, si) => {
      const hgt = Math.max(2, pos(sr.values[i]))
      out.push(
        s('rect', {
          class: `chart__bar is-s${si}`,
          x: f(x0 + si * bw),
          y: f(H - bottom - hgt),
          width: f(bw - 2),
          height: f(hgt),
          rx: 3,
        }),
      )
    })
    out.push(text('chart__label', x0 + (group - gap) / 2, H - bottom + 20, label, 'middle'))
  })
  out.push(line('chart__axis', left, H - bottom, W - right, H - bottom))
  return svgRoot(H, out)
}

function renderLine(n: Normalized): Element {
  const left = 56
  const right = 16
  const top = 12
  const bottom = 44
  const H = 320
  const plotW = W - left - right
  const plotH = H - top - bottom
  const { pos, ticks } = valueScale(n, plotH)
  const step = n.labels.length > 1 ? plotW / (n.labels.length - 1) : 0
  const out: Element[] = []
  for (const t of ticks) {
    const y = H - bottom - pos(t)
    out.push(line('chart__grid', left, y, W - right, y))
    out.push(text('chart__tick', left - 8, y + 4, formatNumber(t), 'end'))
  }
  n.labels.forEach((label, i) => {
    out.push(text('chart__label', left + i * step, H - bottom + 20, label, 'middle'))
  })
  n.series.forEach((sr, si) => {
    const pts = sr.values.map((v, i) => [left + i * step, H - bottom - pos(v)] as const)
    const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`).join(' ')
    out.push(s('path', { class: `chart__line is-s${si}`, d }))
    for (const [x, y] of pts)
      out.push(
        s('circle', {
          class: `chart__dot is-s${si}`,
          cx: f(x),
          cy: f(y),
          r: 3.5,
        }),
      )
  })
  out.push(line('chart__axis', left, H - bottom, W - right, H - bottom))
  return svgRoot(H, out)
}
