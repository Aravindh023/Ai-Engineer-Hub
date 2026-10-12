import { useMemo, useState } from 'react'
import { CODE_CHALLENGES } from '../../data/jobReadiness.js'
import { gradeCode } from '../../lib/readinessGrader.js'
import { formatClock, useCountdown } from '../../hooks/useCountdown.js'

export default function CodePractice({ kind, track, progress, onRecord }) {
  const challenges = useMemo(
    () => CODE_CHALLENGES.filter((challenge) => challenge.kind === kind && challenge.roles.includes(track.id)),
    [kind, track.id]
  )
  const [selectedId, setSelectedId] = useState(challenges[0]?.id)
  const challenge = challenges.find((item) => item.id === selectedId) || challenges[0]
  const previous = progress?.[challenge?.id]
  const [solution, setSolution] = useState(previous?.evidence?.solution || challenge?.starter || '')
  const [result, setResult] = useState(previous || null)
  const timer = useCountdown(challenge?.minutes || 30, challenge?.id)

  if (!challenge) return <p className="lab-empty">No exercises are assigned to this track yet.</p>

  const selectChallenge = (id) => {
    const next = challenges.find((item) => item.id === id)
    const saved = progress?.[id]
    setSelectedId(id)
    setSolution(saved?.evidence?.solution || next?.starter || '')
    setResult(saved || null)
  }

  const submit = () => {
    const graded = gradeCode(challenge, solution)
    timer.stop()
    setResult(graded)
    onRecord(kind, challenge.id, graded, { solution, secondsUsed: timer.elapsed })
  }

  return (
    <div className="lab-workspace">
      <AssessmentList
        items={challenges}
        selectedId={challenge.id}
        results={progress}
        onSelect={selectChallenge}
      />
      <div className="lab-assessment">
        <div className="lab-assessment-head">
          <div>
            <div className="lab-kicker">{challenge.language} · {challenge.difficulty} · hidden contract checks</div>
            <h2>{challenge.title}</h2>
          </div>
          <div className={'lab-timer' + (timer.expired ? ' expired' : '')}>{formatClock(timer.remaining)}</div>
        </div>
        <p className="lab-brief">{challenge.brief}</p>

        <div className="lab-toolbar">
          <button className="lab-btn secondary" onClick={timer.start}>{timer.running ? 'Restart timer' : 'Start timed attempt'}</button>
          <span>{challenge.minutes} minutes recommended</span>
          {previous && <span>Best: {previous.score}% · {previous.attempts || 1} attempt(s)</span>}
        </div>

        <div className="lab-two-col">
          <div>
            <h3 className="lab-subhead">Visible acceptance tests</h3>
            <ul className="lab-checklist plain">
              {challenge.visibleTests.map((test) => <li key={test}>✓ {test}</li>)}
            </ul>
          </div>
          <details className="lab-hints">
            <summary>Hints</summary>
            <ul>{challenge.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>
          </details>
        </div>

        <label className="lab-field-label" htmlFor={`solution-${challenge.id}`}>Your {challenge.language.toUpperCase()} solution</label>
        <textarea
          id={`solution-${challenge.id}`}
          className="lab-code-editor"
          value={solution}
          onChange={(event) => setSolution(event.target.value)}
          spellCheck="false"
          disabled={timer.expired}
        />

        <div className="lab-action-row">
          <button className="lab-btn primary" onClick={submit}>Run hidden checks</button>
          <button className="lab-btn ghost" onClick={() => { setSolution(challenge.starter); setResult(null); timer.reset() }}>Reset starter</button>
          {timer.expired && <span className="lab-warning">Time expired. Submit the current solution for feedback.</span>}
        </div>

        {result && <ScoreResult result={result} />}
      </div>
    </div>
  )
}

function AssessmentList({ items, selectedId, results, onSelect }) {
  return (
    <aside className="lab-list" aria-label="Assessment list">
      {items.map((item) => {
        const saved = results?.[item.id]
        return (
          <button key={item.id} className={'lab-list-item' + (selectedId === item.id ? ' active' : '')} onClick={() => onSelect(item.id)}>
            <span className="lab-list-title">{item.title}</span>
            <span className="lab-list-meta">{item.difficulty} · {item.minutes}m {saved ? `· ${saved.score}%` : ''}</span>
            {saved?.passed && <span className="lab-pass-dot">✓</span>}
          </button>
        )
      })}
    </aside>
  )
}

function ScoreResult({ result }) {
  return (
    <div className={'lab-result ' + (result.passed ? 'pass' : 'retry')}>
      <div className="lab-result-score">{result.score}% <span>{result.passed ? 'PASS' : 'REVISE'}</span></div>
      <p>{result.summary}</p>
      <div className="lab-result-checks">
        {result.checks?.map((check) => (
          <div key={check.label} className={check.passed ? 'passed' : 'failed'}>
            <span>{check.passed ? '✓' : '○'}</span>
            <span>{check.label}</span>
            <span>{check.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

