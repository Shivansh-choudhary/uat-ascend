import { create } from 'zustand'
import { questions } from '#/lib/assessment'
import type { AnswerWeight } from '#/lib/assessment'

export interface UserData {
  employeeCode: string
  name: string
  email: string
  Department: string
  Designation: string
  entity: string
}

export function createEmptyUserData(): UserData {
  return {
    employeeCode: '',
    name: '',
    email: '',
    Department: '',
    Designation: '',
    entity: '',
  }
}

type AssessmentState = {
  currentQuestionId: number
  answersArray: Array<AnswerWeight | undefined>
  isLoggedIn: boolean
  userData: UserData
  setAnswerForQuestion: (questionId: number, value: AnswerWeight) => void
  nextQuestion: () => void
  resetAssessment: () => void
  hydrateAnswers: (answers: Array<AnswerWeight | undefined>) => void
  signIn: (userData: UserData) => void
  signOut: () => void
}

function getCurrentQuestionIdFromAnswers(
  answersArray: Array<AnswerWeight | undefined>,
) {
  for (let questionId = 1; questionId <= questions.length; questionId += 1) {
    if (answersArray[questionId - 1] === undefined) {
      return questionId
    }
  }
  return questions.length
}

export const useAssessmentStore = create<AssessmentState>()((set, get) => ({
  currentQuestionId: 1,
  answersArray: [],
  isLoggedIn: false,
  userData: createEmptyUserData(),
  setAnswerForQuestion: (questionId, value) => {
    const { answersArray } = get()
    const answerIndex = questionId - 1
    if (answerIndex < 0 || answerIndex >= questions.length) {
      return
    }

    const nextAnswers = [...answersArray]
    nextAnswers[answerIndex] = value
    set({ answersArray: nextAnswers })
  },
  nextQuestion: () => {
    const nextQuestionId = getCurrentQuestionIdFromAnswers(get().answersArray)
    set({ currentQuestionId: nextQuestionId })
  },
  resetAssessment: () => {
    set({ answersArray: [], currentQuestionId: 1 })
  },
  hydrateAnswers: (answers) => {
    const trimmedAnswers = answers.slice(0, questions.length)
    const currentQuestionId = getCurrentQuestionIdFromAnswers(trimmedAnswers)
    set({
      answersArray: trimmedAnswers,
      currentQuestionId,
    })
  },
  signIn: (userData: UserData) => {
    const currentQuestionId = getCurrentQuestionIdFromAnswers(get().answersArray)
    set({ isLoggedIn: true, userData: userData, currentQuestionId })
  },
  signOut: () =>
    set({
      isLoggedIn: false,
      userData: createEmptyUserData(),
    }),
}))
