import { forwardRef, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type { UI } from '../data/dish'
import type { Placed, Zone } from '../data/kitchen'

export type Mood = 'cooking' | 'spoiled' | 'cooked'
/** How many times something has landed in each zone, and the colour of the last thing that did. */
export type Splash = Record<Zone, { n: number; color: string }>
/** A value that floats up from a zone when an ingredient lands: "+ €7,283.46", "÷ 578,746". */
export type Pop = { key: number; zone: Zone; text: string }

const vars = (v: Record<string, string | number>) => v as CSSProperties

// One-off flourishes run through the Web Animations API, so the loops set in CSS keep running underneath.
function play(el: Element | null | undefined, frames: Keyframe[], options: KeyframeAnimationOptions) {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.animate(frames, options)
}

/* ---------- the burner: a cast-iron ring with gas flames all round it ---------- */

// Flames stand on an ellipse round the burner cap. The back half is drawn behind the pot, the front half in front of it.
const RING = Array.from({ length: 20 }, (_, k) => {
  const a = ((k + 0.5) / 20) * Math.PI * 2
  return { i: k, x: 210 + Math.cos(a) * 100, y: 323 + Math.sin(a) * 10, front: Math.sin(a) > 0 }
})

// a flame that leans a little and curls at the tip
const flamePath = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y} C${x - w} ${y - h * 0.16} ${x - w * 0.62} ${y - h * 0.62} ${x + w * 0.1} ${y - h} C${x + w * 0.18} ${y - h * 0.64} ${x + w * 0.9} ${y - h * 0.4} ${x} ${y} Z`

function Flames({ front }: { front: boolean }) {
  const w = front ? 16 : 14
  const h = front ? 46 : 42
  return (
    <g className={`flames ${front ? 'flames-front' : 'flames-back'}`}>
      <g className="flare">
        {RING.filter((f) => f.front === front).map((f) => (
          <g key={f.i} className="flame" style={vars({ '--i': f.i })}>
            <path d={flamePath(f.x, f.y, w, h)} className="flame-outer" />
            <path d={flamePath(f.x, f.y - 1, w * 0.42, h * 0.5)} className="flame-core" />
          </g>
        ))}
      </g>
    </g>
  )
}

function BurnerArt() {
  return (
    <svg className="burner-art" viewBox="0 0 420 340" aria-hidden="true">
      <defs>
        <linearGradient id="flame-cool" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f4fd1" />
          <stop offset="0.36" stopColor="#4d9bff" />
          <stop offset="0.58" stopColor="#b3e0ff" />
          <stop offset="0.76" stopColor="#ffd46a" />
          <stop offset="1" stopColor="#ff7a2b" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="flame-hot" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3a5bff" />
          <stop offset="0.28" stopColor="#ff8a2a" />
          <stop offset="0.6" stopColor="#ffc93f" />
          <stop offset="1" stopColor="#fff2b8" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="flame-sick" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2c5f73" />
          <stop offset="0.45" stopColor="#6c9a74" />
          <stop offset="1" stopColor="#c9cf6a" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="flame-core" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#dcf1ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#bfe6ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="burner-glow">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#6fb0ff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#6fb0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pan-glow">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="burner-glow" cx="210" cy="324" rx="200" ry="40" fill="url(#burner-glow)" />
      <Flames front={false} />
      <ellipse className="burner-ring" cx="210" cy="325" rx="114" ry="14" />
      <ellipse className="burner-cap" cx="210" cy="322" rx="80" ry="8.5" />
      <ellipse className="burner-shine" cx="188" cy="319.5" rx="34" ry="2.4" />
      {/* the pot stands on cast-iron prongs */}
      <path className="grate" d="M86 324 L98 297 L112 297 L106 326 Z" />
      <path className="grate" d="M334 324 L322 297 L308 297 L314 326 Z" />
    </svg>
  )
}

/* ---------- the pot: enamel with polka dots; the soup shows what is in it ---------- */

const DOTS = [
  [96, 170], [130, 214], [104, 252], [160, 180], [192, 236], [226, 196], [258, 250], [290, 176], [316, 222], [150, 278], [270, 282], [330, 150], [84, 208],
]

// a splash is a crown of drops: [dx, height, where it lands, radius, soup or food colour]
const CROWN: [number, number, number, number, 'soup' | 'food'][] = [
  [-96, 48, 40, 5.5, 'soup'], [-76, 70, 8, 7, 'food'], [-56, 90, 2, 6, 'soup'], [-36, 108, -4, 5, 'food'], [-16, 84, 0, 7, 'soup'], [2, 122, -2, 6, 'soup'],
  [20, 96, 2, 7, 'food'], [38, 112, -6, 5, 'soup'], [58, 86, 4, 6.5, 'food'], [78, 68, 10, 6, 'soup'], [100, 50, 44, 5.5, 'food'], [-116, 34, 66, 4.5, 'soup'],
  [122, 38, 62, 4.5, 'soup'], [-28, 60, 30, 4, 'food'], [30, 64, 28, 4, 'soup'], [-66, 40, 52, 4, 'food'], [68, 44, 50, 4, 'soup'],
]

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`

