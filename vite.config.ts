import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isMiniDapp = mode === 'mini-dapp'

  return {
    plugins: [react()],
    root: '.',
    build: {
      outDir: isMiniDapp ? 'dist-mini' : 'dist',
      emptyOutDir: true,
      rollupOptions: isMiniDapp ? {
        input: path.resolve(__dirname, 'mini-dapp.html'),
      } : undefined,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, isMiniDapp ? './src/mini-dapp' : './src'),
      },
    },
    server: {
      port: isMiniDapp ? 3100 : 3000,
      host: true,
    },
    envDir: '.',
    envPrefix: 'VITE_',
  }
})