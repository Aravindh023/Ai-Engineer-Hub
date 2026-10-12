import { useCallback, useEffect, useState } from 'react'

export function useCountdown(minutes, resetKey) {
  const totalSeconds = Math.max(1, minutes) * 60
  const [startedAt, setStartedAt] = useState(null)
  const [remaining, setRemaining] = useState(totalSeconds)

  const reset = useCallback(() => {
    setStartedAt(null)
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => { reset() }, [resetKey, reset])

  useEffect(() => {
    if (!startedAt || remaining <= 0) return undefined
    const update = () => setRemaining(Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000)))
    const timer = window.setInterval(update, 500)
    update()
    return () => window.clearInterval(timer)
  }, [startedAt, remaining, totalSeconds])

  const start = useCallback(() => {
    setStartedAt(Date.now())
    setRemaining(totalSeconds)
  }, [totalSeconds])

  const stop = useCallback(() => setStartedAt(null), [])
  return {
    running: !!startedAt && remaining > 0,
    expired: remaining === 0,
    remaining,
    elapsed: totalSeconds - remaining,
    start,
    stop,
    reset,
  }
}

export function formatClock(seconds) {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