function PotArt({ mood, splash, fresh }: { mood: Mood; splash: number; fresh: number }) {
  return (
    <svg className="pot-art" viewBox="0 0 420 340" aria-hidden="true">
      <defs>
        <clipPath id="pot-body">
          <path d="M70 118 C70 118 72 250 86 272 Q98 292 130 296 L290 296 Q322 292 334 272 C348 250 350 118 350 118 Z" />
        </clipPath>
        <radialGradient id="soup-shine" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gold-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd86b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd86b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* handles */}
      <path d="M72 128 C40 128 30 150 44 162 L70 160" className="pot-handle" />
      <path d="M348 128 C380 128 390 150 376 162 L350 160" className="pot-handle" />

      {/* body with polka dots */}
      <path className="pot-body" d="M70 118 C70 118 72 250 86 272 Q98 292 130 296 L290 296 Q322 292 334 272 C348 250 350 118 350 118 Z" />
      <g clipPath="url(#pot-body)">
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="9" className="pot-dot" />
        ))}
        <path d="M70 250 L350 250 L350 300 L70 300 Z" className="pot-shade" />
      </g>

      {/* the rim, the dark inside, and the soup */}
      <ellipse cx="210" cy="118" rx="146" ry="34" className="pot-rim" />
      <ellipse cx="210" cy="120" rx="132" ry="26" className="pot-inside" />
      <g key={`soup-${fresh}`} className="soup-wrap" data-fresh={fresh > 0}>
        <g className="surface">
          <ellipse cx="210" cy="126" rx="126" ry="21" className="soup" />
          <ellipse cx="210" cy="126" rx="126" ry="21" fill="url(#soup-shine)" />
          {mood === 'cooked' && <ellipse cx="210" cy="126" rx="150" ry="40" fill="url(#gold-glow)" className="soup-glow" />}
        </g>
        {[
          [150, 124, 0], [196, 131, 1], [238, 121, 2], [268, 130, 3], [178, 118, 4], [226, 134, 5], [120, 129, 6], [296, 124, 7],
        ].map(([x, y, i]) => (
          <circle key={i} cx={x} cy={y} r={mood === 'spoiled' ? 6 : 3.5} className="bubble" style={vars({ '--i': i })} />
        ))}
      </g>

      {/* each landing: rings, a jet, a crown of drops, drips down the outside, a puff of steam
          (outside the soup, so the refill after a dump does not replay the last one) */}
      <g key={splash} className="splash" data-on={splash > 0}>
        <ellipse cx="210" cy="126" rx="30" ry="6" className="ripple" />
        <ellipse cx="210" cy="126" rx="30" ry="6" className="ripple ripple-2" />
        <ellipse cx="210" cy="126" rx="30" ry="6" className="ripple ripple-3" />
        <path d="M200 128 Q203 96 210 66 Q217 96 220 128 Z" className="jet" />
        <circle cx="210" cy="62" r="8" className="jet-drop" />
        {CROWN.map(([dx, h, fall, r, tone], i) => (
          <circle
            key={i}
            cx={210 + dx * 0.15}
            cy="124"
            r={r}
            className="crown"
            data-tone={tone}
            style={vars({ '--dx': `${dx}px`, '--h': `${h}px`, '--fall': `${fall}px`, '--i': i })}
          />
        ))}
        {[[128, 0], [296, 1]].map(([x, i]) => (
          <ellipse key={x} cx={x} cy="146" rx="4" ry="6" className="spill" style={vars({ '--i': i })} />
        ))}
        {[[176, 0], [210, 1], [246, 2]].map(([x, i]) => (
          <circle key={x} cx={x} cy="116" r="12" className="puff" style={vars({ '--i': i })} />
        ))}
      </g>

      {/* steam */}
      <g className="steam">
        {[160, 210, 260].map((x, i) => (
          <path key={x} d={`M${x} 96 C${x - 16} 76 ${x + 16} 58 ${x} 38 C${x - 14} 22 ${x + 10} 10 ${x} -4`} style={vars({ '--i': i })} />
        ))}
      </g>

      {/* cooked: the ladle stirs and sparkles rise */}
      {mood === 'cooked' && (
        <g className="done">
          <g className="ladle">
            <path d="M210 126 L262 30" className="ladle-handle" />
            <ellipse cx="206" cy="128" rx="18" ry="8" className="ladle-cup" />
          </g>
          {[[150, 70], [276, 60], [230, 36], [178, 44], [306, 96], [118, 96]].map(([x, y], i) => (
            <path key={i} className="sparkle" style={vars({ '--i': i })} d={star(x, y, 9)} />
          ))}
        </g>
      )}

      {/* back on the flame after a dump: rinsed clean */}
      {fresh > 0 && <path key={`rinse-${fresh}`} className="rinse" d={star(304, 104, 12)} />}
    </svg>
  )
}

