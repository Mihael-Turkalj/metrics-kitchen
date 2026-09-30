import { useCallback, useEffect, useState } from 'react'

// Stars per recipe, kept in this browser only. Wrapped in try/catch: storage may be blocked or full.
const KEY = 'metrics-kitchen:stars'

const read = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function useProgress() {
  const [stars, setStars] = useState<Record<string, number>>(read)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(stars))
    } catch {
      /* private mode: progress lasts for this visit only */
    }
  }, [stars])
  const award = useCallback((id: string, n: number) => setStars((s) => ({ ...s, [id]: Math.max(s[id] ?? 0, n) })), [])
  return { stars, award }
}

function useMedia(q: string) {
  const [on, setOn] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const change = () => setOn(mq.matches)
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [q])
  return on
}

export const usePrefersReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

// A finger, not a mouse: cards are tapped, not dragged, so a swipe over the pantry still scrolls the page.
export const useTouchFirst = () => useMedia('(pointer: coarse)')
