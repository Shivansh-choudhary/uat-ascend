import { createFileRoute } from '@tanstack/react-router'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  answerOptions,
  categories,
  getLetterGradeFromAverage,
  questions,
  scoreLevels,
} from '#/lib/assessment'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  createEmptyUserData,
  type UserData,
  useAssessmentStore,
} from '#/store/assessment-store'
import {
  getActiveMicrosoftAccount,
  isMsalConfigured,
  logoutMicrosoft,
  toUserData,
} from '#/lib/msal-auth'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Progress } from '#/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { Separator } from '#/components/ui/separator'

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

const ENTITY_OPTIONS = [
  'Beauty',
  'Construction',
  'PMC',
  'Sobha Community Management',
  'LFM',
  'Sobha Concrete',
  'Lanfam Landscaping',
  'Advanced Manufacturing',
  'Sobha Modular & Facade',
  'Sobha Energy Solutions',
  'Sobha Realty Abu Dhabi',
  'Al Siniya',
  'Furniture',
  'Stay By Latinem',
  'Other',
] as const

type ProfileErrors = Partial<Record<keyof UserData, string>>

const pageBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(248, 245, 235, 0.88), rgba(248, 245, 235, 0.92)), url('/talent_background.PNG')",
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
}

function normalizeUserData(value: UserData): UserData {
  return {
    employeeCode: value.employeeCode.trim(),
    name: value.name.trim(),
    email: value.email.trim().toLowerCase(),
    Department: value.Department.trim(),
    Designation: value.Designation.trim(),
    entity: value.entity.trim(),
  }
}

