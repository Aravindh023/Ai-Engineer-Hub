import { useEffect, useMemo, useRef, useState } from 'react'
import { PHASES, FLAT } from '../data/model.js'

// A spotlight-style command palette (⌘K / Ctrl+K) — the creative replacement for
// the old nav tree. Search across every module and sub-module, arrow-key to
// navigate, Enter to jump, Esc to close.
export default function CommandPalette({ open, onClose, progress, lastConceptId, onLoadConcept, onOpenModule, onGoHome, onOpenJobLab }) {
  const { mastered } = progress
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef()

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [open])

  const query = q.trim().toLowerCase()

  const { sections, flat } = useMemo(() => {
    const sections = []
    const flat = []
    if (!query) {
      const quick = []
      if (lastConceptId) {
        const c = FLAT.find((x) => x.id === lastConceptId)
        if (c) quick.push({ type: 'concept', id: c.id, label: 'Continue: ' + c.title, sub: 'resume', action: () => onLoadConcept(c.id) })
      }
      quick.push({ type: 'home', id: 'home', label: 'Go to opening page', sub: 'home', action: onGoHome })
      quick.push({ type: 'lab', id: 'job-lab', label: 'Open Job Readiness Lab', sub: 'assessments', action: onOpenJobLab })
      const mods = PHASES.map((p) => ({ type: 'module', id: p.id, label: p.title, sub: 'Module ' + p.num, action: () => onOpenModule(p.id) }))
      sections.push({ title: 'Quick actions', items: quick })
      sections.push({ title: 'Modules', items: mods })
    } else {
      const mods = PHASES.filter((p) => p.title.toLowerCase().includes(query))
        .map((p) => ({ type: 'module', id: p.id, label: p.title, sub: 'Module ' + p.num, action: () => onOpenModule(p.id) }))
      const cons = FLAT.filter((c) => c.title.toLowerCase().includes(query) || (c.tag || '').toLowerCase().includes(query))
        .map((c) => ({ type: 'concept', id: c.id, label: c.title, sub: c.phaseTitle, done: !!mastered[c.id], action: () => onLoadConcept(c.id) }))
      if (mods.length) sections.push({ title: 'Modules', items: mods })
      if (cons.length) sections.push({ title: 'Sub-modules', items: cons })
    }
    sections.forEach((s) => s.items.forEach((it) => flat.push(it)))
    return { sections, flat }
  }, [query, lastConceptId, mastered, onLoadConcept, onOpenModule, onGoHome, onOpenJobLab])

  useEffect(() => { if (active > flat.length - 1) setActive(0) }, [flat.length, active])

  if (!open) return null

  const run = (item) => { if (item) { item.action(); onClose() } }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(flat[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  let idx = -1
  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()} onKeyDown={onKey} role="dialog" aria-label="Command palette">
        <div className="cmdk-input-row">
          <span className="cmdk-ico">⌕</span>
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search modules and sub-modules…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0) }}
          />
          <span className="cmdk-esc">esc</span>
        </div>
        <div className="cmdk-results">
          {flat.length === 0 && <div className="cmdk-empty">No matches for &ldquo;{q}&rdquo;.</div>}
          {sections.map((s, si) => (
            <div key={si} className="cmdk-section">
              <div className="cmdk-section-title">{s.title}</div>
              {s.items.map((item) => {
                idx++
                const myIdx = idx
                const isActive = myIdx === active
                const glyph = item.type === 'module' ? '▦' : item.type === 'home' ? '⌂' : item.type === 'lab' ? '◎' : item.done ? '✓' : '○'
                return (
                  <button
                    key={item.type + item.id + myIdx}
                    className={'cmdk-item' + (isActive ? ' active' : '')}
                    onMouseEnter={() => setActive(myIdx)}
                    onClick={() => run(item)}
                  >
                    <span className={'cmdk-badge cmdk-' + item.type}>{glyph}</span>
                    <span className="cmdk-label">{item.label}</span>
                    <span className="cmdk-sub">{item.sub}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-foot">
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </div>
  )
}