/* ---------- in front of the pot: the near flames, sparks, the flies, and the dump ---------- */

const SPARKS = [
  [78, 312, -16], [96, 306, -8], [110, 314, -22], [324, 310, 10], [340, 306, 18], [312, 316, 24],
]

function PotFx({ mood, dumping }: { mood: Mood; dumping: boolean }) {
  return (
    <svg className="pot-fx" viewBox="0 0 420 340" aria-hidden="true">
      <ellipse className="pan-glow" cx="210" cy="292" rx="130" ry="20" fill="url(#pan-glow)" />
      <Flames front />
      <g className="sparks">
        {SPARKS.map(([x, y, dx], i) => (
          <circle key={i} cx={x} cy={y} r="2" className="spark" style={vars({ '--dx': `${dx}px`, '--i': i })} />
        ))}
      </g>

      {/* spoiled: stink lines and flies */}
      {mood === 'spoiled' && (
        <>
          <g className="stink">
            {[150, 205, 262].map((x, i) => (
              <path key={x} d={`M${x} 96 q-10 -12 0 -24 q10 -12 0 -24 q-10 -12 0 -24`} style={vars({ '--i': i })} />
            ))}
          </g>
          <g className="flies">
            {[0, 1, 2].map((i) => (
              <g key={i} className="fly" style={vars({ '--i': i })}>
                <ellipse cx="0" cy="0" rx="4.5" ry="3.5" fill="#1d1712" />
                <ellipse cx="-3" cy="-4" rx="3.5" ry="2.2" className="wing" />
                <ellipse cx="3" cy="-4" rx="3.5" ry="2.2" className="wing" />
              </g>
            ))}
          </g>
        </>
      )}

      {dumping && <Dump />}
    </svg>
  )
}

