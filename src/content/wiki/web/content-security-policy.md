---
title: Content Security Policy の基本
summary: Content Security Policy は、ページが読み込んでよいスクリプトや画像の出どころをブラウザに伝え、それ以外を拒否させるヘッダーです。
tags: [http, security, csp]
created: 2026-09-12
updated: 2026-09-26
sources:
  - https://developer.mozilla.org/ja/docs/Web/HTTP/Guides/CSP
  - https://www.w3.org/TR/CSP3/
---

Content Security Policy（CSP）は、`Content-Security-Policy` ヘッダーで「このページはどこからスクリプトや画像を読み込んでよいか」を宣言する仕組みです。宣言にないものはブラウザが読み込みを拒否し、開発者ツールのコンソールにエラーを出します。

## ディレクティブ

| ディレクティブ | 対象 |
| --- | --- |
| `default-src` | ほかのディレクティブを書かなかった種類の既定値 |
| `script-src` | JavaScript |
| `style-src` | CSS。`<style>` 要素と `style` 属性を含む |
| `img-src` | 画像。CSS の `background-image` も含む |
| `font-src` | Web フォント |
| `connect-src` | `fetch` や WebSocket の接続先 |
| `frame-ancestors` | このページを `<iframe>` で埋め込んでよいサイト |

値には `'self'`（同じオリジン）、`https://api.example.com` のようなオリジン、`'none'` などを並べます。

## inline script の扱い

`script-src 'self'` だけを指定すると、HTML の中に直接書いた `<script>…</script>` は実行されません。外部ファイルにするか、`'sha256-…'` でスクリプトの内容のハッシュを許可する必要があります。`'unsafe-inline'` を付けると制限はなくなりますが、XSS への防御も弱くなります。

このテンプレートでは、ページのスクリプトをすべて `/_astro/` 以下の外部ファイルにしているので、`script-src` は `'self'` で足ります。ただし検索の Pagefind が WebAssembly を使うため、`'wasm-unsafe-eval'` を加えています。

:::note
`<script type="application/ld+json">` のような実行されないデータは、CSP の対象になりません。
:::

## 試すときは Report-Only から

いきなり適用すると、見落としていた外部リソースが読み込めなくなります。最初は `Content-Security-Policy-Report-Only` ヘッダーで同じ値を送り、コンソールに出る違反を確認してから切り替えます。
