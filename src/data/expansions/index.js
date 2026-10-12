// Comprehensive curriculum additions for Modules 01–07.  Each phase file uses
// one lesson schema; this module projects it into the shapes consumed by the
// roadmap, beginner layer, subtype explorer, and deep-content renderer.
import { EXPANSION_P0 } from './p0.js'
import { EXPANSION_P1 } from './p1.js'
import { EXPANSION_P2 } from './p2.js'
import { EXPANSION_P3 } from './p3.js'
import { EXPANSION_P4 } from './p4.js'
import { EXPANSION_P5 } from './p5.js'
import { EXPANSION_P6 } from './p6.js'
import { EXPANSION_P7 } from './p7.js'
import { EXPANSION_P8 } from './p8.js'
import { EXPANSION_P9 } from './p9.js'
import { EXPANSION_P10 } from './p10.js'

export const ADDITIONAL_PHASES = [
  { id: 'p8', num: '08', title: 'AI Product & Human-Centred Design' },
  { id: 'p9', num: '09', title: 'ML Platforms & MLOps' },
  { id: 'p10', num: '10', title: 'Professional Mastery & Career' },
]

export const EXPANSION_LESSONS = [
  ...EXPANSION_P0,
  ...EXPANSION_P1,
  ...EXPANSION_P2,
  ...EXPANSION_P3,
  ...EXPANSION_P4,
  ...EXPANSION_P5,
  ...EXPANSION_P6,
  ...EXPANSION_P7,
  ...EXPANSION_P8,
  ...EXPANSION_P9,
  ...EXPANSION_P10,
]

export const EXPANSION_CONCEPTS_BY_PHASE = {}
export const EXPANSION_BEGINNER = {}
export const EXPANSION_EXTRAS = {}
export const EXPANSION_DEEP = {}

for (const lesson of EXPANSION_LESSONS) {
  const concept = {
    id: lesson.id,
    title: lesson.title,
    tag: lesson.tag,
    body: lesson.levels.intermediate,
    pitfalls: lesson.pitfalls,
    apply: lesson.apply,
    selfCheck: lesson.practice,
    resources: lesson.resources || [],
  }

  if (!EXPANSION_CONCEPTS_BY_PHASE[lesson.phaseId]) {
    EXPANSION_CONCEPTS_BY_PHASE[lesson.phaseId] = []
  }
  EXPANSION_CONCEPTS_BY_PHASE[lesson.phaseId].push({
    after: lesson.after ?? null,
    concept,
  })

  EXPANSION_BEGINNER[lesson.id] = {
    definition: lesson.definition,
    body: lesson.levels.beginner,
  }

  EXPANSION_EXTRAS[lesson.id] = {
    definition: lesson.definition,
    subtypes: lesson.patterns,
  }

  EXPANSION_DEEP[lesson.id] = {
    levels: lesson.levels,
    examples: lesson.examples || lesson.patterns.slice(0, 3).map((pattern) => ({
      title: pattern.name,
      lang: 'example',
      code: pattern.example,
      note: pattern.desc,
    })),
    glossary: lesson.glossary || lesson.patterns.map((pattern) => ({
      term: pattern.name,
      def: pattern.desc,
    })),
    practice: lesson.practice,
  }
}
