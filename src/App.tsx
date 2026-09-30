import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import Book from './components/Book'
import Kitchen from './components/Kitchen'
import { challengeById, challenges } from './data/challenges'
import { challengeDish, recipeDish } from './data/dish'
import { makeCampaign, recipeById, recipes } from './data/kitchen'
import { useProgress } from './lib/progress'
import { setSound, soundOn } from './lib/sound'

// Three screens: the recipe book (#/), a metric kitchen (#/cook/<recipe>) and a word problem (#/challenge/<id>),
// so the back button works.
type Route = { kind: 'recipe' | 'challenge'; id: string } | null

const route = (): Route => {
  const cook = location.hash.match(/^#\/cook\/(.+)$/)
  if (cook && recipeById(cook[1])) return { kind: 'recipe', id: cook[1] }
  const challenge = location.hash.match(/^#\/challenge\/(.+)$/)
  if (challenge && challengeById(challenge[1])) return { kind: 'challenge', id: challenge[1] }
  return null
}

let orderNo = 40

export default function App() {
  const [at, setAt] = useState<Route>(route)
  const [round, setRound] = useState(0)
  const [sound, setSoundState] = useState(soundOn())
  const { stars, award } = useProgress()

  useEffect(() => {
    const on = () => setAt(route())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [at?.kind, at?.id, round])

  const go = (to: Route) => {
    location.hash = to ? `#/${to.kind === 'recipe' ? 'cook' : 'challenge'}/${to.id}` : '#/'
    setRound((r) => r + 1)
  }

  // A fresh campaign (and order number) for each visit to a recipe; a challenge is the same numbers every time.
  const recipe = at?.kind === 'recipe' ? recipeById(at.id) : undefined
  const challenge = at?.kind === 'challenge' ? challengeById(at.id) : undefined
  const dish = useMemo(
    () => (recipe ? recipeDish(recipe, makeCampaign(), ++orderNo) : challenge ? challengeDish(challenge) : null),
    [recipe, challenge, round], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const next = () => {
    if (recipe) return go({ kind: 'recipe', id: recipes[(recipes.indexOf(recipe) + 1) % recipes.length].id })
    if (challenge) go({ kind: 'challenge', id: challenges[(challenges.indexOf(challenge) + 1) % challenges.length].id })
  }

  return (
    <>
      <button
        type="button"
        className="sound-toggle"
        aria-pressed={sound}
        onClick={() => {
          setSound(!sound)
          setSoundState(!sound)
        }}
      >
        {sound ? 'Sound on' : 'Sound off'}
      </button>
      <AnimatePresence mode="wait">
        <motion.main
          key={dish ? `${dish.key}-${round}` : 'book'}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {dish ? (
            <Kitchen dish={dish} stars={stars[dish.key] ?? 0} onAward={(n) => award(dish.key, n)} onNext={next} onBook={() => go(null)} />
          ) : (
            <Book stars={stars} onCook={(id) => go({ kind: 'recipe', id })} onChallenge={(id) => go({ kind: 'challenge', id })} />
          )}
        </motion.main>
      </AnimatePresence>
    </>
  )
}
