import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'
import { SurveyClosedScreen } from '#/components/survey/SurveyClosedScreen'
import { SurveyRunner } from '#/components/survey/SurveyRunner'

export function SurveyMainScreen() {
  const {
    isCheckingCompletion,
    hasCompletedAssessment,
    hasTimedOutAssessment,
    isFinalMessageVisible,
  } = useSurveyFlow()

  return (
    <main className="mx-auto w-full max-w-[1200px] p-3 sm:p-4 md:p-6">
      {isCheckingCompletion ? (
        <section className="rounded-xl bg-card/78 p-6 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            Checking your assessment status...
          </p>
        </section>
      ) : null}

      {!isCheckingCompletion && hasCompletedAssessment ? (
        <SurveyClosedScreen variant="completed" />
      ) : null}

      {!isCheckingCompletion && hasTimedOutAssessment ? (
        <SurveyClosedScreen variant="timed_out" />
      ) : null}

      {!isCheckingCompletion &&
        !hasCompletedAssessment &&
        !hasTimedOutAssessment &&
        isFinalMessageVisible ? (
        <SurveyClosedScreen variant="session_end" />
      ) : null}

      {!isCheckingCompletion &&
        !hasCompletedAssessment &&
        !hasTimedOutAssessment &&
        !isFinalMessageVisible ? (
        <SurveyRunner />
      ) : null}
    </main>
  )
}
