import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/german-cv-generator/', // MUST match your repo name exactly
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
