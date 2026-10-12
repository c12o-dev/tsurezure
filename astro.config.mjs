import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives'
import remarkMath from 'remark-math'
import remarkSectionize from 'remark-sectionize'
import { expressiveCode as codeConfig, features, site, ui } from './src/config'
import { pagefindIntegration } from './src/integrations/pagefind.mjs'
import { contentLastmod } from './src/integrations/sitemap-lastmod.mjs'
import { pluginCopyButton } from './src/plugins/expressive-code/copy-button'
import { pluginLanguageBadge } from './src/plugins/expressive-code/language-badge'
import rehypeChart from './src/plugins/rehype-chart.mjs'
import rehypeMermaid from './src/plugins/rehype-mermaid.mjs'
import { remarkDirectives } from './src/plugins/remark-directives.mjs'
import { remarkExcerpt } from './src/plugins/remark-excerpt.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'

const lastmod = contentLastmod()

// Static output only: no adapter. Deploy `dist/` to any static host.
export default defineConfig({
  // SITE_URL lets a host override the origin per environment (demo, preview)
  // without editing src/config.ts.
  site: process.env.SITE_URL ?? site.url,
  integrations: [
    expressiveCode({
      themes: [codeConfig.theme],
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginLanguageBadge(),
        pluginCopyButton(ui.post.copyCode),
      ],
      defaultProps: {
        wrap: true,
        overridesByLang: { shellsession: { showLineNumbers: false } },
      },
      // The built-in copy button ships an inline script; ours is in src/scripts/copy-code.ts.
      frames: { showCopyToClipboardButton: false },
      styleOverrides: {
        codeBackground: 'var(--code-bg)',
        borderRadius: '10px',
        borderColor: 'var(--line-1)',
        borderWidth: '1px',
        codeFontSize: '0.875rem',
        codeFontFamily: 'var(--font-mono)',
        uiFontFamily: 'var(--font-sans)',
        codeLineHeight: '1.7',
        codePaddingBlock: '1rem',
        codePaddingInline: '1.25rem',
        focusBorder: 'var(--accent)',
        scrollbarThumbColor: 'rgba(255, 255, 255, 0.14)',
        scrollbarThumbHoverColor: 'rgba(255, 255, 255, 0.24)',
        frames: {
          editorBackground: 'var(--code-bg)',
          terminalBackground: 'var(--code-bg)',
          terminalTitlebarBackground: 'var(--bg-1)',
          terminalTitlebarBorderBottomColor: 'var(--line-1)',
          terminalTitlebarForeground: 'var(--fg-3)',
          editorTabBarBackground: 'var(--bg-1)',
          editorTabBarBorderBottomColor: 'var(--line-1)',
          editorActiveTabBackground: 'var(--code-bg)',
          editorActiveTabForeground: 'var(--fg-1)',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'var(--accent)',
          frameBoxShadowCssValue: 'none',
          shadowColor: 'transparent',
        },
        textMarkers: { delHue: 15, insHue: 145, markHue: 45 },
      },
    }),
    // Icon names in src/config.ts (profile.links) can use any icon from these sets.
    icon({ include: { 'fa6-brands': ['*'], 'material-symbols': ['*'] } }),
    svelte(),
    sitemap({
      serialize(item) {
        const date = lastmod[new URL(item.url).pathname]
        if (date) item.lastmod = date
        return item
      },
    }),
    ...(features.search ? [pagefindIntegration()] : []),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
      remarkExcerpt,
      remarkGithubAdmonitionsToDirectives,
      remarkDirective,
      remarkDirectives,
      remarkSectionize,
    ],
    rehypePlugins: [
      // Before Expressive Code, so these blocks are never highlighted.
      rehypeMermaid,
      [rehypeChart, { labels: ui.chart }],
      rehypeKatex,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['anchor-icon'], dataPagefindIgnore: true },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
    ],
  },
  build: {
    // Stylesheets ship as files, never inline <style> blocks.
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline small scripts or assets: every <script> stays an external
      // file under /_astro/ (CSP `script-src 'self'`), and fonts never become
      // data: URIs.
      assetsInlineLimit: 0,
    },
  },
})
