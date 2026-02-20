# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server with HMR
pnpm build:mac      # Build for macOS (skips typecheck unlike pnpm build)
pnpm build          # Typecheck + build (all platforms)
pnpm typecheck      # Run both node and web typechecks
pnpm lint           # Lint with oxlint
pnpm lint:fix       # Auto-fix lint issues
pnpm format         # Check formatting with oxfmt
pnpm format:fix     # Auto-fix formatting
```

There are no tests configured yet.

## Architecture

This is an Electron app built with **electron-vite**, React 19, and TypeScript. The three-process Electron architecture maps to three source directories:

- **`src/main/`** — Main process (Node.js). Entry: `index.ts`. Manages the `BrowserWindow`, IPC handlers, app lifecycle, and auto-updater via `electron-updater`.
- **`src/preload/`** — Preload script. Entry: `index.ts`. Bridges main ↔ renderer using `contextBridge`. Exposes `window.electron` (ElectronAPI from `@electron-toolkit/preload`) and `window.api` (custom APIs). Type declarations are in `index.d.ts`.
- **`src/renderer/`** — Renderer process (React). Entry: `src/main.tsx`. Standard React SPA; accesses Electron APIs only through `window.electron` and `window.api`.

**IPC pattern**: Add handlers in `src/main/index.ts` (`ipcMain.handle`/`ipcMain.on`), expose them via `contextBridge` in `src/preload/index.ts`, declare types in `src/preload/index.d.ts`, then call from renderer via `window.api.*`.

**Path alias**: `@renderer` resolves to `src/renderer/src` (configured in `electron.vite.config.ts`).

**TypeScript**: Two separate configs — `tsconfig.node.json` (main + preload) and `tsconfig.web.json` (renderer). Run typechecks separately with `pnpm typecheck:node` / `pnpm typecheck:web`.

**Tooling**: oxlint for linting, oxfmt (Oxc formatter, Prettier-compatible) for formatting, electron-builder for packaging.
