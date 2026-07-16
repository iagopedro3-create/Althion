import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    environmentMatchGlobs: [['apps/web/**/*.test.tsx', 'jsdom']],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
