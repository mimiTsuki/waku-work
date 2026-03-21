export const env = {
  /** Dev-server URL injected by electron-vite (undefined in production). */
  rendererUrl: process.env['ELECTRON_RENDERER_URL'] ?? null,
  /** Current OS platform. */
  platform: process.platform
} as const
