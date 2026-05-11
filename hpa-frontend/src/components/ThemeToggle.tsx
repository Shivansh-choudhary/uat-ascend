import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'

type Theme = 'dark' | 'light'

function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const syncTheme = () => setTheme(getCurrentTheme())
    syncTheme()
    window.addEventListener('theme-change', syncTheme)
    return () => window.removeEventListener('theme-change', syncTheme)
  }, [])

  const toggleTheme = () => {
    const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(next)
    document.documentElement.style.colorScheme = next
    window.localStorage.setItem('theme', next)
    window.dispatchEvent(new Event('theme-change'))
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggleTheme}>
      {theme === 'dark' ? (
        <>
          <Sun className="size-4" />
          Light
        </>
      ) : (
        <>
          <Moon className="size-4" />
          Dark
        </>
      )}
    </Button>
  )
}
