import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rates': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // If you call other endpoints add here
    }
  }
})
