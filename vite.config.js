import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      common: '/src/common',
      components: '/src/components',
      context: '/src/context',
      hooks: '/src/hooks',
      pages: '/src/pages',
      routes: '/src/routes',
      service: '/src/service',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
});
