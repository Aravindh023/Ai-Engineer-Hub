import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { FLAT, PHASES, computeXP, maxXP, currentRank } from './data/model.js'
import { useProgress } from './hooks/useProgress.js'
import TopBar from './components/TopBar.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import OpeningPage from './components/OpeningPage.jsx'
import JobReadinessLab from './components/JobReadinessLab.jsx'
import Roadmap from './components/Roadmap.jsx'
import ConceptView from './components/ConceptView.jsx'
import Confetti from './components/Confetti.jsx'
import Assistant from './components/Assistant.jsx'
import GlobalBackground3D from './three/GlobalBackground3D.jsx'

export default function App() {
  const progress = useProgress()
  const { mastered, lastConceptId, setLastConcept, openPhase } = progress

  const [route, setRoute] = useState({ name: 'opening' })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(null)

  const goOpening = useCallback(() => { setRoute({ name: 'opening' }); window.scrollTo(0, 0) }, [])
  const goJobLab = useCallback(() => { setRoute({ name: 'job-lab' }); window.scrollTo(0, 0) }, [])
  const openModule = useCallback((phaseId) => {
    openPhase(phaseId); setRoute({ name: 'roadmap', phaseId }); window.scrollTo(0, 0)
  }, [openPhase])
  const loadConcept = useCallback((id) => {
    const c = FLAT.find((x) => x.id === id)
    if (!c) return
    openPhase(c.phaseId); setRoute({ name: 'concept', conceptId: id }); setLastConcept(id); window.scrollTo(0, 0)
  }, [openPhase, setLastConcept])

  // Global command-palette shortcut.
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Crackers whenever a module transitions to fully complete.
  const prevComplete = useRef(null)
  useEffect(() => {
    const complete = {}
    PHASES.forEach((p) => { complete[p.id] = p.concepts.every((c) => mastered[c.id]) })
    if (prevComplete.current) {
      const newly = PHASES.filter((p) => complete[p.id] && !prevComplete.current[p.id])
      if (newly.length) setCelebrate({ big: PHASES.every((p) => complete[p.id]), key: performance.now() })
    }
    prevComplete.current = complete
  }, [mastered])
  const onConfettiDone = useCallback(() => setCelebrate(null), [])

  const xp = useMemo(() => computeXP(mastered), [mastered])
  const rank = useMemo(() => currentRank(xp), [xp])
  const pct = Math.round((xp / maxXP()) * 100)

  const current = route.name === 'concept' ? FLAT.find((c) => c.id === route.conceptId) : null
  const roadmapPhase = route.name === 'roadmap' ? PHASES.find((p) => p.id === route.phaseId) : null

  const crumbs = [{ label: 'Home', onClick: route.name === 'opening' ? null : goOpening }]
  if (roadmapPhase) crumbs.push({ label: roadmapPhase.title })
  if (route.name === 'job-lab') crumbs.push({ label: 'Job Readiness Lab' })
  if (current) {
    crumbs.push({ label: current.phaseTitle, onClick: () => openModule(current.phaseId) })
    crumbs.push({ label: current.title })
  }

  return (
    <>
      <GlobalBackground3D />
      {celebrate && <Confetti key={celebrate.key} big={celebrate.big} onDone={onConfettiDone} />}

      <TopBar crumbs={crumbs} xp={xp} pct={pct} rank={rank} onBrand={goOpening} onOpenLab={goJobLab} onOpenPalette={() => setPaletteOpen(true)} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        progress={progress}
        lastConceptId={lastConceptId}
        onLoadConcept={loadConcept}
        onOpenModule={openModule}
        onGoHome={goOpening}
        onOpenJobLab={goJobLab}
      />

      <div className="stage">
        <div className={'main' + (route.name === 'concept' ? ' main-reading' : '') + (route.name === 'job-lab' ? ' main-lab' : '')}>
          {route.name === 'opening' && (
            <OpeningPage progress={progress} onOpenModule={openModule} onOpenJobLab={goJobLab} xp={xp} pct={pct} rank={rank} />
          )}
          {route.name === 'job-lab' && (
            <JobReadinessLab onBack={goOpening} courseMastered={Object.values(mastered).filter(Boolean).length} courseTotal={FLAT.length} />
          )}
          {route.name === 'roadmap' && roadmapPhase && (
            <Roadmap phase={roadmapPhase} progress={progress} onLoadConcept={loadConcept} onBack={goOpening} />
          )}
          {route.name === 'concept' && current && (
            <ConceptView concept={current} progress={progress} onLoadConcept={loadConcept} onOpenModule={openModule} />
          )}
        </div>
      </div>

      <Assistant currentConcept={current} onLoadConcept={loadConcept} />
    </>
  )
}
