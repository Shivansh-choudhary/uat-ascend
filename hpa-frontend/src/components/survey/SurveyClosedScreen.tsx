import { Button } from '#/components/ui/button'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

type ClosedVariant = 'completed' | 'timed_out' | 'session_end'

const closedCopy: Record<
  ClosedVariant,
  { title: string; description: string; buttonLabel: string }
> = {
  completed: {
    title: 'You already finished the assessment.',
    description:
      'You completed all questions before time ran out. This account cannot take the survey again.',
    buttonLabel: 'Log out',
  },
  timed_out: {
    title: 'Your assessment time has ended.',
    description:
      'The timer ran out before you finished all questions. Your partial responses were saved, but you cannot continue this attempt.',
    buttonLabel: 'Log out',
  },
  session_end: {
    title: '',
    description: '',
    buttonLabel: 'Sign out',
  },
}

export function SurveyClosedScreen({ variant }: { variant: ClosedVariant }) {
  const { submitPhase, handleSignOut } = useSurveyFlow()

  if (variant === 'session_end') {
    return (
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
    )
  }

  const copy = closedCopy[variant]

  return (
    <section className="rounded-xl border border-default bg-card/78 p-6 shadow-xs backdrop-blur-sm">
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
      <Button className="mt-4" variant="outline" onClick={() => void handleSignOut()}>
        {copy.buttonLabel}
      </Button>
    </section>
  )
}
