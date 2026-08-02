import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Unit test configuration.
 *
 * Tests cover the pure logic that guards the API surface - the upstream
 * allowlist, environment/base-URL resolution, secret redaction and health
 * aggregation - none of which require a browser or a running stack.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
