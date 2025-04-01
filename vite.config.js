import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'window',  // Ensure global is window
    'process.env': {}  // Fix issues related to Node.js global process object
  },
  optimizeDeps: {
    include: ['buffer'],  // Explicitly optimize the buffer package
  },
});
