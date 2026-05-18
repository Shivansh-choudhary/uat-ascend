import { defineConfig, loadEnv } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PRODUCTION_API_ORIGIN = 'https://sobhaascend.sobhaapps.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl =
    mode === 'production'
      ? PRODUCTION_API_ORIGIN
      : env.VITE_API_BASE_URL?.trim() || ''

  const msalClientId = env.VITE_MSAL_CLIENT_ID?.trim() ?? ''
  const msalTenantId = env.VITE_MSAL_TENANT_ID?.trim() ?? ''
  const msalRedirectUri =
    env.VITE_MSAL_REDIRECT_URI?.trim() ||
    (mode === 'production' ? PRODUCTION_API_ORIGIN : '')

  return {
    server: {
      host: '0.0.0.0',
      port: 3010,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3010,
      strictPort: true,
    },
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_MSAL_CLIENT_ID': JSON.stringify(msalClientId),
      'import.meta.env.VITE_MSAL_TENANT_ID': JSON.stringify(msalTenantId),
      'import.meta.env.VITE_MSAL_REDIRECT_URI': JSON.stringify(msalRedirectUri),
    },
  }
})
