import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Ensure this is present

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // This line is crucial
    },
  },
})