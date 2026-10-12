import { useState, useEffect } from 'react'
import SectionIntro from './SectionIntro.jsx'
import { LEVEL_DESCRIPTIONS } from '../data/clarity.js'

const LEVELS = [
  { key: 'beginner', label: 'Beginner', tag: 'start here' },
  { key: 'intermediate', label: 'Intermediate', tag: 'go deeper' },
  { key: 'expert', label: 'Expert', tag: 'production-grade' },
]

// Renders the deep, multi-level lesson for a concept: three depth levels you can
// switch between, plus worked examples with code, a mini-glossary, and practice.
export default function DeepContent({ data }) {
  const [level, setLevel] = useState('beginner')

  // Restart at the beginner level whenever we move to a different concept.
  useEffect(() => {
    setLevel('beginner')
  }, [data])

  if (!data) return null
  const levels = data.levels || {}
  const activeHtml = levels[level] || levels.beginner

  return (
    <div className="deep">
      <SectionIntro title="Learn it — beginner to expert">
        Start with the simple mental model, move into implementation choices, and finish with production-level trade-offs.
      </SectionIntro>

      <div className="level-tabs" role="tablist">
        {LEVELS.filter((l) => levels[l.key]).map((l) => (
          <button
            key={l.key}
            role="tab"
            aria-selected={level === l.key}
            className={'level-tab' + (level === l.key ? ' active' : '')}
            onClick={() => setLevel(l.key)}
          >
            <span className="level-tab-name">{l.label}</span>
            <span className="level-tab-tag">{l.tag}</span>
          </button>
        ))}
      </div>

      <div className="level-guide">
        <span className="explanation-label">Current focus</span>
        <p>{LEVEL_DESCRIPTIONS[level]}</p>
      </div>
      <div className="level-body body-text" dangerouslySetInnerHTML={{ __html: activeHtml }} />

      {data.examples?.length > 0 && (
        <>
          <SectionIntro title="Worked examples">
            Trace each example from its input or situation to the result, then change one detail and predict what should happen.
          </SectionIntro>
          {data.examples.map((ex, i) => (
            <div key={i} className="example">
              <div className="example-head">
                <span className="example-title">{ex.title}</span>
                {ex.lang && <span className="example-lang">{ex.lang}</span>}
              </div>
              {ex.code && (
                <pre>
                  <code>{ex.code}</code>
                </pre>
              )}
              {ex.note && (
                <p className="example-note" dangerouslySetInnerHTML={{ __html: ex.note }} />
              )}
            </div>
          ))}
        </>
      )}

      {data.deepDives?.length > 0 &&
        data.deepDives.map((d, i) => (
          <div key={i}>
            <SectionIntro title={d.title}>
              Explore this focused extension after the core explanation is clear.
            </SectionIntro>
            <div className="body-text" dangerouslySetInnerHTML={{ __html: d.html }} />
          </div>
        ))}

      {data.glossary?.length > 0 && (
        <>
          <SectionIntro title="Key terms">
            Learn these words well enough to recognise them, explain them plainly, and use them in a technical discussion.
          </SectionIntro>
          <dl className="glossary">
            {data.glossary.map((g, i) => (
              <div key={i} className="glossary-item">
                <dt className="glossary-term">{g.term}</dt>
                <dd className="glossary-def" dangerouslySetInnerHTML={{ __html: g.def }} />
              </div>
            ))}
          </dl>
        </>
      )}

      {data.practice?.length > 0 && (
        <>
          <SectionIntro title="Practice & recall">
            Try each question without looking back. Open the answer to check your reasoning, not just the final wording.
          </SectionIntro>
          {data.practice.map((p, i) => (
            <PracticeItem key={i} q={p.q} a={p.a} />
          ))}
        </>
      )}
    </div>
  )
}

function PracticeItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'check-item' + (open ? ' open' : '')}>
      <button className="check-q" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span className="check-chev">›</span>
      </button>
      <div className="check-a" dangerouslySetInnerHTML={{ __html: a }} />
    </div>
  )
}
