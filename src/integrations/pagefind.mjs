import { fileURLToPath } from 'node:url'
import * as pagefind from 'pagefind'

/**
 * Builds the Pagefind index into dist/pagefind/ after `astro build`. Only the
 * elements marked `data-pagefind-body` (the article and wiki bodies) are
 * indexed; math, heading anchors and the search UI itself are skipped.
 */
export function pagefindIntegration() {
  return {
    name: 'tsurezure:pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const site = fileURLToPath(dir)
        const { index, errors } = await pagefind.createIndex({
          excludeSelectors: [
            'span.katex',
            'span.katex-display',
            '[data-pagefind-ignore]',
            '#search-root',
          ],
        })
        if (!index) throw new Error(`Pagefind: ${errors.join(', ')}`)
        const { page_count } = await index.addDirectory({ path: site })
        await index.writeFiles({ outputPath: `${site}pagefind` })
        await pagefind.close()
        logger.info(`indexed ${page_count} pages`)
      },
    },
  }
}
