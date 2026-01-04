
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // We define a fallback but allow for dynamic runtime access
    // This ensures process.env is treated as an object in the browser
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || 'undefined')
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  }
});