/* The dump, in pot coordinates. The pot tips about its right-hand lip, which ends up at (426, 124);
   the soup pours from there into a 1970s pedal bin that rises out of the counter, mouth at (426, 214).
   The bin is drawn in two halves that rise together: its back and mouth behind the stream, its front rim and lid in front. */
function Dump() {
  return (
    <g className="dump">
      <g className="bin">
        <path className="bin-body" d="M376 214 L389 432 Q426 442 463 432 L476 214 Z" />
        {[272, 332, 392].map((y) => (
          <path key={y} className="bin-rib" d={`M${379 + (y - 214) * 0.06} ${y} Q426 ${y + 10} ${473 - (y - 214) * 0.06} ${y}`} />
        ))}
        <rect className="bin-pedal" x="402" y="420" width="48" height="10" rx="3" />
        <ellipse className="bin-mouth" cx="426" cy="214" rx="50" ry="12" />
      </g>

      <g className="pour">
        <path className="stream-edge" d="M426 122 C431 150 421 184 426 222" pathLength={100} />
        <path className="stream" d="M426 122 C431 150 421 184 426 222" pathLength={100} />
        <path className="stream-core" d="M423 128 C428 152 418 182 423 214" pathLength={100} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={426} cy={128} r={7 - i * 0.7} className="blob" style={vars({ '--i': i, '--dx': `${(i % 2 ? 1 : -1) * (4 + i * 2)}px` })} />
        ))}
      </g>

      <g className="bin bin-front">
        <path className="bin-rim" d="M376 214 A50 12 0 0 0 476 214" />
        <g className="bin-splash">
          {[[-24, 30, 0], [-8, 42, 1], [10, 36, 2], [26, 26, 3], [-16, 20, 4]].map(([dx, h, i]) => (
            <circle key={i} cx={426} cy={212} r="4.5" className="bin-drop" style={vars({ '--dx': `${dx}px`, '--h': `${h}px`, '--fall': '0px', '--i': i })} />
          ))}
        </g>
        <g className="bin-lid">
          <path className="bin-lid-dome" d="M373 212 Q426 174 479 212 Z" />
          <ellipse className="bin-lid-rim" cx="426" cy="212" rx="53" ry="10" />
          <circle className="bin-knob" cx="426" cy="189" r="6" />
        </g>
        <g className="bin-puff">
          {[[-44, 0], [0, 1], [46, 2]].map(([dx, i]) => (
            <circle key={i} cx={426 + dx * 0.6} cy="208" r="13" style={vars({ '--dx': `${dx}px`, '--i': i })} />
          ))}
        </g>
      </g>
    </g>
  )
}

/* ---------- the strainer (a colander) and the seasoning bowl ---------- */

function StrainerArt({ splash }: { splash: number }) {
  return (
    <svg className="strainer-art" viewBox="0 0 240 150" aria-hidden="true">
      <path d="M22 52 L70 60" className="strainer-handle" />
      <path d="M62 50 Q66 128 140 132 Q214 128 218 50 Z" className="strainer-bowl" />
      {[[96, 78], [120, 84], [144, 86], [168, 84], [192, 78], [108, 102], [132, 108], [156, 108], [180, 102], [140, 124]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="strainer-hole" />
      ))}
      <ellipse cx="140" cy="50" rx="80" ry="16" className="strainer-rim" />
      <ellipse cx="140" cy="51" rx="70" ry="11" className="strainer-inside" />
      {[118, 140, 162].map((x, i) => (
        <circle key={x} cx={x} cy={138} r="3.2" className="drip" style={vars({ '--i': i })} />
      ))}
      {/* a landing shakes a shower through the holes */}
      {splash > 0 && (
        <g key={splash} className="drip-burst">
          {[[100, 90], [124, 110], [146, 128], [168, 110], [190, 90], [136, 132]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" style={vars({ '--i': i })} />
          ))}
        </g>
      )}
    </svg>
  )
}

