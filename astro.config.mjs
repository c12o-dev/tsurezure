import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import { site } from './src/config'

export default defineConfig({
  // SITE_URL lets a host override the origin per environment (demo, preview)
  // without editing src/config.ts.
  site: process.env.SITE_URL ?? site.url,
  integrations: [
    expressiveCode(),
    // Icon names in src/config.ts (profile.links) can use any icon from these sets.
    icon({ include: { 'fa6-brands': ['*'], 'material-symbols': ['*'] } }),
    svelte(),
    sitemap(),
  ],
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
