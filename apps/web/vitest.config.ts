import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react'
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'web',
    globals: true,
    environment: "jsdom",
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '.next/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'test/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: process.env.CI ? ['verbose', 'json'] : ['verbose'],
    outputFile: {
      json: './coverage/test-results.json',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@components": path.resolve(__dirname, "./components"),
      "@app": path.resolve(__dirname, "./app"),
      "@test": path.resolve(__dirname, "./test"),
    }
  }
});
