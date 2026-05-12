export type AnswerWeight = 5 | 4 | 3 | 2 | 1

export type Question = {
  id: number
  title: string
  prompt: string
}

export const answerOptions: Array<{ label: string; value: AnswerWeight }> = [
  { label: 'Strongly Agree', value: 5 },
  { label: 'Agree', value: 4 },
  { label: 'Neutral', value: 3 },
  { label: 'Disagree', value: 2 },
  { label: 'Strongly Disagree', value: 1 },
]

export const questions: Question[] = [
  {
    id: 1,
    title: 'Question 1',
    prompt: 'I remain calm and composed when faced with stressful situations.',
  },
  {
    id: 2,
    title: 'Question 2',
    prompt: 'My colleagues would describe me as someone who delivers consistently.',
  },
  {
    id: 3,
    title: 'Question 3',
    prompt: 'When priorities suddenly change, I quickly realign my focus and actions.',
  },
  {
    id: 4,
    title: 'Question 4',
    prompt: 'In a situation where I lack complete information, I still make timely decisions.',
  },
  {
    id: 5,
    title: 'Question 5',
    prompt: 'I actively try to understand the emotions behind others reactions.',
  },
  {
    id: 6,
    title: 'Question 6',
    prompt: 'I identify potential risks before they become problems.',
  },
  {
    id: 7,
    title: 'Question 7',
    prompt: 'Others see me as approachable and easy to work with.',
  },
  {
    id: 8,
    title: 'Question 8',
    prompt: 'If a team member disagrees with me, I try to understand their perspective before responding.',
  },
  {
    id: 9,
    title: 'Question 9',
    prompt: 'I take ownership when things go wrong, rather than shifting blame.',
  },
  {
    id: 10,
    title: 'Question 10',
    prompt: 'I can clearly communicate a future direction that motivates others.',
  },
  {
    id: 11,
    title: 'Question 11',
    prompt: 'I feel uncomfortable dealing with ambiguity.',
  },
  {
    id: 12,
    title: 'Question 12',
    prompt: 'In high-pressure situations, I stay focused and composed.',
  },
  {
    id: 13,
    title: 'Question 13',
    prompt: 'My team would say I positively influence group decisions.',
  },
  {
    id: 14,
    title: 'Question 14',
    prompt: 'I balance speed and accuracy when making decisions.',
  },
  {
    id: 15,
    title: 'Question 15',
    prompt: 'When faced with a risky decision, I evaluate both upside and downside before acting.',
  },
  {
    id: 16,
    title: 'Question 16',
    prompt: 'I adapt my communication style depending on who I am interacting with.',
  },
  {
    id: 17,
    title: 'Question 17',
    prompt: 'I tend to delay decisions until I have all the information.',
  },
  {
    id: 18,
    title: 'Question 18',
    prompt: 'When I receive critical feedback, I reflect and act on it constructively.',
  },
  {
    id: 19,
    title: 'Question 19',
    prompt: 'Others trust me with high-responsibility tasks.',
  },
  {
    id: 20,
    title: 'Question 20',
    prompt: 'I think beyond immediate tasks and consider long-term impact.',
  },
  {
    id: 21,
    title: 'Question 21',
    prompt: 'I sometimes struggle to inspire others toward a shared goal.',
  },
  {
    id: 22,
    title: 'Question 22',
    prompt: 'In a conflict situation, I focus on resolving the issue rather than winning the argument.',
  },
  {
    id: 23,
    title: 'Question 23',
    prompt: 'I proactively build relationships across teams.',
  },
  {
    id: 24,
    title: 'Question 24',
    prompt: 'I occasionally leave tasks unfinished when priorities shift.',
  },
  {
    id: 25,
    title: 'Question 25',
    prompt: 'I stay aware of how my actions affect others emotionally.',
  },
  {
    id: 26,
    title: 'Question 26',
    prompt: 'My stakeholders would describe me as dependable under pressure.',
  },
  {
    id: 27,
    title: 'Question 27',
    prompt: 'I take calculated risks rather than avoiding them completely.',
  },
  {
    id: 28,
    title: 'Question 28',
    prompt: 'When working in uncertainty, I remain effective and productive.',
  },
  {
    id: 29,
    title: 'Question 29',
    prompt: 'I hesitate to take decisions in uncertain situations.',
  },
  {
    id: 30,
    title: 'Question 30',
    prompt: 'I create an environment where others feel safe to express ideas.',
  },
  {
    id: 31,
    title: 'Question 31',
    prompt: 'When a project fails, I focus on learning rather than blaming.',
  },
  {
    id: 32,
    title: 'Question 32',
    prompt: 'Others see me as someone who drives results without compromising relationships.',
  },
  {
    id: 33,
    title: 'Question 33',
    prompt: 'I align my work with the broader organizational vision.',
  },
  {
    id: 34,
    title: 'Question 34',
    prompt: 'I sometimes react emotionally before fully understanding a situation.',
  },
  {
    id: 35,
    title: 'Question 35',
    prompt: 'I can handle multiple competing priorities effectively.',
  },
  {
    id: 36,
    title: 'Question 36',
    prompt: 'When making decisions, I involve the right stakeholders without slowing progress.',
  },
  {
    id: 37,
    title: 'Question 37',
    prompt: 'I anticipate risks and prepare mitigation plans in advance.',
  },
  {
    id: 38,
    title: 'Question 38',
    prompt: 'My team would say I listen actively and attentively.',
  },
  {
    id: 39,
    title: 'Question 39',
    prompt: 'I maintain consistency in my performance even under pressure.',
  },
  {
    id: 40,
    title: 'Question 40',
    prompt: 'I encourage others to contribute ideas and perspectives.',
  },
]

