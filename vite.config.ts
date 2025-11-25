import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @ts-ignore - Vitest config
  test: {
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
    css: true,
    globals: true,
    include: ['src/**/*.{test,test.*}.{ts,tsx}', 'src/**/*.test.{ts,tsx}', 'src/**/*.test.tsx'],
    exclude: ['e2e/**', 'playwright.config.{ts,js}', 'node_modules/**', 'dist/**'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
