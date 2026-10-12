import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// "Solar Sunset" palette (names kept for continuity; values are the warm theme)
const CYAN = '#F5A524'   // gold (primary)
const VIOLET = '#FB7185' // coral (secondary)
const MAGENTA = '#EC4899'// pink (tertiary)
const BLUE = '#8B5CF6'   // violet accent
const DIM = '#6B5A62'

/* ============================ HUB ============================ */
function HubNode({ position, phase, done, total, onSelect }) {
  const ref = useRef()
  const halo = useRef()
  const [hover, setHover] = useState(false)
  const complete = done === total
  const color = done === 0 ? DIM : complete ? CYAN : VIOLET
  useFrame((state, dt) => {
    if (ref.current) {
      const target = hover ? 1.4 : 1
      ref.current.scale.lerp(new THREE.Vector3(target, target, target), Math.min(1, dt * 8))
      ref.current.rotation.y += dt * 0.4
    }
    if (halo.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.06
      halo.current.scale.setScalar((hover ? 1.5 : 1.2) * p)
    }
  })
  return (
    <group position={position}>
      <mesh ref={halo}>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onSelect(phase.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto' }}
      >
        <icosahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hover ? 1.4 : 0.7}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      <Html position={[0, 0.98, 0]} center distanceFactor={9} pointerEvents="none">
        <div className="viz-node-label">
          <span className="viz-node-num">{phase.num}</span>
          <span className="viz-node-title">{phase.title}</span>
          <span className="viz-node-count">{done}/{total}</span>
        </div>
      </Html>
    </group>
  )
}

function HubScene({ phases, mastered, onSelectPhase }) {
  const nodes = useMemo(() => {
    const n = phases.length
    return phases.map((phase, i) => {
      const a = (i / n) * Math.PI * 2
      const r = 4.2
      return {
        phase,
        pos: [Math.cos(a) * r, (i - (n - 1) / 2) * 0.3, Math.sin(a) * r],
        done: phase.concepts.filter((c) => mastered[c.id]).length,
        total: phase.concepts.length,
      }
    })
  }, [phases, mastered])
  const linePoints = useMemo(() => nodes.map((nd) => nd.pos), [nodes])

  return (
    <group>
      <Line points={[...linePoints, linePoints[0]]} color={CYAN} lineWidth={1.2} transparent opacity={0.3} />
      {nodes.map((nd) => (
        <HubNode key={nd.phase.id} position={nd.pos} phase={nd.phase} done={nd.done} total={nd.total} onSelect={onSelectPhase} />
      ))}
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.5} wireframe />
        </mesh>
      </Float>
      <Sparkles count={70} scale={11} size={3} speed={0.35} color={CYAN} opacity={0.6} />
      <Sparkles count={40} scale={9} size={2} speed={0.25} color={MAGENTA} opacity={0.5} />
    </group>
  )
}

/* ======================= EMBEDDING CLOUD ======================= */
const WORD_POINTS = [
  { w: 'dog', g: 0, p: [-2.6, 1.2, 0.4] }, { w: 'puppy', g: 0, p: [-2.2, 1.6, 0.8] },
  { w: 'cat', g: 0, p: [-2.9, 0.6, -0.3] }, { w: 'kitten', g: 0, p: [-2.4, 0.9, -0.9] },
  { w: 'king', g: 1, p: [2.4, 1.4, 0.3] }, { w: 'queen', g: 1, p: [2.8, 1.0, 0.7] },
  { w: 'prince', g: 1, p: [2.1, 0.8, -0.4] }, { w: 'throne', g: 1, p: [2.9, 1.7, -0.5] },
  { w: 'car', g: 2, p: [0.4, -1.8, 2.3] }, { w: 'truck', g: 2, p: [0.9, -2.1, 1.9] },
  { w: 'engine', g: 2, p: [-0.2, -1.5, 2.6] }, { w: 'wheel', g: 2, p: [0.1, -2.3, 2.0] },
  { w: 'apple', g: 3, p: [-0.6, 2.4, -2.1] }, { w: 'banana', g: 3, p: [-1.1, 2.1, -2.4] },
  { w: 'mango', g: 3, p: [-0.3, 2.7, -1.7] },
]
const GROUP_COLORS = [CYAN, VIOLET, MAGENTA, BLUE]

