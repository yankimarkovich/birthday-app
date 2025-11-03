/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path alias for cleaner imports: @/components instead of ../../components
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Dev server configuration
  server: {
    port: 5173,
    host: true, // Needed for Docker
    strictPort: true,
    watch: {
      usePolling: true, // Needed for hot reload in Docker
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Test configuration (Vitest)
  test: {
    // Use happy-dom for faster, lighter DOM simulation
    environment: 'happy-dom',

    // Setup file runs before each test file
    setupFiles: './tests/setup.ts',

    // Include test files (separate tests directory)
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],

    // Global test APIs (describe, it, expect) without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },

    // UI mode for interactive testing
    ui: true,
  },
});
