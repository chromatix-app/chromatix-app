import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    target: 'es2020',
    rolldownOptions: {
      output: {
        // Code splitting
        manualChunks: (id) => {
          // if (
          //   id.includes('node_modules/react/') ||
          //   id.includes('node_modules/react-dom/') ||
          //   id.includes('node_modules/react-redux/') ||
          //   id.includes('node_modules/react-router-dom/') ||
          //   id.includes('node_modules/scheduler/')
          // ) {
          //   return 'vendor';
          // }
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
