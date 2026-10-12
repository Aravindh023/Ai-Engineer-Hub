// The extracted curriculum remains generated and immutable.  This layer adds
// hand-authored concepts without making `npm run extract` erase them.
import { PHASES as BASE_PHASES } from './content.js'
import { PREREQUISITE_CONCEPTS } from './prerequisites.js'
import { ADDITIONAL_PHASES, EXPANSION_CONCEPTS_BY_PHASE } from './expansions/index.js'
import { estimateStudyHours } from './studyPlan.js'

function insertExpansionConcepts(baseConcepts, additions = []) {
  const byAnchor = new Map()
  additions.forEach((entry) => {
    const anchor = entry.after ?? null
    if (!byAnchor.has(anchor)) byAnchor.set(anchor, [])
    byAnchor.get(anchor).push(entry.concept)
  })

  const result = []
  const inserted = new Set()
  const appendAfter = (anchor) => {
    for (const concept of byAnchor.get(anchor) || []) {
      if (inserted.has(concept.id)) throw new Error(`Duplicate/cyclic curriculum concept: ${concept.id}`)
      inserted.add(concept.id)
      result.push(concept)
      appendAfter(concept.id)
    }
  }

  appendAfter(null)
  baseConcepts.forEach((concept) => {
    result.push(concept)
    appendAfter(concept.id)
  })

  if (inserted.size !== additions.length) {
    const missing = additions.filter((entry) => !inserted.has(entry.concept.id)).map((entry) => entry.concept.id)
    throw new Error(`Unresolved curriculum anchors: ${missing.join(', ')}`)
  }
  return result
}

const EXPANDED_BASE_PHASES = BASE_PHASES.map((phase) => {
  const baseConcepts = phase.id === 'p0'
    ? [...PREREQUISITE_CONCEPTS, ...phase.concepts]
    : phase.concepts
  return {
    ...phase,
    concepts: insertExpansionConcepts(baseConcepts, EXPANSION_CONCEPTS_BY_PHASE[phase.id]),
  }
})

const NEW_PHASES = ADDITIONAL_PHASES.map((phase) => ({
  ...phase,
  concepts: insertExpansionConcepts([], EXPANSION_CONCEPTS_BY_PHASE[phase.id]),
}))

export const PHASES = [...EXPANDED_BASE_PHASES, ...NEW_PHASES].map((phase) => ({
  ...phase,
  concepts: phase.concepts.map((concept) => ({
    ...concept,
    studyHours: estimateStudyHours(phase.id, concept.id),
  })),
}))
