# waku-work

シンプルな稼働時間記録ツール。カレンダー上でドラッグ操作により直感的に作業ログを入力できます。

Electron デスクトップアプリとしても、ブラウザ + Honoでも利用可能です。

## 主な機能

- カレンダー形式のタイムシート入力
- 案件ごとの稼働集計
- テンプレートによる定型入力
- ダーク/ライトテーマ対応

## セットアップ

```bash
pnpm install
```

## 開発

```bash
# Electron (HMR)
pnpm dev

# ブラウザ (Hono + Vite dev server)
pnpm dev:server
```

### オプション

- `--verbose`: 詳細なログを出力

## データ保存先

- 設定: `~/.config/waku-work/settings.json`
- データ: `~/.config/waku-work/data/`
