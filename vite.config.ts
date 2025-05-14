import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite configuration for Penguin Patrol Alert System
// Created for EEE4113F at UCT
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    strictPort: true,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
    outDir: 'dist'
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@assets": path.resolve(__dirname, "./src/assets")
    },
  },
}));
