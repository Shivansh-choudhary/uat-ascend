import { questions } from '#/lib/assessment'
import type { SubmitPhase } from '#/lib/survey-types'

export const ASSESSMENT_DURATION_SECONDS = 7 * 60
export const SECONDS_PER_QUESTION = ASSESSMENT_DURATION_SECONDS / questions.length

export const surveyBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(248, 245, 235, 0.58), rgba(248, 245, 235, 0.68)), url('/talent_background.PNG')",
  backgroundPosition: 'left center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
} as const

export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getCompletionSubmitPhase(isCompleted: boolean): SubmitPhase {
  return isCompleted ? 'completed' : 'timed_out'
}