type Category = {
  id: number
  title: string
  questions: number[]
  weight: number
}

export const categories: Category[] = [
  {
    id: 1,
    title: 'EI',
    questions: [1, 5, 25, 34],
    weight: 0.8,
  },
  {
    id: 2,
    title: 'Reliability',
    questions: [2, 9, 19, 24, 26, 39],
    weight: 0.5,
  },
  {
    id: 3,
    title: 'Agility',
    questions: [3, 11, 28, 35],
    weight: 0.7,
  },
  {
    id: 4,
    title: 'People connect',
    questions: [7, 13, 23, 32, 40],
    weight: 0.8,
  },
  {
    id: 5,
    title: 'Risk Taking',
    questions: [6, 15, 27, 37],
    weight: 0.5,
  },
  {
    id: 6,
    title: 'Vision Setting',
    questions: [10, 20, 21, 33],
    weight: 0.6,
  },
  {
    id: 7,
    title: 'Decision Making',
    questions: [4, 14, 17, 29, 36],
    weight: 0.7,
  },
  {
    id: 8,
    title: 'EI & other competencies',
    questions: [8, 12, 16, 18, 22, 30, 31, 38],
    weight: 0.4,
  },
]


export const scoreLevels = [
  {
    min: 1.0,
    max: 2.0,
    level: 'Low',
    descriptor: 'Derailing Risk',
  },
  {
    min: 2.1,
    max: 3.6,
    level: 'Moderate',
    descriptor: 'Developing',
  },
  {
    min: 3.7,
    max: 4.2,
    level: 'Optimal',
    descriptor: 'Leadership-Ready',
  },
  {
    min: 4.3,
    max: 5.0,
    level: 'Excessive',
    descriptor: 'Potential Overuse',
  },
]

export const LetterGrades = [
  {
    grade: 'A+',
    min: 4.2,
    max: 5.0,
  },
  {
    grade: 'A',
    min: 3.6,
    max: 4.1,
  },
  {
    grade: 'B',
    min: 0,
    max: 3.5,
  },
]

/**
 * Maps overall weighted average (typically 1–5) to a letter grade.
 * Uses tier thresholds so every value maps to a grade (no gaps — the old
 * min/max array lookup missed values like 3.55 or 4.15).
 */
export function getLetterGradeFromAverage(overallWeightedAverage: number): string {
  const score = Math.min(5, Math.max(0, overallWeightedAverage))
  if (score >= 4.2) {
    return 'A+'
  }
  if (score >= 3.6) {
    return 'A'
  }
  return 'B'
}