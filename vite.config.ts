import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PokéCheck',
        short_name: 'PokéCheck',
        description: 'A Pokémon TCG Prize Card Predictor',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/lovable-uploads/e8e0c2bd-e70c-4493-a149-cb40bb2740f7.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/e8e0c2bd-e70c-4493-a149-cb40bb2740f7.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/e8e0c2bd-e70c-4493-a149-cb40bb2740f7.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));