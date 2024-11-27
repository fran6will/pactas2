import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  root: '.', 
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: './index.html' 
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true
  },
  base: '/'
})