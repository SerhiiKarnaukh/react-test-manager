import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@router': path.resolve(__dirname, 'src/router'),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'istanbul',
      include: [
        'src/features/apps-manager/**/*.{ts,tsx}',
        'src/features/social/**/*.{ts,tsx}',
        'src/features/ai-lab/**/*.{ts,tsx}',
        'src/features/taberna/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/features/apps-manager/**/*.test.*',
        'src/features/apps-manager/test/**',
        'src/features/social/**/*.test.*',
        'src/features/social/**/*.models.ts',
        'src/features/social/social.theme.ts',
        'src/features/ai-lab/**/*.test.*',
        'src/features/ai-lab/test/**',
        'src/features/ai-lab/ai-lab.theme.ts',
        'src/features/ai-lab/ai-lab.routes.tsx',
        'src/features/taberna/**/*.test.*',
        'src/features/taberna/test/**',
        'src/features/taberna/taberna.theme.ts',
        'src/features/taberna/taberna.routes.tsx',
      ],
      thresholds: {
        'src/features/ai-lab/**': {
          lines: 100,
          functions: 100,
          statements: 100,
          branches: 100,
        },
      },
    },
  },
})
