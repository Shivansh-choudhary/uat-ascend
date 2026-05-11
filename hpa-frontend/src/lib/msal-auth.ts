// Old MSAL config implementation is intentionally kept as commented reference.
// Do not remove unless explicitly requested.
/*
import {
  type AccountInfo,
  PublicClientApplication,
  type PopupRequest,
} from '@azure/msal-browser'

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin

const authority = tenantId
  ? `https://login.microsoftonline.com/${tenantId}`
  : 'https://login.microsoftonline.com/common'

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: clientId ?? '',
    authority,
    redirectUri,
  },
})

const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
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
  const response = await msalInstance.loginPopup(loginRequest)
  return response.account
}

export async function logoutMicrosoft(account?: AccountInfo | null) {
  if (!isMsalConfigured()) {
    return
  }

  await msalInstance.logoutPopup({
    account: account ?? msalInstance.getActiveAccount() ?? undefined,
    postLogoutRedirectUri: window.location.origin,
  })
}

export function getActiveMicrosoftAccount() {
  return msalInstance.getActiveAccount()
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
*/

export {}
