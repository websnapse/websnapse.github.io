import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@vue/runtime-core',
        replacement: '@vue/runtime-core/dist/runtime-core.esm-bundler.js',
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
