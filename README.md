# Tsurezure — 徒然

> **Work in progress.** The design is settled; the code lands next. Until then, see the sibling portfolio template, [Tomoshibi](https://github.com/c12o-dev/tomoshibi).

A dark, Japanese-first Astro blog template with two layers of writing: time-ordered **posts** and concept-based **wiki** pages. Built to pair with Tomoshibi: same design tokens, and an RSS feed that Tomoshibi's "latest posts" section reads as is.

## Planned features

- Posts with categories, tags, drafts, scheduled publishing, related posts and prev/next navigation
- Optional wiki section (`features.wiki`): pages grouped by topic, with an update timeline
- Markdown extras: Expressive Code, KaTeX, Mermaid, admonitions, GitHub cards, photo cards, map cards, and SVG charts generated from a YAML block
- Generated OG and cover images per post (Satori), so a post without a picture still gets a card
- Pagefind search (⌘K), table of contents, reading time
- Self-hosted, subset Japanese web fonts (Zen Kaku Gothic New, Shippori Mincho B1, JetBrains Mono)
- RSS, sitemap, robots.txt, security.txt and JSON-LD from one config file
- Static output; deploys to any static host (`wrangler.jsonc` included for Cloudflare Workers)

## Status

- [x] Design
- [ ] Astro 7 base (official blog template) with Tailwind v4, porting the existing components
- [ ] Config surface and UI strings
- [ ] Sample content
- [ ] Demo and Astro Themes submission

## License

MIT © 2026 [Seu](https://c12o.net). See [LICENSE](LICENSE).
