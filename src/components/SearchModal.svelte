<script lang="ts">
import { onMount, tick } from 'svelte'
import { features, ui } from '../config'
import { fill } from '../utils/text'

type SearchResult = { url: string; meta: { title: string }; excerpt: string }
type Pagefind = {
  options: (opts: Record<string, unknown>) => Promise<void>
  search: (query: string) => Promise<{ results: { data: () => Promise<SearchResult> }[] }>
}

// ⌘K search over the Pagefind index. Mounted by src/scripts/search.ts (no
// Astro island, so no inline script). Pagefind is loaded lazily on first open;
// in `astro dev` there is no index, so a placeholder result is shown.
let open = $state(false)
let query = $state('')
let results = $state<SearchResult[]>([])
let active = $state(0)
let searching = $state(false)
let status = $state<'idle' | 'ready' | 'error'>('idle')
let inputEl: HTMLInputElement | undefined = $state()
let lastFocus: HTMLElement | null = null
let seq = 0
let pagefind: Pagefind | undefined

const fakeResults: SearchResult[] = [
  {
    url: '/',
    meta: { title: ui.search.devTitle },
    excerpt: ui.search.devExcerpt,
  },
]

async function loadPagefind() {
  if (status !== 'idle') return
  if (import.meta.env.DEV) {
    status = 'ready'
    return
  }
  try {
    const src = '/pagefind/pagefind.js'
    const mod = await import(/* @vite-ignore */ src)
    await mod.options({ excerptLength: 24 })
    pagefind = mod
    status = 'ready'
  } catch (error) {
    console.error('Failed to load Pagefind:', error)
    status = 'error'
  }
}

async function runSearch(q: string) {
  const id = ++seq
  if (!q.trim()) {
    results = []
    return
  }
  searching = true
  try {
    let found: SearchResult[] = []
    if (import.meta.env.DEV) {
      found = fakeResults
    } else if (pagefind) {
      const res = await pagefind.search(q)
      found = await Promise.all(res.results.slice(0, 8).map((r) => r.data()))
    }
    if (id === seq) {
      results = found
      active = 0
    }
  } finally {
    if (id === seq) searching = false
  }
}

$effect(() => {
  const q = query
  if (status === 'ready') runSearch(q)
})

async function show() {
  lastFocus = document.activeElement as HTMLElement | null
  open = true
  document.body.style.overflow = 'hidden'
  loadPagefind()
  await tick()
  inputEl?.focus()
  inputEl?.select()
}

function hide() {
  open = false
  document.body.style.overflow = ''
  lastFocus?.focus()
}

function displayPath(href: string) {
  try {
    return decodeURI(new URL(href, location.origin).pathname)
  } catch {
    return href
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.length) active = (active + 1) % results.length
    scrollActive()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.length) active = (active - 1 + results.length) % results.length
    scrollActive()
  } else if (e.key === 'Enter') {
    const hit = results[active]
    if (hit) {
      e.preventDefault()
      location.href = hit.url
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    hide()
  } else if (e.key === 'Tab') {
    // Keep focus on the input; results are navigated with the arrow keys.
    e.preventDefault()
  }
}

async function scrollActive() {
  await tick()
  document.getElementById(`search-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
}

onMount(() => {
  const onGlobalKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    const typing =
      target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      open ? hide() : show()
    } else if (e.key === '/' && !typing && !open) {
      e.preventDefault()
      show()
    }
  }
  const onClick = (e: MouseEvent) => {
    const trigger = (e.target as HTMLElement | null)?.closest('[data-open-search]')
    if (trigger) {
      e.preventDefault()
      show()
    }
  }
  window.addEventListener('keydown', onGlobalKey)
  document.addEventListener('click', onClick)
  return () => {
    window.removeEventListener('keydown', onGlobalKey)
    document.removeEventListener('click', onClick)
  }
})
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="search-backdrop" onclick={hide}></div>
  <div class="search-dialog surface" role="dialog" aria-modal="true" aria-label={ui.search.dialog}>
    <div class="search-input">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/></svg>
      <input
        bind:this={inputEl}
        bind:value={query}
        onkeydown={onKeydown}
        type="search"
        placeholder={features.wiki ? ui.search.placeholder : ui.search.placeholderPostsOnly}
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls="search-results"
        aria-activedescendant={results.length ? `search-opt-${active}` : undefined}
      />
      <button type="button" class="kbd" onclick={hide} aria-label={ui.search.close}>Esc</button>
    </div>

    <ul id="search-results" class="search-results" role="listbox" aria-label={ui.search.results}>
      {#each results as item, i (item.url)}
        <li id={`search-opt-${i}`} role="option" aria-selected={i === active}>
          <a href={item.url} class:is-active={i === active} onmouseenter={() => (active = i)}>
            <span class="search-results__title">{item.meta.title}</span>
            <span class="search-results__excerpt">{@html item.excerpt}</span>
            <span class="search-results__path">{displayPath(item.url)}</span>
          </a>
        </li>
      {/each}
    </ul>

    {#if query.trim() && !searching && results.length === 0 && status === "ready"}
      <p class="search-empty">{fill(ui.search.empty, { query })}</p>
    {:else if status === "error"}
      <p class="search-empty">{ui.search.error}</p>
    {:else if !query.trim()}
      <p class="search-empty">
        <span class="kbd">↑</span> <span class="kbd">↓</span> {ui.search.hintMove} · <span class="kbd">Enter</span> {ui.search.hintOpen}
      </p>
    {/if}
  </div>
{/if}

<style>
.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(11, 11, 12, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.search-dialog {
  position: fixed;
  z-index: 91;
  top: 12vh;
  left: 50%;
  transform: translateX(-50%);
  width: min(640px, calc(100vw - 32px));
  max-height: 72vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-color: var(--line-2);
  animation: pop var(--dur) var(--ease) both;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-6px);
  }
}
.search-input {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  height: 56px;
  border-bottom: 1px solid var(--line-1);
  color: var(--fg-3);
}
.search-input svg {
  width: 20px;
  height: 20px;
  flex: none;
}
.search-input input {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--fg-1);
  font-size: 16px;
  font-family: var(--font-sans);
}
.search-input input::placeholder {
  color: var(--fg-3);
}
.search-input input::-webkit-search-cancel-button {
  display: none;
}
.search-input .kbd {
  cursor: pointer;
}
.search-results {
  list-style: none;
  margin: 0;
  padding: var(--space-2);
  overflow-y: auto;
}
.search-results:empty {
  display: none;
}
.search-results a {
  display: grid;
  gap: 4px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}
.search-results a.is-active {
  background: var(--bg-2);
  border-color: var(--line-1);
}
.search-results__title {
  color: var(--fg-1);
  font-weight: 700;
  line-height: 1.5;
}
.search-results a.is-active .search-results__title {
  color: var(--accent);
}
.search-results__excerpt {
  font-size: 14px;
  line-height: 1.7;
  color: var(--fg-3);
}
.search-results__excerpt :global(mark) {
  background: transparent;
  color: var(--fg-1);
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-underline-offset: 3px;
}
.search-results__path {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--fg-3);
}
.search-empty {
  margin: 0;
  padding: var(--space-5) var(--space-4);
  font-size: 14px;
  color: var(--fg-3);
  text-align: center;
}
</style>
