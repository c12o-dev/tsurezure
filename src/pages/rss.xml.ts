import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import { site } from '../config'
import { getSortedPosts, type Post } from '../utils/content'
import { getPostUrl } from '../utils/url'

/**
 * RSS 2.0 feed of posts (the wiki is not included). Each <item> carries title,
 * link, guid (= link), pubDate, description, category (the category, then the
 * tags) and content:encoded with the full body. The sibling template Tomoshibi
 * reads title / link / pubDate for its "latest posts" section.
 */
const markdown = new MarkdownIt()

// Characters XML 1.0 does not allow: https://www.w3.org/TR/xml/#charsets
// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point
const INVALID_XML = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F﷐-﷯￾￿]/g

/**
 * Body HTML for content:encoded. The Markdown is rendered without the site's
 * plugins: directive fences (`:::note`, `::github{…}`) are dropped and their
 * contents kept, math stays as TeX, and images with relative paths (resolved
 * only by the site build) are removed.
 */
function bodyHtml(post: Post): string {
  const source = (post.body ?? '')
    .replace(INVALID_XML, '')
    .split('\n')
    .filter((line) => !/^\s*:{2,}/.test(line))
    .join('\n')
  return sanitizeHtml(markdown.render(source), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && !/^https?:\/\//.test(frame.attribs.src ?? ''),
  })
}

function summary(post: Post): string {
  // remark-excerpt.mjs adds `excerpt` to the rendered frontmatter.
  const frontmatter = post.rendered?.metadata?.frontmatter as { excerpt?: unknown } | undefined
  const excerpt = frontmatter?.excerpt
  return post.data.description || (typeof excerpt === 'string' ? excerpt : '')
}

export const GET: APIRoute = async (context) => {
  const origin = context.site ?? new URL(site.url)
  const posts = await getSortedPosts()
  return rss({
    title: site.title,
    description: site.description,
    site: origin,
    xmlns: { content: 'http://purl.org/rss/1.0/modules/content/' },
    customData: `<language>${site.lang}</language>`,
    items: posts.map((post) => {
      const link = new URL(getPostUrl(post.id), origin).href
      return {
        title: post.data.title,
        link,
        pubDate: post.data.published,
        description: summary(post),
        categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
        content: bodyHtml(post),
      }
    }),
  })
}
