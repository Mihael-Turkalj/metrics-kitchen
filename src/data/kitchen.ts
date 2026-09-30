import data from './metrics.json'

// The cookbook: ingredients (base quantities), spices (constant multipliers) and recipes (metrics),
// from research/metrics.md. Pot = top of the formula, strainer = what you divide by, seasoning = multipliers.

export type Zone = 'pot' | 'strainer' | 'spices'
export type Platform = 'meta' | 'google'
export type Unit = 'currency' | 'percent' | 'ratio' | 'count'

export type Ingredient = { id: string; name: string; aka?: string[]; unit: string; note?: string }
export type Recipe = {
  id: string
  platform: Platform
  abbr: string
  name: string
  pot: string[]
  strainer: string[]
  spices: string[]
  unit: Unit
  formula: string
  definition: string
  source: string
  difficulty: 1 | 2 | 3
  note?: string
}

export const ingredients = data.ingredients as Ingredient[]
export const spices = data.spices as { id: string; label: string; value: number }[]
export const recipes = (data.metrics as Recipe[])
  .slice()
  .sort((a, b) => (a.platform === b.platform ? a.difficulty - b.difficulty : a.platform === 'meta' ? -1 : 1))

// CPM is the first recipe in the book: it is the example the kitchen is built around.
const cpm = recipes.findIndex((r) => r.id === 'meta-cpm')
if (cpm > 0) recipes.unshift(...recipes.splice(cpm, 1))

/** Each ingredient's food in the pantry, and the colour it gives the soup. */
export const foods: Record<string, { food: string; color: string }> = {
  cost: { food: 'Carrot', color: '#e8762b' },
  impressions: { food: 'Onion', color: '#c98a4a' },
  reach: { food: 'Garlic', color: '#efe3c8' },
  clicks: { food: 'Tomato', color: '#e0472b' },
  clicks_all: { food: 'Cherry tomatoes', color: '#e5503a' },
  link_clicks: { food: 'Bell pepper', color: '#d9442b' },
  unique_link_clicks: { food: 'Chili', color: '#c93421' },
  results: { food: 'Potato', color: '#b98a55' },
  purchases: { food: 'Eggplant', color: '#7a4f86' },
  leads: { food: 'Leek', color: '#9fbf6a' },
  purchase_value: { food: 'Cheese', color: '#f2c94c' },
  conv_value: { food: 'Honey', color: '#f0a92c' },
  conversions: { food: 'Beetroot', color: '#9c2f4f' },
  thruplays: { food: 'Corn', color: '#f3cf3f' },
  post_engagements: { food: 'Mushroom', color: '#a37a55' },
  interactions: { food: 'Broccoli', color: '#5f8c3a' },
  engagements: { food: 'Zucchini', color: '#5a7f35' },
  trueview_views: { food: 'Peas', color: '#86b04a' },
  eligible_impressions: { food: 'Cabbage', color: '#a3c56b' },
  top_impressions: { food: 'Radish', color: '#d9465a' },
  abs_top_impressions: { food: 'Asparagus', color: '#7da24a' },
  invalid_clicks: { food: 'Brussels sprout', color: '#7fa24e' },
  x1000: { food: 'Apple', color: '#dc4b2e' },
  x100: { food: 'Lemon', color: '#f4d23c' },
}

export const art = (id: string) => `${import.meta.env.BASE_URL}art/${id}.webp`
/** A 256px copy, for places where the food is shown small (the book's cover and how-to). */
export const artSmall = (id: string) => `${import.meta.env.BASE_URL}art/sm/${id}.webp`
export const ingredientName = (id: string) => ingredients.find((i) => i.id === id)?.name ?? spices.find((s) => s.id === id)?.label ?? id
export const isSpice = (id: string) => spices.some((s) => s.id === id)
export const recipeById = (id: string) => recipes.find((r) => r.id === id)

/* ---------- a campaign for each order: realistic numbers that agree with each other ---------- */

const between = (a: number, b: number) => a + Math.random() * (b - a)
const whole = (n: number) => Math.max(1, Math.round(n))

export type Campaign = Record<string, number>

export function makeCampaign(): Campaign {
  const impressions = whole(between(40_000, 900_000))
  const cost = Math.round(between(1.5, 14) * (impressions / 1000) * 100) / 100 // CPM between €1.50 and €14
  const reach = whole(impressions / between(1.3, 3.4))
  const clicks = whole(impressions * between(0.006, 0.035))
  const clicksAll = whole(clicks * between(1.2, 1.8))
  const linkClicks = whole(clicksAll * between(0.45, 0.8))
  const uniqueLinkClicks = whole(linkClicks * between(0.78, 0.95))
  const conversions = whole(clicks * between(0.02, 0.09))
  const purchases = whole(linkClicks * between(0.015, 0.06))
  return {
    cost,
    impressions,
    reach,
    clicks,
    clicks_all: clicksAll,
    link_clicks: linkClicks,
    unique_link_clicks: uniqueLinkClicks,
    results: whole(linkClicks * between(0.03, 0.12)),
    purchases,
    leads: whole(linkClicks * between(0.04, 0.14)),
    purchase_value: Math.round(purchases * between(28, 140) * 100) / 100,
    conv_value: Math.round(conversions * between(35, 160) * 100) / 100,
    conversions,
    thruplays: whole(impressions * between(0.05, 0.2)),
    post_engagements: whole(impressions * between(0.01, 0.06)),
    interactions: whole(clicks * between(1.0, 1.4)),
    engagements: whole(impressions * between(0.01, 0.05)),
    trueview_views: whole(impressions * between(0.12, 0.35)),
    eligible_impressions: whole(impressions / between(0.35, 0.9)),
    top_impressions: whole(impressions * between(0.4, 0.8)),
    abs_top_impressions: whole(impressions * between(0.12, 0.35)),
    invalid_clicks: whole(clicks * between(0.01, 0.08)),
    x1000: 1000,
    x100: 100,
  }
}

