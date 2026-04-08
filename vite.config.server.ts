import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: '../../dist/renderer',
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index-server.html')
    }
  },
  resolve: {
    alias: {
      '@renderer/shared/api': resolve(__dirname, 'src/renderer/src/shared/api/http/index.ts'),
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
