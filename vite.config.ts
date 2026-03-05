import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        tailwindcss(),
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
          manifest: {
            name: 'Interactive Periodic Table',
            short_name: 'Periodic Table',
            description: 'Explore the periodic table with learning tools and classroom modes.',
            theme_color: '#06b6d4',
            background_color: '#0f172a',
            display: 'standalone',
            icons: [
              {
                src: 'icons/icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
              },
              {
                src: 'icons/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,json}'],
          },
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

