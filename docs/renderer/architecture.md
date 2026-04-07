# Architecture

`renderer` パッケージは [Feature-Sliced Design (FSD)](https://feature-sliced.design/) に基づいて構成されている。

## レイヤー構成

FSD では以下の 7 レイヤーが定義されている。本プロジェクトでは現状 `app`・`pages`・`shared` の 3 レイヤーのみ使用している。

| レイヤー     | 説明                                                 |
| ------------ | ---------------------------------------------------- |
| `app/`       | アプリケーション初期化・ルーティング・プロバイダー   |
| `processes/` | 複数ページにまたがるビジネスフロー（非推奨レイヤー） |
| `pages/`     | ページ単位のモジュール                               |
| `widgets/`   | 複数 feature/entity を組み合わせた独立 UI ブロック   |
| `features/`  | ユーザー操作に対応するインタラクション単位           |
| `entities/`  | ビジネスエンティティ（ドメインモデル）               |
| `shared/`    | 全レイヤーから参照可能な共有リソース                 |

### 未使用レイヤーについて

現時点では各ページのドメインロジックや UI が page 内のセグメント（`model/`・`ui/` など）に収まっており、ページ横断で再利用するエンティティやインタラクションが発生していない。そのため `entities/`・`features/`・`widgets/` は作成していない。

今後以下のようなケースが発生した場合に、対応するレイヤーを導入する。

- **`entities/`** — 複数ページで同じドメインモデル（例: `Project`、`LogEntry`）のロジックや UI を共有する必要が出た場合
- **`features/`** — ページをまたいで再利用されるユーザー操作（例: ログの作成・編集フォーム）が出た場合
- **`widgets/`** — 複数の feature/entity を組み合わせた自律的な UI ブロック（例: ヘッダー、サイドバー）が必要になった場合

```
src/renderer/src/
├── app/       # アプリケーション初期化・ルーティング・プロバイダー
├── pages/     # ページ単位のモジュール
└── shared/    # 全レイヤーから参照可能な共有リソース
```

### app/

アプリケーションの初期化やルーティング、グローバルなプロバイダーを配置する。

```
app/
├── App.tsx                    # ルーティング定義
├── main.tsx                   # Electron エントリーポイント
├── serverMain.tsx             # Server エントリーポイント
├── env.d.ts                   # 環境変数の型定義
├── model/
│   └── theme.ts               # テーマ管理
└── providers/
    └── AppQueryProvider.tsx    # TanStack Query プロバイダー
```

### pages/

ルーティングに対応するページ単位のモジュールを配置する。各ページは FSD のセグメント規約に従う。

```
pages/
├── timesheet/     # タイムシートページ
├── summary/       # サマリーページ
├── projects/      # プロジェクト管理ページ
└── settings/      # 設定ページ
```

#### ページ内のセグメント構成

各ページは以下のセグメントで構成される。すべてのセグメントが必須ではなく、必要なものだけ作成する。

| セグメント | 配置するもの                              |
| ---------- | ----------------------------------------- |
| `ui/`      | ページコンポーネントおよびページ固有の UI |
| `model/`   | ビジネスロジック・状態管理・Context       |
| `api/`     | データ取得・更新のロジック                |
| `config/`  | ページ固有の定数・設定値                  |

```
pages/timesheet/
├── ui/
│   ├── TimesheetPage.tsx
│   ├── WeekCalendar.tsx
│   ├── DayColumn.tsx
│   ├── LogBlock.tsx
│   ├── LogFormModal.tsx
│   ├── TimeAxis.tsx
│   ├── MovingPreview.tsx
│   └── DeleteConfirmDialog.tsx
├── model/
│   ├── drag.tsx
│   ├── dragContext.ts
│   ├── dragCreate.ts
│   ├── dragMove.ts
│   ├── dragResize.ts
│   ├── logForm.ts
│   └── calendarLayout.ts
├── api/
│   └── logMutations.ts
├── config/
│   └── calendarConstants.ts
└── index.ts
```

### shared/

全レイヤーから参照可能な共有リソースを配置する。ドメインに依存しない汎用的なコードのみ。

```
shared/
├── ui/        # 汎用 UI コンポーネント（shadcn/ui ベース）
├── api/       # IPC / HTTP 通信の抽象化レイヤー
├── lib/       # ユーティリティ関数
├── config/    # アプリ共通の設定・定数
└── assets/    # CSS・画像などの静的リソース
```

---

## shared/ui/ の設計ルール

`shared/ui/` には **プロダクトのドメインに依存しない汎用 UI コンポーネント**を置く。
主に shadcn/ui ベースのコンポーネントがここに含まれる。

### ディレクトリ構造のルール

コンポーネントは必ず **コンポーネント名のディレクトリ** を切り、その中にファイルを配置する。
フラットな `.tsx` ファイルを直接 `shared/ui/` 直下に置いてはいけない。

#### 単一コンポーネントの場合

コンポーネントは `Component.tsx` に実装する。
外部にスタイルを公開する必要がある場合は `style.ts` に実装する。
スタイルがコンポーネントに閉じている場合は `Component.tsx` ファイル内に実装する。

```
shared/ui/input/
├── Component.tsx    # コンポーネント本体
├── style.ts         # スタイル(外部へ公開が必要な場合のみ作成)
└── index.ts         # 外部公開インターフェース
```

#### 複数コンポーネントを含む場合

1ファイルに複数コンポーネントをまとめず、**コンポーネント単位でファイルを分割**する。
ファイル名は役割を端的に表す名前にする（`Root.tsx`, `Trigger.tsx`, `Content.tsx` など）。

```
shared/ui/dialog/
├── Root.tsx
├── Trigger.tsx
├── Portal.tsx
├── Close.tsx
├── Overlay.tsx
├── Content.tsx
├── Header.tsx
├── Footer.tsx
├── Title.tsx
├── Description.tsx
└── index.ts
```

### index.ts のルール

各コンポーネントディレクトリには必ず `index.ts` を置き、**外部に公開するシンボルをすべてここで宣言**する。

```ts
// shared/ui/button/index.ts
export { Button, type ButtonProps } from './Component'
export { buttonVariants } from './style'
```

### 将来的なファイル配置について

`shared/ui/xxx/` 配下には、今後以下のファイルが追加される可能性がある。
新規ファイルを追加する際はこれらとの共存を意識した命名にすること。

| ファイル例              | 用途                         |
| ----------------------- | ---------------------------- |
| `Component.stories.tsx` | Storybook ストーリー         |
| `Component.test.tsx`    | コンポーネントユニットテスト |

---

## import のルール

### ルール 1: 必ず index.ts 経由で import する

モジュールを外部から import する際は、**必ず `index.ts` 経由（ディレクトリパス指定）**で行う。
内部のファイルを直接 import してはいけない。

```ts
// OK
import { Button, buttonVariants } from '@renderer/shared/ui/button'
import { Dialog, DialogContent } from '@renderer/shared/ui/dialog'
import { TimesheetPage } from '@renderer/pages/timesheet'

// NG（内部ファイルへの直接 import）
import { Button } from '@renderer/shared/ui/button/Component'
import { TimesheetPage } from '@renderer/pages/timesheet/ui/TimesheetPage'
```

### ルール 2: FSD のレイヤー依存方向を守る

上位レイヤーから下位レイヤーへの import のみ許可する。逆方向・同レイヤー間の import は禁止。

```
app → pages → shared    （上位 → 下位のみ OK）
pages → pages            （NG: 同レイヤー間の参照）
shared → pages           （NG: 下位 → 上位の参照）
```

### ルール 3: ページ間の直接 import は禁止

ある page が別の page の内部モジュールを直接参照してはいけない。
ページ間で共有したいロジックは `shared/` に切り出す。

```ts
// NG（page をまたいだ直接 import）
import { useLogs } from '@renderer/pages/timesheet/model/useLogs'

// OK（共有ロジックは shared/ へ）
import { someSharedUtil } from '@renderer/shared/lib/utils'
```

---

## 新規モジュール追加手順

### 汎用 UI コンポーネントを追加する場合（shared/ui/）

1. `shared/ui/<component-name>/` ディレクトリを作成する
2. CVA スタイルがあれば `style.ts` を作成する
3. コンポーネント本体を記述する
   - 単一: `Component.tsx`
   - 複数: `Root.tsx`, `Trigger.tsx` などに分割
4. `index.ts` を作成し、外部公開シンボルをすべて re-export する
5. 利用箇所では `@renderer/shared/ui/<component-name>` から import する

### ページを追加する場合（pages/）

1. `pages/<page-name>/` ディレクトリを作成する
2. セグメント（`ui/`, `model/`, `api/`, `config/` など）を必要に応じて作成し、ファイルを配置する
3. `index.ts` を作成し、`App.tsx` に公開するものだけを re-export する
4. `app/App.tsx` のルーティングに追加する

### shadcn/ui コンポーネントを追加する場合

`pnpm dlx shadcn@latest add <component>` を実行する
