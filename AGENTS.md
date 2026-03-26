# Repository Guidelines

This is an Electron app built with **electron-vite**, React 19, and TypeScript. It also ships a standalone **Hono server** so the same UI can be used from a browser without Electron.

## Core Principles

- **Do NOT maintain backward compatibility** unless explicitly requested. Break things boldly.
- **Keep this file concise.** Context budget is limited.
- If the prompt is unclear or you have questions, always ask the user before proceeding.

## Architecture

### Source directories

- **`src/core/`** — Platform-independent domain logic (entities, use cases, repositories, infrastructure, file I/O, utilities). No Electron or Hono imports allowed here.
- **`src/main/`** — Electron main process. Entry: `index.ts`. Contains IPC controllers, BrowserWindow setup, app lifecycle. Controllers call `src/core/` use cases.
- **`src/server/`** — Hono HTTP server. Entry: `index.ts`. Route handlers call `src/core/` use cases — same pattern as Electron controllers.
- **`src/preload/`** — Preload script. Bridges main ↔ renderer using `contextBridge`.
- **`src/renderer/`** — React SPA (shared between Electron and server).
  - `src/api/index.ts` — Electron IPC API (default)
  - `src/api/index.http.ts` — HTTP fetch API (used by server build via Vite alias)
  - `src/main.tsx` — Electron entry point
  - `src/server-main.tsx` — Server entry point
- **`src/shared/`** — Types and schemas shared across all processes.

### Dependency direction

```
src/main/   → src/core/
src/server/ → src/core/
src/core/ has NO dependency on main/ or server/
```

> **Always read `@src/renderer/docs/architecture.md` before implementing anything under `src/renderer/`.**

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Electron dev server with HMR
pnpm dev:server     # Hono (port 3000) + Vite dev server (port 5173, /api proxied)
pnpm build          # Typecheck + Electron build
pnpm build:server   # Build renderer SPA + Hono server
pnpm start:server   # Run built server (serves SPA + API on port 3000)
pnpm build:mac      # Build for macOS
pnpm typecheck      # Run both node and web typechecks
pnpm lint           # Lint with oxlint
pnpm lint:fix       # Auto-fix lint issues
pnpm format         # Check formatting with oxfmt
pnpm format:fix     # Auto-fix formatting
```

There are no tests configured yet.
