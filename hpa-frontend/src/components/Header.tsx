import { Button } from '#/components/ui/button'
import { logoutMicrosoft } from '#/lib/msal-auth'
import { useAssessmentStore } from '#/store/assessment-store'

export default function Header() {
  const { isLoggedIn, signOut, resetAssessment } = useAssessmentStore()

  const handleSignOut = async () => {
    try {
      await logoutMicrosoft()
    } catch (error) {
      console.error('[Auth] Microsoft logout failed:', error)
    } finally {
      resetAssessment()
      signOut()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-4">
      <nav className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-sm font-semibold no-underline">
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          Sobha Ascend
        </a>
        {isLoggedIn ? (
          <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        ) : null}
      </nav>
    </header>
  )
}
