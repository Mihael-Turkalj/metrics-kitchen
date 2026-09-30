import { challenges, type Challenge, type Kind } from './challenges'
import {
  art,
  complete,
  cook,
  fits,
  foods,
  formatQuantity,
  formatResult,
  ingredientName,
  isSpice,
  pantryFor,
  recipes,
  whySpoiled,
  type Campaign,
  type Placed,
  type Recipe,
  type Zone,
} from './kitchen'

/** Whatever is on the stove: a metric recipe or a word problem. The kitchen only talks to this. */
export type Dish = {
  kind: 'recipe' | 'challenge'
  key: string
  pantry: string[]
  values: Record<string, number>
  name: (id: string) => string
  food: (id: string) => string
  art: (id: string) => string
  color: (id: string) => string
  /** Spices and rates get the seasoning card. */
  seasoning: (id: string) => boolean
  quantity: (id: string) => string
  fits: (placed: Placed, id: string, zone: Zone) => boolean
  why: (placed: Placed, id: string, zone: Zone) => string
  complete: (placed: Placed) => boolean
  hint: (placed: Placed) => { id: string; zone: Zone } | null
  cook: (placed: Placed) => number
  result: (v: number) => string
  ticket: { meta: string; side: string; title: string; subtitle: string; question?: string }
  served: (placed: Placed, v: number) => { kicker: string; title: string; formula: string; definition: string; note?: string; source?: string }
  where: string
  /** the label on the served card's first button */
  next: string
}

/* ---------- the words on the page ---------- */

export const ui = {
  book: '← Recipe book',
  bookButton: 'Recipe book',
  pantry: 'Pantry',
  drag: 'Drag a food onto the stove, or click it and then click where it goes.',
  tap: 'Tap a food, then tap where it goes: pot, strainer or seasoning.',
  pick: (name: string) => `Now pick where ${name} goes, or press Esc.`,
  ask: 'Ask the chef',
  chef: 'Chef:',
  dump: 'Dump the pot & try again',
  pot: 'Pot',
  strainer: '÷ Strainer',
  seasoning: '× Seasoning',
  empty: 'empty',
  none: 'none',
  spoiled: 'Spoiled',
  cooked: 'Cooked',
  best: (n: number) => `Best: ${n} of 3 stars`,
  earned: (n: number) => `${n} of 3 stars`,
  zones: {
    strainer: { name: 'Strainer', what: 'divide by' },
    pot: { name: 'Pot', what: 'top of the formula', short: 'sum on top' },
    spices: { name: 'Seasoning', what: 'multiply by' },
  },
  putIn: (name: string, what: string) => `Put it in ${name.toLowerCase()} (${what})`,
  hint: (name: string, food: string, zone: Zone) =>
    `Put “${name}” (the ${food.toLowerCase()}) ${zone === 'pot' ? 'into the pot' : zone === 'strainer' ? 'through the strainer' : 'into the seasoning bowl'}.`,
}

export type UI = typeof ui

/* ---------- a metric recipe, as the kitchen sees it ---------- */

export function recipeDish(recipe: Recipe, campaign: Campaign, order: number): Dish {
  const same = recipes.filter((r) => r.platform === recipe.platform)
  return {
    kind: 'recipe',
    key: recipe.id,
    pantry: pantryFor(recipe),
    values: campaign,
    name: ingredientName,
    food: (id) => foods[id]?.food ?? ingredientName(id),
    art,
    color: (id) => foods[id]?.color ?? '#e0a050',
    seasoning: isSpice,
    quantity: (id) => formatQuantity(id, campaign[id]),
    fits: (placed, id, zone) => fits(recipe, placed, id, zone),
    why: (placed, id, zone) => whySpoiled(recipe, placed, id, zone),
    complete: (placed) => complete(recipe, placed),
    hint: (placed) => {
      for (const zone of ['pot', 'strainer', 'spices'] as Zone[]) {
        const have = [...placed[zone]]
        for (const id of recipe[zone]) {
          const i = have.indexOf(id)
          if (i < 0) return { id, zone }
          have.splice(i, 1)
        }
      }
      return null
    },
    cook: (placed) => cook(placed, campaign),
    result: (v) => formatResult(recipe.unit, v),
    ticket: {
      meta: `Order #${String(order).padStart(4, '0')}`,
      side: recipe.platform === 'meta' ? 'Meta Ads' : 'Google Ads',
      title: recipe.abbr,
      subtitle: recipe.name,
    },
    served: (_, v) => ({
      kicker: 'Cooked!',
      title: `${recipe.abbr} = ${formatResult(recipe.unit, v)}`,
      formula: recipe.formula,
      definition: recipe.definition,
      note: recipe.note,
      source: recipe.source,
    }),
    where: `${recipe.platform === 'meta' ? 'Meta Ads' : 'Google Ads'} kitchen · recipe ${same.indexOf(recipe) + 1} of ${same.length}`,
    next: 'Next recipe',
  }
}

