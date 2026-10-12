import { READINESS_WEIGHTS } from '../data/jobReadiness.js'

function matches(source, pattern) {
  try {
    return new RegExp(pattern, 'im').test(source)
  } catch {
    return false
  }
}

export function gradeCode(challenge, solution) {
  const source = String(solution || '').trim()
  if (source.length < 20) {
    return { score: 0, passed: false, checks: [], summary: 'Write a complete solution before running the hidden checks.' }
  }

  const checks = challenge.checks.map((check) => {
    const allPass = !check.all || check.all.every((pattern) => matches(source, pattern))
    const anyPass = !check.any || check.any.some((pattern) => matches(source, pattern))
    const nonePass = !check.none || check.none.every((pattern) => !matches(source, pattern))
    const passed = allPass && anyPass && nonePass
    return { label: check.label, points: check.points, passed }
  })
  const score = checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0)
  return {
    score,
    passed: score >= 70,
    checks,
    summary: score >= 70
      ? 'The solution satisfies the core contract. Explain its complexity and test edge cases aloud.'
      : 'The hidden contract found gaps. Use the failed checks as requirements, then revise the implementation.',
  }
}

export function gradeDesign(designCase, answers) {
  const sections = designCase.sections.map((section) => {
    const answer = String(answers?.[section.id] || '').trim()
    const keywordHits = section.keywords.filter((term) => answer.toLowerCase().includes(term.toLowerCase()))
    const keywordRatio = keywordHits.length / section.keywords.length
    const depthRatio = Math.min(1, answer.length / 220)
    const earned = Math.round(section.points * (keywordRatio * 0.65 + depthRatio * 0.35))
    return { id: section.id, label: section.label, points: section.points, earned, keywordHits, missing: section.keywords.filter((term) => !keywordHits.includes(term)) }
  })
  const score = sections.reduce((sum, section) => sum + section.earned, 0)
  return {
    score,
    passed: score >= 70,
    sections,
    summary: score >= 70
      ? 'The design covers the major decision areas. Practise presenting it in 10 minutes and defending the weakest trade-off.'
      : 'The design needs more explicit requirements, trade-offs, evidence, or failure handling before it is interview-ready.',
  }
}

export function gradeTroubleshooting(incident, selected, diagnosis) {
  const selectedSet = new Set((selected || []).map(Number))
  const correct = incident.options.map((option, index) => option[1] ? index : null).filter((index) => index !== null)
  const truePositives = correct.filter((index) => selectedSet.has(index)).length
  const falsePositives = [...selectedSet].filter((index) => !correct.includes(index)).length
  const actionScore = Math.max(0, Math.round(70 * ((truePositives - falsePositives * 0.75) / correct.length)))
  const lowerDiagnosis = String(diagnosis || '').toLowerCase()
  const termsFound = incident.diagnosisTerms.filter((term) => lowerDiagnosis.includes(term.toLowerCase()))
  const diagnosisScore = Math.round(30 * Math.min(1, (lowerDiagnosis.length / 180) * 0.35 + (termsFound.length / incident.diagnosisTerms.length) * 0.65))
  const score = Math.max(0, Math.min(100, actionScore + diagnosisScore))
  return {
    score,
    passed: score >= 70,
    selected: [...selectedSet],
    correct,
    termsFound,
    summary: score >= 70 ? incident.explanation : `Contain the incident first, verify the strongest signal, and avoid actions that hide evidence. ${incident.explanation}`,
  }
}

function validEvidenceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function gradeCapstone(capstone, submission) {
  const repositoryValid = validEvidenceUrl(submission?.repository)
  const criteria = capstone.criteria.map(([id, label, points]) => {
    const evidence = String(submission?.evidence?.[id] || '').trim()
    const checked = !!submission?.checked?.[id]
    const sufficient = checked && evidence.length >= 60
    return { id, label, points, earned: sufficient ? points : 0, sufficient, evidenceLength: evidence.length }
  })
  let score = criteria.reduce((sum, criterion) => sum + criterion.earned, 0)
  if (!repositoryValid) score = Math.min(score, 69)
  return {
    score,
    passed: score >= 75 && repositoryValid,
    repositoryValid,
    criteria,
    summary: !repositoryValid
      ? 'Add a valid repository or review URL. Evidence-based readiness requires something another engineer can inspect.'
      : score >= 75
        ? 'The submission has enough reviewable evidence for a portfolio checkpoint. Ask an engineer to challenge the claims and trade-offs.'
        : 'Several checked claims lack concrete evidence. Link tests, metrics, traces, diagrams, or runbook sections rather than describing intentions.',
  }
}

export function gradeInterviewAnswer(question, answer) {
  const text = String(answer || '').trim()
  const lower = text.toLowerCase()
  const hits = question.keywords.filter((term) => lower.includes(term.toLowerCase()))
  const coverage = hits.length / question.keywords.length
  const depth = Math.min(1, text.length / 420)
  const structureSignals = ['because', 'trade-off', 'first', 'then', 'result', 'measure'].filter((term) => lower.includes(term)).length
  const structure = Math.min(1, structureSignals / 3)
  const score = Math.round(coverage * 50 + depth * 30 + structure * 20)
  return {
    score,
    passed: score >= 70,
    hits,
    missing: question.keywords.filter((term) => !hits.includes(term)),
    summary: score >= 70
      ? 'Strong coverage. Now deliver it aloud with a clear opening, one trade-off, and a concise conclusion.'
      : 'Add concrete decisions, evidence, and trade-offs. Avoid listing terms without connecting them into a reasoned answer.',
  }
}

export function calculateReadiness(state, track) {
  const requirements = track.requirements
  const results = state.results || {}
  const countPassed = (category) => Object.values(results[category] || {}).filter((result) => result.passed).length
  const counts = {
    coding: countPassed('coding'),
    debugging: countPassed('debugging'),
    design: countPassed('design'),
    troubleshooting: countPassed('troubleshooting'),
    capstones: countPassed('capstones'),
    interviews: (state.interviewSessions || []).filter((session) => session.passed).length,
  }
  const categories = Object.keys(READINESS_WEIGHTS).map((id) => {
    const required = requirements[id]
    const complete = counts[id]
    const ratio = Math.min(1, complete / required)
    return { id, required, complete, ratio, weight: READINESS_WEIGHTS[id], earned: Math.round(READINESS_WEIGHTS[id] * ratio) }
  })
  const score = categories.reduce((sum, category) => sum + category.earned, 0)
  const band = score >= 85 ? 'Interview ready' : score >= 65 ? 'Portfolio ready' : score >= 35 ? 'Building evidence' : 'Foundation stage'
  return { score, band, counts, categories }
}

