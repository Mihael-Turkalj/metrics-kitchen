import { AnimatePresence, animate, motion, useMotionValue, useTransform, useVelocity } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ui, type Dish } from '../data/dish'
import { emptyPlaced, type Placed, type Zone } from '../data/kitchen'
import { usePrefersReducedMotion, useTouchFirst } from '../lib/progress'
import { sfx } from '../lib/sound'
import { Station, type Mood, type Pop, type Splash, type ZoneRefs } from './Station'

type Point = { x: number; y: number }
/** A food in the air: centres in viewport pixels, its size as it leaves the shelf, and how much it shrinks to fit the zone. */
type Flight = { key: number; id: string; zone: Zone; from: Point; to: Point; size: number; toScale: number; spin: number }

// Where the floating foods sit inside each zone, as fractions of the zone's art (mirrors .zone-items in the CSS).
const ZONE_BOX: Record<Zone, { left: number; right: number; top: number }> = {
  pot: { left: 0.22, right: 0.22, top: 0.22 },
  strainer: { left: 0.3, right: 0.12, top: 0.08 },
  spices: { left: 0.18, right: 0.18, top: 0.04 },
}

// The dump plays for this long (the CSS keyframes and the sound are timed to it).
const DUMP_MS = 2200

const snap = [0.16, 1, 0.3, 1] as const

/* ---------- soup colour: broth that takes on the colour of what goes in ---------- */

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const mix = (a: string, b: string, t: number) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t))

function soupColour(dish: Dish, placed: Placed, mood: Mood) {
  if (mood === 'spoiled') return '#7b8a2c'
  if (mood === 'cooked') return '#f0b23a'
  const items = [...placed.pot, ...placed.strainer, ...placed.spices]
  if (!items.length) return '#efd9a8'
  const avg = toHex(
    items
      .map((id) => hex(dish.color(id)))
      .reduce((s, c) => s.map((v, i) => v + c[i] / items.length), [0, 0, 0]),
  )
  return mix('#efd9a8', avg, Math.min(0.8, 0.35 + items.length * 0.15))
}

/* ---------- a pantry card: dragged to a zone, or picked and then placed ---------- */

function PantryCard({
  id,
  dish,
  selected,
  hinted,
  disabled,
  touch,
  index,
  onSelect,
  onDragMove,
  onDrop,
}: {
  id: string
  dish: Dish
  selected: boolean
  hinted: boolean
  disabled: boolean
  touch: boolean
  index: number
  onSelect: (id: string, el: HTMLElement, keyboard: boolean) => void
  onDragMove: (p: Point | null) => void
  onDrop: (id: string, p: Point, el: HTMLElement) => boolean
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // the card leans into the direction it is thrown
  const vx = useVelocity(x)
  const rotate = useTransform(vx, [-1400, 0, 1400], [-16, 0, 16], { clamp: true })
  const moved = useRef(false)
  const el = useRef<HTMLButtonElement>(null)

  return (
    <motion.button
      ref={el}
      type="button"
      className={`card ${dish.seasoning(id) ? 'is-spice' : ''}`}
      data-selected={selected}
      data-hinted={hinted}
      data-touch={touch}
      disabled={disabled}
      style={{ x, y, rotate, '--i': index } as never}
      drag={!disabled && !touch}
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 40, cursor: 'grabbing' }}
      onDragStart={() => {
        moved.current = true
        sfx.pick()
      }}
      onDrag={(_, info) => onDragMove({ x: info.point.x - window.scrollX, y: info.point.y - window.scrollY })}
      onDragEnd={(_, info) => {
        onDragMove(null)
        const p = { x: info.point.x - window.scrollX, y: info.point.y - window.scrollY }
        if (el.current && onDrop(id, p, el.current)) {
          // it flies on from where it was let go; the card is back on the shelf at once
          x.jump(0)
          y.jump(0)
        } else {
          animate(x, 0, { type: 'spring', stiffness: 420, damping: 30 })
          animate(y, 0, { type: 'spring', stiffness: 420, damping: 30 })
        }
        window.setTimeout(() => (moved.current = false), 0)
      }}
      onClick={(e) => {
        if (moved.current || !el.current) return
        onSelect(id, el.current, e.detail === 0)
      }}
      aria-pressed={selected}
      aria-label={`${dish.name(id)}, ${dish.quantity(id)}`}
    >
      <img src={dish.art(id)} alt="" draggable={false} />
      <span className="card-name">{dish.name(id)}</span>
      <span className="card-food">{dish.food(id)}</span>
      <span className="card-value">{dish.quantity(id)}</span>
    </motion.button>
  )
}

