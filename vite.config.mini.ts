import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist-mini',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/mini-dapp'),
    },
  },
  server: {
    port: 3100,
    host: true,
    https: process.env.NODE_ENV === 'production' ? undefined : {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
  },
  envDir: '.',
  envPrefix: 'VITE_',
});