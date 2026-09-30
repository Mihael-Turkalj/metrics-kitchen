// The chef's challenges: word problems from ad work, solved in the kitchen.
// Each one is cooked with the same rule as the metrics: what is in the pot, divided by what goes through
// the strainer, times everything in the seasoning bowl. Rates such as "2% of people buy" are seasonings:
// jars of spice that multiply. Amounts are stored as plain numbers, rates as fractions (0.6% is 0.006).

/** What a given number is. Its kind picks its art and how it is written. */
export type Kind = 'money' | 'impressions' | 'clicks' | 'purchases' | 'value' | 'price' | 'ctr' | 'cr' | 'margin'

export type Given = { id: string; kind: Kind; value: number; name: string }

export type Challenge = {
  id: string
  question: string
  given: Given[]
  /** The chef's placement: one amount in the pot, what divides, and what multiplies (x100 and x1000 are the lemon and the apple). */
  pot: string
  strainer?: string
  seasoning: string[]
  unit: 'percent' | 'count' | 'currency'
  /** The answer as a sentence; {v} is the result. */
  answer: string
  explain: string
  metric: string
}

export const challenges: Challenge[] = [
  {
    id: 'q1',
    question: 'An ad was shown 1,500,000 times and clicked 7,500 times. What percentage of people clicked?',
    given: [
      { id: 'impressions', kind: 'impressions', value: 1_500_000, name: 'Impressions' },
      { id: 'clicks', kind: 'clicks', value: 7_500, name: 'Clicks' },
    ],
    pot: 'clicks',
    strainer: 'impressions',
    seasoning: ['x100'],
    unit: 'percent',
    answer: '{v} of people clicked',
    explain: 'Clicks ÷ impressions is the share of people who clicked: 7,500 ÷ 1,500,000 = 0.005. The lemon (×100) turns that into a percentage: 0.5%.',
    metric: 'In ad terms: CTR, the click-through rate.',
  },
  {
    id: 'q2',
    question: '6,300 people clicked the ad and 160 of them bought. What percentage bought?',
    given: [
      { id: 'clicks', kind: 'clicks', value: 6_300, name: 'Clicks' },
      { id: 'purchases', kind: 'purchases', value: 160, name: 'Purchases' },
    ],
    pot: 'purchases',
    strainer: 'clicks',
    seasoning: ['x100'],
    unit: 'percent',
    answer: '{v} of the people who clicked bought',
    explain: 'Purchases ÷ clicks is the share of clickers who bought: 160 ÷ 6,300 ≈ 0.0254. ×100 makes it 2.54%.',
    metric: 'In ad terms: the conversion rate.',
  },
  {
    id: 'q3',
    question: 'You have €5,500 for ads and one click costs €0.40. How many clicks can you buy?',
    given: [
      { id: 'budget', kind: 'money', value: 5_500, name: 'Budget' },
      { id: 'cpc', kind: 'price', value: 0.4, name: 'Price of a click' },
    ],
    pot: 'budget',
    strainer: 'cpc',
    seasoning: [],
    unit: 'count',
    answer: '{v} clicks',
    explain: 'Budget ÷ the price of one click: €5,500 ÷ €0.40 = 13,750 clicks. No seasoning: the answer is a count, not a percentage.',
    metric: 'It is CPC turned round: budget ÷ cost per click.',
  },
  {
    id: 'q4',
    question: 'Of every 1,000 people who see the ad, 0.6% click, and each click costs €0.50. How much do 1,000 impressions cost?',
    given: [
      { id: 'ctr', kind: 'ctr', value: 0.006, name: 'Share who click' },
      { id: 'cpc', kind: 'price', value: 0.5, name: 'Price of a click' },
    ],
    pot: 'cpc',
    seasoning: ['ctr', 'x1000'],
    unit: 'currency',
    answer: '1,000 impressions cost {v}',
    explain: 'Of 1,000 viewers, 0.6% click: 1,000 × 0.006 = 6 clicks. Each costs €0.50, so 6 × €0.50 = €3.00.',
    metric: 'In ad terms: CPM, the cost of 1,000 impressions (CTR × CPC × 1,000).',
  },
  {
    id: 'q5',
    question: 'A click costs €0.40, 2% of the people who click buy, and the average purchase is €260. How many euros do you get back for every euro you spend?',
    given: [
      { id: 'cpc', kind: 'price', value: 0.4, name: 'Price of a click' },
      { id: 'cr', kind: 'cr', value: 0.02, name: 'Share who buy' },
      { id: 'aov', kind: 'value', value: 260, name: 'Average purchase' },
    ],
    pot: 'aov',
    strainer: 'cpc',
    seasoning: ['cr'],
    unit: 'currency',
    answer: '{v} back for every €1',
    explain: 'A click brings in 2% of a €260 purchase: 0.02 × €260 = €5.20. It costs €0.40, so €5.20 ÷ €0.40 = 13. Every €1 spent brings back €13.',
    metric: 'In ad terms: ROAS, the return on ad spend (here 13).',
  },
  {
    id: 'q6',
    question: 'You earn 15% on a €290 purchase, and 0.7% of the people who click buy. What is the most you can pay for one click without losing money?',
    given: [
      { id: 'value', kind: 'value', value: 290, name: 'Purchase amount' },
      { id: 'margin', kind: 'margin', value: 0.15, name: 'Your margin' },
      { id: 'cr', kind: 'cr', value: 0.007, name: 'Share who buy' },
    ],
    pot: 'value',
    seasoning: ['margin', 'cr'],
    unit: 'currency',
    answer: 'At most {v} a click',
    explain: 'A purchase earns you 15% of €290 = €43.50. Only 0.7% of clicks buy, so one click is worth €43.50 × 0.007 = €0.3045. Pay more than about €0.30 a click and you lose money.',
    metric: 'In ad terms: the break-even CPC (purchase × margin × conversion rate).',
  },
]

export const challengeById = (id: string) => challenges.find((c) => c.id === id)
