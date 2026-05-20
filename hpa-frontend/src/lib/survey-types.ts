export interface CategoryResult {
  categories: {
    categoryId: number
    title: string
    totalScore: number
    averageScore: number
    weightedScore: number
    scoreLevel: string
  }[]
  letterGrade: string
}

export interface SurveySubmitStatus {
  isCompleted: boolean
  timedOut: boolean
}

export interface ResultData {
  userId: string
  categoryResults: CategoryResult
  questionsAnswered: {
    questionId: number
    answer: number
  }[]
  isCompleted: boolean
  timedOut: boolean
  remainingSeconds?: number
}

export type SubmitPhase =
  | 'idle'
  | 'submitting'
  | 'completed'
  | 'timed_out'
  | 'error'
