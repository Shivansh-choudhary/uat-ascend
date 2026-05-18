/** Public API host — must match nginx server_name (not :5001). */
export const PRODUCTION_API_ORIGIN = 'https://sobhaascend.sobhaapps.com'

export function getApiBaseUrl(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_API_ORIGIN
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:5001'
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}
