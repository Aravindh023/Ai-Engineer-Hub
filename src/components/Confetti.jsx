import { useRef, useEffect } from 'react'

// A one-shot full-screen "crackers" burst on a canvas. Mounts, animates for a
// few seconds, then calls onDone so the parent can unmount it.
export default function Confetti({ big = false, onDone }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const colors = ['#22D3EE', '#A78BFA', '#F472B6', '#3B82F6', '#FDE047', '#34D399']
    const count = big ? 320 : 160
    // Launch from a couple of points for a fireworks feel.
    const origins = big
      ? [{ x: w * 0.25, y: h * 0.32 }, { x: w * 0.5, y: h * 0.25 }, { x: w * 0.75, y: h * 0.32 }]
      : [{ x: w * 0.5, y: h * 0.3 }]
    const parts = []
    for (let i = 0; i < count; i++) {
      const o = origins[i % origins.length]
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * (big ? 13 : 10)
      parts.push({
        x: o.x, y: o.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        g: 0.22 + Math.random() * 0.16,
        size: 5 + Math.random() * 7,
        color: colors[i % colors.length],
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.5,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }
    const dur = big ? 4500 : 3000
    const start = performance.now()
    let raf
    const frame = (t) => {
      const el = t - start
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.vy += p.g
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, 1 - el / dur)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.28); ctx.fill() }
        ctx.restore()
      }
      if (el < dur) raf = requestAnimationFrame(frame)
      else onDone && onDone()
    }
    raf = requestAnimationFrame(frame)
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [big, onDone])

  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />
}
