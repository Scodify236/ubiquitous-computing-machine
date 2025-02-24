import { defineConfig, PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import solidPlugin from 'vite-plugin-solid';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Define injectEruda only once
const injectEruda = (): PluginOption => ({
  name: 'erudaInjector',
  transformIndexHtml: html => ({
    html,
    tags: [
      {
        tag: 'script',
        attrs: {
          src: '/node_modules/eruda/eruda'
        },
        injectTo: 'body-prepend'
      },
      {
        tag: 'script',
        injectTo: 'body-prepend',
        children: 'eruda.init()'
      }
    ]
  })
});

export default defineConfig(({ command }) => ({
  define: {
    Locales: JSON.stringify(readdirSync(resolve(__dirname, './src/locales')).map(file => file.slice(0, 2))),
    Version: JSON.stringify(
      ((today = new Date()) => `${process.env.npm_package_version} (${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()})`)()
    ),
  },
  plugins: [
    ...(command === 'serve' ? [injectEruda()] : []),
    solidPlugin(),
    VitePWA({
      manifest: {
        "short_name": "Ytify",
        "name": "Listen with ytify",
        "description": "32kb/s to 128kb/s youtube audio streaming website. Copy a youtube video link and listen to it as an audio totally free.",
        "icons": [
          {
            "src": "logo192.png",
            "type": "image/png",
            "sizes": "192x192",
            "purpose": "any maskable"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "any maskable"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "44x44",
            "purpose": "any"
          }
        ],
        "shortcuts": [
          {
            "name": "History",
            "url": "/list?collection=history",
            "icons": [
              {
                "src": "memories-fill.png",
                "sizes": "192x192"
              }]
          },
          {
            "name": "Favorites",
            "url": "/list?collection=favorites",
            "icons": [
              {
                "src": "heart-fill.png",
                "sizes": "192x192"
              }]
          },
          {
            "name": "Listen Later",
            "url": "/list?collection=listenLater",
            "icons": [
              {
                "src": "calendar-schedule-fill.png",
                "sizes": "192x192"
              }]
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "theme_color": "white",
        "background_color": "white",
        "share_target": {
          "action": "/",
          "method": "GET",
          "params": {
            "title": "title",
            "text": "text",
            "url": "url"
          }
        }
      },
      disable: command !== 'build',
      includeAssets: ['*.woff2', 'ytify_banner.webp']
    })
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
      ]
    }
  },
  server: {
    port: 14000, // Set Vite to use Tauri's expected port
    strictPort: true, // Prevent fallback
  },
  clearScreen: false,
}));