function WordPoint({ point }) {
  const [hover, setHover] = useState(false)
  const color = GROUP_COLORS[point.g]
  return (
    <group position={point.p}>
      <mesh onPointerOver={(e) => { e.stopPropagation(); setHover(true) }} onPointerOut={() => setHover(false)}>
        <sphereGeometry args={[hover ? 0.22 : 0.15, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 1.4 : 0.6} roughness={0.2} metalness={0.5} />
      </mesh>
      <Html position={[0, 0.3, 0]} center distanceFactor={8} pointerEvents="none">
        <div className="viz-word-label" style={{ borderColor: color, color, opacity: hover ? 1 : 0.85 }}>{point.w}</div>
      </Html>
    </group>
  )
}

function EmbeddingCloud() {
  return (
    <group>
      <Line points={[[-4, 0, 0], [4, 0, 0]]} color={DIM} lineWidth={1} transparent opacity={0.18} />
      <Line points={[[0, -4, 0], [0, 4, 0]]} color={DIM} lineWidth={1} transparent opacity={0.18} />
      <Line points={[[0, 0, -4], [0, 0, 4]]} color={DIM} lineWidth={1} transparent opacity={0.18} />
      {WORD_POINTS.map((pt) => <WordPoint key={pt.w} point={pt} />)}
      <Sparkles count={50} scale={9} size={2} speed={0.3} color={CYAN} opacity={0.4} />
    </group>
  )
}

/* ======================= ATTENTION RING ======================= */
const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'warm']
const WEIGHTS = { 7: [0.1, 0.9, 0.15, 0.1, 0.1, 0.35, 0.1, 1, 0.2, 0.25] }

function AttentionRing() {
  const groupRef = useRef()
  const [focus, setFocus] = useState(7)
  const positions = useMemo(() => {
    const n = SENTENCE.length
    return SENTENCE.map((_, i) => {
      const a = (i / n) * Math.PI * 2
      return [Math.cos(a) * 3.4, Math.sin(a) * 3.4, 0]
    })
  }, [])
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.15
  })
  const weights = WEIGHTS[focus] || SENTENCE.map(() => 0.2)

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => {
        if (i === focus) return null
        const w = weights[i]
        return (
          <Line key={'l' + i} points={[positions[focus], pos]} color={MAGENTA} lineWidth={0.5 + w * 3.5} transparent opacity={0.1 + w * 0.7} />
        )
      })}
      {positions.map((pos, i) => {
        const isFocus = i === focus
        const color = isFocus ? VIOLET : CYAN
        return (
          <group key={i} position={pos}>
            <mesh
              onClick={(e) => { e.stopPropagation(); setFocus(i) }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <sphereGeometry args={[isFocus ? 0.36 : 0.23, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isFocus ? 1.4 : 0.6} roughness={0.2} metalness={0.5} />
            </mesh>
            <Html position={[0, 0.44, 0]} center distanceFactor={9} pointerEvents="none">
              <div className="viz-word-label" style={{ borderColor: color, color }}>{SENTENCE[i]}</div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0, 0]} center distanceFactor={11} pointerEvents="none">
        <div className="viz-center-hint">click a token<br />to see its attention</div>
      </Html>
      <Sparkles count={40} scale={8} size={2} speed={0.3} color={VIOLET} opacity={0.4} />
    </group>
  )
}

/* ==================== NEURAL BACKGROUND ==================== */
// Ambient full-screen field: drifting particles + a slow wireframe core.
function NeuralBackground() {
  const g = useRef()
  useFrame((state, dt) => {
    if (g.current) {
      g.current.rotation.y += dt * 0.04
      g.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.15
    }
  })
  return (
    <group ref={g}>
      <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh>
          <icosahedronGeometry args={[5.5, 1]} />
          <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.25} wireframe transparent opacity={0.35} />
        </mesh>
      </Float>
      <mesh>
        <icosahedronGeometry args={[8, 1]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.15} wireframe transparent opacity={0.15} />
      </mesh>
      <Sparkles count={500} scale={22} size={2.4} speed={0.2} color={CYAN} opacity={0.7} />
      <Sparkles count={250} scale={18} size={1.8} speed={0.15} color={MAGENTA} opacity={0.5} />
      <Sparkles count={150} scale={14} size={3} speed={0.1} color={VIOLET} opacity={0.5} />
    </group>
  )
}

/* ============================ CANVAS ============================ */
const SCENES = { hub: HubScene, embeddings: EmbeddingCloud, attention: AttentionRing, background: NeuralBackground }

export default function Scene3D({ kind, ...props }) {
  const SceneComp = SCENES[kind]
  if (!SceneComp) return null
  const isBg = kind === 'background'
  const autoRotate = kind !== 'attention' && !isBg
  const camZ = isBg ? 15 : kind === 'hub' ? 11 : 9

  return (
    <Canvas
      camera={{ position: [0, 0, camZ], fov: 50 }}
      dpr={isBg ? [1, 1.5] : [1, 2]}
      gl={{ alpha: true, antialias: !isBg }}
      style={isBg ? { pointerEvents: 'none' } : undefined}
    >
      {!isBg && <fog attach="fog" args={['#0B0910', 12, 26]} />}
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.4} color={CYAN} />
      <pointLight position={[-10, -6, -8]} intensity={0.8} color={MAGENTA} />
      <pointLight position={[0, 8, -10]} intensity={0.6} color={VIOLET} />
      <SceneComp {...props} />
      {!isBg && (
        <OrbitControls
          enablePan={false}
          enableZoom={kind === 'hub'}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
          minDistance={5}
          maxDistance={16}
        />
      )}
    </Canvas>
  )
}
