import { useState, useRef, useEffect, useCallback } from 'react'
import {
  groundedAnswer, llmAnswer, getApiKey, setApiKey, getModel, setModel, DEFAULT_MODEL, serverTutorAvailable,
} from '../lib/tutor.js'

// Tiny, safe inline formatter: escapes HTML, then applies **bold**, *italic*, `code`.
function renderText(text) {
  return text.split('\n\n').map((para, i) => (
    <p key={i}>
      {para.split('\n').map((line, j) => (
        <span key={j}>
          {j > 0 && <br />}
          {formatInline(line)}
        </span>
      ))}
    </p>
  ))
}
function formatInline(line) {
  const nodes = []
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g
  let last = 0, m, k = 0
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) nodes.push(line.slice(last, m.index))
    if (m[2] !== undefined) nodes.push(<strong key={k++}>{m[2]}</strong>)
    else if (m[3] !== undefined) nodes.push(<em key={k++}>{m[3]}</em>)
    else if (m[4] !== undefined) nodes.push(<code key={k++}>{m[4]}</code>)
    last = m.index + m[0].length
  }
  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}

const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — fast & cheap' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — balanced' },
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — most capable' },
]

const WELCOME = {
  role: 'assistant',
  text: "Hi! I’m your AI-engineering **tutor**. Ask me to explain any concept, give an example, or clear up something confusing. If a lesson is open, you can just say *“explain this simpler.”*",
  suggestions: ['What is an embedding?', 'Explain RAG simply', 'Fine-tuning vs RAG?'],
  sources: [],
}

export default function Assistant({ currentConcept, onLoadConcept }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [keyDraft, setKeyDraft] = useState(getApiKey())
  const [modelDraft, setModelDraft] = useState(getModel())
  const [hasKey, setHasKey] = useState(!!getApiKey())
  const [serverKey, setServerKey] = useState(false)
  const claudeOn = hasKey || serverKey
  const scrollRef = useRef(null)

  useEffect(() => { serverTutorAvailable().then(setServerKey) }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  const push = (m) => setMessages((ms) => [...ms, m])

  const send = useCallback(async (raw) => {
    const q = (raw !== undefined ? raw : input).trim()
    if (!q || busy) return
    push({ role: 'user', text: q })
    setInput('')

    if (claudeOn) {
      setBusy(true)
      try {
        const a = await llmAnswer(q, currentConcept)
        push({ role: 'assistant', text: a.text, sources: a.sources, via: 'Claude' })
      } catch (e) {
        const g = groundedAnswer(q, currentConcept)
        const note = e && e.message && e.message !== 'no-key'
          ? `_(Claude couldn’t answer: ${e.message} — here’s the grounded lesson answer.)_\n\n`
          : ''
        push({ role: 'assistant', text: note + g.text, sources: g.sources, suggestions: g.suggestions })
      } finally {
        setBusy(false)
      }
    } else {
      const g = groundedAnswer(q, currentConcept)
      push({ role: 'assistant', text: g.text, sources: g.sources, suggestions: g.suggestions })
    }
  }, [input, busy, currentConcept, claudeOn])

  const saveSettings = () => {
    setApiKey(keyDraft.trim())
    setModel(modelDraft)
    setHasKey(!!keyDraft.trim())
    setShowSettings(false)
    push({
      role: 'assistant',
      text: keyDraft.trim()
        ? `Connected to **Claude** (${MODELS.find((m) => m.id === modelDraft)?.label || modelDraft}). I’ll now answer your questions generatively, grounded in the course. Your key is stored only in this browser.`
        : serverKey
          ? 'Cleared your personal key — using the **server’s** Claude connection.'
          : 'Cleared the API key — back to **grounded** mode (offline answers from the curriculum).',
    })
  }

  const goTo = (id) => { onLoadConcept(id); setOpen(true) }

  return (
    <>
      <button
        className={'assistant-fab' + (open ? ' hidden' : '')}
        onClick={() => setOpen(true)}
        aria-label="Open AI tutor"
      >
        <span className="assistant-fab-glyph">✦</span>
        <span className="assistant-fab-label">Ask AI</span>
      </button>

      <div className={'assistant-panel' + (open ? ' open' : '')} role="dialog" aria-label="AI tutor">
        <div className="assistant-head">
          <div className="assistant-title">
            <span className="assistant-orb" />
            <div>
              <div className="assistant-name">AI Tutor</div>
              <div className="assistant-mode">{claudeOn ? `Claude · ${getModel().replace('claude-', '')}` : 'Grounded · offline'}</div>
            </div>
          </div>
          <div className="assistant-head-btns">
            <button className="assistant-icon-btn" title="Settings" onClick={() => setShowSettings((s) => !s)}>⚙</button>
            <button className="assistant-icon-btn" title="Close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>

        {showSettings && (
          <div className="assistant-settings">
            <p className="assistant-settings-hint">
              Optional: add an <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Anthropic API key</a> to
              get free-form AI answers from Claude. Without it, the tutor still answers from the built-in curriculum. The key is stored only in your browser.
              {serverKey && ' This server already has a key configured, so you can leave this blank.'}
            </p>
            <input
              className="assistant-key-input"
              type="password"
              placeholder="sk-ant-… (leave blank for offline mode)"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
            />
            <select className="assistant-model-select" value={modelDraft} onChange={(e) => setModelDraft(e.target.value)}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <div className="assistant-settings-actions">
              <button className="assistant-save" onClick={saveSettings}>Save</button>
              {hasKey && <button className="assistant-clear" onClick={() => { setKeyDraft(''); setApiKey(''); setHasKey(false); setModel(DEFAULT_MODEL); }}>Remove key</button>}
            </div>
          </div>
        )}

        <div className="assistant-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={'msg msg-' + m.role}>
              <div className="msg-body">{renderText(m.text)}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="msg-sources">
                  {m.sources.map((s) => (
                    <button key={s.id} className="msg-source" onClick={() => goTo(s.id)}>
                      📖 {s.title} →
                    </button>
                  ))}
                </div>
              )}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="msg-suggestions">
                  {m.suggestions.map((s, j) => (
                    <button key={j} className="msg-suggestion" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="msg msg-assistant">
              <div className="msg-body msg-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        <form
          className="assistant-input-row"
          onSubmit={(e) => { e.preventDefault(); send() }}
        >
          <input
            className="assistant-input"
            placeholder={currentConcept ? `Ask about “${currentConcept.title}”…` : 'Ask about any concept…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button className="assistant-send" type="submit" disabled={busy || !input.trim()} aria-label="Send">➤</button>
        </form>
      </div>
    </>
  )
}
