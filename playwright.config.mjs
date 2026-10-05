import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 1,
  reporter: 'list',
  use: { baseURL: process.env.SITE_URL || 'http://127.0.0.1:4179', browserName:'chromium', headless:true },
  webServer: process.env.SITE_URL ? undefined : { command:'node scripts/serve.mjs',url:'http://127.0.0.1:4179',reuseExistingServer:false },
});
