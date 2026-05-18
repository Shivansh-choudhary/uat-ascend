import { defineConfig, loadEnv } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PRODUCTION_API_ORIGIN = 'https://sobhaascend.sobhaapps.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl =
    env.VITE_API_BASE_URL?.trim() ||
    (mode === 'production' ? PRODUCTION_API_ORIGIN : '')

  return {
    server: {
      host: '0.0.0.0',
      port: 3001,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3001,
      strictPort: true,
    },
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
  }
})
