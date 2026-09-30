// Kitchen sounds, synthesised with Web Audio (no audio files): a whoosh, a splash, a sprinkle, a bell,
// a sour squelch for spoiled soup, and the whole dump: lid, glugs, bangs, slam, fresh broth.
// Only ever played in answer to the visitor.

let ctx: AudioContext | null = null
let on = true

const audio = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const setSound = (value: boolean) => void (on = value)
export const soundOn = () => on

function tone(freq: number, dur: number, type: OscillatorType, gain: number, glide?: number, delay = 0) {
  if (!on) return
  const a = audio()
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur: number, gain: number, freq: number, delay = 0, freqTo?: number) {
  if (!on) return
  const a = audio()
  const t = a.currentTime + delay
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
  const d = buffer.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = a.createBufferSource()
  src.buffer = buffer
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.setValueAtTime(freq, t)
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur)
  const g = a.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
}

export const sfx = {
  pick: () => tone(520, 0.08, 'triangle', 0.08, 700),
  whoosh: () => noise(0.32, 0.1, 500, 0, 2400),
  plop: () => {
    tone(420, 0.18, 'sine', 0.24, 120)
    noise(0.34, 0.2, 1100, 0.02, 500)
    noise(0.22, 0.08, 3400, 0.05)
    tone(900, 0.06, 'sine', 0.06, 1400, 0.16)
  },
  sprinkle: () => {
    for (let i = 0; i < 5; i++) noise(0.04, 0.12, 5200, i * 0.045)
  },
  drip: () => {
    tone(900, 0.07, 'sine', 0.12, 1500)
    tone(760, 0.07, 'sine', 0.1, 1300, 0.09)
  },
  spoil: () => {
    tone(180, 0.5, 'sawtooth', 0.12, 70)
    noise(0.5, 0.12, 300, 0.05)
  },
  bell: () => {
    tone(1318, 1.1, 'sine', 0.18)
    tone(1975, 0.8, 'sine', 0.07, undefined, 0.01)
  },
  /** Timed to the 2.2 s dump in the CSS: lift, lid, glugs, two bangs, the pot lands, the lid slams. */
  dump: () => {
    noise(0.3, 0.07, 500, 0, 1500)
    tone(620, 0.07, 'square', 0.04, 420, 0.5)
    tone(480, 0.12, 'triangle', 0.08, undefined, 0.53)
    for (let i = 0; i < 6; i++) {
      tone(i % 2 ? 150 : 190, 0.13, 'sine', 0.2, 80, 0.74 + i * 0.095)
      noise(0.12, 0.1, 480, 0.74 + i * 0.095)
    }
    for (const t of [1.0, 1.15]) {
      tone(200, 0.14, 'triangle', 0.22, 130, t)
      noise(0.07, 0.2, 2600, t)
    }
    tone(130, 0.14, 'triangle', 0.24, 90, 1.58)
    tone(640, 0.4, 'triangle', 0.1, 580, 1.67)
    tone(960, 0.3, 'sine', 0.05, undefined, 1.67)
    noise(0.12, 0.28, 1900, 1.67)
  },
  refill: () => {
    noise(0.55, 0.07, 800, 0, 1300)
    tone(1568, 0.35, 'sine', 0.05, undefined, 0.45)
  },
  stir: () => noise(0.6, 0.08, 1400),
}
