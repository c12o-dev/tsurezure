import { toHtml } from 'hast-util-to-html'
import { describe, expect, it } from 'vitest'
import { formatNumber, linearTicks, logTicks, niceMax, normalize, renderChart } from './chart-svg'

describe('scales', () => {
  it('rounds max up to a nice number', () => {
    expect(niceMax(73)).toBe(100)
    expect(niceMax(120)).toBe(200)
    expect(niceMax(5_000_000)).toBe(5_000_000)
  })
  it('produces linear ticks from zero', () => {
    expect(linearTicks(73)[0]).toBe(0)
    expect(linearTicks(73).at(-1)).toBe(100)
  })
  it('produces powers of ten for log', () => {
    expect(logTicks(10_000, 5_000_000)).toEqual([1e4, 1e5, 1e6, 1e7])
  })
})

describe('formatNumber', () => {
  it('uses Japanese units', () => {
    expect(formatNumber(5_000_000)).toBe('500万')
    expect(formatNumber(100_000, '/日')).toBe('10万/日')
    expect(formatNumber(1200)).toBe('1,200')
    expect(formatNumber(2.5)).toBe('2.5')
  })
})

describe('normalize', () => {
  it('rejects bad input with a readable message', () => {
    expect(() => normalize({ type: 'pie' as never, data: [['a', 1]] })).toThrow(/未対応/)
    expect(() => normalize({ scale: 'log', data: [['a', 0]] })).toThrow(/log/)
    expect(() => normalize({ labels: ['a'], series: [{ name: 's', values: [1, 2] }] })).toThrow(
      /一致/,
    )
  })
})

describe('renderChart', () => {
  const spec = {
    type: 'bar' as const,
    title: 'T',
    unit: '/日',
    scale: 'log' as const,
    data: [
      ['A', 100],
      ['B', 10_000],
    ] as [string, number][],
  }
  it('emits a figure with svg and an accessible table', () => {
    const html = toHtml(renderChart(spec))
    expect(html).toContain('<figure class="chart chart--bar chart--log"')
    expect(html).toContain('<svg')
    expect(html).toContain('<table class="sr-only">')
    expect(html).toContain('1万/日')
    expect(html).toContain('<rect')
  })
  it('escapes labels', () => {
    const html = toHtml(renderChart({ data: [['<b>', 1]] }))
    expect(html).toContain('&#x3C;b>')
    expect(html).not.toContain('<b>')
  })
  it('renders line and column charts with multiple series', () => {
    for (const type of ['line', 'column'] as const) {
      const html = toHtml(
        renderChart({
          type,
          labels: ['1', '2', '3'],
          series: [
            { name: 'a', values: [1, 2, 3] },
            { name: 'b', values: [3, 2, 1] },
          ],
        }),
      )
      expect(html).toContain('chart__legend')
      expect(html).toContain(type === 'line' ? '<path' : '<rect')
    }
  })
})
