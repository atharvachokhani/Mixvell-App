import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true, 
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
