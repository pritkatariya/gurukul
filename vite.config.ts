import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  base: '/',  // આ ઉમેરો
  build: {
    chunkSizeWarningLimit: 1600,
    assetsDir: 'assets',
    outDir: 'dist',
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  logLevel: 'warn',
})