function BowlArt({ splash }: { splash: number }) {
  return (
    <svg className="bowl-art" viewBox="0 0 200 120" aria-hidden="true">
      <path d="M18 44 Q24 110 100 112 Q176 110 182 44 Z" className="bowl-body" />
      <path d="M40 70 Q100 84 160 70" className="bowl-grain" />
      <path d="M52 92 Q100 102 148 92" className="bowl-grain" />
      <ellipse cx="100" cy="44" rx="82" ry="16" className="bowl-rim" />
      <ellipse cx="100" cy="46" rx="70" ry="10" className="bowl-inside" />
      {/* a pinch of it flies up and settles */}
      {splash > 0 && (
        <g key={splash} className="sprinkle-burst">
          {[[-58, 40], [-40, 58], [-22, 70], [-6, 52], [10, 76], [26, 60], [42, 66], [60, 44], [-30, 36], [34, 38]].map(([dx, h], i) => (
            <rect key={i} x="98" y="40" width="4" height="4" rx="1" className="speck" style={vars({ '--dx': `${dx}px`, '--h': `${h}px`, '--fall': '4px', '--i': i })} />
          ))}
        </g>
      )}
    </svg>
  )
}

/* ---------- a zone: the art, what it holds, the values that pop up, and its label ---------- */

type ZoneProps = {
  zone: Zone
  items: string[]
  pops: Pop[]
  hover: boolean
  armed: boolean
  hint: boolean
  color: string
  onPick: (keyboard: boolean) => void
  label: string
  what: string
  short?: string
  putIn: UI['putIn']
  artOf: (id: string) => string
  children: ReactNode
}

const ZoneBox = forwardRef<HTMLDivElement, ZoneProps>(function ZoneBox({ zone, items, pops, hover, armed, hint, color, onPick, label, what, short, putIn, artOf, children }, ref) {
  return (
    <div className={`zone zone-${zone}`} data-hover={hover} data-armed={armed} data-hint={hint} style={vars({ '--drop': color })}>
      <div ref={ref} className="zone-target">
        {children}
        <div className="zone-items" aria-hidden="true">
          {items.map((id, i) => (
            <img key={`${id}-${i}`} src={artOf(id)} alt="" className="floating" style={vars({ '--i': i, '--n': items.length })} draggable={false} />
          ))}
        </div>
        {pops.map((p) => (
          <span key={p.key} className="pop" aria-hidden="true">
            {p.text}
          </span>
        ))}
      </div>
      <button type="button" className="zone-label" onClick={(e) => onPick(e.detail === 0)} disabled={!armed} aria-label={putIn(label, what)}>
        <span className="zone-name">{label}</span>
        <span className="zone-hint">
          {short ? (
            <>
              <span className="hint-long">{what}</span>
              <span className="hint-short">{short}</span>
            </>
          ) : (
            what
          )}
        </span>
      </button>
    </div>
  )
})

export type ZoneRefs = Record<Zone, React.RefObject<HTMLDivElement | null>>

