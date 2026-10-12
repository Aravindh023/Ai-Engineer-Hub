import { PHASES } from './curriculum.js'

// Flattened concept list (with phase metadata attached) + totals, plus the
// XP / rank system carried over from the original build.

export { PHASES }

export const FLAT = []
PHASES.forEach((ph) =>
  ph.concepts.forEach((c) =>
    FLAT.push({ ...c, phaseId: ph.id, phaseNum: ph.num, phaseTitle: ph.title })
  )
)
export const TOTAL = FLAT.length

export const RANKS = [
  { frac: 0, title: 'Curious beginner' },
  { frac: 0.12, title: 'Prompt tinkerer' },
  { frac: 0.28, title: 'RAG builder' },
  { frac: 0.46, title: 'Agent engineer' },
  { frac: 0.68, title: 'Systems architect' },
  { frac: 0.9, title: 'AI engineer, full stack' },
]

export function phaseDoneCount(phase, mastered) {
  return phase.concepts.filter((c) => mastered[c.id]).length
}

export function computeXP(mastered) {
  const masteredCount = Object.values(mastered).filter(Boolean).length
  let phaseBonus = 0
  PHASES.forEach((p) => {
    if (phaseDoneCount(p, mastered) === p.concepts.length) phaseBonus += 25
  })
  return masteredCount * 10 + phaseBonus
}

export function maxXP() {
  return TOTAL * 10 + PHASES.length * 25
}

export function currentRank(xp) {
  const max = maxXP()
  let cur = RANKS[0]
  RANKS.forEach((r) => {
    if (xp >= r.frac * max) cur = r
  })
  return cur
}

export function nextRankInfo(xp) {
  const max = maxXP()
  for (const r of RANKS) {
    if (xp < r.frac * max) return r
  }
  return null
}
