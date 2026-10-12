// A lightweight retrieval index over the whole curriculum, used by the AI tutor
// to ground answers in the actual lesson content (definitions, bodies, deep
// levels, glossaries). No server needed — pure client-side keyword scoring.
import { FLAT } from '../data/model.js'
import { EXTRAS, BEGINNER } from '../data/catalog.js'
import { DEEP } from '../data/deep/index.js'

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const STOP = new Set('the a an of to in is are and or for with how what why when which that this it as on be do does can you your we our i me my'.split(' '))

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

// Build one document per concept, plus a flat glossary list.
export const DOCS = FLAT.map((c) => {
  const b = BEGINNER[c.id]
  const e = EXTRAS[c.id]
  const d = DEEP[c.id]
  const definition = (b && b.definition) || (e && e.definition) || ''
  const glossary = (d && d.glossary) || []
  const parts = [
    c.title, c.title, c.title, // weight the title
    c.tag, c.tag,
    c.phaseTitle,
    definition,
    stripHtml(b && b.body),
    e && e.subtypes ? e.subtypes.map((s) => s.name + ' ' + s.desc).join(' ') : '',
    d ? stripHtml(d.levels.beginner) : '',
    glossary.map((g) => g.term + ' ' + stripHtml(g.def)).join(' '),
  ]
  return {
    id: c.id,
    title: c.title,
    tag: c.tag,
    phaseId: c.phaseId,
    phaseTitle: c.phaseTitle,
    definition,
    glossary,
    hasDeep: !!d,
    tokens: tokenize(parts.join(' ')),
    titleTokens: new Set(tokenize(c.title + ' ' + c.tag)),
  }
})

export const GLOSSARY = []
DOCS.forEach((doc) => {
  doc.glossary.forEach((g) => {
    GLOSSARY.push({ term: g.term, def: stripHtml(g.def), conceptId: doc.id, conceptTitle: doc.title })
  })
})

// Score concepts against a free-text query; returns the best matches.
export function searchConcepts(query, k = 3) {
  const qt = tokenize(query)
  if (qt.length === 0) return []
  const scored = DOCS.map((doc) => {
    let score = 0
    const freq = {}
    doc.tokens.forEach((t) => { freq[t] = (freq[t] || 0) + 1 })
    qt.forEach((q) => {
      if (freq[q]) score += Math.min(freq[q], 4)
      if (doc.titleTokens.has(q)) score += 6 // strong boost for title/tag hits
    })
    return { doc, score }
  })
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k).map((s) => s.doc)
}

// Find a glossary term the query is clearly asking about.
export function findGlossary(query) {
  const q = query.toLowerCase()
  let best = null
  GLOSSARY.forEach((g) => {
    const term = g.term.toLowerCase()
    if (q.includes(term) && (!best || term.length > best.term.toLowerCase().length)) best = g
  })
  return best
}

// Compact grounding context string for the LLM path.
export function buildContext(query, current) {
  const hits = searchConcepts(query, 3)
  const docs = current && !hits.find((d) => d.id === current.id)
    ? [DOCS.find((d) => d.id === current.id), ...hits].filter(Boolean).slice(0, 3)
    : hits
  return docs
    .map((d) => `## ${d.title} (${d.phaseTitle})\n${d.definition}` +
      (d.glossary.length ? `\nKey terms: ${d.glossary.slice(0, 5).map((g) => g.term).join(', ')}` : ''))
    .join('\n\n')
}
