/** Production API URLs — baked as string literals (not :5001, not server IP). */
export const API_SURVEY_SESSION_URL =
  'https://sobhaascend.sobhaapps.com/api/surveys/users/session'

export const API_SURVEY_RESPONSES_URL =
  'https://sobhaascend.sobhaapps.com/api/surveys/responses'

function devApiOrigin(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return 'http://localhost:5001'
}

/** Dev-only branch is removed from production bundles (import.meta.env.DEV === false). */
export function surveySessionUrl(): string {
  if (import.meta.env.DEV) {
    return `${devApiOrigin()}/api/surveys/users/session`
  }
  return API_SURVEY_SESSION_URL
}

export function surveyResponsesUrl(): string {
  if (import.meta.env.DEV) {
    return `${devApiOrigin()}/api/surveys/responses`
  }
  return API_SURVEY_RESPONSES_URL
}

export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return devApiOrigin()
  }
  return 'https://sobhaascend.sobhaapps.com'
}
