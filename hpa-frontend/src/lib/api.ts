const PRODUCTION_API_ORIGIN = 'https://sobhaascend.sobhaapps.com'

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_ORIGIN
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return PRODUCTION_API_ORIGIN
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}
