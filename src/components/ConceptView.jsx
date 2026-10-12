import { useEffect, useMemo, useState } from 'react'
import { FLAT, TOTAL } from '../data/model.js'
import { DIAGRAMS } from '../data/content.js'
import { EXTRAS, BEGINNER } from '../data/catalog.js'
import { DEEP } from '../data/deep/index.js'
import SubtypesExplorer from './SubtypesExplorer.jsx'
import DeepContent from './DeepContent.jsx'
import SectionIntro from './SectionIntro.jsx'
import Viz3D from '../three/Viz3D.jsx'
import { formatHourRange } from '../data/studyPlan.js'
import { buildSimpleOverview } from '../data/clarity.js'

// Flagship interactive 3D visualizers, mapped to the concepts they illuminate.
const VISUALIZERS = {
  embeddings: { kind: 'embeddings', label: 'meaning as space · similar words cluster · drag to rotate' },
  transformer: { kind: 'attention', label: 'self-attention · click a token to see what it attends to' },
}

// The original concept bodies embed the interactive-widget markup inline. When we
// show the beginner-friendly prose instead, we still want that widget — so pull
// just the .widget-box element out of the original body and render it after.
function extractWidgetHtml(body) {
  if (!body || !body.includes('widget-box')) return null
  if (typeof DOMParser === 'undefined') return null // SSR / non-browser guard
  const doc = new DOMParser().parseFromString(body, 'text/html')
  const w = doc.querySelector('.widget-box')
  return w ? w.outerHTML : null
}

