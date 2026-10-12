import { useMemo, useState } from 'react'
import { CAPSTONE_RUBRICS } from '../../data/jobReadiness.js'
import { gradeCapstone } from '../../lib/readinessGrader.js'

export default function CapstoneReview({ track, progress, onRecord }) {
  const capstones = useMemo(() => CAPSTONE_RUBRICS.filter((item) => item.roles.includes(track.id)), [track.id])
  const [selectedId, setSelectedId] = useState(capstones[0]?.id)
  const capstone = capstones.find((item) => item.id === selectedId) || capstones[0]
  const previous = progress?.[capstone?.id]
  const empty = { repository: '', demo: '', checked: {}, evidence: {} }
  const [submission, setSubmission] = useState(previous?.evidence?.submission || empty)
  const [result, setResult] = useState(previous || null)

  if (!capstone) return <p className="lab-empty">No capstone rubrics are assigned to this track.</p>

  const selectCapstone = (id) => {
    const saved = progress?.[id]
    setSelectedId(id)
    setSubmission(saved?.evidence?.submission || empty)
    setResult(saved || null)
  }

  const update = (field, value) => setSubmission((current) => ({ ...current, [field]: value }))
  const submit = () => {
    const graded = gradeCapstone(capstone, submission)
    setResult(graded)
    onRecord('capstones', capstone.id, graded, { submission })
  }

  return (
    <div className="lab-workspace">
      <aside className="lab-list">
        {capstones.map((item) => {
          const saved = progress?.[item.id]
          return (
            <button key={item.id} className={'lab-list-item' + (item.id === capstone.id ? ' active' : '')} onClick={() => selectCapstone(item.id)}>
              <span className="lab-list-title">{item.title}</span>
              <span className="lab-list-meta">evidence review {saved ? `· ${saved.score}%` : ''}</span>
              {saved?.passed && <span className="lab-pass-dot">✓</span>}
            </button>
          )
        })}
      </aside>
      <div className="lab-assessment">
        <div className="lab-assessment-head"><div><div className="lab-kicker">PORTFOLIO EVIDENCE</div><h2>{capstone.title}</h2></div></div>
        <p className="lab-brief">{capstone.brief}</p>
        <div className="lab-evidence-links">
          <label><span>Repository or review URL *</span><input value={submission.repository} onChange={(event) => update('repository', event.target.value)} placeholder="https://github.com/…" /></label>
          <label><span>Demo or deployment URL</span><input value={submission.demo} onChange={(event) => update('demo', event.target.value)} placeholder="https://…" /></label>
        </div>
        <p className="lab-note">A checked box earns points only when its evidence describes something another engineer can inspect: a file, test, metric, trace, diagram, report, or runbook section.</p>

        <div className="lab-rubric-list">
          {capstone.criteria.map(([id, label, points]) => {
            const criterionResult = result?.criteria?.find((entry) => entry.id === id)
            return (
              <div className={'lab-rubric-item' + (criterionResult?.sufficient ? ' verified' : '')} key={id}>
                <label className="lab-rubric-check">
                  <input
                    type="checkbox"
                    checked={!!submission.checked?.[id]}
                    onChange={(event) => setSubmission((current) => ({ ...current, checked: { ...current.checked, [id]: event.target.checked } }))}
                  />
                  <span>{label}</span><strong>{points} pts</strong>
                </label>
                <textarea
                  value={submission.evidence?.[id] || ''}
                  onChange={(event) => setSubmission((current) => ({ ...current, evidence: { ...current.evidence, [id]: event.target.value } }))}
                  placeholder="Point to exact evidence and summarize what it proves (minimum 60 characters)…"
                />
                {criterionResult && !criterionResult.sufficient && <span className="lab-warning">Checked criteria need at least 60 characters of concrete evidence.</span>}
              </div>
            )
          })}
        </div>
        <div className="lab-action-row"><button className="lab-btn primary" onClick={submit}>Grade portfolio evidence</button></div>
        {result && (
          <div className={'lab-result ' + (result.passed ? 'pass' : 'retry')}>
            <div className="lab-result-score">{result.score}% <span>{result.passed ? 'PORTFOLIO CHECKPOINT PASSED' : 'MORE EVIDENCE NEEDED'}</span></div>
            <p>{result.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

