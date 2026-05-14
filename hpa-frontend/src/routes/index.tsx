import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import {
  answerOptions,
  categories,
  getLetterGradeFromAverage,
  questions,
  scoreLevels,
} from '#/lib/assessment'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { createEmptyUserData, useAssessmentStore } from '#/store/assessment-store'
import type { UserData } from '#/store/assessment-store'
import {
  getActiveMicrosoftAccount,
  isMsalConfigured,
  logoutMicrosoft,
  toUserData,
} from '#/lib/msal-auth'
import { Progress } from '#/components/ui/progress'
import { cn } from '#/lib/utils'
import { Separator } from '#/components/ui/separator'
import { EmployeeDetailsForm } from '#/components/EmployeeDetailsForm'
import { AuthHeroPanel } from '#/components/AuthHeroPanel'

export const Route = createFileRoute('/')({ component: App })

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

function roundTo2(value: number) {
  return Number(value.toFixed(2))
}

function calculateCategoryResults(
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

      // find the score level from the average score
      const scoreLevel =
        scoreLevels.find(
          (level) => averageScore >= level.min && averageScore <= level.max,
        )?.descriptor ?? ''

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

interface ResultData {
  userData: UserData
  categoryResults: CategoryResult
  questionsAnswered: number[]
}

const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5001`
    : 'http://10.131.2.6:5001'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL


const ASSESSMENT_DURATION_SECONDS = 7 * 60

type ProfileErrors = Partial<Record<keyof UserData | 'otherEntity', string>>
type SubmitPhase =
  | 'idle'
  | 'submitting'
  | 'completed'
  | 'timed_out'
  | 'error'

const surveyBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(248, 245, 235, 0.58), rgba(248, 245, 235, 0.68)), url('/talent_background.PNG')",
  backgroundPosition: 'left center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
}

function normalizeUserData(value: UserData, otherEntity: string): UserData {
  const normalizedOtherEntity = otherEntity.trim()

  return {
    employeeCode: value.employeeCode.trim(),
    name: value.name.trim(),
    email: value.email.trim().toLowerCase(),
    Department: value.Department.trim(),
    Designation: value.Designation.trim(),
    entity:
      value.entity.trim() === 'Other' ? normalizedOtherEntity : value.entity.trim(),
  }
}

function validateUserData(value: UserData, otherEntity: string): ProfileErrors {
  const normalized = normalizeUserData(value, otherEntity)
  const errors: ProfileErrors = {}

  if (!normalized.employeeCode) {
    errors.employeeCode = 'Employee code is required.'
  }
  if (!normalized.name) {
    errors.name = 'Employee name is required.'
  }
  if (!normalized.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!normalized.Designation) {
    errors.Designation = 'Designation is required.'
  }
  if (!normalized.Department) {
    errors.Department = 'Department is required.'
  }
  if (!normalized.entity) {
    errors.entity = 'Entity is required.'
  }
  if (value.entity.trim() === 'Other' && !otherEntity.trim()) {
    errors.otherEntity = 'Please enter the entity name.'
  }

  return errors
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getCompletionSubmitPhase(isCompleted: boolean): SubmitPhase {
  return isCompleted ? 'completed' : 'timed_out'
}

function App() {
  const {
    currentQuestionId,
    answersArray,
    setAnswerForQuestion,
    nextQuestion,
    resetAssessment,
    isLoggedIn,
    userData,
    signIn,
    signOut,
  } = useAssessmentStore()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [profileForm, setProfileForm] = useState<UserData>(() => createEmptyUserData())
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [otherEntity, setOtherEntity] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(ASSESSMENT_DURATION_SECONDS)
  const [timerRunId, setTimerRunId] = useState(0)
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(false)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)
  /** This session only — after a successful POST from completing all questions */
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle')
  const autoSubmitStartedRef = useRef(false)
  const answeredCount = answersArray.reduce(
    (count, answer) => (answer === undefined ? count : count + 1),
    0,
  )
  const completionPercent = Math.round((answeredCount / questions.length) * 100)
  const isCompleted = answeredCount === questions.length
  const currentPageStart = Math.floor((currentQuestionId - 1) / 5) * 5
  const visibleQuestions = questions.slice(currentPageStart, currentPageStart + 5)
  const isTimeUp = remainingSeconds <= 0
  const countdownLabel = formatCountdown(remainingSeconds)
  const isFinalMessageVisible =
    submitPhase === 'completed' || submitPhase === 'timed_out'
  const buildResultPayload = (): ResultData => {
    const answersMap = answersArray.reduce<Record<number, number>>(
      (acc, value, index) => {
        if (value !== undefined) {
          acc[index + 1] = value
        }
        return acc
      },
      {},
    )
    const results = calculateCategoryResults(answersMap)
    return {
      userData: userData,
      categoryResults: results,
      questionsAnswered: answersArray.flatMap((answer) =>
        answer === undefined ? [] : [answer],
      ),
    }
  }

  const saveResultsToDatabase = async (resultData: ResultData) => {
    const endpoint = `${API_BASE_URL}/api/surveys/responses`
    console.log('[Survey][Frontend] Sending POST request:', {
      endpoint,
      method: 'POST',
    })

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      })

      const responseBody = await response.json().catch(() => null)
      console.log('[Survey][Frontend] Received response:', {
        status: response.status,
        ok: response.ok,
        body: responseBody,
      })

      if (!response.ok) {
        throw new Error(`Failed to save survey response. Status: ${response.status}`)
      }

      console.log('[Survey][Frontend] Survey response posted successfully.')
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('[Survey][Frontend] Error posting survey response:', {
        message: errorMessage,
        raw: error,
      })
      return false
    }
  }

  const updateProfileField = (field: keyof UserData, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === 'entity' ? { otherEntity: undefined } : null),
    }))

    if (field === 'entity' && value !== 'Other') {
      setOtherEntity('')
    }
  }

  const handleOtherEntityChange = (value: string) => {
    setOtherEntity(value)
    setProfileErrors((current) => ({
      ...current,
      otherEntity: undefined,
    }))
  }

  const resetProfileForm = () => {
    setProfileForm(createEmptyUserData())
    setProfileErrors({})
    setOtherEntity('')
  }

  const handleLogin = () => {
    resetProfileForm()
    setShowProfileForm(true)
  }

  const handleProfileSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validateUserData(profileForm, otherEntity)
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    signIn(normalizeUserData(profileForm, otherEntity))
    setShowInstructions(true)
    setShowProfileForm(false)
    setSubmitPhase('idle')
    autoSubmitStartedRef.current = false
  }

  const handleStartSurvey = () => {
    setShowInstructions(false)
    resetAssessment()
    setRemainingSeconds(ASSESSMENT_DURATION_SECONDS)
    setTimerRunId((v) => v + 1)
  }

  const handleSignOut = async () => {
    try {
      await logoutMicrosoft()
    } catch (error) {
      console.error('[Auth] Microsoft logout failed:', error)
    } finally {
      resetAssessment()
      signOut()
      resetProfileForm()
      setShowProfileForm(false)
      setShowInstructions(false)
      setSubmitPhase('idle')
      autoSubmitStartedRef.current = false
    }
  }

  useEffect(() => {
    if (isLoggedIn || !isMsalConfigured()) {
      return
    }

    void (async () => {
      const account = await getActiveMicrosoftAccount()
      if (!account) {
        return
      }

      signIn(toUserData(account))
    })()
  }, [isLoggedIn, signIn])

  useEffect(() => {
    console.log('[Auth/Survey State]', {
      isLoggedIn,
      answeredCount,
      currentQuestionId,
      isCompleted,
      isTimeUp,
      visibleQuestionIds: visibleQuestions.map((q) => q.id),
    })
  }, [
    isLoggedIn,
    answeredCount,
    currentQuestionId,
    isCompleted,
    isTimeUp,
    visibleQuestions,
  ])

  useEffect(() => {
    const deadline = Date.now() + ASSESSMENT_DURATION_SECONDS * 1000
    const timerId = window.setInterval(() => {
      const diff = Math.max(deadline - Date.now(), 0)
      setRemainingSeconds(Math.ceil(diff / 1000))
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [timerRunId])

  useEffect(() => {
    if (!isLoggedIn || !userData.email || showInstructions) {
      setHasCompletedAssessment(false)
      setSubmitPhase('idle')
      autoSubmitStartedRef.current = false
      return
    }

    const checkCompletionStatus = async () => {
      setIsCheckingCompletion(true)
      const endpoint = `${API_BASE_URL}/api/surveys/responses/status?email=${encodeURIComponent(
        userData.email,
      )}`
      console.log('[Survey][Frontend] Checking completion status:', {
        endpoint,
        email: userData.email,
      })

      try {
        const response = await fetch(endpoint)
        const body = await response.json().catch(() => null)
        console.log('[Survey][Frontend] Completion status response:', {
          status: response.status,
          ok: response.ok,
          body,
        })

        if (!response.ok) {
          setHasCompletedAssessment(false)
          setSubmitPhase('idle')
          return
        }

        setHasCompletedAssessment(Boolean(body?.hasCompleted))
        if (!body?.hasCompleted) {
          setSubmitPhase('idle')
          autoSubmitStartedRef.current = false
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        console.error('[Survey][Frontend] Failed completion check:', {
          message: errorMessage,
          raw: error,
        })
        setHasCompletedAssessment(false)
        setSubmitPhase('idle')
        autoSubmitStartedRef.current = false
      } finally {
        setIsCheckingCompletion(false)
      }
    }

    void checkCompletionStatus()
  }, [isLoggedIn, userData.email])

  useEffect(() => {
    if (isCheckingCompletion || hasCompletedAssessment || showInstructions) {
      return
    }
    if (!isCompleted && !isTimeUp) {
      return
    }
    if (autoSubmitStartedRef.current) {
      return
    }
    autoSubmitStartedRef.current = true
    setSubmitPhase('submitting')

    const run = async () => {
      const resultData = buildResultPayload()
      console.log('[Survey][Frontend] Auto-submit prepared payload:', {
        apiBaseUrl: API_BASE_URL,
        userEmail: resultData.userData.email,
        answersCount: resultData.questionsAnswered.length,
        letterGrade: resultData.categoryResults.letterGrade,
        timedOut: isTimeUp && !isCompleted,
      })
      const ok = await saveResultsToDatabase(resultData)
      if (ok) {
        setSubmitPhase(getCompletionSubmitPhase(isCompleted))
      } else {
        setSubmitPhase('error')
        autoSubmitStartedRef.current = false
      }
    }

    void run()
  }, [isCheckingCompletion, hasCompletedAssessment, isCompleted, isTimeUp])

  const canGoNext = useMemo(() => {
    if (isTimeUp) {
      return false
    }
    if (currentQuestionId >= questions.length) {
      return false
    }
    return visibleQuestions.every(
      (question) => answersArray[question.id - 1] !== undefined,
    )
  }, [answersArray, currentQuestionId, isTimeUp, visibleQuestions])

  return (
    <div className="min-h-[calc(100vh-72px)]" style={surveyBackgroundStyle}>
      {!isLoggedIn && !showProfileForm ? (
        <div className="min-h-[calc(100vh-72px)] bg-white lg:grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="contents lg:contents">
            <AuthHeroPanel
              title="Welcome to the High Potential Assessment Questionnaire"
            />

            <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:px-12 xl:px-16">
              <div className="w-full max-w-md">
                <img src="/logo-sobha.png" alt="Sobha Ascend Logo" className="mb-4  mx-auto h-16 w-16 object-contain" />
                <div className="text-center">

                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Sobha Ascend
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Use the button below to continue into the assessment flow.
                  </p>
                </div>

                <Button className="mt-8 w-full" size="lg" onClick={handleLogin}>
                  Sign in to get started
                </Button>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {!isLoggedIn && showProfileForm ? (
        <EmployeeDetailsForm
          profileForm={profileForm}
          profileErrors={profileErrors}
          otherEntity={otherEntity}
          onUpdateField={updateProfileField}
          onOtherEntityChange={handleOtherEntityChange}
          onSubmit={handleProfileSubmit}
          onBack={() => {
            resetProfileForm()
            setShowProfileForm(false)
          }}
        />
      ) : null}

      {isLoggedIn && showInstructions ? (
        <div className="min-h-[calc(100vh-72px)] bg-white lg:grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="contents lg:contents">
            <AuthHeroPanel
              title="High Potential Assessment Questionnaire"
            />

            <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:px-12 xl:px-16">
              <div className="w-full max-w-2xl">
                <div className=" mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Sobha Ascend
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">Instructions</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Please read the following instructions carefully before starting the assessment:
                  </p>
                </div>

                <div className="space-y-6 text-left">
                  <div className="rounded-lg border border-border bg-card/50 p-6">
                    <ul className="space-y-4 text-sm leading-6">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
                        <span>The assessment consists of <strong>40 questions</strong>. Ensure that you attempt and complete all questions.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
                        <span>This is a timed assessment with a total duration of <strong>7 minutes</strong>. The assessment is designed to be quick and can typically be completed within 2 minutes if done in one sitting.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
                        <span>If needed, click "Save and Sign Out" Button to save your progress and exit. You can resume later by signing in again.</span>

                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button className="w-full sm:w-auto" size="lg" onClick={handleStartSurvey}>
                    Start Survey
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {isLoggedIn && !showInstructions ? (
        <main className="mx-auto w-full max-w-[1200px] p-3 sm:p-4 md:p-6">
          {isCheckingCompletion ? (
            <section className="rounded-xl bg-card/78 p-6 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Checking your assessment status...
              </p>
            </section>
          ) : null}

          {!isCheckingCompletion && hasCompletedAssessment ? (
            <section className="rounded-xl border border-default bg-card/78 p-6 shadow-xs backdrop-blur-sm">
              <h2 className="text-xl font-semibold">You already finished the assessment.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This account has already submitted a response.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void handleSignOut()}>
                Log out
              </Button>
            </section>
          ) : null}

          {!isCheckingCompletion &&
            !hasCompletedAssessment &&
            isFinalMessageVisible ? (
            <section className="animate-in fade-in zoom-in-95 duration-500 rounded-xl border border-default bg-card/78 p-8 shadow-xs backdrop-blur-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {submitPhase === 'timed_out' ? 'Time is up' : 'Thank you'}
              </p>
              <h2 className="text-2xl font-semibold">
                {submitPhase === 'timed_out'
                  ? 'Time is up. Thank you for participating.'
                  : 'Thank you for participating in the survey.'}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {submitPhase === 'timed_out'
                  ? 'Your progress has been saved to the best of what you completed before the timer ended.'
                  : 'Your responses have been saved successfully.'}
              </p>
              <Button className="mt-6" variant="default" onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </section>
          ) : null}

          {!isCheckingCompletion &&
            !hasCompletedAssessment &&
            !isFinalMessageVisible ? (
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

                {submitPhase === 'error' ? (
                  <div className="w-full rounded-md border border-destructive/50 bg-card/82 p-6 backdrop-blur-sm">
                    <p className="font-medium text-destructive">
                      We could not save your responses.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Check your connection and try again.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setSubmitPhase('submitting')
                        void (async () => {
                          const ok = await saveResultsToDatabase(buildResultPayload())
                          if (ok) {
                            setSubmitPhase(getCompletionSubmitPhase(isCompleted))
                            autoSubmitStartedRef.current = true
                          } else {
                            setSubmitPhase('error')
                          }
                        })()
                      }}
                    >
                      Try again
                    </Button>
                  </div>
                ) : submitPhase === 'submitting' ? (
                  <div className="w-full rounded-md border border-default bg-card/82 p-8 text-center backdrop-blur-sm">
                    <p className="text-base font-medium">
                      {isTimeUp && !isCompleted
                        ? 'Time is up. Saving your responses…'
                        : 'Saving your responses…'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please wait a moment.
                    </p>
                  </div>
                ) : (
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

                    <div className="mt-4 flex justify-stretch sm:justify-end">
                      <Button className="w-full sm:w-auto" onClick={nextQuestion} disabled={!canGoNext}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
      ) : null}
    </div>
  )
}
