import { useEffect, useState } from 'react'

// A floating glass header that replaces the old left nav: brand, a live
// breadcrumb of where you are, an XP readout, an animated overall-progress ring,
// a command-palette trigger, and a thin scroll-progress line.
export default function TopBar({ crumbs, xp, pct, rank, onBrand, onOpenLab, onOpenPalette }) {
  const [scroll, setScroll] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setScroll(max > 8 ? (el.scrollTop / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const R = 13
  const C = 2 * Math.PI * R

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="tb-brand" onClick={onBrand} aria-label="Home">
          <span className="brand-glyph">◇</span>
          <span className="tb-brand-text">AI ENGINEER</span>
        </button>

        <nav className="tb-crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} className="tb-crumb-seg">
              {i > 0 && <span className="tb-sep">›</span>}
              {c.onClick ? (
                <button className="tb-crumb" onClick={c.onClick}>{c.label}</button>
              ) : (
                <span className="tb-crumb current">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="tb-right">
          <button className="tb-lab" onClick={onOpenLab} aria-label="Open Job Readiness Lab">
            <span>◎</span><span className="tb-lab-label">Job Lab</span>
          </button>
          <button className="tb-search" onClick={onOpenPalette} aria-label="Search (Ctrl or Cmd + K)">
            <span className="tb-search-ico">⌕</span>
            <span className="tb-search-label">Jump to…</span>
            <span className="tb-kbd">⌘K</span>
          </button>
          <div className="tb-xp">
            <span className="tb-rank">{rank.title}</span>
            <span className="tb-xpval">{xp} XP</span>
          </div>
          <button className="tb-ring" onClick={onBrand} title={`Overall progress ${pct}%`} aria-label="Overall progress">
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r={R} fill="none" stroke="rgba(140,160,230,0.18)" strokeWidth="3" />
              <circle
                cx="17" cy="17" r={R} fill="none" stroke="url(#tbgrad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 17 17)"
                style={{ transition: 'stroke-dashoffset .6s ease' }}
              />
              <defs>
                <linearGradient id="tbgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#22D3EE" />
                  <stop offset="1" stopColor="#F472B6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="tb-ring-pct">{pct}</span>
          </button>
        </div>
      </div>
      <div className="tb-scroll" style={{ width: scroll + '%' }} />
    </header>
  )
}
