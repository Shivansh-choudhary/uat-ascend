import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PRODUCTION_API_ORIGIN = 'https://uat-sobhaascend.sobhaapps.com'
const LOCAL_BACKEND_ORIGIN = 'http://localhost:5011'
const configDir = path.dirname(fileURLToPath(import.meta.url))

function isLocalApiUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url)
}

/** Fix UTF-8 BOM on first line of .env files (breaks VITE_MSAL_CLIENT_ID). */
function loadProjectEnv(mode: string) {
  const env = loadEnv(mode, configDir, '')
  for (const [key, value] of Object.entries(env)) {
    if (key.charCodeAt(0) === 0xfeff) {
      const normalizedKey = key.slice(1)
      if (!env[normalizedKey]?.trim()) {
        env[normalizedKey] = value
      }
    }
  }
  return env
}

export default defineConfig(({ mode }) => {
  const env = loadProjectEnv(mode)
  const devApiEnv = env.VITE_API_BASE_URL?.trim() ?? ''
  const devUseProxy =
    mode !== 'production' && (!devApiEnv || isLocalApiUrl(devApiEnv))
  const apiBaseUrl =
    mode === 'production'
      ? PRODUCTION_API_ORIGIN
      : devUseProxy
        ? ''
        : devApiEnv.replace(/\/$/, '')
  const devProxy = {
    '/api': { target: LOCAL_BACKEND_ORIGIN, changeOrigin: true },
    '/health': { target: LOCAL_BACKEND_ORIGIN, changeOrigin: true },
  }

  const useLogin = env.VITE_USE_LOGIN?.trim() === '1' ? '1' : '0'
  const msalClientId = env.VITE_MSAL_CLIENT_ID?.trim() ?? ''
  const msalTenantId = env.VITE_MSAL_TENANT_ID?.trim() ?? ''
  const msalRedirectUri =
    env.VITE_MSAL_REDIRECT_URI?.trim() ||
    (mode === 'production' ? PRODUCTION_API_ORIGIN : '')

  if (mode === 'production' && (!msalClientId || !msalTenantId)) {
    console.warn(
      '\n[hpa-frontend] WARNING: VITE_MSAL_CLIENT_ID or VITE_MSAL_TENANT_ID is missing.\n' +
        '  Add them to hpa-frontend/.env.production or .env.production.local, then run npm run build again.\n' +
        '  Microsoft SSO will not work until you rebuild.\n',
    )
  }

  return {
    envDir: configDir,
    server: {
      host: '0.0.0.0',
      port: 3011,
      strictPort: true,
      proxy: devUseProxy ? devProxy : undefined,
    },
    preview: {
      host: '0.0.0.0',
      port: 3011,
      strictPort: true,
      proxy: devUseProxy ? devProxy : undefined,
    },
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), tanstackStart(), viteReact()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      // TanStack server bundles do not load .env at runtime — inject at build time
      'import.meta.env.VITE_MSAL_CLIENT_ID': JSON.stringify(msalClientId),
      'import.meta.env.VITE_MSAL_TENANT_ID': JSON.stringify(msalTenantId),
      'import.meta.env.VITE_MSAL_REDIRECT_URI': JSON.stringify(msalRedirectUri),
      'import.meta.env.VITE_USE_LOGIN': JSON.stringify(useLogin),
    },
  }
})
