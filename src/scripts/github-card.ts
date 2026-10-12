/**
 * Fills the `::github{repo="owner/repo"}` cards (src/plugins/rehype-github-card.mjs)
 * from the public GitHub API. Unauthenticated requests are limited to 60 per
 * hour per visitor; on failure the card keeps its link and placeholder text.
 */
type Repo = {
  description: string | null
  language: string | null
  forks: number
  stargazers_count: number
  license: { spdx_id: string } | null
  owner: { avatar_url: string }
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

for (const card of document.querySelectorAll<HTMLElement>('.card-github[data-repo]')) {
  const repo = card.dataset.repo ?? ''
  const set = (name: string, text: string) => {
    const el = card.querySelector<HTMLElement>(`[data-field="${name}"]`)
    if (el) el.textContent = text
  }
  fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: 'no-referrer' })
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status}`)
      return res.json() as Promise<Repo>
    })
    .then((data) => {
      set('description', data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') ?? '')
      set('language', data.language ?? '')
      set('stars', compact.format(data.stargazers_count))
      set('forks', compact.format(data.forks))
      set('license', data.license?.spdx_id ?? '')
      const avatar = card.querySelector<HTMLElement>('[data-field="avatar"]')
      if (avatar) {
        avatar.style.backgroundImage = `url(${data.owner.avatar_url})`
        avatar.style.backgroundColor = 'transparent'
      }
      card.classList.remove('fetch-waiting')
    })
    .catch(() => card.classList.add('fetch-error'))
}
