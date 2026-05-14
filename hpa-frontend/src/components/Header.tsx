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
        <a href="/" className="flex items-center gap-2  font-semibold no-underline">
          <img src="/logo-sobha.png" alt="Sobha Ascend Logo" className="h-10 w-10 object-contain" />
          <span className=" text-difference text-2xl font-semibold">Sobha Ascend</span>
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
