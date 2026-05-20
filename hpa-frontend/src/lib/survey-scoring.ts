import {
  categories,
  getLetterGradeFromAverage,
  questions,
  scoreLevels,
} from '#/lib/assessment'
import type { CategoryResult, ResultData, SurveySubmitStatus } from '#/lib/survey-types'
import {
  buildAnsweredEntries,
  buildAnswersMapFromArray,
} from '#/lib/survey-answers'

function roundTo2(value: number) {
  return Number(value.toFixed(2))
}

function getScoreLevelDescriptor(averageScore: number) {
  return (
    scoreLevels.find(
      (level) => averageScore >= level.min && averageScore <= level.max,
    )?.descriptor ?? 'Developing'
  )
}

export function calculateCategoryResults(
  answers: Record<number, number>,
): CategoryResult {
  const categoryScores: CategoryResult['categories'] = categories.map(
    (category) => {
      const rawSum = category.questions.reduce(
        (sum, questionId) => sum + (answers[questionId] ?? 0),
        0,
      )
      const averageScore = rawSum / category.questions.length
      const weightedScore = averageScore * category.weight
      const scoreLevel = getScoreLevelDescriptor(averageScore)

      return {
        categoryId: category.id,
        title: category.title,
        totalScore: roundTo2(rawSum),
        averageScore: roundTo2(averageScore),
        weightedScore: roundTo2(weightedScore),
        scoreLevel: scoreLevel,
      }
    },
  )

  const weightSum = categories.reduce((sum, c) => sum + c.weight, 0)
  const overallWeightedAverage =
    categoryScores.reduce((sum, item) => sum + item.weightedScore, 0) /
    weightSum

  const letterGrade = getLetterGradeFromAverage(overallWeightedAverage)

  return {
    categories: categoryScores,
    letterGrade,
  }
}

/** Partial save: only categories with at least one answered question. */
export function calculateCategoryResultsFromAnsweredOnly(
  answersArray: Array<number | undefined>,
): CategoryResult {
  const answersMap = buildAnswersMapFromArray(answersArray)
  const categoryScores: CategoryResult['categories'] = []

  for (const category of categories) {
    const answeredQuestionIds = category.questions.filter(
      (questionId) => answersMap[questionId] !== undefined,
    )
    if (answeredQuestionIds.length === 0) {
      continue
    }

    const rawSum = answeredQuestionIds.reduce(
      (sum, questionId) => sum + (answersMap[questionId] as number),
      0,
    )
    const averageScore = rawSum / answeredQuestionIds.length
    const weightedScore = averageScore * category.weight

    categoryScores.push({
      categoryId: category.id,
      title: category.title,
      totalScore: roundTo2(rawSum),
      averageScore: roundTo2(averageScore),
      weightedScore: roundTo2(weightedScore),
      scoreLevel: getScoreLevelDescriptor(averageScore),
    })
  }

  const weightSum = categoryScores.reduce((sum, item) => {
    const category = categories.find((entry) => entry.id === item.categoryId)
    return sum + (category?.weight ?? 0)
  }, 0)
  const overallWeightedAverage =
    weightSum > 0
      ? categoryScores.reduce((sum, item) => sum + item.weightedScore, 0) / weightSum
      : 0

  return {
    categories: categoryScores,
    letterGrade: getLetterGradeFromAverage(overallWeightedAverage),
  }
}

export function buildSurveyResultPayload(
  activeUserId: string,
  answersArray: Array<number | undefined>,
  answeredCount: number,
  status: SurveySubmitStatus,
  remainingSeconds?: number,
): ResultData | null {
  if (!activeUserId) {
    return null
  }
  const questionsAnswered = buildAnsweredEntries(answersArray)
  if (questionsAnswered.length === 0) {
    return null
  }
  const allQuestionsAnswered = answeredCount === questions.length
  const categoryResults = allQuestionsAnswered
    ? calculateCategoryResults(buildAnswersMapFromArray(answersArray))
    : calculateCategoryResultsFromAnsweredOnly(answersArray)
  if (categoryResults.categories.length === 0) {
    return null
  }
  return {
    userId: activeUserId,
    categoryResults,
    questionsAnswered,
    isCompleted: status.isCompleted,
    timedOut: status.timedOut,
    ...(remainingSeconds !== undefined
      ? { remainingSeconds: Math.max(0, Math.floor(remainingSeconds)) }
      : {}),
  }
}
