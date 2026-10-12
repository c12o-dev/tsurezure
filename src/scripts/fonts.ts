/**
 * Japanese web fonts (scripts/build-fonts.mjs → public/fonts/fonts.css).
 * First visit: attach the stylesheet after the load event so ~300 font slices
 * never compete with first paint; text shows in the system fallback, then
 * swaps. Later pages in the session hit the HTTP cache, so the stylesheet is
 * attached immediately.
 */
const KEY = 'fonts-ready'
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = '/fonts/fonts.css'
const attach = () => document.head.append(link)

let cached = false
try {
  cached = sessionStorage.getItem(KEY) !== null
} catch {}

if (cached) {
  attach()
} else {
  link.addEventListener('load', () => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {}
  })
  if (document.readyState === 'complete') attach()
  else addEventListener('load', attach, { once: true })
}
