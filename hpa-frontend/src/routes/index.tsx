import { createFileRoute } from '@tanstack/react-router'
import { SurveyFlowProvider } from '#/features/survey-flow/survey-flow-context'
import { SurveyFlowShell } from '#/features/survey-flow/SurveyFlowShell'

export type { CategoryResult } from '#/lib/survey-types'

export const Route = createFileRoute('/')({
  component: SurveyApp,
})

function SurveyApp() {
  return (
    <SurveyFlowProvider>
      <SurveyFlowShell />
    </SurveyFlowProvider>
  )
}
