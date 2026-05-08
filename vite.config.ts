import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

/**
 * Forces a full page reload when a hook file is saved, instead of hot-swapping it.
 * Without this, Vite's HMR remounts components that use the hook, which re-fires
 * their useEffect calls. Those effects call bridge API functions that read from the
 * Redux store — but the store hasn't finished reloading its data from localStorage
 * yet, so the values are null and the app throws an error.
 */
const fullReloadOnHooksChange = {
  name: 'full-reload-on-hooks-change',
  handleHotUpdate({ file, server }: { file: string; server: any }) {
    if (file.includes('/src/js/hooks/')) {
      server.ws.send({ type: 'full-reload' });
      return [];
    }
  },
};

export default defineConfig({
  plugins: [react(), svgr(), fullReloadOnHooksChange],
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
