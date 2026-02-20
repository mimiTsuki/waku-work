<!--
  Sync Impact Report
  ==================
  Version change: (template, unversioned) → 1.0.0 (initial ratification)
  Bump rationale: MINOR — first concrete population of all principles and sections
    from the blank template; no prior versioned content existed.

  Modified principles: N/A (initial)
  Added sections: Core Principles (I–V), Technology Stack, Development Workflow, Governance
  Removed sections: None

  Templates requiring updates:
    ✅ .specify/templates/plan-template.md
         "Constitution Check" section uses a dynamic placeholder filled at plan-generation
         time by reading this file. No static change needed.
    ✅ .specify/templates/spec-template.md
         No principle-driven mandatory section changes required.
    ✅ .specify/templates/tasks-template.md
         Task phases and categories align with the five principles; no change needed.
    ✅ .specify/templates/checklist-template.md
         Generic structure; no constitution-specific content required.
    ✅ .specify/templates/agent-file-template.md
         Auto-generated from plan files; no constitution amendment needed.

  Deferred TODOs: None — all placeholders resolved.
-->

# waku-work Constitution

## Core Principles

### I. Electron Process Separation

The three-process Electron architecture (main, preload, renderer) defines the hard
structural boundary of this application. No code MUST cross these boundaries directly.

- The **renderer** process MUST NOT import or call Node.js or Electron APIs directly.
- All cross-process capabilities MUST be exposed via `contextBridge` in the preload
  script (`src/preload/index.ts`).
- Every IPC-exposed API MUST be declared with TypeScript types in `src/preload/index.d.ts`
  before it is consumed in the renderer.
- `sandbox: false` (current `BrowserWindow` default) MUST be revisited and justified
  in any production-hardening phase; enabling the sandbox is the preferred end state.

*Rationale*: Process separation is a security model, not a stylistic preference.
Bypassing it via `nodeIntegration: true` or bare `require` calls in renderer code
is prohibited regardless of perceived convenience.

### II. Type Safety

TypeScript strict typing is the non-negotiable baseline across all three processes.

- The `any` type is PROHIBITED without an inline justification comment explaining why
  type inference or a union/unknown type is genuinely insufficient.
- Both `tsconfig.node.json` (main + preload) and `tsconfig.web.json` (renderer) MUST
  pass `tsc --noEmit` cleanly; failing typecheck is a merge blocker.
- Generic React component props MUST be typed with explicit interfaces or type aliases;
  implicit prop spreading without a typed shape is prohibited.

*Rationale*: The deliberate split TypeScript config enforces the process boundary at
the type-system level — violations surface as compile errors before they become
runtime surprises.

### III. Component-First UI

React components in the renderer are the primary unit of UI composition and MUST be
kept small and focused.

- Business logic MUST live in hooks (`use*.ts`) or service modules, not embedded in
  JSX component bodies.
- Components MUST be independently renderable without implicit global-state dependencies.
- Styles MUST be co-located with their component (CSS modules, scoped CSS, or
  inline where trivial); global stylesheet mutations from within a component are
  PROHIBITED.

*Rationale*: Components that carry no incidental logic are trivially portable,
testable in isolation, and safe to replace when product requirements shift.

### IV. IPC Contract Discipline

Every communication channel between the main process and the renderer is a formal,
named contract.

- New IPC channels MUST use a namespaced name (e.g., `app:quit`, `fs:read-file`,
  `window:toggle-fullscreen`); flat, generic names are prohibited.
- `ipcMain.handle` (async, returns a resolved value) is PREFERRED over `ipcMain.on`
  for all request-response patterns.
- IPC handler registrations MUST reside in `src/main/index.ts` or in explicitly
  imported handler modules; scattered registration throughout arbitrary files is
  PROHIBITED.
- IPC payloads MUST be plain-serializable (strings, numbers, plain objects, arrays);
  class instances, functions, and Proxy objects MUST NOT be passed across the bridge.

*Rationale*: Undocumented IPC channels become invisible, untestable dependencies.
Naming and registration discipline keeps the process API surface auditable and
prevents channel-name collisions across features.

### V. Simplicity (YAGNI)

The minimum correct implementation that satisfies the stated requirement is the
expected implementation.

- Abstractions (utilities, base classes, shared hooks) MUST NOT be introduced until
  the same pattern appears in at least two concrete, independent locations.
- Every new `package.json` dependency requires explicit justification against the
  problem it solves; the justification MUST appear in the PR description or commit
  message.
- `pnpm` is the ONLY permitted package manager; `npm` or `yarn` invocations are
  PROHIBITED and MUST NOT appear in scripts or documentation.

*Rationale*: Desktop Electron apps accrue packaging weight and abstraction layers
quickly. Deliberate restraint at each addition point keeps the app lean and the
codebase navigable by a single developer.

## Technology Stack

The following stack is locked for this project. Deviations require a constitution
amendment.

| Concern | Choice |
|---|---|
| Runtime | Electron (latest stable, pinned in `devDependencies`) |
| UI framework | React 19 + TypeScript |
| Build system | electron-vite (Vite-based, three-target: main/preload/renderer) |
| Linter | oxlint — `pnpm lint` must exit 0 before merge |
| Formatter | oxfmt — `pnpm format` must exit 0 before merge |
| Package manager | pnpm (lock file committed, `pnpm-lock.yaml` MUST NOT be gitignored) |
| Distribution | electron-builder (`build:mac`, `build:win`, `build:linux`) |

Path alias `@renderer` resolves to `src/renderer/src` (configured in
`electron.vite.config.ts`). This alias is the canonical import path for
renderer-internal modules.

## Development Workflow

Every change that touches a source file MUST pass all gates below before merge.

1. **Typecheck** — `pnpm typecheck` (runs both node and web configs; both MUST pass).
2. **Lint** — `pnpm lint` (zero errors required; warnings are advisory).
3. **Format** — `pnpm format:fix` to auto-correct, then `pnpm format` to verify.
4. **Smoke test** — `pnpm dev` and manually exercise the changed feature end-to-end.
5. **Build verification** — `pnpm build:mac` (or target-platform equivalent) to confirm
   the production build succeeds before opening a PR.

*No automated test suite is configured at ratification.* When one is added, this
section MUST be amended to include the test command and gate (with the minimum
pass threshold), and the constitution version bumped accordingly.

## Governance

This constitution supersedes all informal conventions. Any practice not addressed here
defaults to the spirit of the five Core Principles above.

**Amendment procedure**:

1. State the concrete problem the amendment solves.
2. Bump the version per semantic rules:
   - MAJOR — principle removed, renamed, or fundamentally redefined.
   - MINOR — new principle or section added, or material guidance expansion.
   - PATCH — clarification, wording correction, typo fix.
3. Re-run `/speckit.constitution` after any change to propagate updates to dependent
   templates.
4. Use commit message: `docs: amend constitution to vX.Y.Z (<short rationale>)`.

**Compliance**:
All PRs MUST verify adherence to Principles I (Process Separation) and IV (IPC
Contract Discipline) before merge — these are the highest-risk boundaries.
Departures from Principle V (Simplicity) MUST be documented in the relevant
feature plan's Complexity Tracking table with a clear justification.

Runtime development guidance lives in `CLAUDE.md` at the repository root.

**Version**: 1.0.0 | **Ratified**: 2026-02-20 | **Last Amended**: 2026-02-20
