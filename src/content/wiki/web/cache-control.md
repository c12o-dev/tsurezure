---
title: Cache-Control の基本
summary: Cache-Control はレスポンスをどこに何秒保存してよいかを伝えるヘッダーで、ファイル名にハッシュが付くかどうかで値を変えます。
tags: [http, cache, performance]
created: 2026-09-05
updated: 2026-10-02
sources:
  - https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Headers/Cache-Control
  - https://www.rfc-editor.org/rfc/rfc9111
---

`Cache-Control` は、HTTP のレスポンスをブラウザや CDN がどれだけの間、再利用してよいかを伝えるヘッダーです。仕様は RFC 9111 にあります。

## よく使う値

| 値 | 意味 |
| --- | --- |
| `max-age=<秒>` | 受け取ってからこの秒数の間は、サーバーに問い合わせずに再利用してよい |
| `no-cache` | 保存してよいが、使う前に毎回サーバーに更新を確認する |
| `no-store` | 保存しない |
| `public` | 共有キャッシュ（CDN など）にも保存してよい |
| `private` | ブラウザにだけ保存してよい |
| `immutable` | 期限内は内容が変わらないので、再読み込みでも確認しなくてよい |

`no-cache` は「キャッシュしない」ではありません。保存はしたうえで、使うたびに `ETag` や `Last-Modified` で更新を確かめます。保存自体をさせたくないときは `no-store` です。

## ファイルの種類で値を分ける

静的サイトでは、ファイル名に内容のハッシュが入っているかどうかで値を分けます。

```txt title="public/_headers"
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=2592000
```

- `/_astro/` 以下は、内容が変わるとファイル名も変わる。1 年保存して `immutable` を付けても、古い内容が残らない
- HTML はファイル名が変わらない。長く保存させると更新が届かないので、ホストの既定（多くは再検証）に任せる
- フォントのように名前が変わらず更新もまれなファイルは、1 か月程度にする

```chart
type: bar
title: max-age の目安（日）
scale: log
data:
  - [ハッシュ付きの JS / CSS, 365]
  - [フォント, 30]
  - [画像（名前固定）, 7]
caption: このサイトの public/_headers の設定値です。
```

## 確認のしかた

ブラウザの開発者ツールのネットワークタブで、レスポンスヘッダーの `Cache-Control` と、取得元が「メモリキャッシュ」「ディスクキャッシュ」のどちらになっているかを見ます。

```shellsession
$ curl -sI https://example.com/ | grep -i cache-control
```
