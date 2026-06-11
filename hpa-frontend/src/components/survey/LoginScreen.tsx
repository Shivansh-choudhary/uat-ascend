import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { AuthHeroPanel } from '#/components/AuthHeroPanel'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

export function LoginScreen() {
  const {
    authError,
    isAuthRedirecting,
    isHandlingMsalRedirect,
    isRestoringSession,
    isPasswordLoginEnabled,
    isPasswordLoggingIn,
    handleLogin,
    handlePasswordLogin,
  } = useSurveyFlow()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isBusy =
    isAuthRedirecting || isHandlingMsalRedirect || isRestoringSession || isPasswordLoggingIn

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

            {isPasswordLoginEnabled ? (
              <form
                className="mt-8 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handlePasswordLogin(email, password)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled={isBusy}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    disabled={isBusy}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={isBusy}>
                  {isPasswordLoggingIn ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            ) : null}

            {isPasswordLoginEnabled ? (
              <Button
                className="mt-4 w-full flex items-center justify-center gap-3"
                size="lg"
                variant="outline"
                disabled
              >
                <img
                  src="/microsoft.png"
                  alt="Microsoft Logo"
                  className="h-5 w-5 object-contain"
                />
                Sign in with Microsoft Single Sign-On
              </Button>
            ) : (
              <Button
                className="mt-8 w-full flex items-center justify-center gap-3"
                size="lg"
                disabled={isBusy}
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
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
