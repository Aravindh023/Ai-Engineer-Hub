export default function SectionIntro({ title, children }) {
  return (
    <div className="section-intro">
      <div className="section-label">{title}</div>
      {children && <p className="section-description">{children}</p>}
    </div>
  )
}

