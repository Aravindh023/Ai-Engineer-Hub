import { PHASES, TOTAL, maxXP, nextRankInfo, phaseDoneCount } from '../data/model.js'
import { STUDY_PACES, formatHourRange, paceDuration, sumStudyHours } from '../data/studyPlan.js'

// The landing screen. Each module (phase) is a card you open to reveal its
// roadmap of sub-modules.
export default function OpeningPage({ progress, onOpenModule, onOpenJobLab, xp, pct, rank }) {
  const { mastered, resetProgress } = progress
  const nxt = nextRankInfo(xp)
  const max = maxXP()
  const masteredCount = Object.values(mastered).filter(Boolean).length
  const totalStudy = sumStudyHours(PHASES.flatMap((phase) => phase.concepts))
  const focusedDays = {
    min: Math.ceil(totalStudy.min / 6),
    max: Math.ceil(totalStudy.max / 6),
  }

  return (
    <div className="opening">
      <div className="opening-hero">
        <p className="home-kicker">◇ AI ENGINEER FIELD MANUAL</p>
        <h1 className="opening-h1">Become an AI Engineer.</h1>
        <p className="home-lead">
          A complete, interactive journey — from prerequisites to frontier topics.
          Open a module to reveal its roadmap, then travel through each sub-module.
          Your progress is saved, earns XP and a rank, and every finished module sets
          off the crackers.
        </p>

        <div className="opening-stats">
          <div className="opening-stat">
            <span className="opening-stat-num">{PHASES.length}</span>
            <span className="opening-stat-label">modules</span>
          </div>
          <div className="opening-stat">
            <span className="opening-stat-num">{TOTAL}</span>
            <span className="opening-stat-label">sub-modules</span>
          </div>
          <div className="opening-stat">
            <span className="opening-stat-num">{formatHourRange(totalStudy)}</span>
            <span className="opening-stat-label">lesson study only</span>
          </div>
          <div className="opening-stat">
            <span className="opening-stat-num">{xp}</span>
            <span className="opening-stat-label">XP · {rank.title}</span>
          </div>
          <div className="opening-stat opening-stat-grow">
            <div className="progress-track"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
            <span className="opening-stat-label">
              {masteredCount}/{TOTAL} mastered
              {nxt ? ` · ${Math.max(1, Math.ceil(nxt.frac * max - xp))} XP to ${nxt.title}` : ' · max rank!'}
            </span>
          </div>
        </div>
      </div>

      <button className="job-lab-cta" onClick={onOpenJobLab}>
        <span className="job-lab-cta-icon">◎</span>
        <span className="job-lab-cta-copy">
          <span className="job-lab-cta-kicker">JOB READINESS LAB</span>
          <strong>Prove that you can perform under interview conditions.</strong>
          <span>Autograded Python, SQL, ML and DSA · timed debugging · system design · production incidents · capstone evidence · mock interviews</span>
        </span>
        <span className="job-lab-cta-open">Open lab →</span>
      </button>

      <div className="section-label">Study timeframe — lessons only</div>
      <div className="study-plan-intro">
        Approximately {focusedDays.min}–{focusedDays.max} focused six-hour study days.
        These estimates cover curriculum study only; capstone and portfolio project time
        is intentionally excluded.
      </div>
      <div className="study-plan-grid">
        {STUDY_PACES.map((pace) => {
          const duration = paceDuration(totalStudy, pace.hoursPerWeek)
          return (
            <div className="study-plan-card" key={pace.id}>
              <span className="study-plan-name">{pace.label}</span>
              <span className="study-plan-duration">
                {duration.months.min}–{duration.months.max} months
              </span>
              <span className="study-plan-detail">
                {pace.hoursPerWeek}h/week · {duration.weeks.min}–{duration.weeks.max} weeks
              </span>
              <span className="study-plan-note">{pace.note}</span>
            </div>
          )
        })}
      </div>

      <div className="section-label">Modules — tap a card to open</div>
      <div className="module-grid">
        {PHASES.map((phase, i) => {
          const done = phaseDoneCount(phase, mastered)
          const total = phase.concepts.length
          const p = Math.round((done / total) * 100)
          const complete = done === total
          const started = done > 0
          const phaseStudy = sumStudyHours(phase.concepts)
          return (
            <button
              key={phase.id}
              className={'module-card' + (complete ? ' complete' : '')}
              style={{ animationDelay: i * 60 + 'ms' }}
              onClick={() => onOpenModule(phase.id)}
            >
              <div className="module-card-top">
                <span className="module-card-num">MODULE {phase.num}</span>
                <span className="module-card-status">
                  {complete ? '✓ complete' : started ? 'in progress' : 'not started'}
                </span>
              </div>
              <div className="module-card-title">{phase.title}</div>
              <div className="module-card-count">
                {total} sub-modules · {formatHourRange(phaseStudy)} study · {done} done
              </div>
              <div className="module-card-bar"><div className="module-card-fill" style={{ width: p + '%' }} /></div>
              <div className="module-card-open">Open roadmap →</div>
            </button>
          )
        })}
      </div>

      {masteredCount > 0 && (
        <div className="reset-row">
          <button
            className="reset-btn"
            onClick={() => {
              if (window.confirm('Reset all learning progress? This clears every mastered sub-module and your XP.')) resetProgress()
            }}
          >
            reset progress
          </button>
          <span className="reset-note">saved locally in this browser</span>
        </div>
      )}
    </div>
  )
}
