// The AI tutor's brain. Two modes:
//   1. Grounded (default, offline) — retrieves the most relevant lesson content
//      and composes a helpful, citation-backed answer. Zero setup, no key.
//   2. Generative (optional) — free-text questions are answered by Claude
//      (Haiku 4.5) grounded in the same retrieved context. Uses either the
//      server's key (ANTHROPIC_API_KEY, attached by the /api/tutor proxy in
//      vite.config.js — never sent to the browser) or a personal key the
//      learner saves in this browser.
import { DOCS, searchConcepts, findGlossary, buildContext } from './searchIndex.js'

const KEY_STORE = 'ai_field_manual_anthropic_key'
const MODEL_STORE = 'ai_field_manual_tutor_model'
export const DEFAULT_MODEL = 'claude-haiku-4-5' // cheap + fast, good for a tutor

export function getApiKey() {
  // A personal key saved via the in-app settings (per browser). The project's
  // own key stays on the server — see serverTutorAvailable().
  try { const k = localStorage.getItem(KEY_STORE); if (k) return k } catch {}
  return ''
}
export function setApiKey(k) {
  try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE) } catch {}
}
export function getModel() {
  try { const m = localStorage.getItem(MODEL_STORE); if (m) return m } catch {}
  try { if (import.meta.env && import.meta.env.VITE_TUTOR_MODEL) return import.meta.env.VITE_TUTOR_MODEL } catch {}
  return DEFAULT_MODEL
}
export function setModel(m) {
  try { localStorage.setItem(MODEL_STORE, m || DEFAULT_MODEL) } catch {}
}

// Does the dev/preview server hold a key for the /api/tutor proxy?
let serverStatus = null
export function serverTutorAvailable() {
  if (!serverStatus) {
    serverStatus = fetch('./api/tutor/status')
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d) => !!d.enabled)
      .catch(() => false)
  }
  return serverStatus
}

const VAGUE = /\b(this|that|it|simpler|simple|again|more|explain|elaborate|example|confused|understand|mean|clarify)\b/

// ---- Grounded (offline) answer -------------------------------------------
export function groundedAnswer(query, current) {
  const q = query.trim()
  if (!q) return { text: "Ask me anything about the concepts — e.g. “what is RAG?” or “explain tokenization simply.”", sources: [], suggestions: [] }

  if (/^(hi|hey|hello|yo|sup)\b/i.test(q)) {
    return {
      text: "Hi! I’m your AI-engineering tutor. Ask me to explain any concept, give an example, or clarify something you’re stuck on. If a lesson is open, you can also just say “explain this simpler.”",
      sources: [],
      suggestions: ['What is an embedding?', 'Explain RAG simply', 'Difference between fine-tuning and RAG?'],
    }
  }

  // Direct glossary hit ("what does KV-cache mean?")
  const g = findGlossary(q)

  // Vague follow-up + an open lesson → answer about the current concept.
  let hits = searchConcepts(q, 3)
  if (current && (hits.length === 0 || (VAGUE.test(q.toLowerCase()) && q.split(/\s+/).length <= 5))) {
    const cur = DOCS.find((d) => d.id === current.id)
    if (cur) hits = [cur, ...hits.filter((h) => h.id !== cur.id)].slice(0, 3)
  }

  if (hits.length === 0 && !g) {
    return {
      text: "I couldn’t find that in the curriculum. Try naming a concept — like “attention,” “chunking,” “quantization,” or “agents.”",
      sources: [],
      suggestions: ['What is the transformer?', 'How does chunking work?', 'What is an AI agent?'],
    }
  }

  const top = hits[0]
  let text = ''
  if (g && (!top || g.conceptId)) {
    text += `**${g.term}** — ${g.def}\n\n`
  }
  if (top) {
    text += `Here’s the gist of **${top.title}**: ${top.definition}`
    if (top.tag) text += `\n\nIn one line: *${top.tag}.*`
    if (top.glossary && top.glossary.length) {
      text += `\n\nRelated terms you’ll meet: ${top.glossary.slice(0, 4).map((t) => t.term).join(', ')}.`
    }
    text += `\n\nOpen the full lesson below for the beginner → expert breakdown, examples, and practice.`
  }

  const sources = hits.slice(0, 3).map((d) => ({ id: d.id, title: d.title }))
  const suggestions = []
  if (top) {
    suggestions.push(`Give me an example of ${top.title.toLowerCase()}`)
    suggestions.push(`Why does ${top.title.toLowerCase()} matter?`)
    if (hits[1]) suggestions.push(`How is it different from ${hits[1].title.toLowerCase()}?`)
  }
  return { text, sources, suggestions }
}

// ---- Generative (Claude) answer ------------------------------------------
const SYSTEM = `You are a warm, encouraging tutor for people learning AI engineering.
Explain clearly and simply, in a few short paragraphs. Prefer everyday analogies.
Ground your answer in the provided COURSE CONTEXT when relevant; if the question is
outside it, still help briefly. Never invent APIs or fabricate specifics. Keep it concise.`

export async function llmAnswer(query, current, { signal } = {}) {
  const apiKey = getApiKey()
  if (!apiKey && !(await serverTutorAvailable())) throw new Error('no-key')
  const model = getModel()
  const context = buildContext(query, current)
  const userContent =
    (context ? `COURSE CONTEXT (for grounding):\n${context}\n\n` : '') +
    (current ? `The learner is currently viewing the lesson: "${current.title}".\n\n` : '') +
    `Question: ${query}`

  const body = JSON.stringify({
    model,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: 'user', content: userContent }],
  })
  // Personal key → call Anthropic directly from this browser.
  // Otherwise → the server proxy, which attaches the project key server-side.
  const res = apiKey
    ? await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body,
      })
    : await fetch('./api/tutor', { method: 'POST', signal, headers: { 'content-type': 'application/json' }, body })

  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch {}
    if (res.status === 401) throw new Error('Invalid API key. Check it in settings.')
    if (res.status === 429) throw new Error('Rate limited by the API — wait a moment and try again.')
    throw new Error(detail || `API error ${res.status}.`)
  }
  const data = await res.json()
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
  // Still surface relevant lessons to navigate to.
  const sources = searchConcepts(query, 3).map((d) => ({ id: d.id, title: d.title }))
  return { text: text || 'No answer.', sources }
}
