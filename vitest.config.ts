import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/ui/src'),
    },
  },
});
