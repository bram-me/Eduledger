import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // Vite prefers this way instead of path.resolve
    },
  },
  build: {
    outDir: 'dist', // Ensure Vercel looks in the correct build folder
  },
  define: {
    global: 'window',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
  },
});
