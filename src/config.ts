import type {
  ExpressiveCodeConfig,
  Features,
  LicenseConfig,
  NavLink,
  OgConfig,
  ProfileConfig,
  SiteConfig,
  UiStrings,
  WikiConfig,
} from './types'

/**
 * Site-wide settings. This is the only file you need to edit besides your
 * content. Set `url` first: canonical URLs, the sitemap, robots.txt, RSS and
 * OG image URLs are built from it.
 */
export const site: SiteConfig = {
  title: 'Tsurezure',
  subtitle: '書きながら考えるためのブログ',
  description:
    'Your Name の個人ブログ。仕事で調べたことや作ったものの記録と、概念ごとにまとめた Wiki。',
  lang: 'ja',
  ogLocale: 'ja_JP',
  url: 'https://example.com',
  // Delete this block to skip /.well-known/security.txt.
  security: {
    contact: 'mailto:hello@example.com',
    preferredLanguages: 'ja, en',
  },
}

export const features: Features = {
  wiki: true,
  search: true,
  share: ['x', 'copy'],
}

/** Header navigation. `/wiki/` links disappear when `features.wiki` is off. */
export const nav: NavLink[] = [
  { name: 'Posts', url: '/', match: '/posts/' },
  { name: 'Wiki', url: '/wiki/' },
  { name: 'Archive', url: '/archive/' },
  { name: 'About', url: '/about/' },
]

export const profile: ProfileConfig = {
  avatar: 'assets/avatar.png',
  name: 'Your Name',
  bio: 'ソフトウェアエンジニア。仕事では TypeScript と PostgreSQL で業務システムを作っています。',
  links: [
    { name: 'GitHub', icon: 'fa6-brands:github', url: 'https://github.com' },
    { name: 'X', icon: 'fa6-brands:x-twitter', url: 'https://x.com' },
  ],
}

export const license: LicenseConfig = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
}

/** Text drawn on the generated OG images and post covers (src/pages/og, src/pages/cover). */
export const og: OgConfig = {
  domainLabel: 'example.com',
  kicker: features.wiki ? 'BLOG · WIKI' : 'BLOG',
  glyph: '徒',
  fallbackGlyph: 'T',
}

export const wiki: WikiConfig = {
  topics: {
    guide: '使い方',
    web: 'Web',
  },
}

export const expressiveCode: ExpressiveCodeConfig = {
  theme: 'vesper',
}

/** Fixed UI strings. Swap the values to change the language of the whole site. */
export const ui: UiStrings = {
  skipToContent: '本文へスキップ',
  breadcrumb: 'パンくずリスト',
  nav: {
    homeAria: 'ホーム',
    mainAria: 'メイン',
    menu: 'メニュー',
    menuOpen: 'メニューを開く',
    menuClose: 'メニューを閉じる',
  },
  search: {
    open: 'サイト内検索を開く',
    label: '検索',
    dialog: 'サイト内検索',
    placeholder: '記事・Wiki を検索',
    placeholderPostsOnly: '記事を検索',
    close: '検索を閉じる',
    results: '検索結果',
    empty: '「{query}」に一致するページはありません。',
    error: '検索インデックスを読み込めませんでした。',
    hintMove: 'で移動',
    hintOpen: 'で開く',
    devTitle: '開発サーバーでは検索できません',
    devExcerpt: '<mark>pnpm build</mark> のあと <mark>pnpm preview</mark> で確認してください。',
  },
  toc: { label: '目次', sections: '{n} sections' },
  home: {
    latest: 'Latest',
    posts: 'Posts',
    pageTitle: '記事一覧 {n} ページ目',
    pageHeading: 'Posts — page {n}',
    archive: 'アーカイブ',
    filterAria: 'カテゴリで絞り込む',
    all: 'すべて',
    wiki: 'Wiki',
    wikiRecent: '最近更新',
    wikiAll: 'Wiki をすべて見る',
  },
  pagination: { aria: 'ページ送り', newer: '新しい記事', older: '古い記事' },
  post: {
    count: '{n} posts',
    words: '{n} 字',
    minutes: '{n} 分',
    updated: '更新',
    readMore: '続きを読む',
    tags: 'タグ',
    home: 'Home',
    posts: 'Posts',
    toList: '記事一覧',
    navAria: '前後の記事',
    newer: '← 新しい記事',
    older: '古い記事 →',
    related: '関連記事',
    recent: '最近の記事',
    sidebar: 'サイドバー',
    shareX: 'で共有',
    copyLink: 'リンクをコピー',
    copied: 'コピーしました',
    copyCode: 'コードをコピー',
  },
  wiki: {
    title: 'Wiki',
    description: '調べたことを概念ごとにまとめ、分かったことを追記していくページ。',
    heading: '調べたことを、概念ごとに。',
    lead: '日付で流れていくメモではなく、同じ概念のページを育てていく場所です。新しく分かったことは既存のページに追記します。',
    count: '{topics} topics · {pages} pages',
    empty: 'まだページはありません。',
    topics: 'Topics',
    updated: '更新',
    showAll: 'すべて表示',
    timeline: '更新履歴',
    timelineCount: '最新 {n} 件',
    summary: '一言まとめ',
    created: '作成',
    draft: 'Draft',
    sources: '出典',
    publishedTo: '記事化',
    publishedToLink: 'この内容は記事にもなっています',
    sameTopic: '同じトピック — {label}',
  },
  archive: {
    title: 'Archive',
    description: 'すべての記事の一覧。年ごとに並べ、カテゴリとタグで絞り込めます。',
    heading: 'すべての記事',
    categories: 'カテゴリ',
    tags: 'タグ',
    moreTags: '他 {n} 件',
    uncategorized: 'カテゴリなし',
    filtering: '「{label}」で絞り込み中 — {n} 件',
    reset: '解除',
  },
  about: { title: 'About', description: '{name} について。' },
  notFound: {
    title: 'ページが見つかりません',
    description:
      'URL が変わったか、削除された可能性があります。検索するか、一覧から探してください。',
    kicker: '404 — Not Found',
    home: '記事一覧へ',
    wiki: 'Wiki へ',
    search: '検索する',
    glyph: '迷',
  },
  footer: { navAria: 'フッター', rss: 'RSS', sitemap: 'Sitemap', builtWith: 'Built with Astro' },
  chart: { item: '項目', value: '値', fallbackTitle: 'グラフ' },
}
