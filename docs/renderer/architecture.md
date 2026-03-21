# Architecture

## ディレクトリ構成

`src/renderer/src/` 配下の主要なディレクトリについて記載する。

```
- components: 汎用 UI コンポーネント（プロダクト非依存）
- features: 機能ドメイン単位のモジュール
- lib: アプリ全体で使うユーティリティ・型定義
```

## components/ の設計ルール

`components/` には **プロダクトのドメインに依存しない汎用 UI コンポーネント**を置く。
主に shadcn/ui ベースのコンポーネントがここに含まれる。

### ディレクトリ構造のルール

コンポーネントは必ず **コンポーネント名のディレクトリ** を切り、その中にファイルを配置する。
フラットな `.tsx` ファイルを直接 `components/` 直下に置いてはいけない。

#### 単一コンポーネントの場合

-コンポーネントは `Component.tsx` に実装する。
外部にスタイルを公開する必要がある場合は `style.ts` に実装する。
スタイルがコンポーネントに閉じている場合は `Component.tsx` ファイル内に実装する。

```
components/input/
├── Component.tsx    # コンポーネント本体
├── style.ts         # スタイル(外部へ公開が必要な場合のみ作成)
└── index.ts         # 外部公開インターフェース
```

#### 複数コンポーネントを含む場合

1ファイルに複数コンポーネントをまとめず、**コンポーネント単位でファイルを分割**する。
ファイル名は役割を端的に表す名前にする（`Root.tsx`, `Trigger.tsx`, `Content.tsx` など）。

```
components/dialog/
├── Root.tsx         # Dialog（Primitive.Root の再エクスポート）
├── Trigger.tsx      # DialogTrigger
├── Portal.tsx       # DialogPortal
├── Close.tsx        # DialogClose
├── Overlay.tsx      # DialogOverlay
├── Content.tsx      # DialogContent（Portal・Overlay を内部利用）
├── Header.tsx       # DialogHeader
├── Footer.tsx       # DialogFooter
├── Title.tsx        # DialogTitle
├── Description.tsx  # DialogDescription
└── index.ts         # 上記すべてを re-export
```

### index.ts のルール

各コンポーネントディレクトリには必ず `index.ts` を置き、**外部に公開するシンボルをすべてここで宣言**する。

```ts
// components/button/index.ts
export { Button, type ButtonProps } from './Component'
export { buttonVariants } from './style'
```

### 将来的なファイル配置について

`components/xxx/` 配下には、今後以下のファイルが追加される可能性がある。
新規ファイルを追加する際はこれらとの共存を意識した命名にすること。

| ファイル例              | 用途                         |
| ----------------------- | ---------------------------- |
| `Component.stories.tsx` | Storybook ストーリー         |
| `Component.test.tsx`    | コンポーネントユニットテスト |

---

## features/ の設計ルール

`features/` には**プロダクトのドメインに依存する機能モジュール**を置く。
「どの画面・どの機能に属するか」が明確なコード（ページコンポーネント、ドメイン固有のロジック、カスタムフックなど）はここに配置する。

### 構造例（timesheet）

```
features/timesheet/
├── page/          # ページコンポーネント
├── components/    # ドメイン固有のコンポーネント
├── context/       # React Context・Provider
├── hooks/         # ドメイン固有のカスタムフック
└── index.ts       # 外部に公開するもの
```

### 役割別サブディレクトリの規約

各 feature 内では、ファイルを役割別のサブディレクトリに分類する。

| ディレクトリ  | 配置するもの                                       |
| ------------- | -------------------------------------------------- |
| `page/`       | ページコンポーネント（ルーティングに対応するもの） |
| `components/` | ドメイン固有の UI コンポーネント                   |
| `context/`    | React Context 定義・Provider コンポーネント        |
| `hooks/`      | ドメイン固有のカスタムフック                       |

上記に当てはまらないものでも、役割が明確であれば独自のディレクトリを切ってよい。

各 feature の `index.ts` は、`App.tsx` など上位から参照されるものだけを公開する。
feature 内部のサブコンポーネントやフックは feature の外から直接 import しない。

---

## import のルール

### ルール 1: 必ず index.ts 経由で import する

コンポーネントや feature を外部から import する際は、**必ず `index.ts` 経由（ディレクトリパス指定）**で行う。
内部のファイルを直接 import してはいけない。

```ts
// ✅ 正しい
import { Button, buttonVariants } from '@renderer/components/button'
import { Dialog, DialogContent } from '@renderer/components/dialog'
import { TimesheetPage } from '@renderer/features/timesheet'

// ❌ 誤り（内部ファイルへの直接 import）
import { Button } from '@renderer/components/button/Component'
import { TimesheetPage } from '@renderer/features/timesheet/TimesheetPage'
```

### ルール 2: feature 間の直接 import は禁止

ある feature が別の feature の内部モジュールを直接参照してはいけない。
feature 間で共有したいロジックは `lib/` に切り出す。

```ts
// ❌ 誤り（feature をまたいだ直接 import）
import { useLogs } from '@renderer/features/timesheet/hooks/useLogs'

// ✅ 正しい（共有ロジックは lib/ へ）
import { someSharedUtil } from '@renderer/lib/utils'
```

### ルール 3: components/ は lib/ に依存してよい。逆は禁止

```
components/ → lib/      ✅ OK
lib/        → components/  ❌ NG（循環・過剰依存）
```

---

## 新規コンポーネント追加手順

### 汎用 UI コンポーネントを追加する場合（components/）

1. `components/<ComponentName>/` ディレクトリを作成する
2. CVA スタイルがあれば `style.ts` を作成する
3. コンポーネント本体を記述する
   - 単一: `Component.tsx`
   - 複数: `Root.tsx`, `Trigger.tsx` などに分割
4. `index.ts` を作成し、外部公開シンボルをすべて re-export する
5. 利用箇所では `@renderer/components/<component-name>` から import する

### 機能モジュールを追加する場合（features/）

1. `features/<FeatureName>/` ディレクトリを作成する
2. 役割別サブディレクトリ（`page/`, `components/`, `context/`, `hooks/` など）を切り、ファイルを配置する
3. `index.ts` を作成し、`App.tsx` など外部に公開するものだけを re-export する
4. `App.tsx` のルーティングに追加する

### shadcn/ui コンポーネントを追加する場合

`pnpm dlx shadcn@latest add <component>` を実行する
