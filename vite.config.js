import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // REST API → FastAPI on :8000
      '/api': {
        target: 'http://veldt-agent-fahad.southeastasia.azurecontainer.io:8080',
        changeOrigin: true,
      },
      // Product images → FastAPI on :8000
      '/images': {
        target: 'http://veldt-agent-fahad.southeastasia.azurecontainer.io:8080',
        changeOrigin: true,
      },
      // WebSocket → AI stylist agent on :8080
      '/ws': {
        target: 'ws://veldt-agent-fahad.southeastasia.azurecontainer.io:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});