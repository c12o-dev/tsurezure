import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [expressiveCode(), icon(), svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
