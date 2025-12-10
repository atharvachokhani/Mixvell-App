import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  server: {
    port: 3000,
    host: true, // Expose to local network
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});