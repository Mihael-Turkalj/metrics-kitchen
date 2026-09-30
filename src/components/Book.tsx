import { motion } from 'motion/react'
import { challenges } from '../data/challenges'
import { challengeDish } from '../data/dish'
import { allWork, lab } from '../data/lab'
import { artSmall, recipes, type Platform } from '../data/kitchen'

const snap = [0.16, 1, 0.3, 1] as const

function Chilis({ n }: { n: number }) {
  return (
    <span className="chilis" aria-label={`Difficulty ${n} of 3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} data-on={i <= n} />
      ))}
    </span>
  )
}

function Kitchen({ platform, stars, onCook }: { platform: Platform; stars: Record<string, number>; onCook: (id: string) => void }) {
  const list = recipes.filter((r) => r.platform === platform)
  const done = list.filter((r) => (stars[r.id] ?? 0) > 0).length
  return (
    <section className={`book-kitchen kitchen-${platform}`} aria-labelledby={`k-${platform}`}>
      <header className="book-kitchen-head">
        <h2 id={`k-${platform}`}>{platform === 'meta' ? 'The Meta Ads kitchen' : 'The Google Ads kitchen'}</h2>
        <p>
          {done} of {list.length} recipes cooked
        </p>
      </header>
      <ol className="recipe-grid">
        {list.map((r, i) => (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: snap, delay: Math.min(i, 8) * 0.04 }}
          >
            <button type="button" className="index-card" onClick={() => onCook(r.id)}>
              {r.id === 'meta-cpm' && <span className="ribbon">Start here</span>}
              <span className="index-abbr">{r.abbr}</span>
              <span className="index-name">{r.name}</span>
              <span className="index-foot">
                <Chilis n={r.difficulty} />
                <span className="index-stars" aria-label={`${stars[r.id] ?? 0} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <b key={n} data-on={n <= (stars[r.id] ?? 0)}>
                      ★
                    </b>
                  ))}
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- the chef's challenges: word problems, cooked the same way ---------- */

function Challenges({ stars, onChallenge }: { stars: Record<string, number>; onChallenge: (id: string) => void }) {
  const done = challenges.filter((c) => (stars[c.id] ?? 0) > 0).length
  return (
    <section className="book-kitchen kitchen-challenges" aria-labelledby="k-challenges">
      <header className="book-kitchen-head">
        <h2 id="k-challenges">The chef's challenges</h2>
        <p>
          {done} of {challenges.length} solved
        </p>
      </header>
      <p className="challenges-lead">
        Word problems from real ad work. Read the order, then cook the answer: an amount in the pot, what you divide by through the strainer, and rates
        like 2% (jars of spice) or ×100 in the seasoning.
      </p>
      <ol className="challenge-grid">
        {challenges.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.2 : -1.2 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.5 : -0.5 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: snap, delay: i * 0.05 }}
          >
            <button type="button" className="index-card challenge-card" onClick={() => onChallenge(c.id)}>
              <span className="index-abbr">Challenge {i + 1}</span>
              <span className="challenge-question">{c.question}</span>
              <span className="index-foot">
                <span className="challenge-jars" aria-hidden="true">
                  {c.given.map((g) => (
                    <img key={g.id} src={challengeDish(c).art(g.id)} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="index-stars" aria-label={`${stars[c.id] ?? 0} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <b key={n} data-on={n <= (stars[c.id] ?? 0)}>
                      ★
                    </b>
                  ))}
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

const DRIFT = ['cost', 'impressions', 'x1000', 'clicks', 'conv_value', 'thruplays', 'x100', 'purchase_value']

export default function Book({ stars, onCook, onChallenge }: { stars: Record<string, number>; onCook: (id: string) => void; onChallenge: (id: string) => void }) {
  // the hero counts the metric recipes; the challenges keep their own tally
  const earned = recipes.map((r) => stars[r.id] ?? 0)
  const total = earned.reduce((a, b) => a + b, 0)
  const cooked = earned.filter((s) => s > 0).length
  return (
    <div className="book">
      <header className="book-hero">
        <div className="sunburst" aria-hidden="true" />
        <div className="drift" aria-hidden="true">
          {DRIFT.map((id, i) => (
            <img key={id} src={artSmall(id)} alt="" style={{ '--i': i } as React.CSSProperties} draggable={false} />
          ))}
        </div>
        <p className="book-kicker">A cooking game for ad metrics</p>
        {/* the intro fades in from 0.001, not 0: it looks the same, but the browser counts it as painted at once */}
        <h1 className="book-title">
          {'The Metrics Kitchen'.split(' ').map((w, i) => (
            <motion.span key={w} initial={{ opacity: 0.001, y: 40, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 + i * 0.12 }}>
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p className="book-lead" initial={{ opacity: 0.001, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: snap, delay: 0.5 }}>
          Cook every Meta and Google Ads metric from scratch. Put the right ingredients in the right place and the number comes out right. Get it wrong
          and the soup spoils.
        </motion.p>
        <motion.p className="book-progress" initial={{ opacity: 0.001 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          {cooked} of {recipes.length} recipes cooked · {total} ★
        </motion.p>
      </header>

      <section className="howto" aria-labelledby="howto-title">
        <h2 id="howto-title">How the cooking works</h2>
        <ol>
          <li>
            <img src={artSmall('cost')} alt="" />
            <b>The pot</b>
            <span>holds the top of the formula. For CPM, that is the carrot: Cost.</span>
          </li>
          <li>
            <img src={artSmall('impressions')} alt="" />
            <b>The strainer</b>
            <span>is what you divide by. For CPM, the onion: Impressions.</span>
          </li>
          <li>
            <img src={artSmall('x1000')} alt="" />
            <b>The seasoning</b>
            <span>multiplies. The apple is ×1,000 and the lemon ×100, for percentages.</span>
          </li>
        </ol>
      </section>

      <Kitchen platform="meta" stars={stars} onCook={onCook} />
      <Kitchen platform="google" stars={stars} onCook={onCook} />
      <Challenges stars={stars} onChallenge={onChallenge} />

      <footer className="book-foot">
        <p>
          An unofficial learning game by{' '}
          <a href="https://mihaelturkalj.com">Mihael Turkalj</a>. Not affiliated with Meta or Google. Every recipe follows the platform’s own metric
          definition, linked from the recipe card; the campaign numbers are made up for each order.
        </p>
        {/* the rest of the lab, so one visit leads to the next */}
        <nav className="lab" aria-labelledby="lab-title">
          <h2 id="lab-title">More from the lab</h2>
          <ul>
            {lab
              .filter((l) => l.id !== 'metrics-kitchen')
              .map((l) => (
                <li key={l.id}>
                  <a href={l.href}>{l.title}</a>
                  <span>{l.what}</span>
                </li>
              ))}
          </ul>
          <a className="lab-all" href={allWork}>
            All work by Mihael Turkalj →
          </a>
        </nav>
      </footer>
    </div>
  )
}
