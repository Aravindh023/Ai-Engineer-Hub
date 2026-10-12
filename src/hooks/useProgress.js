import { useState, useEffect, useCallback } from 'react'

// Single source of truth for learning progress, mirrored to localStorage so it
// survives reloads. Stores: which concepts are mastered, which phases are open
// in the sidebar, and the last concept viewed (for resume-on-open).
const STORE_KEY = 'ai_field_manual_react_v1'

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {} // corrupt / unavailable storage — start fresh
  }
}

export function useProgress() {
  const [state, setState] = useState(() => {
    const s = readStore()
    return {
      mastered: s.mastered || {},
      openPhases: s.openPhases || { p0: true },
      lastConceptId: s.lastConceptId || null,
    }
  })

  // Persist on every change; failures (private mode, quota) are non-fatal.
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      /* progress simply won't persist */
    }
  }, [state])

  const toggleMastered = useCallback((id) => {
    setState((s) => ({ ...s, mastered: { ...s.mastered, [id]: !s.mastered[id] } }))
  }, [])

  const togglePhase = useCallback((phaseId) => {
    setState((s) => ({ ...s, openPhases: { ...s.openPhases, [phaseId]: !s.openPhases[phaseId] } }))
  }, [])

  const openPhase = useCallback((phaseId) => {
    setState((s) => (s.openPhases[phaseId] ? s : { ...s, openPhases: { ...s.openPhases, [phaseId]: true } }))
  }, [])

  const setLastConcept = useCallback((id) => {
    setState((s) => (s.lastConceptId === id ? s : { ...s, lastConceptId: id }))
  }, [])

  const resetProgress = useCallback(() => {
    setState({ mastered: {}, openPhases: { p0: true }, lastConceptId: null })
    try {
      localStorage.removeItem(STORE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  return {
    mastered: state.mastered,
    openPhases: state.openPhases,
    lastConceptId: state.lastConceptId,
    toggleMastered,
    togglePhase,
    openPhase,
    setLastConcept,
    resetProgress,
  }
}
