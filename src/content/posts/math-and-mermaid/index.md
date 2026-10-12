---
title: 数式と Mermaid の図
published: 2026-10-05
description: KaTeX で数式を、Mermaid でフローチャートやシーケンス図を記事に書く方法です。
tags: [markdown, math, mermaid]
category: 技術
---

数式は [KaTeX](https://katex.org/) でビルド時に HTML にします。図は [Mermaid](https://mermaid.js.org/) の記法で書き、閲覧時にブラウザで SVG にします。Mermaid のスクリプトは、図があるページでだけ読み込みます。

## 数式

文中の数式は `$` で囲みます。たとえば $E = mc^2$ や $\sqrt{a^2 + b^2}$ のように書きます。

独立した行の数式は `$$` で囲みます。

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

行列や場合分けも書けます。

$$
f(x) =
\begin{cases}
  x^2 & (x \ge 0) \\
  -x & (x < 0)
\end{cases}
\qquad
A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}
$$

## Mermaid

言語名を `mermaid` にしたコードブロックが図になります。

```mermaid
flowchart LR
  A[記事を書く] --> B{draft?}
  B -- true --> C[開発サーバーでだけ表示]
  B -- false --> D[ビルドして公開]
  D --> E[RSS と sitemap に載る]
```

シーケンス図の例です。

```mermaid
sequenceDiagram
  participant B as ブラウザ
  participant S as サイト
  participant G as GitHub API
  B->>S: 記事ページを取得
  S-->>B: HTML（カードは仮表示）
  B->>G: リポジトリ情報を取得
  G-->>B: 説明・スター数
```

Mermaid の配色は、ページを読み込んだときにデザイントークンの値を読んで決めます。`src/styles/tokens.css` の色を変えると、図の色も変わります。
