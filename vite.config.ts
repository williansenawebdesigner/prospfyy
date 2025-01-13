import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/places/search': {
        target: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/places/search', ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Google API:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Google API:', proxyRes.statusCode);
          });
        },
      },
      '/api/places/details': {
        target: 'https://maps.googleapis.com/maps/api/place/details/json',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/places/details', ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      },
    },
  },
});