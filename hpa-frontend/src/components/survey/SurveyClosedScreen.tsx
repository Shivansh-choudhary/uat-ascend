import { Button } from '#/components/ui/button'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

type ClosedVariant = 'completed' | 'timed_out' | 'session_end'

const closedCopy: Record<
  ClosedVariant,
  { title: string; description: string; buttonLabel: string }
> = {
  completed: {
    title: 'Assessment already submitted.',
    description:
      'You have already completed the assessment. Your responses are on record.',
    buttonLabel: 'Log out',
  },
  timed_out: {
    title: 'Assessment time has ended.',
    description:
      'The time limit was reached before all questions were answered. Your partial responses are on record.',
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
            : `Thank you for taking the time to complete the HiPo assessment.`}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {submitPhase === 'timed_out'
            ? 'Your progress has been saved to the best of what you completed before the timer ended.'
            : `We truly appreciate your effort and participation.
Our People Development team will review the outcomes and will get in touch with you regarding the next steps.
Once again, thank you for your time and commitment.`}
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
