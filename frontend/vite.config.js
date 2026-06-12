import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly from XAMPP subdirectories
  build: {
    outDir: '../assets', // Compiles into the assets directory
    emptyOutDir: false // CRITICAL: prevent deleting other directories
  }
})