function validateUserData(value: UserData): ProfileErrors {
  const normalized = normalizeUserData(value)
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

  return errors
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
  const [profileForm, setProfileForm] = useState<UserData>(() => createEmptyUserData())
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [remainingMinutes, setRemainingMinutes] = useState(7)
  const [timerRunId, setTimerRunId] = useState(0)
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(false)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)
  /** This session only — after a successful POST from completing all questions */
  const [submitPhase, setSubmitPhase] = useState<
    'idle' | 'submitting' | 'thanks' | 'error'
  >('idle')
  const autoSubmitStartedRef = useRef(false)
  const answeredCount = answersArray.reduce(
    (count, answer) => (answer === undefined ? count : count + 1),
    0,
  )
  const completionPercent = Math.round((answeredCount / questions.length) * 100)
  const isCompleted = answeredCount === questions.length
  const currentPageStart = Math.floor((currentQuestionId - 1) / 5) * 5
  const visibleQuestions = questions.slice(currentPageStart, currentPageStart + 5)
  const isTimeUp = remainingMinutes <= 0
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
    setProfileErrors((current) => ({ ...current, [field]: undefined }))
  }

  const resetProfileForm = () => {
    setProfileForm(createEmptyUserData())
    setProfileErrors({})
  }

  const handleLogin = () => {
    resetProfileForm()
    setShowProfileForm(true)
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validateUserData(profileForm)
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    signIn(normalizeUserData(profileForm))
    resetAssessment()
    setRemainingMinutes(7)
    setTimerRunId((v) => v + 1)
    setSubmitPhase('idle')
    autoSubmitStartedRef.current = false
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
    const deadline = Date.now() + 7 * 60 * 1000
    const timerId = window.setInterval(() => {
      const diff = Math.max(deadline - Date.now(), 0)
      setRemainingMinutes(Math.ceil(diff / 60000))
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [timerRunId])

  useEffect(() => {
    if (!isLoggedIn || !userData.email) {
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
    if (isCheckingCompletion || hasCompletedAssessment) {
      return
    }
    if (!isCompleted) {
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
      })
      const ok = await saveResultsToDatabase(resultData)
      if (ok) {
        setSubmitPhase('thanks')
      } else {
        setSubmitPhase('error')
        autoSubmitStartedRef.current = false
      }
    }

    void run()
  }, [isCheckingCompletion, hasCompletedAssessment, isCompleted])

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
    <div className="min-h-[calc(100vh-72px)]" style={pageBackgroundStyle}>
      {!isLoggedIn && !showProfileForm ? (
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1400px] items-center px-6 py-10">
          <div className="max-w-xl rounded-3xl border border-white/50 bg-white/75 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              HPAQ Self Assessment
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Welcome to the High Potential Assessment Questionnaire
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Start with the sign-in button, then complete your employee details to move
              into the survey.
            </p>
            <Button className="mt-8 w-full sm:w-auto" size="lg" onClick={handleLogin}>
              Sign in to get started
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoggedIn && showProfileForm ? (
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1400px] items-center px-6 py-10">
          <section className="w-full max-w-3xl rounded-3xl border border-white/50 bg-white/85 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Employee Details
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              High Potential Assessment Questionnaire
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Fill in all mandatory details before you move to the survey.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleProfileSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeCode">Employee Code *</Label>
                  <Input
                    id="employeeCode"
                    value={profileForm.employeeCode}
                    onChange={(event) => updateProfileField('employeeCode', event.target.value)}
                    aria-invalid={Boolean(profileErrors.employeeCode)}
                    placeholder="Enter employee code"
                  />
                  {profileErrors.employeeCode ? (
                    <p className="text-sm text-destructive">{profileErrors.employeeCode}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => updateProfileField('email', event.target.value)}
                    aria-invalid={Boolean(profileErrors.email)}
                    placeholder="Enter email address"
                  />
                  {profileErrors.email ? (
                    <p className="text-sm text-destructive">{profileErrors.email}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Employee Name *</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(event) => updateProfileField('name', event.target.value)}
                    aria-invalid={Boolean(profileErrors.name)}
                    placeholder="Enter employee name"
                  />
                  {profileErrors.name ? (
                    <p className="text-sm text-destructive">{profileErrors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={profileForm.Designation}
                    onChange={(event) => updateProfileField('Designation', event.target.value)}
                    aria-invalid={Boolean(profileErrors.Designation)}
                    placeholder="Enter designation"
                  />
                  {profileErrors.Designation ? (
                    <p className="text-sm text-destructive">{profileErrors.Designation}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={profileForm.Department}
                    onChange={(event) => updateProfileField('Department', event.target.value)}
                    aria-invalid={Boolean(profileErrors.Department)}
                    placeholder="Enter department"
                  />
                  {profileErrors.Department ? (
                    <p className="text-sm text-destructive">{profileErrors.Department}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity">Entity *</Label>
                  <Select
                    value={profileForm.entity}
                    onValueChange={(value) => updateProfileField('entity', value)}
                  >
                    <SelectTrigger
                      id="entity"
                      className="w-full bg-background/80"
                      aria-invalid={Boolean(profileErrors.entity)}
                    >
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profileErrors.entity ? (
                    <p className="text-sm text-destructive">{profileErrors.entity}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetProfileForm()
                    setShowProfileForm(false)
                  }}
                >
                  Back
                </Button>
                <Button type="submit">Next</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isLoggedIn ? (
        <main className="mx-auto w-full max-w-[1200px] p-4">
          {isCheckingCompletion ? (
            <section className="rounded-xl bg-card/90 p-6 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Checking your assessment status...
              </p>
            </section>
          ) : null}

          {!isCheckingCompletion && hasCompletedAssessment ? (
            <section className="rounded-xl border border-default bg-card/90 p-6 shadow-xs backdrop-blur-sm">
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
          submitPhase === 'thanks' ? (
            <section className="rounded-xl border border-default bg-card/90 p-8 shadow-xs backdrop-blur-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Thank you
              </p>
              <h2 className="text-2xl font-semibold">
                Thanks for completing the survey
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Your responses have been saved. You can sign out when you are ready.
              </p>
              <Button className="mt-6" variant="default" onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </section>
          ) : null}

          {!isCheckingCompletion &&
          !hasCompletedAssessment &&
          submitPhase !== 'thanks' ? (
            <>
          <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-white/65 p-4 backdrop-blur-sm">
            <div>
              <h1 className="text-2xl font-semibold">Hi, {userData.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">Designation: {userData.Designation}</Badge>
                <Badge variant="outline">Department: {userData.Department}</Badge>
              </div>
            </div>
            <p className="pt-1 text-lg font-semibold">Time left: {remainingMinutes} min</p>
          </div>

          <section className="w-full rounded-xl bg-card/90 p-4 backdrop-blur-sm">
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

            <div className="mb-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                disabled={isCompleted || submitPhase === 'submitting'}
                onClick={() => {
                  resetAssessment()
                  setRemainingMinutes(7)
                  setTimerRunId((v) => v + 1)
                  setSubmitPhase('idle')
                  autoSubmitStartedRef.current = false
                }}
              >
                Reset (Test)
              </Button>
            </div>

            {submitPhase === 'error' && isCompleted ? (
              <div className="w-full rounded-md border border-destructive/50 bg-card/95 p-6 backdrop-blur-sm">
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
                        setSubmitPhase('thanks')
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
            ) : isCompleted ? (
              <div className="w-full rounded-md border border-default bg-card/95 p-8 text-center backdrop-blur-sm">
                <p className="text-base font-medium">Saving your responses…</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please wait a moment.
                </p>
              </div>
            ) : (
              <div className="w-full rounded-md border border-default bg-card/95 p-3 shadow-xs backdrop-blur-sm">

                <div className="mt-3 space-y-5">
                  {visibleQuestions.map((question) => {
                    const currentAnswer = answersArray[question.id - 1]
                    return (
                        <div key={question.id}>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col max-w-[500px]">
                              <p className="text-base font-semibold text-muted-foreground">Question {question.id}</p>
                              <h2 className="m-0 text-base font-semibold">{question.prompt}</h2>
                            </div>
                            <div className="mt-2 flex h-24 flex-wrap gap-4">
                              {answerOptions.map((option) => {
                                const active = currentAnswer === option.value
                                return (
                                  <div key={`${question.id}-${option.value}`} className="relative h-20 w-20">
                                    <button
                                      onClick={() => setAnswerForQuestion(question.id, option.value)}
                                      disabled={isTimeUp}
                                      className={cn(
                                        'absolute top-0 left-0 h-20 w-20 rounded-lg border-2 px-1 text-center text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center',
                                        active
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5',
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <Separator />
                        </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={nextQuestion} disabled={!canGoNext}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {isTimeUp && !isCompleted ? (
              <p className="mt-4 text-sm font-semibold text-destructive">
                Time is up. Please answer all questions before your responses can be saved.
              </p>
            ) : null}
          </section>
            </>
          ) : null}
        </main>
      ) : null}
    </div>
  )
}
