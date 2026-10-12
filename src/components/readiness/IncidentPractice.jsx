import { useMemo, useState } from 'react'
import { TROUBLESHOOTING_CASES } from '../../data/jobReadiness.js'
import { gradeTroubleshooting } from '../../lib/readinessGrader.js'
import { formatClock, useCountdown } from '../../hooks/useCountdown.js'

export default function IncidentPractice({ track, progress, onRecord }) {
  const incidents = useMemo(() => TROUBLESHOOTING_CASES.filter((item) => item.roles.includes(track.id)), [track.id])
  const [selectedId, setSelectedId] = useState(incidents[0]?.id)
  const incident = incidents.find((item) => item.id === selectedId) || incidents[0]
  const previous = progress?.[incident?.id]
  const [selected, setSelected] = useState(previous?.evidence?.selected || [])
  const [diagnosis, setDiagnosis] = useState(previous?.evidence?.diagnosis || '')
  const [result, setResult] = useState(previous || null)
  const timer = useCountdown(incident?.minutes || 20, incident?.id)

  if (!incident) return <p className="lab-empty">No incident drills are assigned to this track.</p>

  const selectIncident = (id) => {
    const saved = progress?.[id]
    setSelectedId(id)
    setSelected(saved?.evidence?.selected || [])
    setDiagnosis(saved?.evidence?.diagnosis || '')
    setResult(saved || null)
  }

  const toggleOption = (index) => setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  const submit = () => {
    const graded = gradeTroubleshooting(incident, selected, diagnosis)
    timer.stop()
    setResult(graded)
    onRecord('troubleshooting', incident.id, graded, { selected, diagnosis, secondsUsed: timer.elapsed })
  }

  return (
    <div className="lab-workspace">
      <aside className="lab-list">
        {incidents.map((item) => {
          const saved = progress?.[item.id]
          return (
            <button key={item.id} className={'lab-list-item' + (item.id === incident.id ? ' active' : '')} onClick={() => selectIncident(item.id)}>
              <span className="lab-list-title">{item.title}</span>
              <span className="lab-list-meta">{item.severity} · {item.minutes}m {saved ? `· ${saved.score}%` : ''}</span>
              {saved?.passed && <span className="lab-pass-dot">✓</span>}
            </button>
          )
        })}
      </aside>
      <div className="lab-assessment">
        <div className="lab-assessment-head">
          <div><div className="lab-kicker">PRODUCTION INCIDENT · {incident.severity}</div><h2>{incident.title}</h2></div>
          <div className={'lab-timer' + (timer.expired ? ' expired' : '')}>{formatClock(timer.remaining)}</div>
        </div>
        <div className="lab-scenario"><strong>Observed signal</strong><p>{incident.signal}</p></div>
        <div className="lab-toolbar">
          <button className="lab-btn secondary" onClick={timer.start}>{timer.running ? 'Restart timer' : 'Start incident drill'}</button>
          <span>Select every action you would take. Unsafe actions reduce the score.</span>
        </div>

        <div className="lab-option-grid">
          {incident.options.map(([label], index) => (
            <label key={label} className={'lab-option' + (selected.includes(index) ? ' selected' : '')}>
              <input type="checkbox" checked={selected.includes(index)} onChange={() => toggleOption(index)} disabled={timer.expired} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <label className="lab-field-label" htmlFor={`diagnosis-${incident.id}`}>Diagnosis and reasoning</label>
        <textarea
          id={`diagnosis-${incident.id}`}
          className="lab-textarea"
          value={diagnosis}
          onChange={(event) => setDiagnosis(event.target.value)}
          placeholder="State the likely cause, immediate containment, evidence to inspect, corrective action, and regression prevention…"
          disabled={timer.expired}
        />
        <div className="lab-action-row"><button className="lab-btn primary" onClick={submit}>Submit incident response</button></div>
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

