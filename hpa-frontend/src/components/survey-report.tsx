import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { CategoryResult as CategoryResultType } from '#/lib/survey-types'
// import Table from shadcn/ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from './ui/button'

interface SurveyReportCardProps {
  name: string
  completedAt?: string
  categoryResults: CategoryResultType
}

function gradeColor(grade: string) {
  const g = grade.toUpperCase()
  if (['A+', 'A', 'A-'].includes(g)) return 'text-[oklch(0.62_0.15_155)]'
  if (['B+', 'B', 'B-'].includes(g)) return 'text-[oklch(0.55_0.17_210)]'
  if (['C+', 'C', 'C-'].includes(g)) return 'text-[oklch(0.75_0.18_75)]'
  return 'text-[oklch(0.62_0.22_27)]'
}

function gradeBg(grade: string) {
  const g = grade.toUpperCase()
  if (['A+', 'A', 'A-'].includes(g)) return 'bg-[oklch(0.62_0.15_155/0.1)]'
  if (['B+', 'B', 'B-'].includes(g)) return 'bg-[oklch(0.55_0.17_210/0.1)]'
  if (['C+', 'C', 'C-'].includes(g)) return 'bg-[oklch(0.75_0.18_75/0.1)]'
  return 'bg-[oklch(0.62_0.22_27/0.1)]'
}

export function SurveyReportCard({
  name,
  completedAt = 'Today at 10:00 AM',
  categoryResults,
}: SurveyReportCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      {/* Header & Grade */}
      <div className=" flex items-start gap-4 justify-between">
        {/* Left side - Header info */}
        <div className="flex flex-col items-start gap-1 flex-1">
          {/* Badge */}
          <div className="w-8 h-8 rounded-2xl bg-[oklch(0.62_0.15_155/0.12)] flex items-center justify-center mb-1">
            <CheckCircle2
              className="w-6 h-6 text-[oklch(0.52_0.15_155)]"
              strokeWidth={2}
            />
          </div>

          <h2 className="text-xl font-bold text-foreground leading-snug font-sans text-left">
            {name}
          </h2>
          {completedAt && (
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              {completedAt}
            </p>
          )}
        </div>

        {/* Right side - Grade Badge */}
        <div
          className={cn(
            'w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0',
            gradeBg(categoryResults.letterGrade),
          )}
        >
          <span
            className={cn(
              'text-6xl font-bold leading-none select-none',
              gradeColor(categoryResults.letterGrade),
            )}
          >
            {categoryResults.letterGrade}
          </span>
        </div>
      </div>

      {/* Collapsible details */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}
        aria-hidden={!open}
      >
        {/* Column headers */}
        <div>
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[32%] text-xs font-semibold text-muted-foreground font-sans whitespace-normal break-words">
                  Category
                </TableHead>
                <TableHead className="w-[18%] text-right text-xs font-semibold text-muted-foreground font-sans whitespace-normal break-words">
                  Total Score
                </TableHead>
                <TableHead className="w-[18%] text-right text-xs font-semibold text-muted-foreground font-sans whitespace-normal break-words">
                  Average Score
                </TableHead>
                <TableHead className="w-[28%] text-right text-xs font-semibold text-muted-foreground font-sans whitespace-normal break-words">
                  Score Descriptor
                </TableHead>
                <TableHead className="w-[22%] text-right text-xs font-semibold text-muted-foreground font-sans whitespace-normal break-words">
                  Weighted Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryResults.categories.map((cat) => (
                <TableRow key={cat.categoryId}>
                  <TableCell className="text-sm font-medium text-foreground font-sans leading-snug whitespace-normal wrap-break-words">
                    {cat.title}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground font-sans whitespace-normal wrap-break-words">
                    {cat.totalScore}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground font-sans whitespace-normal wrap-break-words">
                    {cat.averageScore}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground font-sans whitespace-normal wrap-break-words">
                    {cat.scoreLevel}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground font-sans whitespace-normal wrap-break-words">
                    {cat.weightedScore}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* More Details Button */}
      <div className="py-3">
        <Button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>{open ? 'Hide Details' : 'More Details'}</span>
          {open ? (
            <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
          )}
        </Button>
      </div>
    </div>
  )
}