export const formatQuantity = (id: string, value: number) => {
  if (isSpice(id)) return `×${value.toLocaleString('en-GB')}`
  const unit = ingredients.find((i) => i.id === id)?.unit
  return unit === 'currency'
    ? `€${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value.toLocaleString('en-GB')
}

export const formatResult = (unit: Unit, value: number) => {
  if (!Number.isFinite(value)) return '—'
  if (unit === 'currency') return `€${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (unit === 'percent') return `${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}%`
  if (unit === 'ratio') return `${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}×`
  return value.toLocaleString('en-GB', { maximumFractionDigits: 1 })
}

export type Placed = Record<Zone, string[]>
export const emptyPlaced = (): Placed => ({ pot: [], strainer: [], spices: [] })

/** What the pot holds so far: pot ÷ strainer × spices, where each side adds up. */
export function cook(placed: Placed, c: Campaign) {
  const sum = (ids: string[]) => ids.reduce((n, id) => n + c[id], 0)
  const top = sum(placed.pot)
  const bottom = placed.strainer.length ? sum(placed.strainer) : 1
  const spice = placed.spices.reduce((n, id) => n * c[id], 1)
  return (top / bottom) * spice
}

const count = (ids: string[], id: string) => ids.filter((x) => x === id).length

/** Does this ingredient belong in this zone, and is there still room for it there? */
export function fits(recipe: Recipe, placed: Placed, id: string, zone: Zone) {
  const wanted = zone === 'pot' ? recipe.pot : zone === 'strainer' ? recipe.strainer : recipe.spices
  return count(wanted, id) > count(placed[zone], id)
}

export const complete = (recipe: Recipe, placed: Placed) =>
  placed.pot.length === recipe.pot.length && placed.strainer.length === recipe.strainer.length && placed.spices.length === recipe.spices.length

export const zoneName: Record<Zone, string> = { pot: 'the pot', strainer: 'the strainer', spices: 'the seasoning bowl' }

/** The chef's explanation of why the soup spoiled. */
export function whySpoiled(recipe: Recipe, placed: Placed, id: string, zone: Zone) {
  const name = ingredientName(id)
  const food = foods[id]?.food ?? name
  const inPot = recipe.pot.includes(id)
  const inStrainer = recipe.strainer.includes(id)
  const inSpices = recipe.spices.includes(id)
  if (!inPot && !inStrainer && !inSpices) {
    return isSpice(id)
      ? `${recipe.abbr} doesn't need a ${food.toLowerCase()} (${name}): nothing in it is multiplied by ${id === 'x1000' ? '1,000' : '100'}.`
      : `${food} (${name}) isn't part of ${recipe.abbr} at all.`
  }
  if (count(placed[zone], id) > 0 && fits(recipe, { ...placed, [zone]: [] }, id, zone)) {
    return `${name} was already in ${zoneName[zone]}. Adding it twice counts it twice.`
  }
  if (isSpice(id)) return `${food} is a spice (${name}): it belongs in the seasoning bowl, not ${zoneName[zone]}.`
  if (inStrainer && zone !== 'strainer') return `${recipe.abbr} divides by ${name}, so it goes through the strainer, not ${zoneName[zone]}.`
  if (inPot && zone !== 'pot') return `${name} is the top of the ${recipe.abbr} formula, so it goes in the pot, not ${zoneName[zone]}.`
  return `${name} doesn't go in ${zoneName[zone]} for ${recipe.abbr}.`
}

/** The pantry for a recipe: what it needs plus a few decoys from the same kitchen, and both spices. */
export function pantryFor(recipe: Recipe) {
  const needed = [...new Set([...recipe.pot, ...recipe.strainer])]
  const kitchen = new Set(recipes.filter((r) => r.platform === recipe.platform).flatMap((r) => [...r.pot, ...r.strainer]))
  const decoys = [...kitchen].filter((id) => !needed.includes(id)).sort(() => Math.random() - 0.5)
  const extra = Math.max(3, 7 - needed.length)
  return [...needed, ...decoys.slice(0, extra)].sort(() => Math.random() - 0.5).concat(spices.map((s) => s.id))
}
