// Shared plain-language helpers. They turn the existing lesson metadata into a
// consistent explanation for every concept without replacing the authored
// beginner, intermediate, and expert material.
function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function asSentence(value) {
  const clean = plainText(value)
  if (!clean) return ''
  return /[.!?]$/.test(clean) ? clean : `${clean}.`
}

function asClause(value) {
  const clean = plainText(value).replace(/[.!?]+$/, '')
  return clean ? clean.charAt(0).toLowerCase() + clean.slice(1) : ''
}

export function buildSimpleOverview(concept, definition) {
  const goals = concept?.apply || []
  const firstGoal = asClause(goals[0] || concept?.tag)
  return {
    meaning: asSentence(definition),
    importance: asSentence(`Understanding ${concept?.title} helps you ${firstGoal}`),
    outcome: asSentence(goals[1] || goals[0] || `Explain and apply ${concept?.title}`),
  }
}

export function buildSubtypeExplanation(subtype, concept) {
  return {
    meaning: asSentence(subtype?.desc),
    importance: `${subtype?.name} helps you make a deliberate choice when working with ${concept?.title}, instead of treating every situation the same way.`,
    decision: `${subtype?.name} is one option within ${concept?.title}. Compare its strengths, limits, and fit with the other approaches before using it.`,
    example: plainText(subtype?.example),
  }
}

export const LEVEL_DESCRIPTIONS = {
  beginner: 'Build a clear mental model with plain language and familiar examples.',
  intermediate: 'Learn the main approaches, trade-offs, and implementation workflow.',
  expert: 'Study production decisions, failure modes, measurement, and operating limits.',
}