export default function ConceptView({ concept: c, progress, onLoadConcept, onOpenModule }) {
  const { mastered, toggleMastered } = progress
  const idx = FLAT.findIndex((x) => x.id === c.id)
  const extra = EXTRAS[c.id]
  const beginner = BEGINNER[c.id]
  const deep = DEEP[c.id]

  // Prefer the beginner-friendly definition + body when available.
  const definition = beginner?.definition || extra?.definition
  const overview = buildSimpleOverview(c, definition)
  const useBeginnerBody = !!beginner?.body
  const bodyHtml = useBeginnerBody ? beginner.body : c.body
  const widgetHtml = useMemo(
    () => (useBeginnerBody ? extractWidgetHtml(c.body) : null),
    [c.body, useBeginnerBody]
  )

  // Bodies contain the original interactive-widget HTML with inline handlers
  // that resolve against window globals from legacy-widgets.js. After the body
  // is injected, run the concept's widget initializer if one exists.
  useEffect(() => {
    const init = window.WIDGET_INIT && window.WIDGET_INIT[c.id]
    if (init) {
      try {
        init()
      } catch {
        /* a widget failing must never break the lesson */
      }
    }
  }, [c.id])

  return (
    <>
      <div className="crumbs">
        <span className="content-num">{c.phaseNum}</span>
        <span className="sep">/</span>
        <button className="crumb-link" onClick={() => onOpenModule && onOpenModule(c.phaseId)}>
          {c.phaseTitle} roadmap
        </button>
        <span className="sep">·</span>
        <span>{idx + 1} of {TOTAL}</span>
      </div>
      <h1 className="concept-title">{c.title}</h1>
      <p className="concept-tag">{c.tag}</p>
      {c.studyHours && (
        <p className="concept-time">◷ {formatHourRange(c.studyHours)} estimated study time</p>
      )}

      {definition && (
        <div className="definition-box">
          <div className="definition-label">In simple terms</div>
          <div className="definition-detail-grid">
            <div className="definition-detail definition-detail-wide">
              <span className="explanation-label">What it means</span>
              <p className="definition-text">{overview.meaning}</p>
            </div>
            <div className="definition-detail">
              <span className="explanation-label">Why it matters</span>
              <p className="definition-text">{overview.importance}</p>
            </div>
            <div className="definition-detail">
              <span className="explanation-label">What you will practise</span>
              <p className="definition-text">{overview.outcome}</p>
            </div>
          </div>
        </div>
      )}

      {VISUALIZERS[c.id] && (
        <>
          <SectionIntro title="Explore the idea visually">
            Interact with the model to connect the abstract explanation to a shape, relationship, or flow you can inspect.
          </SectionIntro>
          <Viz3D kind={VISUALIZERS[c.id].kind} label={VISUALIZERS[c.id].label} height={340} />
        </>
      )}

      {extra?.subtypes?.length > 0 && (
        <>
          <SectionIntro title="Sub-types & examples">
            Compare the main forms of this concept. Open each option to learn what it means, why it matters, how to choose it, and what it looks like in practice.
          </SectionIntro>
          <SubtypesExplorer subtypes={extra.subtypes} concept={c} />
        </>
      )}

      {c.diagram && DIAGRAMS[c.diagram] && (
        <>
          <SectionIntro title="How the pieces connect">
            Use this diagram to see the order of the main parts and how information moves between them.
          </SectionIntro>
          <div
            className="diagram-box"
            dangerouslySetInnerHTML={{ __html: DIAGRAMS[c.diagram] }}
          />
        </>
      )}

      {deep ? (
        <>
          {widgetHtml && (
            <>
              <SectionIntro title="Try it — interactive">
                Change the inputs and observe the output. Use the result to test the mental model from the explanation above.
              </SectionIntro>
              <div className="body-text" dangerouslySetInnerHTML={{ __html: widgetHtml }} />
            </>
          )}
          <DeepContent data={deep} />
        </>
      ) : (
        <>
          <SectionIntro title={useBeginnerBody ? 'Explained simply' : 'What it is & how it works'}>
            Read this first for the core idea, then explain it back in your own words before moving on.
          </SectionIntro>
          <div className="body-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {widgetHtml && (
            <div className="body-text" dangerouslySetInnerHTML={{ __html: widgetHtml }} />
          )}
        </>
      )}

      {c.pitfalls?.length > 0 && (
        <>
          <SectionIntro title="Common pitfalls">
            These are frequent mistakes, weak assumptions, or shortcuts that can make an implementation unreliable.
          </SectionIntro>
          <ul className="pitfall-list">
            {c.pitfalls.map((p, i) => (
              <li key={i} className="pitfall-item">
                <span className="pitfall-mark">✕</span>
                <span dangerouslySetInnerHTML={{ __html: p }} />
              </li>
            ))}
          </ul>
        </>
      )}

      {c.apply?.length > 0 && (
        <>
          <SectionIntro title="How to apply it">
            Follow these small, practical steps to turn the idea into something you can build, test, or explain.
          </SectionIntro>
          <ul className="apply-list">
            {c.apply.map((a, i) => (
              <li key={i} className="apply-item">
                <span className="apply-mark">✓</span>
                <span dangerouslySetInnerHTML={{ __html: a }} />
              </li>
            ))}
          </ul>
        </>
      )}

      {c.selfCheck?.length > 0 && (
        <>
          <SectionIntro title="Test yourself">
            Answer from memory first, then open the explanation and compare it with your reasoning.
          </SectionIntro>
          {c.selfCheck.map((qa, i) => (
            <SelfCheck key={i} q={qa.q} a={qa.a} />
          ))}
        </>
      )}

      {c.resources?.length > 0 && (
        <>
          <div className="further-label">Further reading (optional)</div>
          <p className="section-description further-description">
            Use these sources after the lesson when you want authoritative detail or another explanation.
          </p>
          <ul className="further-list">
            {c.resources.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mark-row">
        <button
          className={'mark-btn' + (mastered[c.id] ? ' done' : '')}
          onClick={() => toggleMastered(c.id)}
        >
          {mastered[c.id] ? '✓ mastered' : 'mark as mastered'}
        </button>
      </div>

      <div className="pager">
        <button
          className="pager-btn"
          disabled={idx === 0}
          onClick={() => idx > 0 && onLoadConcept(FLAT[idx - 1].id)}
        >
          <span className="pager-label">← previous</span>
          <span className="pager-title">{idx > 0 ? FLAT[idx - 1].title : ''}</span>
        </button>
        <button
          className="pager-btn next"
          disabled={idx === TOTAL - 1}
          onClick={() => idx < TOTAL - 1 && onLoadConcept(FLAT[idx + 1].id)}
        >
          <span className="pager-label">next →</span>
          <span className="pager-title">{idx < TOTAL - 1 ? FLAT[idx + 1].title : ''}</span>
        </button>
      </div>
    </>
  )
}

function SelfCheck({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={'check-item' + (open ? ' open' : '')}>
      <button className="check-q" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span className="check-chev">›</span>
      </button>
      <div className="check-a">{a}</div>
    </div>
  )
}
