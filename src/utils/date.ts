/** `2026-10-12`, for `datetime` attributes and JSON-LD. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** `2026.10.12`, the dotted form used in mono labels. */
export function formatDate(date: Date): string {
  return isoDate(date).replaceAll('-', '.')
}

/** `10.12`, where the year is already shown as a group heading. */
export function formatMonthDay(date: Date): string {
  return isoDate(date).slice(5).replace('-', '.')
}
