import { API_SURVEY_RESPONSES_URL, API_SURVEY_SESSION_URL } from '#/lib/api'
import type { ResultData } from '#/lib/survey-types'
import type { UserData } from '#/store/assessment-store'

export async function saveSurveyResults(resultData: ResultData) {
  console.log('[Survey][Frontend] Sending POST request:', {
    endpoint: API_SURVEY_RESPONSES_URL,
    method: 'POST',
  })

  try {
    const response = await fetch(API_SURVEY_RESPONSES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData),
    })

    const responseBody = await response.json().catch(() => null)
    console.log('[Survey][Frontend] Received response:', {
      status: response.status,
      ok: response.ok,
      body: responseBody,
    })

    if (!response.ok) {
      throw new Error(`Failed to save survey response. Status: ${response.status}`)
    }

    console.log('[Survey][Frontend] Survey response posted successfully.')
    return true
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[Survey][Frontend] Error posting survey response:', {
      message: errorMessage,
      raw: error,
    })
    return false
  }
}

export async function postSurveySession(userData: UserData | { email: string; name: string }) {
  const response = await fetch(API_SURVEY_SESSION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userData }),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Failed to prepare user session. Status: ${response.status}`)
  }
  return body as {
    data?: {
      user?: Record<string, unknown> | null
      response?: Record<string, unknown> | null
    }
  }
}
