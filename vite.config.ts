import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'opcionA.png', 'OneSignalSDKWorker.js'], // si tienes más, los agregas aquí
      manifest: {
        name: 'Control de Gastos',
        short_name: 'Gastos',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4F83F8',
        icons: [
          {
            src: '/opcionA.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
