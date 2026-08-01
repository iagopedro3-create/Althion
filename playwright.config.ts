import { defineConfig, devices } from '@playwright/test';

// Porta dedicada, não a 3000 do `next dev`. Com `reuseExistingServer`, um
// servidor alheio já escutando na porta padrão é adotado como se fosse o nosso:
// a suíte roda inteira contra o site errado e reprova — ou, pior, aprova.
const port = process.env.E2E_PORT ?? '3210';
const baseURL = `http://127.0.0.1:${port}`;
const webServerCommand =
  process.env.E2E_WEB_SERVER_COMMAND ??
  `pnpm --dir apps/web dev --hostname 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: baseURL,
  },
});
