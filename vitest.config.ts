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
      reporter: ['text', 'lcov'], 
      reportsDirectory: 'coverage', 
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/pages/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/constants/__tests__/*.{ts,tsx}',
        'src/events/__tests__/*.{ts,tsx}',
      ],
      exclude: [
        'src/main.tsx',
        'src/test/**/*',
        'src/routes/**/*',
        'src/types/**/*',
        'src/constants/**/*',
        'src/**/*.d.ts',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'], 
    exclude: ['node_modules', 'dist'],
  },
})