/* ---------- a food in the air: a thrown arc, a spin, and a fading trail ---------- */

function FlyingFood({ f, src, onLand, reduced }: { f: Flight; src: string; onLand: (f: Flight) => void; reduced: boolean }) {
  const x0 = f.from.x - f.size / 2
  const y0 = f.from.y - f.size / 2
  const x1 = f.to.x - f.size / 2
  const y1 = f.to.y - f.size / 2
  const dist = Math.hypot(x1 - x0, y1 - y0)
  const peak = Math.min(y0, y1) - Math.max(90, dist * 0.3)
  const duration = reduced ? 0.01 : Math.min(0.85, 0.46 + dist / 2600)
  // across at an even pace, up then down under gravity
  const move = (delay: number) => ({
    x: { duration, delay, ease: 'linear' as const, times: [0, 0.5, 1] },
    y: { duration, delay, ease: ['easeOut', 'easeIn'] as ('easeOut' | 'easeIn')[], times: [0, 0.5, 1] },
    default: { duration, delay, ease: 'easeInOut' as const, times: [0, 0.5, 1] },
  })
  const path = { x: [x0, (x0 + x1) / 2, x1], y: [y0, peak, y1], rotate: [0, f.spin * 0.55, f.spin], scale: [1, 1.14, f.toScale] }
  return (
    <>
      {!reduced &&
        [3, 2, 1].map((k) => (
          <motion.img
            key={k}
            src={src}
            alt=""
            className="flying ghost"
            style={{ width: f.size, height: f.size }}
            initial={{ x: x0, y: y0, opacity: 0 }}
            animate={{ ...path, opacity: [0.42 - k * 0.1, 0.36 - k * 0.09, 0] }}
            transition={move(k * 0.045)}
          />
        ))}
      <motion.img
        src={src}
        alt=""
        className="flying"
        style={{ width: f.size, height: f.size }}
        initial={{ x: x0, y: y0 }}
        animate={reduced ? { x: x1, y: y1, opacity: 0 } : path}
        transition={reduced ? { duration } : move(0)}
        onAnimationComplete={() => onLand(f)}
      />
    </>
  )
}

/* ---------- the order ticket: the recipe (or the question) and the formula as it is built ---------- */

function Ticket({ dish, placed, mood, result }: { dish: Dish; placed: Placed; mood: Mood; result: number }) {
  const line = (ids: string[]) =>
    ids.map((id, i) => (
      <motion.span key={`${id}-${i}`} className="ticket-item" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: snap }}>
        {dish.name(id)} <b>{dish.quantity(id)}</b>
      </motion.span>
    ))
  return (
    <aside className="ticket" data-kind={dish.kind} aria-label={dish.ticket.title}>
      <div className="ticket-clip" aria-hidden="true" />
      <p className="ticket-meta">
        <span>{dish.ticket.meta}</span>
        <span>{dish.ticket.side}</span>
      </p>
      <h1 className="ticket-abbr">{dish.ticket.title}</h1>
      {dish.ticket.subtitle && <p className="ticket-name">{dish.ticket.subtitle}</p>}
      {dish.ticket.question && <p className="ticket-question">{dish.ticket.question}</p>}
      <div className="ticket-rule" />
      <dl className="ticket-lines">
        <div>
          <dt>{ui.pot}</dt>
          <dd>{placed.pot.length ? line(placed.pot) : <span className="ticket-empty">{ui.empty}</span>}</dd>
        </div>
        <div>
          <dt>{ui.strainer}</dt>
          <dd>{placed.strainer.length ? line(placed.strainer) : <span className="ticket-empty">{ui.empty}</span>}</dd>
        </div>
        <div>
          <dt>{ui.seasoning}</dt>
          <dd>{placed.spices.length ? line(placed.spices) : <span className="ticket-empty">{ui.none}</span>}</dd>
        </div>
      </dl>
      <div className="ticket-rule" />
      <p className="ticket-total">
        <span>=</span>
        <b>{mood === 'cooked' ? <CountUp to={result} format={dish.result} /> : '…'}</b>
        <AnimatePresence>
          {mood !== 'cooking' && (
            <motion.span
              key={mood}
              className={`stamp stamp-${mood}`}
              initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 16 }}
            >
              {mood === 'spoiled' ? ui.spoiled : ui.cooked}
            </motion.span>
          )}
        </AnimatePresence>
      </p>
    </aside>
  )
}

