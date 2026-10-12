import { useCallback, useEffect, useState } from 'react'

const STORE_KEY = 'ai_field_manual_job_readiness_v1'

const EMPTY_STATE = {
  trackId: 'applied-ai',
  results: { coding: {}, debugging: {}, design: {}, troubleshooting: {}, capstones: {} },
  interviewSessions: [],
}

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') return EMPTY_STATE
    return {
      ...EMPTY_STATE,
      ...parsed,
      results: { ...EMPTY_STATE.results, ...(parsed.results || {}) },
      interviewSessions: Array.isArray(parsed.interviewSessions) ? parsed.interviewSessions : [],
    }
  } catch {
    return EMPTY_STATE
  }
}

export function useReadinessProgress() {
  const [state, setState] = useState(readState)

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)) } catch { /* private mode or quota */ }
  }, [state])

  const setTrack = useCallback((trackId) => setState((current) => ({ ...current, trackId })), [])

  const recordResult = useCallback((category, id, result, evidence) => {
    setState((current) => {
      const previous = current.results?.[category]?.[id]
      const attempt = {
        ...result,
        evidence,
        attempts: (previous?.attempts || 0) + 1,
        completedAt: new Date().toISOString(),
      }
      const best = !previous || attempt.score >= previous.score ? attempt : { ...previous, attempts: attempt.attempts, lastScore: attempt.score }
      return {
        ...current,
        results: {
          ...current.results,
          [category]: { ...(current.results?.[category] || {}), [id]: best },
        },
      }
    })
  }, [])

  const recordInterviewSession = useCallback((session) => {
    setState((current) => ({
      ...current,
      interviewSessions: [...current.interviewSessions, { ...session, completedAt: new Date().toISOString() }].slice(-20),
    }))
  }, [])

  const resetReadiness = useCallback(() => {
    setState(EMPTY_STATE)
    try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
  }, [])

  return { state, setTrack, recordResult, recordInterviewSession, resetReadiness }
}

