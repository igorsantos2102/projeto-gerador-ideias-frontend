import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom', 
    globals: true,         
    setupFiles: ['src/test/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov', "json-summary"], 
      reportsDirectory: 'coverage', 
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/__tests__/**',
        '**/*.{test,spec}.{ts,tsx}',
        'src/**/*.d.ts',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'], 
    exclude: ['node_modules', 'dist'],
  },
})
