import { resolve } from 'path'
import { defineConfig, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const googleClientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
  return {
  main: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    define: {
      __BUILTIN_GOOGLE_CLIENT_ID__: JSON.stringify(googleClientId)
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
  };
})