function CountUp({ to, format }: { to: number; format: (v: number) => string }) {
  const [v, setV] = useState(0)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) return void setV(to)
    const c = animate(0, to, { duration: 1.1, ease: snap, onUpdate: setV })
    return () => c.stop()
  }, [to, reduced])
  return <>{format(v)}</>
}

/* ---------- the kitchen ---------- */

export default function Kitchen({
  dish,
  stars,
  onAward,
  onNext,
  onBook,
}: {
  dish: Dish
  stars: number
  onAward: (n: number) => void
  onNext: () => void
  onBook: () => void
}) {
  const reduced = usePrefersReducedMotion()
  const touch = useTouchFirst()
  const [placed, setPlaced] = useState<Placed>(emptyPlaced)
  const [mood, setMood] = useState<Mood>('cooking')
  const [spoils, setSpoils] = useState(0)
  const [hinted, setHinted] = useState(false)
  const [why, setWhy] = useState<{ id: string; zone: Zone; before: Placed } | null>(null)
  const [tip, setTip] = useState<{ id: string; zone: Zone } | null>(null)
  const [hover, setHover] = useState<Zone | null>(null)
  const [selected, setSelected] = useState<{ id: string; el: HTMLElement } | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [splash, setSplash] = useState<Splash>({ pot: { n: 0, color: '#e0a050' }, strainer: { n: 0, color: '#e0a050' }, spices: { n: 0, color: '#e0a050' } })
  const [pops, setPops] = useState<Pop[]>([])
  const [shake, setShake] = useState(0)
  const [dumping, setDumping] = useState(false)
  const [fresh, setFresh] = useState(0)
  const flightKey = useRef(0)
  const popKey = useRef(0)
  const inAir = useRef<Record<Zone, number>>({ pot: 0, strainer: 0, spices: 0 })
  const refs: ZoneRefs = { pot: useRef(null), strainer: useRef(null), spices: useRef(null) }
  const placedRef = useRef(placed)
  placedRef.current = placed

  const result = useMemo(() => dish.cook(placed), [placed, dish])
  const earned = Math.max(1, 3 - spoils - (hinted ? 1 : 0))

  const zoneAt = useCallback(
    (p: Point): Zone | null => {
      for (const z of ['pot', 'strainer', 'spices'] as Zone[]) {
        const r = refs[z].current?.getBoundingClientRect()
        if (r && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) return z
      }
      return null
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // The flight ends right above the slot the food will float in, so the dunk carries straight on from it.
  const landingOf = (z: Zone, count: number) => {
    const target = refs[z].current!
    const r = target.getBoundingClientRect()
    const size = r.width * (parseFloat(getComputedStyle(target.parentElement!).getPropertyValue('--item')) || 0.15)
    const box = ZONE_BOX[z]
    const x = r.left + r.width * (box.left + ((count + 0.5) / (count + 1)) * (1 - box.left - box.right))
    return { x, y: r.top + r.height * box.top + size / 2 - size * 0.7, size }
  }

  const launch = (id: string, zone: Zone, card: HTMLElement) => {
    setTip(null)
    setSelected(null)
    const img = (card.querySelector('img') ?? card).getBoundingClientRect()
    const to = landingOf(zone, placedRef.current[zone].length + inAir.current[zone])
    inAir.current[zone]++
    sfx.whoosh()
    setFlights((f) => [
      ...f,
      {
        key: ++flightKey.current,
        id,
        zone,
        from: { x: img.left + img.width / 2, y: img.top + img.height / 2 },
        to: { x: to.x, y: to.y },
        size: img.width,
        toScale: to.size / img.width,
        spin: Math.random() < 0.5 ? -360 : 360,
      },
    ])
  }

  const land = (f: Flight) => {
    setFlights((all) => all.filter((x) => x.key !== f.key))
    inAir.current[f.zone]--
    const now = placedRef.current
    setSplash((s) => ({ ...s, [f.zone]: { n: s[f.zone].n + 1, color: dish.color(f.id) } }))
    // the value goes up from where it landed: + on top, ÷ below, × as seasoning
    const amount = dish.quantity(f.id)
    const key = ++popKey.current
    const text = f.zone === 'pot' ? `+ ${amount}` : f.zone === 'strainer' ? `÷ ${amount}` : amount.startsWith('×') ? amount : `× ${amount}`
    setPops((all) => [...all, { key, zone: f.zone, text }])
    window.setTimeout(() => setPops((all) => all.filter((x) => x.key !== key)), 1600)
    if (f.zone === 'pot') sfx.plop()
    else if (f.zone === 'spices') sfx.sprinkle()
    else sfx.drip()
    const next = { ...now, [f.zone]: [...now[f.zone], f.id] }
    if (!dish.fits(now, f.id, f.zone)) {
      setPlaced(next)
      setMood('spoiled')
      setSpoils((n) => n + 1)
      setWhy({ id: f.id, zone: f.zone, before: now })
      setShake((n) => n + 1)
      window.setTimeout(sfx.spoil, 120)
      return
    }
    setPlaced(next)
    if (dish.complete(next)) {
      window.setTimeout(() => {
        sfx.stir()
        setMood('cooked')
        window.setTimeout(sfx.bell, 500)
      }, 380)
    }
  }

  useEffect(() => {
    if (mood === 'cooked') onAward(earned)
  }, [mood]) // eslint-disable-line react-hooks/exhaustive-deps

  // The bin comes up, the pot pours out, gets two bangs, and goes back on the flame; then fresh broth.
  const dump = () => {
    if (dumping) return
    const reset = () => {
      setPlaced(emptyPlaced())
      setMood('cooking')
      setWhy(null)
      setDumping(false)
    }
    if (reduced) return reset()
    sfx.dump()
    setDumping(true)
    window.setTimeout(() => {
      reset()
      setFresh((n) => n + 1)
      sfx.refill()
    }, DUMP_MS)
  }

  const askChef = () => {
    setHinted(true)
    setTip(dish.hint(placed))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const cooking = mood === 'cooking' && !dumping
  const soup = soupColour(dish, placed, mood)
  const served = mood === 'cooked' ? dish.served(placed, result) : null

  return (
    <div className="kitchen" data-mood={mood} data-kind={dish.kind}>
      <header className="kitchen-bar">
        <button type="button" className="chip" onClick={onBook}>
          {ui.book}
        </button>
        <p className="kitchen-where">{dish.where}</p>
        <p className="kitchen-stars" aria-label={ui.best(stars)}>
          {[1, 2, 3].map((n) => (
            <span key={n} data-on={n <= stars}>
              ★
            </span>
          ))}
        </p>
      </header>

      <div className="kitchen-grid">
        <Ticket dish={dish} placed={placed} mood={mood} result={result} />

        <section className="stove" aria-label="The stove" data-dumping={dumping}>
          <p className="stove-order" aria-hidden="true">
            {dish.ticket.title}
          </p>
          <Station
            placed={placed}
            mood={mood}
            soup={soup}
            hover={hover}
            armed={!!selected && cooking}
            hint={cooking && tip ? tip.zone : null}
            splash={splash}
            pops={pops}
            refs={refs}
            shake={shake}
            dumping={dumping}
            fresh={fresh}
            labels={ui.zones}
            putIn={ui.putIn}
            artOf={dish.art}
            onPick={(zone, keyboard) => {
              if (!selected) return
              launch(selected.id, zone, selected.el)
              // from the keyboard, go back to the shelf for the next ingredient
              if (keyboard) selected.el.focus()
            }}
          />
          <AnimatePresence mode="wait">
            {mood === 'spoiled' && why && (
              <motion.div key="why" className="chef chef-spoiled" data-dumping={dumping} role="alert" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4, ease: snap }}>
                <p className="chef-says">
                  <b>{ui.chef}</b> {dish.why(why.before, why.id, why.zone)}
                </p>
                <button type="button" className="btn btn-tomato" onClick={dump} disabled={dumping}>
                  {ui.dump}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="pantry" aria-label={ui.pantry}>
          <div className="pantry-head">
            <h2>{ui.pantry}</h2>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={selected ? 'pick' : tip ? `tip-${tip.id}` : 'how'}
                className={!selected && tip ? 'pantry-tip' : undefined}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                transition={{ duration: 0.3, ease: snap }}
                role={!selected && tip ? 'status' : undefined}
              >
                {selected ? (
                  ui.pick(dish.name(selected.id))
                ) : tip ? (
                  <>
                    <b>{ui.chef}</b> {ui.hint(dish.name(tip.id), dish.food(tip.id), tip.zone)}
                  </>
                ) : touch ? (
                  ui.tap
                ) : (
                  ui.drag
                )}
              </motion.p>
            </AnimatePresence>
            <button type="button" className="chip" onClick={askChef} disabled={!cooking}>
              {ui.ask}
            </button>
          </div>
          <div className="shelf">
            {dish.pantry.map((id, i) => (
              <PantryCard
                key={id}
                id={id}
                dish={dish}
                index={i}
                selected={selected?.id === id}
                hinted={cooking && tip?.id === id && selected?.id !== id}
                disabled={!cooking}
                touch={touch}
                onSelect={(sid, el, keyboard) => {
                  sfx.pick()
                  const picking = selected?.id !== sid
                  setSelected(picking ? { id: sid, el } : null)
                  // from the keyboard, jump to the pot's label; Shift+Tab and Tab reach the strainer and the seasoning
                  if (picking && keyboard) window.setTimeout(() => refs.pot.current?.parentElement?.querySelector<HTMLButtonElement>('.zone-label')?.focus(), 0)
                }}
                onDragMove={(p) => setHover(p ? zoneAt(p) : null)}
                onDrop={(sid, p, el) => {
                  const z = zoneAt(p)
                  if (!z || !cooking) return false
                  launch(sid, z, el)
                  return true
                }}
              />
            ))}
          </div>
        </section>
      </div>

      {flights.map((f) => (
        <FlyingFood key={f.key} f={f} src={dish.art(f.id)} onLand={land} reduced={reduced} />
      ))}

      <AnimatePresence>
        {served && (
          <motion.div className="served" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: reduced ? 0 : 1.2 }}>
            <motion.article
              className="recipe-card"
              role="dialog"
              aria-labelledby="served-title"
              initial={{ y: 60, rotate: -3, opacity: 0 }}
              animate={{ y: 0, rotate: -1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: reduced ? 0 : 1.25 }}
            >
              <header className="recipe-head">
                <p className="recipe-kicker">{served.kicker}</p>
                <h2 id="served-title" className="recipe-title">
                  {served.title}
                </h2>
              </header>
              <p className="recipe-stars" aria-label={ui.earned(earned)}>
                {[1, 2, 3].map((n) => (
                  <motion.span
                    key={n}
                    data-on={n <= earned}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14, delay: reduced ? 0 : 1.6 + n * 0.14 }}
                  >
                    ★
                  </motion.span>
                ))}
              </p>
              <p className="recipe-formula">{served.formula}</p>
              <p className="recipe-def">{served.definition}</p>
              {served.note && <p className="recipe-note">{served.note}</p>}
              {served.source && (
                <p className="recipe-source">
                  <a href={served.source} target="_blank" rel="noopener noreferrer">
                    Official definition →
                  </a>
                </p>
              )}
              <div className="recipe-actions">
                <button type="button" className="btn btn-tomato" onClick={onNext} autoFocus>
                  {dish.next}
                </button>
                <button type="button" className="btn btn-ghost" onClick={onBook}>
                  {ui.bookButton}
                </button>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
