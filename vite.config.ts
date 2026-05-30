import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 'base' ને './' કરવાથી બધી એસેટ્સ સાપેક્ષ (relative) પાથથી લોડ થશે
  base: './', 
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    assetsDir: 'assets',
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  logLevel: 'info',
})