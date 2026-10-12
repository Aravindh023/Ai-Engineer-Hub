import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { phaseDoneCount } from '../data/model.js'
import { formatHourRange, sumStudyHours } from '../data/studyPlan.js'

const ROW = 98 // fallback vertical spacing between stations, px

// Remembers where the toy was per phase, so re-entering a roadmap after finishing
// a sub-module animates the toy from its old spot to the new one.
const lastToyIndex = {}

export default function Roadmap({ phase, progress, onLoadConcept, onBack }) {
  const { mastered } = progress
  const concepts = phase.concepts
  const n = concepts.length
  const done = phaseDoneCount(phase, mastered)
  const complete = done === n
  const phaseStudy = sumStudyHours(concepts)
  // The toy sits at the first not-yet-mastered sub-module, or the finish flag.
  const currentIndex = Math.min(done, n)

  const [toyIndex, setToyIndex] = useState(
    lastToyIndex[phase.id] !== undefined ? lastToyIndex[phase.id] : currentIndex
  )
  useEffect(() => {
    // Kick the toy to its true position just after mount so the CSS transition runs.
    const t = setTimeout(() => setToyIndex(currentIndex), 120)
    lastToyIndex[phase.id] = currentIndex
    return () => clearTimeout(t)
  }, [phase.id, currentIndex])

  // Stations flow naturally so wrapped titles (narrow screens, browser zoom)
  // push the next station down instead of overlapping it. The toy and the
  // filled spine are positioned from the measured station offsets.
  const trackRef = useRef(null)
  const [tops, setTops] = useState(null)
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const next = [...track.querySelectorAll(':scope > .station')].map((el) => el.offsetTop)
      setTops((prev) => (prev && prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [n])
  const topOf = (i) => (tops && tops[i] !== undefined ? tops[i] : i * ROW)

  return (
    <div className="roadmap">
      <button className="roadmap-back" onClick={onBack}>← all modules</button>

      <div className="roadmap-head">
        <span className="roadmap-num">MODULE {phase.num}</span>
        <h1 className="roadmap-title">{phase.title}</h1>
        <p className="roadmap-sub">
          {complete ? '✓ Module complete — nicely done!' : `${done} of ${n} sub-modules mastered`}
          {' · '}{formatHourRange(phaseStudy)} lesson study
        </p>
        <div className="module-card-bar" style={{ maxWidth: 320 }}>
          <div className="module-card-fill" style={{ width: Math.round((done / n) * 100) + '%' }} />
        </div>
      </div>

      <div className="roadmap-track" ref={trackRef}>
        <div className="roadmap-spine" />
        <div
          className="roadmap-fill"
          style={{ height: topOf(Math.min(currentIndex, n)) + 22 }}
        />

        {concepts.map((c, i) => {
          const isDone = !!mastered[c.id]
          const isCurrent = i === currentIndex
          const side = i % 2 === 0 ? 'left' : 'right'
          return (
            <div
              key={c.id}
              className={'station station-' + side + (isCurrent ? ' current' : '')}
            >
              <button
                className={'station-node' + (isDone ? ' done' : '') + (isCurrent ? ' current' : '')}
                onClick={() => onLoadConcept(c.id)}
                aria-label={c.title}
              >
                {isDone ? '✓' : i + 1}
              </button>
              <button className="station-card" onClick={() => onLoadConcept(c.id)}>
                <span className="station-index">SUB-MODULE {i + 1}</span>
                <span className="station-title">{c.title}</span>
                <span className="station-tag">{c.tag}</span>
                {c.studyHours && (
                  <span className="station-hours">{formatHourRange(c.studyHours)} study</span>
                )}
              </button>
            </div>
          )
        })}

        {/* finish flag */}
        <div className={'station station-finish' + (complete ? ' reached' : '')}>
          <div className="station-node finish">🏁</div>
          <div className="station-card finish-card">
            <span className="station-index">FINISH</span>
            <span className="station-title">{complete ? 'Module mastered!' : 'Complete all to unlock'}</span>
          </div>
        </div>

        {/* the traveling toy */}
        <div className="roadmap-toy" style={{ top: topOf(toyIndex) - 6 }}>
          <span className="toy-emoji">🤖</span>
          {!complete && <span className="toy-pill">you are here</span>}
        </div>
      </div>
    </div>
  )
}
