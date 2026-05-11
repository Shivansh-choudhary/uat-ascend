import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { questions } from '#/lib/assessment'
import type { AnswerWeight } from '#/lib/assessment'

interface UserData {
  name: string
  email: string
  Department: string
  Designation: string
}

type AssessmentState = {
  currentQuestionId: number
  answersArray: Array<AnswerWeight | undefined>
  isLoggedIn: boolean
  userData: UserData
  setAnswerForQuestion: (questionId: number, value: AnswerWeight) => void
  nextQuestion: () => void
  resetAssessment: () => void
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

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      currentQuestionId: 1,
      answersArray: [],
      isLoggedIn: false,
      userData: {
        name: '',
        email: '',
        Department: '',
        Designation: '',
      },
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
        const nextQuestionId = getCurrentQuestionIdFromAnswers(
          get().answersArray,
        )
        set({ currentQuestionId: nextQuestionId })
      },
      resetAssessment: () => {
        set({ answersArray: [], currentQuestionId: 1 })
      },
      signIn: (userData: UserData) => {
        const currentQuestionId = getCurrentQuestionIdFromAnswers(
          get().answersArray,
        )
        set({ isLoggedIn: true, userData: userData, currentQuestionId })
      },
      signOut: () =>
        set({
          isLoggedIn: false,
          userData: { name: '', email: '', Department: '', Designation: '' },
        }),
    }),
    {
      name: 'assessment-store',
      partialize: (state) => ({
        currentQuestionId: state.currentQuestionId,
        answersArray: state.answersArray,
        isLoggedIn: state.isLoggedIn,
        userData: state.userData,
      }),
    },
  ),
)
