import { defineConfig } from '@playwright/test';

const baseURL = process.env.IMPACT_TEST_URL || 'http://127.0.0.1:3102';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  use: { baseURL, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: process.env.IMPACT_TEST_URL ? undefined : {
    command: 'npm run dev -- --port 3102',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
