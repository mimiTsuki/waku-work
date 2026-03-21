# Repository Guidelines

This is an Electron app built with **electron-vite**, React 19, and TypeScript.

## Core Principles

- **Do NOT maintain backward compatibility** unless explicitly requested. Break things boldly.
- **Keep this file concise.** Context budget is limited.
- If the prompt is unclear or you have questions, always ask the user before proceeding.

## Architecture

The three-process Electron architecture maps to three source directories:

- **`src/main/`** — Main process (Node.js). Entry: `index.ts`. Manages the `BrowserWindow`, IPC handlers, app lifecycle, and auto-updater via `electron-updater`.
- **`src/preload/`** — Preload script. Entry: `index.ts`. Bridges main ↔ renderer using `contextBridge`. Exposes `window.electron` (ElectronAPI from `@electron-toolkit/preload`) and `window.api` (custom APIs). Type declarations are in `index.d.ts`.
- **`src/renderer/`** — Renderer process (React). Entry: `src/main.tsx`. Standard React SPA; accesses Electron APIs only through `window.electron` and `window.api`.

> **Always read `@src/renderer/docs/architecture.md` before implementing anything under `src/renderer/`.**

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
