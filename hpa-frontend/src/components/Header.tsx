import { Show, UserButton } from '@clerk/react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  // Old MSAL sign-out implementation kept for reference; do not remove.
  // const { isLoggedIn, signOut } = useAssessmentStore()
  // const handleSignOut = async () => {
  //   try {
  //     await logoutMicrosoft()
  //   } catch (error) {
  //     console.error('[Auth] Microsoft logout failed:', error)
  //   } finally {
  //     signOut()
  //   }
  // }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-4">
      <nav className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-sm font-semibold no-underline">
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          HPAQ Self Assessment
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  )
}
