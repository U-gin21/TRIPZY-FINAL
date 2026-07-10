import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get the name of the workspace folder (parent of frontend)
const projectFolderName = path.basename(path.resolve(__dirname, '..'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __PROJECT_FOLDER_NAME__: JSON.stringify(projectFolderName)
  },
  base: './', // Ensures assets load correctly from XAMPP subdirectories
  build: {
    outDir: '../assets', // Compiles into the assets directory
    emptyOutDir: false // CRITICAL: prevent deleting other directories
  }
})
