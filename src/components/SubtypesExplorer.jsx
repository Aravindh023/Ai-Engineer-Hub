import { useState, useEffect } from 'react'
import { buildSubtypeExplanation } from '../data/clarity.js'

// Interactive tabbed explorer for a concept's sub-types. Each tab reveals the
// sub-type's description and a concrete worked example.
export default function SubtypesExplorer({ subtypes, concept }) {
  const [active, setActive] = useState(0)

  // Reset to the first tab whenever the concept (and thus its subtypes) changes.
  useEffect(() => {
    setActive(0)
  }, [subtypes])

  if (!subtypes || subtypes.length === 0) return null
  const cur = subtypes[active]
  const explanation = buildSubtypeExplanation(cur, concept)

  return (
    <div className="subtypes">
      <div className="subtypes-tabs" role="tablist">
        {subtypes.map((s, i) => (
          <button
            key={s.name}
            role="tab"
            aria-selected={i === active}
            className={'subtype-tab' + (i === active ? ' active' : '')}
            onClick={() => setActive(i)}
          >
            <span className="subtype-tab-idx">{String(i + 1).padStart(2, '0')}</span>
            {s.name}
          </button>
        ))}
      </div>
      <div className="subtype-panel" role="tabpanel">
        <div className="subtype-name">{cur.name}</div>
        <div className="subtype-detail-grid">
          <div className="subtype-detail">
            <span className="explanation-label">What it means</span>
            <p className="subtype-desc">{explanation.meaning}</p>
          </div>
          <div className="subtype-detail">
            <span className="explanation-label">Why it matters here</span>
            <p className="subtype-desc">{explanation.importance}</p>
          </div>
          <div className="subtype-detail subtype-detail-wide">
            <span className="explanation-label">How to choose</span>
            <p className="subtype-desc">{explanation.decision}</p>
          </div>
        </div>
        <div className="subtype-example">
          <span className="subtype-example-label">Concrete example</span>
          <code>{explanation.example}</code>
        </div>
      </div>
    </div>
  )
}
