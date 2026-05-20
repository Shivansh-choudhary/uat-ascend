import { createContext, useContext, type ReactNode } from 'react'
import { useSurveyFlowState, type SurveyFlow } from '#/features/survey-flow/use-survey-flow'

const SurveyFlowContext = createContext<SurveyFlow | null>(null)

export function SurveyFlowProvider({ children }: { children: ReactNode }) {
  const flow = useSurveyFlowState()
  return (
    <SurveyFlowContext.Provider value={flow}>{children}</SurveyFlowContext.Provider>
  )
}

export function useSurveyFlow(): SurveyFlow {
  const flow = useContext(SurveyFlowContext)
  if (!flow) {
    throw new Error('useSurveyFlow must be used inside SurveyFlowProvider')
  }
  return flow
}
