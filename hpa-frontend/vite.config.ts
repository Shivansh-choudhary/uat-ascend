import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
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
})

export default config
