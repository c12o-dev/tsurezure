/** Fill `{name}` placeholders in a UI string: `fill('{n} posts', { n: 3 })`. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
