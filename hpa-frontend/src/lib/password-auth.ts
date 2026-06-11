import { API_SURVEY_LOGIN_URL } from '#/lib/api'

const PASSWORD_AUTH_TOKEN_KEY = 'hpa.passwordAuthToken'

export function getStoredPasswordAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  const token = sessionStorage.getItem(PASSWORD_AUTH_TOKEN_KEY)?.trim()
  return token || null
}

export function storePasswordAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.setItem(PASSWORD_AUTH_TOKEN_KEY, token.trim())
}

export function clearPasswordAuthToken() {
  if (typeof window === 'undefined') {
    return
  }
  sessionStorage.removeItem(PASSWORD_AUTH_TOKEN_KEY)
}

export async function loginWithPassword(email: string, password: string) {
  const response = await fetch(API_SURVEY_LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && typeof body.message === 'string'
        ? body.message
        : `Sign in failed. Status: ${response.status}`
    throw new Error(message)
  }

  const token =
    body &&
    typeof body === 'object' &&
    body.data &&
    typeof body.data === 'object' &&
    typeof body.data.token === 'string'
      ? body.data.token.trim()
      : ''

  if (!token) {
    throw new Error('Sign in succeeded but no token was returned.')
  }

  storePasswordAuthToken(token)

  const user =
    body &&
    typeof body === 'object' &&
    body.data &&
    typeof body.data === 'object' &&
    body.data.user &&
    typeof body.data.user === 'object'
      ? (body.data.user as Record<string, unknown>)
      : null

  return { token, user }
}

export async function getPasswordAuthToken(): Promise<string | null> {
  return getStoredPasswordAuthToken()
}
