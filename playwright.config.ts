import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    env: {
      VITE_BACKEND_URL: 'https://e9f02030dacf.ngrok-free.app',
      VITE_USE_IDEAS_API: 'true',
      VITE_USE_CATEGORIES_API: 'true',
    },
  },
})

