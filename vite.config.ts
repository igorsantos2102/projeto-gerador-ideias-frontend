import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'https://e9f02030dacf.ngrok-free.app'
  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: 'src/setupTests.ts',
      css: true,
      globals: true,
      include: ['src/**/*.{test,test.*}.{ts,tsx}', 'src/**/*.test.{ts,tsx}', 'src/**/*.test.tsx'],
      exclude: ['e2e/**', 'playwright.config.{ts,js}', 'node_modules/**', 'dist/**'],
    },
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: { '@': resolve(__dirname, 'src') },
    },
  }
})
