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
  integrations: [expressiveCode(), icon(), svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
