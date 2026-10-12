import { Component, Suspense, lazy } from 'react'

// A fixed, full-screen, non-interactive 3D particle field that sits behind the
// whole app for ambient depth. Lazy so three.js stays out of the initial bundle,
// and wrapped so a WebGL failure just leaves the CSS background showing.
const Scene3D = lazy(() => import('./Scene3D.jsx'))

class Silent extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function GlobalBackground3D() {
  return (
    <div className="global-bg3d" aria-hidden="true">
      <Silent>
        <Suspense fallback={null}>
          <Scene3D kind="background" />
        </Suspense>
      </Silent>
    </div>
  )
}