/* ---------- a word problem, as the kitchen sees it ---------- */

// whole euros as the questions write them (€5,500), anything else to the cent (or finer, for an exact result)
const money = (v: number, digits = 2, whole = false) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: whole && Number.isInteger(v) ? 0 : 2, maximumFractionDigits: digits }).format(v)
const count = (v: number, digits = 0) => new Intl.NumberFormat('en-IE', { maximumFractionDigits: digits }).format(v)
const percent = (fraction: number) => new Intl.NumberFormat('en-IE', { style: 'percent', maximumFractionDigits: 2 }).format(fraction)

// Each kind of number has one food (or jar) everywhere in the challenges.
const LOOK: Record<Kind, { art: string; color: string; food: string }> = {
  money: { art: 'cost.webp', color: '#e8762b', food: 'Carrot' },
  impressions: { art: 'impressions.webp', color: '#c98a4a', food: 'Onion' },
  clicks: { art: 'clicks.webp', color: '#e0472b', food: 'Tomato' },
  purchases: { art: 'purchases.webp', color: '#7a4f86', food: 'Eggplant' },
  value: { art: 'purchase_value.webp', color: '#f2c94c', food: 'Cheese' },
  price: { art: 'coin.svg', color: '#d9a441', food: 'Coin' },
  ctr: { art: 'jar-paprika.svg', color: '#c8462c', food: 'Paprika' },
  cr: { art: 'jar-turmeric.svg', color: '#e0a526', food: 'Turmeric' },
  margin: { art: 'jar-herbs.svg', color: '#6f8f3a', food: 'Herbs' },
}

const SPICES: Record<string, { name: string; food: string; value: number }> = {
  x100: { name: '×100 (percent)', food: 'Lemon', value: 100 },
  x1000: { name: '×1000', food: 'Apple', value: 1000 },
}

// what the chef says when a word problem goes wrong
const say = {
  noApple: 'Nothing here is per thousand, so no apple (×1000).',
  noLemon: "The answer isn't a percentage, so no lemon (×100).",
  twice: (name: string) => `“${name}” is already in the dish. Putting it in twice counts it twice.`,
  noDivide: (name: string) => `Nothing gets divided in this one: “${name}” multiplies, so it goes on top.`,
  strainerFull: 'Only one thing goes through the strainer here.',
  onTop: (name: string) => `“${name}” doesn't divide: it goes on top, in the pot or the seasoning bowl.`,
  divideBy: (name: string) => `“${name}” is what you divide by: put it through the strainer.`,
  spiceInPot: 'Apples and lemons are seasoning: they go in the bowl.',
  potFull: (name: string) => `The pot already holds “${name}”. Two things in the pot add up, and nothing here needs adding: multiply with the seasoning bowl instead.`,
  keepForPot: 'Keep one amount for the pot: every dish starts in the pot.',
}

const isSpiceId = (id: string) => id in SPICES

/** What is left of `from` once `taken` is removed, counting repeats. */
function without(from: string[], taken: string[]) {
  const left = [...from]
  for (const id of taken) {
    const i = left.indexOf(id)
    if (i >= 0) left.splice(i, 1)
  }
  return left
}

const sameItems = (a: string[], b: string[]) => a.length === b.length && without(a, b).length === 0