export function Station({
  placed,
  mood,
  soup,
  hover,
  armed,
  hint,
  splash,
  pops,
  refs,
  onPick,
  shake,
  dumping,
  fresh,
  labels,
  putIn,
  artOf,
}: {
  placed: Placed
  mood: Mood
  soup: string
  hover: Zone | null
  armed: boolean
  hint: Zone | null
  splash: Splash
  pops: Pop[]
  refs: ZoneRefs
  onPick: (zone: Zone, keyboard: boolean) => void
  shake: number
  dumping: boolean
  fresh: number
  labels: UI['zones']
  putIn: UI['putIn']
  artOf: (id: string) => string
}) {
  const root = useRef<HTMLDivElement>(null)
  const q = (s: string) => root.current?.querySelector(s)

  // something lands in the pot: it squashes, the soup sloshes and the flames jump
  useEffect(() => {
    if (!splash.pot.n) return
    play(q('.pot-bounce'), [{ transform: 'none' }, { transform: 'scale(1.04, 0.93)' }, { transform: 'scale(0.98, 1.03)' }, { transform: 'none' }], { duration: 460, easing: 'ease-out' })
    play(q('.surface'), [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.4)' }, { transform: 'scaleY(0.82)' }, { transform: 'scaleY(1.08)' }, { transform: 'scaleY(1)' }], { duration: 760, easing: 'ease-out' })
    root.current?.querySelectorAll('.zone-pot .flare').forEach((el) =>
      play(el, [{ transform: 'none' }, { transform: 'scale(1.12, 1.7)' }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }),
    )
  }, [splash.pot.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // the colander wobbles, the bowl bounces
  useEffect(() => {
    if (!splash.strainer.n) return
    play(q('.strainer-art'), [{ transform: 'none' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'none' }], { duration: 640, easing: 'ease-out' })
  }, [splash.strainer.n]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!splash.spices.n) return
    play(q('.bowl-art'), [{ transform: 'none' }, { transform: 'scale(1.08, 0.88)' }, { transform: 'scale(0.96, 1.05)' }, { transform: 'none' }], { duration: 520, easing: 'ease-out' })
  }, [splash.spices.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // the wrong thing went in: the pot rattles
  useEffect(() => {
    if (!shake) return
    play(
      q('.pot-bounce'),
      [
        { transform: 'none' },
        { transform: 'translateX(-2px) rotate(-1deg)' },
        { transform: 'translateX(5px) rotate(1.5deg)' },
        { transform: 'translateX(-8px) rotate(-2.5deg)' },
        { transform: 'translateX(8px) rotate(2.5deg)' },
        { transform: 'translateX(-6px) rotate(-2deg)' },
        { transform: 'translateX(3px) rotate(1deg)' },
        { transform: 'none' },
      ],
      { duration: 560, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' },
    )
  }, [shake]) // eslint-disable-line react-hooks/exhaustive-deps

  const heat = Math.min(5, placed.pot.length + placed.strainer.length + placed.spices.length)
  const zonePops = (z: Zone) => pops.filter((p) => p.zone === z)

  return (
    <div ref={root} className="station" data-mood={mood} data-dumping={dumping} style={vars({ '--soup': soup, '--heat': heat })}>
      <ZoneBox ref={refs.strainer} zone="strainer" items={placed.strainer} pops={zonePops('strainer')} color={splash.strainer.color} hover={hover === 'strainer'} armed={armed} hint={hint === 'strainer'} onPick={(kb) => onPick('strainer', kb)} label={labels.strainer.name} what={labels.strainer.what} putIn={putIn} artOf={artOf}>
        <StrainerArt splash={splash.strainer.n} />
        <span key={splash.strainer.n} className="zone-pulse" data-on={splash.strainer.n > 0} />
      </ZoneBox>
      <ZoneBox ref={refs.pot} zone="pot" items={placed.pot} pops={zonePops('pot')} color={splash.pot.color} hover={hover === 'pot'} armed={armed} hint={hint === 'pot'} onPick={(kb) => onPick('pot', kb)} label={labels.pot.name} what={labels.pot.what} short={labels.pot.short} putIn={putIn} artOf={artOf}>
        <BurnerArt />
        <div className="pot-shaker">
          <div className="pot-bounce">
            <PotArt mood={mood} splash={splash.pot.n} fresh={fresh} />
          </div>
        </div>
        <PotFx mood={mood} dumping={dumping} />
      </ZoneBox>
      <ZoneBox ref={refs.spices} zone="spices" items={placed.spices} pops={zonePops('spices')} color={splash.spices.color} hover={hover === 'spices'} armed={armed} hint={hint === 'spices'} onPick={(kb) => onPick('spices', kb)} label={labels.spices.name} what={labels.spices.what} putIn={putIn} artOf={artOf}>
        <BowlArt splash={splash.spices.n} />
        <span key={splash.spices.n} className="zone-pulse" data-on={splash.spices.n > 0} />
      </ZoneBox>
    </div>
  )
}
