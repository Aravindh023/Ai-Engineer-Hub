const DEFAULT_HOURS = {
  p0: { min: 3, max: 5 },
  p1: { min: 4, max: 7 },
  p2: { min: 3, max: 5 },
  p3: { min: 4, max: 7 },
  p4: { min: 4, max: 7 },
  p5: { min: 3, max: 5 },
  p6: { min: 4, max: 7 },
  p7: { min: 4, max: 8 },
  p8: { min: 3, max: 5 },
  p9: { min: 4, max: 7 },
  p10: { min: 2, max: 4 },
}

// Capstones stay in the learning path, but their build time is deliberately not
// estimated or included in the study roadmap. Project scope varies too much for
// one honest number, while lesson-study time can be estimated consistently.
export const PROJECT_CONCEPT_IDS = new Set([
  'foundations-capstone',
  'api-capstone',
  'rag-capstone',
  'agents-capstone',
  'evaluation-capstone',
  'deployment-capstone',
  'advanced-capstone',
  'product-capstone',
  'mlops-capstone',
  'career-capstone',
])

const DEEP_TOPICS = new Set([
  'transformer', 'finetuning', 'distributed-training', 'preference-optimization',
  'interpretability', 'efficient-long-context', 'privacy-preserving-ml',
  'cloud-kubernetes', 'inference-serving', 'security-prod',
])

export const STUDY_PACES = [
  { id: 'intensive', label: 'Full-time study', hoursPerWeek: 30, note: '5 focused days × 6 study hours' },
  { id: 'balanced', label: 'Consistent study', hoursPerWeek: 15, note: '5 focused days × 3 study hours' },
  { id: 'part-time', label: 'Part-time study', hoursPerWeek: 8, note: '4 focused sessions × 2 study hours' },
]

export function estimateStudyHours(phaseId, conceptId) {
  if (PROJECT_CONCEPT_IDS.has(conceptId)) return null
  const base = DEFAULT_HOURS[phaseId] || { min: 3, max: 6 }
  if (DEEP_TOPICS.has(conceptId)) return { min: base.min + 2, max: base.max + 3 }
  return { ...base }
}

export function isProjectConcept(conceptOrId) {
  const id = typeof conceptOrId === 'string' ? conceptOrId : conceptOrId?.id
  return PROJECT_CONCEPT_IDS.has(id)
}

export function sumStudyHours(concepts) {
  return concepts.reduce((total, concept) => ({
    min: total.min + (concept.studyHours?.min || 0),
    max: total.max + (concept.studyHours?.max || 0),
  }), { min: 0, max: 0 })
}

export function formatHourRange(range) {
  return `${range.min.toLocaleString('en-US')}–${range.max.toLocaleString('en-US')}h`
}

export function paceDuration(totalHours, hoursPerWeek) {
  const weeks = {
    min: Math.ceil(totalHours.min / hoursPerWeek),
    max: Math.ceil(totalHours.max / hoursPerWeek),
  }
  return {
    weeks,
    months: {
      min: Math.max(1, Math.ceil(weeks.min / 4.35)),
      max: Math.max(1, Math.ceil(weeks.max / 4.35)),
    },
  }
}
