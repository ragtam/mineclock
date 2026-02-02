import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/mineclock/',
  root: 'src',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Keep manifest.json at root level
          if (assetInfo.name === 'manifest.json') {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  publicDir: '../public'
})
