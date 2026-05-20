import { answerOptions, questions } from '#/lib/assessment'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Progress } from '#/components/ui/progress'
import { cn } from '#/lib/utils'
import { Separator } from '#/components/ui/separator'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

export function SurveyRunner() {
  const {
    userData,
    countdownLabel,
    completionPercent,
    answeredCount,
    visibleQuestions,
    answersArray,
    isTimeUp,
    submitPhase,
    canGoNext,
    setAnswerForQuestion,
    nextQuestion,
    handleSaveAndSignOut,
    handleRetrySave,
    isCompleted,
  } = useSurveyFlow()

  if (submitPhase === 'error') {
    return (
      <div className="w-full rounded-md border border-destructive/50 bg-card/82 p-6 backdrop-blur-sm">
        <p className="font-medium text-destructive">We could not save your responses.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <Button className="mt-4" onClick={() => void handleRetrySave()}>
          Try again
        </Button>
      </div>
    )
  }

  if (submitPhase === 'submitting') {
    return (
      <div className="w-full rounded-md border border-default bg-card/82 p-8 text-center backdrop-blur-sm">
        <p className="text-base font-medium">
          {isTimeUp && !isCompleted
            ? 'Time is up. Saving your responses…'
            : 'Saving your responses…'}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white/62 p-3 backdrop-blur-sm sm:p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">Hi, {userData.name}</h1>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Badge className="w-fit max-w-full truncate" variant="secondary">
              Designation: {userData.Designation}
            </Badge>
            <Badge className="w-fit max-w-full truncate" variant="outline">
              Department: {userData.Department}
            </Badge>
          </div>
        </div>
        <div className="shrink-0 rounded-xl border border-border/80 bg-white/80 px-4 py-2 text-center shadow-xs sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Time Left
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{countdownLabel}</p>
        </div>
      </div>

      <section className="w-full rounded-xl bg-card/78 p-3 backdrop-blur-sm sm:p-4">
        <div className="mb-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Self Assessment
          </p>
          <h1 className="m-0 text-base font-semibold">40 Questions</h1>
          <div className="mt-2">
            <Progress value={completionPercent} />
            <p className="mt-1 text-xs text-muted-foreground">
              {answeredCount}/{questions.length} complete ({completionPercent}%)
            </p>
          </div>
        </div>

        <div className="w-full rounded-md border border-default bg-card/82 p-3 shadow-xs backdrop-blur-sm sm:p-4">
          <div className="mt-1 space-y-6 sm:mt-3 sm:space-y-5">
            {visibleQuestions.map((question) => {
              const currentAnswer = answersArray[question.id - 1]
              return (
                <div key={question.id} className="space-y-3">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                    <div className="min-w-0 flex-1 lg:max-w-[min(100%,32rem)] xl:max-w-[500px]">
                      <p className="text-sm font-semibold text-muted-foreground sm:text-base">
                        Question {question.id}
                      </p>
                      <h2 className="mt-1 text-base font-semibold leading-snug sm:text-base">
                        {question.prompt}
                      </h2>
                    </div>
                    <div
                      className="grid w-full shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end lg:gap-3"
                      role="group"
                      aria-label={`Answer choices for question ${question.id}`}
                    >
                      {answerOptions.map((option) => {
                        const active = currentAnswer === option.value
                        return (
                          <button
                            key={`${question.id}-${option.value}`}
                            type="button"
                            onClick={() => setAnswerForQuestion(question.id, option.value)}
                            disabled={isTimeUp}
                            className={cn(
                              'min-h-11 w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium leading-tight transition-all duration-200 ease-out sm:min-h-12 lg:h-20 lg:w-20 lg:px-1 lg:py-0 lg:text-center',
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-card-foreground active:bg-primary/10 lg:hover:border-primary lg:hover:bg-primary/5',
                            )}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => void handleSaveAndSignOut()}
              disabled={isTimeUp}
            >
              Save and Sign Out
            </Button>
            <Button className="w-full sm:w-auto" onClick={nextQuestion} disabled={!canGoNext}>
              Next
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
