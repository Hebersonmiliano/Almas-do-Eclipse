const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/browser',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:8765', browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined, headless: true, viewport: { width: 1280, height: 720 } },
  webServer: { command: 'python -m http.server 8765 --bind 127.0.0.1 --directory dist', url: 'http://127.0.0.1:8765', reuseExistingServer: false }
});
