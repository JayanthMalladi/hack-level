import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/langflow': {
        target: 'https://api.langflow.astra.datastax.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/langflow/, ''),
        headers: {
          'Authorization': `Bearer ${process.env.VITE_LANGFLOW_ACCESS_TOKEN}`,
        },
      },
    },
  },
});
