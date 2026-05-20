import { surveyBackgroundStyle } from '#/lib/survey-constants'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'
import { InstructionsScreen } from '#/components/survey/InstructionsScreen'
import { LoginScreen } from '#/components/survey/LoginScreen'
import { ProfileScreen } from '#/components/survey/ProfileScreen'
import { SurveyMainScreen } from '#/components/survey/SurveyMainScreen'

export function SurveyFlowShell() {
  const { isLoggedIn, showProfileForm, showInstructions } = useSurveyFlow()

  return (
    <div className="min-h-[calc(100vh-72px)]" style={surveyBackgroundStyle}>
      {!isLoggedIn && !showProfileForm ? <LoginScreen /> : null}
      {!isLoggedIn && showProfileForm ? <ProfileScreen /> : null}
      {isLoggedIn && showInstructions ? <InstructionsScreen /> : null}
      {isLoggedIn && !showInstructions ? <SurveyMainScreen /> : null}
    </div>
  )
}
