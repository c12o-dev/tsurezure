---
title: コードブロックと、YAML から描くグラフ
published: 2026-09-21
description: Expressive Code によるコードブロックの表示と、YAML で書いた数値から棒グラフや折れ線グラフを生成する方法です。
tags: [markdown, typescript, chart]
category: 技術
---

コードブロックは [Expressive Code](https://expressive-code.com/) で表示します。色付けはビルド時に済むので、ページに読み込む JavaScript はコピーボタンの処理だけです。

## コードブロック

言語名を書くと、右上に言語のラベルが出ます。マウスを重ねると、ラベルの位置にコピーボタンが出ます。

```ts
type Post = {
  title: string
  published: Date
  tags: string[]
}

export function latest(posts: Post[], count = 5): Post[] {
  return [...posts].sort((a, b) => b.published.getTime() - a.published.getTime()).slice(0, count)
}
```

`title` でファイル名を、`{ }` で強調する行を指定できます。`ins` と `del` は追加と削除の行です。

```ts title="src/config.ts" {2} ins={3} del={4}
export const features = {
  wiki: true,
  search: true,
  share: [],
}
```

`shellsession` は行番号を付けずに表示します。

```shellsession
$ pnpm build
$ pnpm preview
```

長いファイルの一部だけを見せたいときは、`collapse` で行を折りたためます。

```js collapse={1-6}
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const config = JSON.parse(read('package.json'))

console.log(config.name)
```

## YAML から描くグラフ

言語名を `chart` にしたコードブロックは、ビルド時に SVG のグラフになります。画像を用意する必要はなく、色はサイトのデザイントークンに従います。

````md
```chart
type: bar
title: 月ごとの記事数
unit: 本
data:
  - [7月, 3]
  - [8月, 5]
  - [9月, 4]
```
````

上の記法から、次のグラフができます。

```chart
type: bar
title: 月ごとの記事数
unit: 本
data:
  - [7月, 3]
  - [8月, 5]
  - [9月, 4]
```

`type` は `bar`（横棒）、`column`（縦棒）、`line`（折れ線）の 3 種類です。系列が複数あるときは `labels` と `series` で書きます。

```chart
type: line
title: ページの読み込み時間（秒）
labels: [1月, 2月, 3月, 4月, 5月, 6月]
series:
  - name: トップページ
    values: [2.4, 2.1, 1.8, 1.6, 1.5, 1.2]
  - name: 記事ページ
    values: [3.1, 2.9, 2.2, 2.0, 1.7, 1.6]
caption: 数値は表示例のための架空のものです。
```

桁が大きく違う値を並べるときは `scale: log` で対数目盛りにできます。

```chart
type: column
title: 1 日あたりの上限
scale: log
labels: [読み取り, 書き込み, 削除]
series:
  - name: 無料枠
    values: [5000000, 100000, 100000]
caption: 数値は表示例のための架空のものです。
```

グラフの横には、スクリーンリーダー向けに同じ数値の表を隠して置いています。
