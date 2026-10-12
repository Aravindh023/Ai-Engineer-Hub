import { useMemo, useState } from 'react'
import { SYSTEM_DESIGN_CASES } from '../../data/jobReadiness.js'
import { gradeDesign } from '../../lib/readinessGrader.js'
import { formatClock, useCountdown } from '../../hooks/useCountdown.js'

export default function DesignPractice({ track, progress, onRecord }) {
  const cases = useMemo(() => SYSTEM_DESIGN_CASES.filter((item) => item.roles.includes(track.id)), [track.id])
  const [selectedId, setSelectedId] = useState(cases[0]?.id)
  const current = cases.find((item) => item.id === selectedId) || cases[0]
  const previous = progress?.[current?.id]
  const [answers, setAnswers] = useState(previous?.evidence?.answers || {})
  const [result, setResult] = useState(previous || null)
  const timer = useCountdown(current?.minutes || 45, current?.id)

  if (!current) return <p className="lab-empty">No design cases are assigned to this track.</p>

  const selectCase = (id) => {
    const saved = progress?.[id]
    setSelectedId(id)
    setAnswers(saved?.evidence?.answers || {})
    setResult(saved || null)
  }

  const submit = () => {
    const graded = gradeDesign(current, answers)
    timer.stop()
    setResult(graded)
    onRecord('design', current.id, graded, { answers, secondsUsed: timer.elapsed })
  }

  return (
    <div className="lab-workspace">
      <aside className="lab-list">
        {cases.map((item) => {
          const saved = progress?.[item.id]
          return (
            <button key={item.id} className={'lab-list-item' + (item.id === current.id ? ' active' : '')} onClick={() => selectCase(item.id)}>
              <span className="lab-list-title">{item.title}</span>
              <span className="lab-list-meta">{item.difficulty} · {item.minutes}m {saved ? `· ${saved.score}%` : ''}</span>
              {saved?.passed && <span className="lab-pass-dot">✓</span>}
            </button>
          )
        })}
      </aside>
      <div className="lab-assessment">
        <div className="lab-assessment-head">
          <div><div className="lab-kicker">AI SYSTEM DESIGN · {current.difficulty}</div><h2>{current.title}</h2></div>
          <div className={'lab-timer' + (timer.expired ? ' expired' : '')}>{formatClock(timer.remaining)}</div>
        </div>
        <div className="lab-scenario"><strong>Scenario</strong><p>{current.scenario}</p></div>
        <div className="lab-toolbar">
          <button className="lab-btn secondary" onClick={timer.start}>{timer.running ? 'Restart timer' : 'Start design interview'}</button>
          <span>Clarify assumptions before proposing components.</span>
        </div>

        <div className="lab-design-sections">
          {current.sections.map((section) => {
            const sectionResult = result?.sections?.find((entry) => entry.id === section.id)
            return (
              <div className="lab-design-section" key={section.id}>
                <div className="lab-design-title"><span>{section.label}</span><span>{section.points} pts</span></div>
                <p>{section.prompt}</p>
                <textarea
                  value={answers[section.id] || ''}
                  onChange={(event) => setAnswers((value) => ({ ...value, [section.id]: event.target.value }))}
                  placeholder="State decisions, alternatives, trade-offs, measurements, and failure handling…"
                  disabled={timer.expired}
                />
                {sectionResult && (
                  <div className="lab-inline-feedback">
                    <span>{sectionResult.earned}/{sectionResult.points} points</span>
                    {sectionResult.missing.length > 0 && <span>Consider: {sectionResult.missing.join(', ')}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="lab-action-row">
          <button className="lab-btn primary" onClick={submit}>Score design evidence</button>
          <button className="lab-btn ghost" onClick={() => { setAnswers({}); setResult(null); timer.reset() }}>Clear attempt</button>
        </div>
        {result && (
          <div className={'lab-result ' + (result.passed ? 'pass' : 'retry')}>
            <div className="lab-result-score">{result.score}% <span>{result.passed ? 'PASS' : 'REVISE'}</span></div>
            <p>{result.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

