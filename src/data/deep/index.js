// Builds one deep lesson for every concept. Phases 0–1 and the expanded Python
// path have fully hand-authored lessons. Later phases combine their existing
// beginner copy, concept-specific advanced guidance, patterns, examples, and
// practice into the same three-level learning experience.
import { DEEP_P0 } from './p0.js'
import { DEEP_P1 } from './p1.js'
import { TOPIC_GUIDANCE } from './topic-guidance.js'
import { PHASES } from '../curriculum.js'
import { BEGINNER, EXTRAS } from '../catalog.js'
import { PREREQUISITE_DEEP } from '../prerequisites.js'
import { EXPANSION_DEEP } from '../expansions/index.js'

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function patternList(items) {
  if (!items.length) return ''
  return `<h3>Core approaches</h3><ul>${items.map((item) => (
    `<li><strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.desc)}` +
    (item.example ? `<br><code>${escapeHtml(item.example)}</code>` : '') +
    '</li>'
  )).join('')}</ul>`
}

function actionList(items) {
  if (!items.length) return ''
  return `<h3>Engineering workflow</h3><ol>${items.map((item) => (
    `<li>${item}</li>`
  )).join('')}</ol>`
}

function riskList(items) {
  if (!items.length) return ''
  return `<h3>Production review</h3><ul>${items.map((item) => (
    `<li>${item}</li>`
  )).join('')}</ul>`
}

function generatedLesson(concept) {
  const beginner = BEGINNER[concept.id]
  const extra = EXTRAS[concept.id]
  const guidance = TOPIC_GUIDANCE[concept.id]
  const patterns = extra?.subtypes || []
  const checks = concept.selfCheck || []

  return {
    levels: {
      beginner: beginner?.body || `<p>${escapeHtml(extra?.definition || concept.title)}</p>`,
      intermediate: `
        ${guidance?.intermediate || `<p>${escapeHtml(extra?.definition || '')}</p>`}
        ${patternList(patterns)}
        ${actionList(concept.apply || [])}`,
      expert: `
        ${guidance?.expert || '<p>Apply this topic with explicit contracts, measurement, failure handling, and operational limits.</p>'}
        ${riskList(concept.pitfalls || [])}`,
    },
    examples: patterns.slice(0, 3).map((item) => ({
      title: item.name,
      lang: 'example',
      code: item.example,
      note: escapeHtml(item.desc),
    })),
    glossary: patterns.map((item) => ({
      term: item.name,
      def: escapeHtml(item.desc),
    })),
    practice: checks.length > 0 ? checks : [
      {
        q: `Explain ${concept.title} in one sentence.`,
        a: escapeHtml(extra?.definition || beginner?.definition || concept.tag),
      },
      {
        q: `What should you verify before using ${concept.title} in production?`,
        a: 'Verify quality on representative data, define failure handling and limits, and instrument cost, latency, and correctness.',
      },
    ],
  }
}

const AUTHORED = { ...DEEP_P0, ...DEEP_P1, ...PREREQUISITE_DEEP, ...EXPANSION_DEEP }
const GENERATED = {}

PHASES.forEach((phase) => {
  phase.concepts.forEach((concept) => {
    if (!AUTHORED[concept.id]) GENERATED[concept.id] = generatedLesson(concept)
  })
})

export const DEEP = {
  ...GENERATED,
  ...AUTHORED,
}