export function challengeDish(ch: Challenge): Dish {
  const top = [ch.pot, ...ch.seasoning]
  const bottom = ch.strainer ? [ch.strainer] : []
  const given = (id: string) => ch.given.find((g) => g.id === id)
  const values: Record<string, number> = { x100: 100, x1000: 1000 }
  for (const g of ch.given) values[g.id] = g.value
  const n = challenges.indexOf(ch) + 1

  const name = (id: string) => given(id)?.name ?? SPICES[id]?.name ?? id
  const quantity = (id: string) => {
    if (isSpiceId(id)) return `×${count(values[id])}`
    const g = given(id)!
    if (g.kind === 'money' || g.kind === 'value' || g.kind === 'price') return money(g.value, 2, true)
    if (g.kind === 'ctr' || g.kind === 'cr' || g.kind === 'margin') return percent(g.value)
    return count(g.value)
  }
  const result = (v: number, exact = false) =>
    ch.unit === 'percent' ? percent(v / 100) : ch.unit === 'currency' ? money(v, exact ? 4 : 2) : count(v, exact ? 2 : 0)

  // A placement can still come out right: the pot holds one amount, the strainer what divides,
  // and everything that multiplies is either in the pot or in the bowl (it is all one product).
  const fitsHere = (placed: Placed, id: string, zone: Zone) => {
    const topLeft = without(top, [...placed.pot, ...placed.spices])
    if (zone === 'strainer') return without(bottom, placed.strainer).includes(id)
    if (!topLeft.includes(id)) return false
    if (zone === 'pot') return !isSpiceId(id) && placed.pot.length === 0
    return placed.pot.length > 0 || without(topLeft, [id]).some((x) => !isSpiceId(x))
  }

  return {
    kind: 'challenge',
    key: ch.id,
    pantry: [...ch.given.map((g) => g.id), 'x100', 'x1000'],
    values,
    name,
    food: (id) => (isSpiceId(id) ? SPICES[id].food : LOOK[given(id)!.kind].food),
    art: (id) => `${import.meta.env.BASE_URL}art/${isSpiceId(id) ? `${id}.webp` : LOOK[given(id)!.kind].art}`,
    color: (id) => (isSpiceId(id) ? foods[id].color : LOOK[given(id)!.kind].color),
    seasoning: (id) => isSpiceId(id) || ['ctr', 'cr', 'margin'].includes(given(id)?.kind ?? ''),
    quantity,
    fits: fitsHere,
    why: (placed, id, zone) => {
      const nm = name(id)
      if (!top.includes(id) && !bottom.includes(id)) return id === 'x1000' ? say.noApple : id === 'x100' ? say.noLemon : say.onTop(nm)
      const used = [...placed.pot, ...placed.strainer, ...placed.spices].filter((x) => x === id).length
      if (used >= [...top, ...bottom].filter((x) => x === id).length) return say.twice(nm)
      if (zone === 'strainer') return bottom.length === 0 ? say.noDivide(nm) : bottom.includes(id) ? say.strainerFull : say.onTop(nm)
      if (bottom.includes(id)) return say.divideBy(nm)
      if (zone === 'pot') return isSpiceId(id) ? say.spiceInPot : say.potFull(name(placed.pot[0]))
      return say.keepForPot
    },
    complete: (placed) => placed.pot.length === 1 && sameItems([...placed.pot, ...placed.spices], top) && sameItems(placed.strainer, bottom),
    hint: (placed) => {
      if (!placed.pot.length) {
        const left = without(top, placed.spices).filter((x) => !isSpiceId(x))
        return { id: left.includes(ch.pot) ? ch.pot : left[0], zone: 'pot' }
      }
      const under = without(bottom, placed.strainer)[0]
      if (under) return { id: under, zone: 'strainer' }
      const more = without(top, [...placed.pot, ...placed.spices])[0]
      return more ? { id: more, zone: 'spices' } : null
    },
    cook: (placed) => cook(placed, values),
    result: (v) => result(v),
    ticket: { meta: "Chef's challenge", side: `${n} / ${challenges.length}`, title: `Challenge ${n}`, subtitle: '', question: ch.question },
    served: (placed, v) => {
      // written the way it is cooked: pot ÷ strainer × seasoning
      const times = placed.spices.map((id) => ` × ${isSpiceId(id) ? count(values[id]) : quantity(id)}`).join('')
      const divide = placed.strainer.length ? ` ÷ ${placed.strainer.map(quantity).join(' + ')}` : ''
      return {
        kicker: 'Solved!',
        title: ch.answer.replace('{v}', result(v)),
        formula: `${quantity(placed.pot[0])}${divide}${times} = ${result(v, true)}`,
        definition: ch.explain,
        note: ch.metric,
      }
    },
    where: `Chef's challenges · ${n} of ${challenges.length}`,
    next: 'Next challenge',
  }
}
