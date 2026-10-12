import { definePlugin, type ExpressiveCodePlugin } from 'astro-expressive-code'

/**
 * Shows the code block's language (`data-language` on <pre>) in the top-right
 * corner of frames without a title. It fades out on hover so the copy button
 * takes its place; on touch screens it moves left of the always-visible
 * button instead.
 */
export function pluginLanguageBadge(): ExpressiveCodePlugin {
  return definePlugin({
    name: 'Language badge',
    baseStyles: `
      .frame:not(.has-title):not(.is-terminal) pre[data-language]::before {
        content: attr(data-language);
        position: absolute;
        z-index: 2;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.1rem 0.5rem;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--fg-3);
        background: var(--bg-2);
        border: 1px solid var(--line-1);
        border-radius: 6px;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      @media (hover: hover) {
        .frame:not(.has-title):not(.is-terminal):hover pre[data-language]::before {
          opacity: 0;
        }
      }
      @media (hover: none) {
        .frame:not(.has-title):not(.is-terminal) pre[data-language]::before {
          margin-right: 2.75rem;
        }
      }
    `,
  })
}
