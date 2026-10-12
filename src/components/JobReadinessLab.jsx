import { useMemo, useState } from 'react'
import { LAB_SECTIONS, ROLE_TRACKS } from '../data/jobReadiness.js'
import { calculateReadiness } from '../lib/readinessGrader.js'
import { useReadinessProgress } from '../hooks/useReadinessProgress.js'
import CodePractice from './readiness/CodePractice.jsx'
import DesignPractice from './readiness/DesignPractice.jsx'
import IncidentPractice from './readiness/IncidentPractice.jsx'
import CapstoneReview from './readiness/CapstoneReview.jsx'
import MockInterview from './readiness/MockInterview.jsx'

const CATEGORY_COPY = {
  coding: ['Coding & DSA', 'Solve Python, SQL, ML-metric, heap, cache, graph, and streaming problems against explicit contracts.'],
  debugging: ['Timed debugging', 'Repair concurrency, retry, security, and evaluation defects under a short interview clock.'],
  design: ['AI system design', 'Turn ambiguous requirements into architectures with measurable quality, safety, reliability, and cost.'],
  troubleshooting: ['Production incidents', 'Contain failures, identify the strongest evidence, diagnose the cause, and prevent recurrence.'],
  capstones: ['Capstone evidence', 'Prove project claims with inspectable code, tests, metrics, traces, diagrams, and operational documents.'],
  interviews: ['Mock interviews', 'Practise concise theory, design, debugging, project, and behavioural answers under time pressure.'],
}

export default function JobReadinessLab({ onBack, courseMastered = 0, courseTotal = 0 }) {
  const readiness = useReadinessProgress()
  const [active, setActive] = useState('overview')
  const track = ROLE_TRACKS.find((item) => item.id === readiness.state.trackId) || ROLE_TRACKS[0]
  const report = useMemo(() => calculateReadiness(readiness.state, track), [readiness.state, track])
  const coursePct = courseTotal ? Math.round((courseMastered / courseTotal) * 100) : 0

  return (
    <div className="job-lab">
      <button className="roadmap-back" onClick={onBack}>← learning modules</button>

      <header className="lab-hero">
        <div>
          <p className="home-kicker">◇ EVIDENCE-BASED JOB READINESS</p>
          <h1>Job Readiness Lab</h1>
          <p>Lessons teach the concepts. This lab tests whether you can code, debug, design, diagnose, present, and defend production AI work without relying on a completion checkbox.</p>
        </div>
        <div className="lab-score-card">
          <div className="lab-score-ring" style={{ '--score': `${report.score * 3.6}deg` }}><strong>{report.score}</strong><span>/100</span></div>
          <div><strong>{report.band}</strong><span>{track.title}</span><small>Course study: {coursePct}% · readiness is scored separately</small></div>
        </div>
      </header>

      <section className="lab-track-section">
        <div className="lab-section-heading"><div><span>Target role</span><h2>Choose the interview you are preparing for</h2></div><p>The same activity can matter differently by role. Requirements and question selection update when the track changes.</p></div>
        <div className="lab-track-grid">
          {ROLE_TRACKS.map((item) => (
            <button key={item.id} className={'lab-track-card' + (item.id === track.id ? ' active' : '')} onClick={() => readiness.setTrack(item.id)}>
              <span className="lab-track-check">{item.id === track.id ? '✓' : '○'}</span>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <small>{item.focus.join(' · ')}</small>
            </button>
          ))}
        </div>
      </section>

      <nav className="lab-tabs" aria-label="Job readiness sections">
        {LAB_SECTIONS.map((section) => (
          <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => { setActive(section.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span>{section.label}</span>
            {section.id !== 'overview' && <small>{report.counts[section.id] || 0}/{track.requirements[section.id]}</small>}
          </button>
        ))}
      </nav>

      <section className="lab-content">
        {active === 'overview' && <ReadinessOverview report={report} track={track} onOpen={setActive} />}
        {active === 'coding' && <CodePractice key={`${track.id}-coding`} kind="coding" track={track} progress={readiness.state.results.coding} onRecord={readiness.recordResult} />}
        {active === 'debugging' && <CodePractice key={`${track.id}-debugging`} kind="debugging" track={track} progress={readiness.state.results.debugging} onRecord={readiness.recordResult} />}
        {active === 'design' && <DesignPractice key={track.id} track={track} progress={readiness.state.results.design} onRecord={readiness.recordResult} />}
        {active === 'troubleshooting' && <IncidentPractice key={track.id} track={track} progress={readiness.state.results.troubleshooting} onRecord={readiness.recordResult} />}
        {active === 'capstones' && <CapstoneReview key={track.id} track={track} progress={readiness.state.results.capstones} onRecord={readiness.recordResult} />}
        {active === 'interviews' && <MockInterview key={track.id} track={track} sessions={readiness.state.interviewSessions} onRecordSession={readiness.recordInterviewSession} />}
      </section>

      <div className="lab-reset-row">
        <span>Assessment evidence is stored only in this browser.</span>
        <button onClick={() => { if (window.confirm('Reset all Job Readiness Lab scores, submissions, and interview sessions?')) readiness.resetReadiness() }}>Reset readiness evidence</button>
      </div>
    </div>
  )
}

function ReadinessOverview({ report, track, onOpen }) {
  return (
    <div className="lab-overview">
      <div className="lab-section-heading"><div><span>Readiness gates</span><h2>Progress requires passed evidence</h2></div><p>A gate reaches 100% only after the track’s required number of assessments are passed. Repeated reading does not increase this score.</p></div>
      <div className="lab-gate-grid">
        {report.categories.map((category) => {
          const [title, description] = CATEGORY_COPY[category.id]
          return (
            <button key={category.id} className="lab-gate-card" onClick={() => onOpen(category.id)}>
              <div className="lab-gate-top"><strong>{title}</strong><span>{category.earned}/{category.weight} pts</span></div>
              <div className="lab-gate-bar"><span style={{ width: `${category.ratio * 100}%` }} /></div>
              <p>{description}</p>
              <small>{category.complete} passed · {category.required} required →</small>
            </button>
          )
        })}
      </div>

      <div className="lab-graduation">
        <div>
          <span className="lab-kicker">GRADUATION STANDARD</span>
          <h2>What “interview ready” means here</h2>
          <p>The score becomes interview-ready at 85, but the final judgment is still human: another engineer should be able to inspect your work and challenge your decisions.</p>
        </div>
        <ul>
          <li>Pass {track.requirements.coding} coding/DSA contracts and {track.requirements.debugging} timed debugging exercises.</li>
          <li>Pass {track.requirements.design} system designs and {track.requirements.troubleshooting} incident diagnoses.</li>
          <li>Submit {track.requirements.capstones} capstones with reviewable repositories and criterion-level evidence.</li>
          <li>Pass {track.requirements.interviews} complete 30-minute mock interviews.</li>
          <li>Present one project aloud, including a failure, measurable outcome, and decision you would reverse.</li>
        </ul>
      </div>
    </div>
  )
}
