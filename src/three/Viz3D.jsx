import { Component, Suspense, lazy } from 'react'

// three.js is heavy, so the whole 3D scene is a separate lazy chunk that only
// downloads when a 3D view is actually shown. If WebGL is unavailable or the
// scene errors, we fall back to a calm placeholder instead of crashing the page.
const Scene3D = lazy(() => import('./Scene3D.jsx'))

class WebGLBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return <div className="viz3d-fallback">3D view unavailable on this device.</div>
    }
    return this.props.children
  }
}

export default function Viz3D({ kind, height = 320, label, ...props }) {
  return (
    <div className="viz3d" style={{ height }}>
      {label && <div className="viz3d-label">{label}</div>}
      <WebGLBoundary>
        <Suspense fallback={<div className="viz3d-fallback">loading 3D…</div>}>
          <Scene3D kind={kind} {...props} />
        </Suspense>
      </WebGLBoundary>
    </div>
  )
}
