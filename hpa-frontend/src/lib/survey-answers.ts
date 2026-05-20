import { questions } from '#/lib/assessment'
import { ASSESSMENT_DURATION_SECONDS, SECONDS_PER_QUESTION } from '#/lib/survey-constants'

export function buildAnswersMapFromArray(answersArray: Array<number | undefined>) {
  return answersArray.reduce<Record<number, number>>((acc, value, index) => {
    if (value !== undefined) {
      acc[index + 1] = value
    }
    return acc
  }, {})
}

export function buildAnsweredEntries(answersArray: Array<number | undefined>) {
  return answersArray.flatMap((answer, index) =>
    answer === undefined
      ? []
      : [
          {
            questionId: index + 1,
            answer,
          },
        ],
  )
}

export function toAnswersArrayFromEntries(
  entries: Array<{ questionId: number; answer: number }> | undefined,
) {
  const restoredAnswers: Array<1 | 2 | 3 | 4 | 5 | undefined> = Array.from(
    { length: questions.length },
    () => undefined,
  )
  if (!Array.isArray(entries)) {
    return restoredAnswers
  }

  for (const entry of entries) {
    if (
      entry.questionId >= 1 &&
      entry.questionId <= questions.length &&
      (entry.answer === 1 ||
        entry.answer === 2 ||
        entry.answer === 3 ||
        entry.answer === 4 ||
        entry.answer === 5)
    ) {
      restoredAnswers[entry.questionId - 1] = entry.answer
    }
  }

  return restoredAnswers
}

export function calculateResumeDurationSeconds(answersArray: Array<number | undefined>) {
  const answeredCount = answersArray.reduce<number>(
    (count, answer) => (answer === undefined ? count : count + 1),
    0,
  )
  const remainingQuestions = Math.max(questions.length - answeredCount, 0)
  return Math.max(1, Math.ceil(remainingQuestions * SECONDS_PER_QUESTION))
}

/** Prefer saved timer from DB; fall back to per-question estimate for older saves. */
export function resolveRemainingSecondsFromBackend(
  backendRemainingSeconds: unknown,
  restoredAnswers: Array<number | undefined>,
): number {
  const saved =
    typeof backendRemainingSeconds === 'number'
      ? backendRemainingSeconds
      : Number(backendRemainingSeconds)

  if (Number.isFinite(saved) && saved >= 0) {
    return Math.min(Math.max(0, Math.floor(saved)), ASSESSMENT_DURATION_SECONDS)
  }

  return calculateResumeDurationSeconds(restoredAnswers)
}
