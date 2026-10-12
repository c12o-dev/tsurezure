/** Types for src/config.ts. Every field is documented where it is used. */

export type SiteConfig = {
  /** Wordmark, `og:site_name`, RSS title, and the suffix of every page title. */
  title: string
  /** Shown after the title on the home page `<title>`, in the footer and on the site-wide OG image. */
  subtitle: string
  /** Default `<meta name="description">` and the RSS channel description. */
  description: string
  /** `<html lang>`, e.g. `ja` or `en`. A post can override it with `lang` in its frontmatter. */
  lang: string
  /** `og:locale`, e.g. `ja_JP` or `en_US`. */
  ogLocale: string
  /**
   * Absolute origin, e.g. `https://blog.example.com`. Canonical URLs, the
   * sitemap, robots.txt, RSS and OG image URLs derive from it. The `SITE_URL`
   * environment variable overrides it for one build.
   */
  url: string
  /** `<meta name="theme-color">`. Defaults to `--bg-0`. */
  themeColor?: string
  /**
   * RFC 9116 security.txt at /.well-known/security.txt. Omit to skip the file.
   * `Expires` is the build time plus `expiresInDays` (default 365).
   */
  security?: {
    contact: string
    preferredLanguages?: string
    expiresInDays?: number
  }
}

export type NavLink = {
  name: string
  /** Site-relative path, e.g. `/archive/`. Links under `/wiki/` are dropped when `features.wiki` is off. */
  url: string
  /** Path prefix that marks this link as the current section. Defaults to `url`. */
  match?: string
}

export type SocialLink = {
  name: string
  /** Any Iconify name from the bundled sets: `fa6-brands:*`, `material-symbols:*`. */
  icon: string
  url: string
}

export type ProfileConfig = {
  /** Image under src/, e.g. `assets/avatar.png`. Shown on the About page. */
  avatar: string
  /** Author name: `<meta name="author">`, JSON-LD, footer copyright. */
  name: string
  bio: string
  /** Header icons, mobile menu, About page and footer. */
  links: SocialLink[]
}

export type LicenseConfig = {
  /** License of the writing, shown in the footer. */
  name: string
  url: string
}

export type ShareTarget = 'x' | 'copy'

export type Features = {
  /** The /wiki/ section, its nav link, the home page block and the OG kicker. */
  wiki: boolean
  /** Pagefind index and the ⌘K search modal. */
  search: boolean
  /** Share buttons under each post. An empty list hides the row. */
  share: ShareTarget[]
}

export type OgConfig = {
  /** Small label next to the site title on OG images, e.g. `blog.example.com`. */
  domainLabel: string
  /** Mono label above the title on the site-wide OG image. */
  kicker: string
  /** Large background glyph on the site-wide OG image. */
  glyph: string
  /** Background glyph when a post title has no kanji, katakana or latin letter. */
  fallbackGlyph: string
}

export type WikiConfig = {
  /** Display names for topic folders (src/content/wiki/<topic>/). Missing topics show their folder name. */
  topics: Record<string, string>
}

export type ExpressiveCodeConfig = {
  /** Any Shiki theme name. */
  theme: string
}

/**
 * Every fixed string in the UI. Translate here; components carry no copy of
 * their own. `{n}`, `{query}` and `{label}` are replaced at render time.
 */
export type UiStrings = {
  skipToContent: string
  /** `aria-label` of the breadcrumb `<nav>`. */
  breadcrumb: string
  nav: {
    homeAria: string
    mainAria: string
    menu: string
    menuOpen: string
    menuClose: string
  }
  search: {
    open: string
    label: string
    dialog: string
    placeholder: string
    /** Placeholder when `features.wiki` is off. */
    placeholderPostsOnly: string
    close: string
    results: string
    /** `{query}` is the search text. */
    empty: string
    error: string
    hintMove: string
    hintOpen: string
    devTitle: string
    devExcerpt: string
  }
  toc: { label: string; sections: string }
  home: {
    latest: string
    posts: string
    /** `{n}` is the page number. */
    pageTitle: string
    pageHeading: string
    archive: string
    filterAria: string
    all: string
    wiki: string
    wikiRecent: string
    wikiAll: string
  }
  pagination: { aria: string; newer: string; older: string }
  post: {
    /** `{n}` is the post count, e.g. `{n} posts`. */
    count: string
    /** `{n}` is the character count. */
    words: string
    /** `{n}` is the reading time in minutes. */
    minutes: string
    updated: string
    readMore: string
    tags: string
    home: string
    posts: string
    toList: string
    navAria: string
    newer: string
    older: string
    related: string
    recent: string
    sidebar: string
    shareX: string
    copyLink: string
    copied: string
    copyCode: string
  }
  wiki: {
    title: string
    description: string
    heading: string
    lead: string
    /** `{topics}` and `{pages}` are counts. */
    count: string
    empty: string
    topics: string
    updated: string
    showAll: string
    timeline: string
    /** `{n}` is the number of entries shown. */
    timelineCount: string
    summary: string
    created: string
    draft: string
    sources: string
    publishedTo: string
    publishedToLink: string
    /** `{label}` is the topic name. */
    sameTopic: string
  }
  archive: {
    title: string
    description: string
    heading: string
    categories: string
    tags: string
    /** `{n}` is the number of hidden tags. */
    moreTags: string
    uncategorized: string
    /** `{label}` is the filter, `{n}` the number of matches. */
    filtering: string
    reset: string
  }
  about: { title: string; description: string }
  notFound: {
    title: string
    description: string
    kicker: string
    home: string
    wiki: string
    search: string
    glyph: string
  }
  footer: { navAria: string; rss: string; sitemap: string; builtWith: string }
  chart: { item: string; value: string; fallbackTitle: string }
}
