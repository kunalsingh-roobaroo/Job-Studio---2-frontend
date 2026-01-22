import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    // Production build optimizations
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          aws: ['aws-amplify'],
        },
      },
    },
    // Increase chunk size warning limit (images are large)
    chunkSizeWarningLimit: 1000,
  },
  // Remove console logs in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
