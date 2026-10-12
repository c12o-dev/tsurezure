/** Copy button injected into code blocks by src/plugins/expressive-code/copy-button.ts. */
document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest('.copy-btn')
  if (!button) return
  const code = button.closest('pre')?.querySelector('code')
  const text = Array.from(code?.querySelectorAll('.code:not(summary *)') ?? [])
    .map((line) => (line.textContent === '\n' ? '' : line.textContent))
    .join('\n')
  navigator.clipboard.writeText(text)
  button.classList.add('success')
  window.setTimeout(() => button.classList.remove('success'), 1200)
})
