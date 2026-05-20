import { Button } from '#/components/ui/button'
import { AuthHeroPanel } from '#/components/AuthHeroPanel'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

export function LoginScreen() {
  const {
    authError,
    isAuthRedirecting,
    isHandlingMsalRedirect,
    isRestoringSession,
    handleLogin,
  } = useSurveyFlow()

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white lg:grid lg:grid-cols-[1.15fr_0.85fr]">
      <div className="contents lg:contents">
        <AuthHeroPanel title="Welcome to the High Potential Assessment Questionnaire" />

        <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <img
              src="/logo-sobha.png"
              alt="Sobha Ascend Logo"
              className="mb-4  mx-auto h-20 w-20 object-contain"
            />
            <div className="text-center">
              <p className="text-2xl font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                Sobha Ascend
              </p>
            </div>

            {authError ? (
              <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {authError}
              </p>
            ) : null}

            <Button
              className="mt-8 w-full flex items-center justify-center gap-3"
              size="lg"
              disabled={isAuthRedirecting || isHandlingMsalRedirect || isRestoringSession}
              onClick={() => void handleLogin()}
            >
              <img
                src="/microsoft.png"
                alt="Microsoft Logo"
                className="h-5 w-5 object-contain"
              />
              {isHandlingMsalRedirect || isRestoringSession
                ? 'Completing sign in…'
                : isAuthRedirecting
                  ? 'Redirecting to Microsoft…'
                  : 'Sign in with Microsoft Single Sign-On'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
