import type {
  AccountInfo,
  PopupRequest,
  PublicClientApplication,
} from '@azure/msal-browser'

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID

const authority = tenantId
  ? `https://login.microsoftonline.com/${tenantId}`
  : 'https://login.microsoftonline.com/common'

const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
}

let msalInstancePromise: Promise<PublicClientApplication | null> | null = null

async function getMsalInstance() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!msalInstancePromise) {
    msalInstancePromise = import('@azure/msal-browser').then(
      ({ PublicClientApplication }) =>
        new PublicClientApplication({
          auth: {
            clientId: clientId ?? '',
            authority,
            redirectUri:
              import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin,
          },
        }),
    )
  }

  return msalInstancePromise
}

function ensureMsalConfigured() {
  if (!clientId || !tenantId) {
    throw new Error(
      'Microsoft SSO is not configured. Set VITE_MSAL_CLIENT_ID and VITE_MSAL_TENANT_ID.',
    )
  }
}

export function isMsalConfigured() {
  return Boolean(clientId && tenantId)
}

export async function loginWithMicrosoft() {
  ensureMsalConfigured()
  const msalInstance = await getMsalInstance()
  if (!msalInstance) {
    throw new Error('Microsoft SSO is only available in the browser.')
  }

  const response = await msalInstance.loginPopup(loginRequest)
  if (!response.account) {
    throw new Error('Microsoft login completed without an account.')
  }

  msalInstance.setActiveAccount(response.account)
  return response.account
}

export async function logoutMicrosoft(account?: AccountInfo | null) {
  if (!isMsalConfigured() || typeof window === 'undefined') {
    return
  }

  const msalInstance = await getMsalInstance()
  if (!msalInstance) {
    return
  }

  await msalInstance.logoutPopup({
    account: account ?? msalInstance.getActiveAccount() ?? undefined,
    postLogoutRedirectUri: window.location.origin,
  })
}

export async function getActiveMicrosoftAccount() {
  const msalInstance = await getMsalInstance()
  if (!msalInstance) {
    return null
  }

  const activeAccount = msalInstance.getActiveAccount()
  if (activeAccount) {
    return activeAccount
  }

  const fallbackAccount = msalInstance.getAllAccounts()[0] ?? null
  if (fallbackAccount) {
    msalInstance.setActiveAccount(fallbackAccount)
  }

  return fallbackAccount
}

export function toUserData(account: AccountInfo) {
  const fullName = account.name ?? ''
  const [first, ...rest] = fullName.split(' ')
  return {
    name: fullName || account.username,
    email: account.username,
    Department: '',
    Designation: rest.length > 0 ? rest.join(' ') : first || 'Employee',
  }
}
