import { defineConfig, PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import autoprefixer from 'autoprefixer';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';
import fs from 'fs-extra';

export default defineConfig(({ command }) => ({
  define: {
    Version: JSON.stringify(
      ((today = new Date()) => `${process.env.npm_package_version} (${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()})`)()
    ),
  },
  plugins: [
    injectEruda(command === 'serve'),
    solidPlugin(),
    VitePWA({
      manifest: {
        "short_name": "Raag Heaven",
        "name": "Listen with Raag Heaven",
        "description": "32kb/s to 320kb/s youtube based audio streaming platform. Copy a youtube video link or search here and listen to it as an audio totally free.",
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
                "sizes": "192x192",
              }]
          },
          {
            "name": "Favorites",
            "url": "/list?collection=favorites",
            "icons": [
              {
                "src": "heart-fill.png",
                "sizes": "192x192",
              }]
          },
          {
            "name": "Listen Later",
            "url": "/list?collection=listenLater",
            "icons": [
              {
                "src": "calendar-schedule-fill.png",
                "sizes": "192x192",
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
      includeAssets: ['*.woff2', 'rh_banner.webp']
    })
  ],
  build: {
    rollupOptions: {
      // Ensure the additional files are copied to the dist folder
      plugins: [
        {
          name: 'copy-ads-and-cont',
          writeBundle() {
            // Copy ads.txt and cont.html to the dist folder after build
            const distDir = path.resolve(__dirname, 'dist');
            fs.copySync(path.resolve(__dirname, 'ads.txt'), path.join(distDir, 'ads.txt'));
            fs.copySync(path.resolve(__dirname, 'cont.html'), path.join(distDir, 'cont.html'));
          }
        }
      ]
    }
  },
  css: {
    postcss: {
      plugins: [autoprefixer()]
    }
  }
}));

const injectEruda = (serve: boolean) => serve ? (<PluginOption>{
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
}) : [];