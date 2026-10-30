import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audio } from '../audio/audioManager'
import { useStore, type Interactable } from '../store'

export const INTERACTABLES: Interactable[] = [
  { id: 'med-1', kind: 'meditation', label: 'Đệm thiền 1', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: -4.5, z: -12 },
  { id: 'med-2', kind: 'meditation', label: 'Đệm thiền 2', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: -1.5, z: -12 },
  { id: 'med-3', kind: 'meditation', label: 'Đệm thiền 3', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: 1.5, z: -12 },
  { id: 'med-4', kind: 'meditation', label: 'Đệm thiền 4', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: 4.5, z: -12 },
  { id: 'med-5', kind: 'meditation', label: 'Đệm thiền 5', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: -3, z: -15.5 },
  { id: 'med-6', kind: 'meditation', label: 'Đệm thiền 6', hint: 'Nhấn E hoặc nút Tương tác để ngồi thiền', x: 3, z: -15.5 },
  { id: 'bell', kind: 'bell', label: 'Chuông chùa', hint: 'Nhấn E để thỉnh chuông', x: 9, z: 8 },
  { id: 'mok', kind: 'mok', label: 'Mõ tụng kinh', hint: 'Nhấn E để gõ mõ', x: 7.5, z: -11 },
  { id: 'altar', kind: 'altar', label: 'Bàn thờ Phật', hint: 'Nhấn E để mở kinh sách', x: 0, z: -16.5 },
]

/** Va chạm AABB: [minX, maxX, minZ, maxZ] */
const WALLS: Array<[number, number, number, number]> = [
  [-10.5, -9.5, -22, -6], [9.5, 10.5, -22, -6],
  [-10, 10, -22.5, -21.5],
  [-3.2, 3.2, -20.2, -17.2], // bệ thờ
  [-6.4, -5.6, 15.6, 16.4], [-2.9, -2.1, 15.6, 16.4], [2.1, 2.9, 15.6, 16.4], [5.6, 6.4, 15.6, 16.4],
  [8.4, 9.6, 7.4, 8.6], // tháp chuông
  [6.9, 8.1, -11.6, -10.4], // bàn mõ
]
const CIRCLES: Array<[number, number, number]> = [
  [-10, 6, 4.4], // hồ sen
  [-14, 2, 0.7], [-13, 12, 0.7], [14, 0, 0.7], [13, 18, 0.7], [-16, -2, 0.7], [16, -8, 0.7], [-8, 24, 0.7], [8, 24, 0.7],
]

function collides(x: number, z: number, r = 0.45): boolean {
  if (x < -28 || x > 28 || z < -24 || z > 34) return true
  for (const [x0, x1, z0, z1] of WALLS) if (x + r > x0 && x - r < x1 && z + r > z0 && z - r < z1) return true
  for (const [cx, cz, cr] of CIRCLES) { const dx = x - cx, dz = z - cz; if (dx * dx + dz * dz < (cr + r) * (cr + r)) return true }
  return false
}

const WOOD = '#7a5230'
const WOOD_DARK = '#5d3d22'
const TILE = '#8e2f28'
const GOLD = '#c9972f'
const STONE = '#b8b0a0'

function Roof({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={TILE} roughness={0.85} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[size[0] * 0.55, 0.35, size[2] * 0.6]} /><meshStandardMaterial color={TILE} roughness={0.85} /></mesh>
    </group>
  )
}

function Tree({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    if (useStore.getState().quality === 'low') return
    const t = clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * 0.7 + phase) * 0.03
    ref.current.rotation.x = Math.cos(t * 0.5 + phase) * 0.02
  })
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.22, 0.32, 2.8, 8]} /><meshStandardMaterial color={WOOD_DARK} roughness={1} /></mesh>
      <group ref={ref} position={[0, 3.4, 0]}>
        <mesh castShadow><sphereGeometry args={[1.7, 10, 8]} /><meshStandardMaterial color="#4a7a3d" roughness={1} /></mesh>
        <mesh position={[0.8, 0.7, 0.3]} castShadow><sphereGeometry args={[1.1, 10, 8]} /><meshStandardMaterial color="#5d8f47" roughness={1} /></mesh>
        <mesh position={[-0.8, 0.6, -0.3]} castShadow><sphereGeometry args={[1.0, 10, 8]} /><meshStandardMaterial color="#437136" roughness={1} /></mesh>
      </group>
    </group>
  )
}

function Buddha() {
  return (
    <group position={[0, 0.6, -19]}>
      {/* Đài sen */}
      <mesh position={[0, 0.15, 0]} receiveShadow><cylinderGeometry args={[1.7, 1.9, 0.3, 24]} /><meshStandardMaterial color={STONE} roughness={0.9} /></mesh>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[1.4, 1.6, 0.3, 24]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.45} /></mesh>
      {/* Thân ngồi kiết già — mô hình thủ tục, có thể thay bằng file GLB có giấy phép trong public/models/ */}
      <mesh position={[0, 0.95, 0]} castShadow><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 0.95, 0]} scale={[1.05, 0.45, 0.85]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.95, 0]} castShadow><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.95, 0]} scale={[0.78, 1.05, 0.58]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      {/* Đầu, nhục kế, hào quang */}
      <mesh position={[0, 3.15, 0]} castShadow><sphereGeometry args={[0.44, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 3.55, 0]}><sphereGeometry args={[0.18, 16, 12]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 3.05, -0.42]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.95, 0.06, 10, 32]} /><meshStandardMaterial color="#e8c766" emissive="#a67c1a" emissiveIntensity={0.5} /></mesh>
      {/* Tay đặt trong lòng */}
      <mesh position={[-0.55, 1.55, 0.35]} rotation={[0, 0, 0.9]} castShadow><capsuleGeometry args={[0.14, 0.7, 4, 10]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0.55, 1.55, 0.35]} rotation={[0, 0, -0.9]} castShadow><capsuleGeometry args={[0.14, 0.7, 4, 10]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.15, 0.55]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
    </group>
  )
}

function Player({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const meditation = useStore((s) => s.meditation)
  const legL = useRef<THREE.Mesh>(null)
  const legR = useRef<THREE.Mesh>(null)
  const armL = useRef<THREE.Mesh>(null)
  const armR = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    // Tốc độ bước do Controller ghi vào userData của group mỗi frame.
    const t = clock.elapsedTime
    const speed = (groupRef.current?.userData.walkSpeed as number | undefined) ?? 0
    const swing = Math.sin(t * 9) * 0.55 * Math.min(1, speed)
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing
    if (armR.current) armR.current.rotation.x = swing
  })
  // Tốc độ bước được Controller ghi vào userData của group mỗi frame.
  if (meditation) {
    return (
      <group ref={groupRef} position={[meditation.spotX, 0.32, meditation.spotZ]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow><sphereGeometry args={[0.5, 18, 14]} /><meshStandardMaterial color="#6b4a2f" roughness={0.9} /></mesh>
        <mesh position={[0, 0.35, 0]} scale={[1.25, 0.55, 0.9]}><sphereGeometry args={[0.5, 18, 14]} /><meshStandardMaterial color="#6b4a2f" roughness={0.9} /></mesh>
        <mesh position={[0, 1.05, 0]} castShadow><capsuleGeometry args={[0.3, 0.65, 4, 12]} /><meshStandardMaterial color="#8a5a34" roughness={0.9} /></mesh>
        <mesh position={[0, 1.78, 0]} castShadow><sphereGeometry args={[0.22, 18, 14]} /><meshStandardMaterial color="#e8c39a" roughness={0.8} /></mesh>
        <mesh position={[0, 1.78, 0.02]}><sphereGeometry args={[0.215, 18, 14]} /><meshStandardMaterial color="#2b2118" roughness={1} /></mesh>
        <mesh position={[0, 0.72, 0.32]}><sphereGeometry args={[0.16, 12, 10]} /><meshStandardMaterial color="#e8c39a" roughness={0.8} /></mesh>
      </group>
    )
  }
  return (
    <group ref={groupRef} position={[0, 0, 28]}>
      <mesh ref={legL} position={[-0.17, 0.45, 0]} castShadow><boxGeometry args={[0.22, 0.9, 0.22]} /><meshStandardMaterial color="#3d2b1e" roughness={1} /></mesh>
      <mesh ref={legR} position={[0.17, 0.45, 0]} castShadow><boxGeometry args={[0.22, 0.9, 0.22]} /><meshStandardMaterial color="#3d2b1e" roughness={1} /></mesh>
      <mesh position={[0, 1.25, 0]} castShadow><capsuleGeometry args={[0.32, 0.7, 4, 12]} /><meshStandardMaterial color="#7a5230" roughness={0.9} /></mesh>
      <mesh ref={armL} position={[-0.42, 1.35, 0]} castShadow><boxGeometry args={[0.16, 0.8, 0.16]} /><meshStandardMaterial color="#7a5230" roughness={0.9} /></mesh>
      <mesh ref={armR} position={[0.42, 1.35, 0]} castShadow><boxGeometry args={[0.16, 0.8, 0.16]} /><meshStandardMaterial color="#7a5230" roughness={0.9} /></mesh>
      <mesh position={[0, 2.02, 0]} castShadow><sphereGeometry args={[0.24, 18, 14]} /><meshStandardMaterial color="#e8c39a" roughness={0.8} /></mesh>
      <mesh position={[0, 2.02, 0.02]}><sphereGeometry args={[0.235, 18, 14]} /><meshStandardMaterial color="#2b2118" roughness={1} /></mesh>
    </group>
  )
}

function Controller() {
  const { camera, gl } = useThree()
  const playerRef = useRef<THREE.Group>(null)
  const bellRef = useRef<THREE.Group>(null)
  const mokRef = useRef<THREE.Group>(null)
  const keys = useRef<Record<string, boolean>>({})
  const cam = useRef({ yaw: 0, pitch: 0.38, dist: 6.5, dragging: false, lastX: 0, lastY: 0 })
  const pos = useRef({ x: 0, z: 28, phi: Math.PI })
  const walk = useRef(0)
  const bellStrike = useRef(-10)
  const mokStrike = useRef(-10)
  const lastNearby = useRef<string | null>(null)
  const interactNonce = useStore((s) => s.interactNonce)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true
      if (e.key.toLowerCase() === 'e') useStore.getState().requestInteract()
    }
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    const el = gl.domElement
    const pd = (e: PointerEvent) => { cam.current.dragging = true; cam.current.lastX = e.clientX; cam.current.lastY = e.clientY }
    const pm = (e: PointerEvent) => {
      if (!cam.current.dragging) return
      cam.current.yaw -= (e.clientX - cam.current.lastX) * 0.005
      cam.current.pitch = Math.min(1.05, Math.max(0.15, cam.current.pitch + (e.clientY - cam.current.lastY) * 0.004))
      cam.current.lastX = e.clientX; cam.current.lastY = e.clientY
    }
    const pu = () => { cam.current.dragging = false }
    const wheel = (e: WheelEvent) => { e.preventDefault(); cam.current.dist = Math.min(10, Math.max(3.5, cam.current.dist + e.deltaY * 0.005)) }
    el.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up)
      window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu)
      el.removeEventListener('pointerdown', pd); el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  // Xử lý tương tác: chuông / mõ có animation trong 3D, thiền & kinh mở panel.
  useEffect(() => {
    if (interactNonce === 0) return
    const st = useStore.getState()
    const n = st.nearby
    if (!n) return
    if (n.kind === 'bell') { audio.unlock(); audio.bell(); bellStrike.current = performance.now() / 1000 }
    if (n.kind === 'mok') { audio.unlock(); audio.mok(); mokStrike.current = performance.now() / 1000 }
    if (n.kind === 'meditation') st.setPanel('meditation')
    if (n.kind === 'altar') st.setPanel('sutra')
  }, [interactNonce])

  useFrame((_state, delta) => {
    const st = useStore.getState()
    const med = st.meditation
    const g = playerRef.current
    if (!g) return

    if (med) {
      g.position.set(med.spotX, 0.32, med.spotZ)
      g.rotation.y = Math.PI
      // Camera thiền: đứng phía trước người thiền, nhìn về phía người thiền.
      const target = new THREE.Vector3(med.spotX + 1.6, 1.5, med.spotZ - 3.0)
      const look = new THREE.Vector3(med.spotX, 1.0, med.spotZ)
      camera.position.lerp(target, 1 - Math.pow(0.001, delta))
      camera.lookAt(look)
    } else {
      const k = keys.current
      let ix = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0) + st.joystick.x
      let iy = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0) - st.joystick.y
      const len = Math.hypot(ix, iy)
      if (len > 1) { ix /= len; iy /= len }
      const s = Math.sin(cam.current.yaw), c = Math.cos(cam.current.yaw)
      const fx = -s, fz = -c, rx = c, rz = -s
      const mx = fx * iy + rx * ix
      const mz = fz * iy + rz * ix
      const speed = 4.2
      const step = speed * delta
      const nx = pos.current.x + mx * step
      const nz = pos.current.z + mz * step
      if (!collides(nx, pos.current.z)) pos.current.x = nx
      if (!collides(pos.current.x, nz)) pos.current.z = nz
      walk.current = Math.min(1, Math.hypot(mx, mz))
      g.userData.walkSpeed = walk.current
      if (walk.current > 0.1) pos.current.phi = Math.atan2(mx, mz)
      g.position.set(pos.current.x, 0, pos.current.z)
      g.rotation.y = pos.current.phi
      // Animation chân tay đơn giản qua userData? Dùng scale nhịp: giữ nguyên, chân đã có useFrame riêng (tĩnh).
      const d = cam.current.dist
      const desired = new THREE.Vector3(
        pos.current.x + s * Math.cos(cam.current.pitch) * d,
        1.6 + Math.sin(cam.current.pitch) * d,
        pos.current.z + c * Math.cos(cam.current.pitch) * d,
      )
      camera.position.lerp(desired, 1 - Math.pow(0.0001, delta))
      camera.lookAt(pos.current.x, 1.4, pos.current.z)
    }

    // Gần vật thể nào?
    let best: Interactable | null = null
    let bestD = 2.6
    for (const it of INTERACTABLES) {
      const d = Math.hypot(pos.current.x - it.x, pos.current.z - it.z)
      if (d < bestD) { bestD = d; best = it }
    }
    const key = best?.id ?? null
    if (key !== lastNearby.current) { lastNearby.current = key; st.setNearby(best) }

    // Animation chuông / mõ sau khi gõ
    const now = performance.now() / 1000
    if (bellRef.current) {
      const dt = now - bellStrike.current
      bellRef.current.rotation.z = dt < 2 ? Math.sin(dt * 7) * 0.18 * Math.exp(-dt * 1.5) : 0
    }
    if (mokRef.current) {
      const dt = now - mokStrike.current
      mokRef.current.rotation.x = dt < 0.5 ? -Math.sin(dt * 22) * 0.5 * Math.exp(-dt * 6) : 0
    }
  })

  const waterRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (waterRef.current) waterRef.current.position.y = 0.06 + Math.sin(clock.elapsedTime * 0.8) * 0.015
  })

  return (
    <>
      <Player groupRef={playerRef} />
      {/* Hồ sen */}
      <mesh ref={waterRef} position={[-10, 0.06, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial color="#5aa3b0" transparent opacity={0.85} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[-10, 0.1, 6]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[4.2, 4.7, 32]} /><meshStandardMaterial color={STONE} roughness={1} /></mesh>
      {[[-11, 5], [-9, 7.5], [-10.5, 7]].map(([x, z], i) => (
        <group key={i} position={[x, 0.18, z]}>
          <mesh><sphereGeometry args={[0.32, 10, 8]} /><meshStandardMaterial color="#e87fa8" roughness={0.7} /></mesh>
          <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.4, 0.4, 0.06, 12]} /><meshStandardMaterial color="#4a7a3d" roughness={1} /></mesh>
        </group>
      ))}
      {/* Tháp chuông */}
      <group position={[9, 0, 8]}>
        {[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.6, z]} castShadow><cylinderGeometry args={[0.18, 0.22, 3.2, 8]} /><meshStandardMaterial color={WOOD} roughness={0.9} /></mesh>
        ))}
        <group ref={bellRef} position={[0, 3.1, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.35, 0.65, 1.0, 16]} /><meshStandardMaterial color="#8a6a2a" metalness={0.6} roughness={0.35} /></mesh>
        </group>
        <Roof position={[0, 3.9, 0]} size={[3.4, 0.35, 3.4]} />
      </group>
      {/* Bàn mõ */}
      <group position={[7.5, 0, -11]}>
        <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.2, 0.9, 0.7]} /><meshStandardMaterial color={WOOD} roughness={0.9} /></mesh>
        <mesh position={[0, 1.05, 0]} castShadow><sphereGeometry args={[0.35, 16, 12]} /><meshStandardMaterial color="#a33b2e" roughness={0.6} /></mesh>
        <group ref={mokRef} position={[0.5, 1.3, 0.3]}>
          <mesh rotation={[0, 0, 0.8]}><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial color={WOOD_DARK} roughness={1} /></mesh>
        </group>
      </group>
      {/* Đệm thiền — hiển thị rõ vị trí tương tác */}
      {INTERACTABLES.filter((i) => i.kind === 'meditation').map((it) => (
        <group key={it.id} position={[it.x, 0.32, it.z]}>
          <mesh receiveShadow><cylinderGeometry args={[0.55, 0.6, 0.18, 20]} /><meshStandardMaterial color="#7a2e2e" roughness={1} /></mesh>
          <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.45, 0.45, 0.08, 20]} /><meshStandardMaterial color="#a84438" roughness={1} /></mesh>
        </group>
      ))}
    </>
  )
}

function Hall() {
  return (
    <group>
      <mesh position={[0, 0.15, -14]} receiveShadow><boxGeometry args={[21, 0.3, 17]} /><meshStandardMaterial color="#9a7a52" roughness={0.9} /></mesh>
      <mesh position={[0, 2.5, -21.8]} castShadow receiveShadow><boxGeometry args={[20, 5, 0.4]} /><meshStandardMaterial color="#e8dcc0" roughness={0.95} /></mesh>
      <mesh position={[-10, 2.5, -14]} castShadow><boxGeometry args={[0.4, 5, 16]} /><meshStandardMaterial color="#e8dcc0" roughness={0.95} /></mesh>
      <mesh position={[10, 2.5, -14]} castShadow><boxGeometry args={[0.4, 5, 16]} /><meshStandardMaterial color="#e8dcc0" roughness={0.95} /></mesh>
      {[-8, -4, 0, 4, 8].map((x) => (
        <mesh key={x} position={[x, 2.5, -6.2]} castShadow><cylinderGeometry args={[0.28, 0.32, 5, 10]} /><meshStandardMaterial color={WOOD} roughness={0.9} /></mesh>
      ))}
      <Roof position={[0, 6.1, -14]} size={[23, 0.5, 19]} />
      {/* Bàn thờ */}
      <mesh position={[0, 0.75, -19.2]} castShadow><boxGeometry args={[5, 1.0, 1.6]} /><meshStandardMaterial color={WOOD} roughness={0.9} /></mesh>
      {[[-2, -19.2], [2, -19.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.6, z]}><cylinderGeometry args={[0.05, 0.05, 0.7, 8]} /><meshStandardMaterial color="#e8c766" emissive="#ffaa22" emissiveIntensity={0.8} /></mesh>
      ))}
      <Buddha />
    </group>
  )
}

function Gate() {
  return (
    <group position={[0, 0, 16]}>
      {[-6, -2.5, 2.5, 6].map((x) => (
        <mesh key={x} position={[x, 2.5, 0]} castShadow><boxGeometry args={[0.8, 5, 0.8]} /><meshStandardMaterial color={STONE} roughness={0.95} /></mesh>
      ))}
      <Roof position={[0, 5.6, 0]} size={[15, 0.5, 3.2]} />
      <mesh position={[0, 4.4, 0.5]}><boxGeometry args={[3.2, 0.9, 0.15]} /><meshStandardMaterial color={GOLD} metalness={0.3} roughness={0.5} /></mesh>
    </group>
  )
}

export default function TempleScene() {
  const quality = useStore((s) => s.quality)
  const shadows = quality !== 'low'
  const dpr: [number, number] = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [1, 1]
  const trees = useMemo(() => [
    { p: [-14, 2] as const, ph: 0 }, { p: [-13, 12] as const, ph: 1.3 }, { p: [14, 0] as const, ph: 2.1 },
    { p: [13, 18] as const, ph: 0.7 }, { p: [-16, -2] as const, ph: 2.8 }, { p: [16, -8] as const, ph: 1.9 },
    { p: [-8, 24] as const, ph: 0.4 }, { p: [8, 24] as const, ph: 2.4 },
  ], [])
  return (
    <Canvas shadows={shadows} dpr={dpr} camera={{ position: [0, 4, 34], fov: 55 }} gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}>
      <color attach="background" args={['#f7e3b0']} />
      <fog attach="fog" args={['#f7e3b0', 45, 110]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[20, 28, 12]} intensity={1.6} color="#ffdf9e" castShadow={shadows}
        shadow-mapSize={[quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024]}
        shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} />
      <pointLight position={[0, 4, -14]} intensity={12} distance={22} color="#ffb45e" />
      {/* Mặt đất, sân, lối đi */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[140, 140]} /><meshStandardMaterial color="#6d8a52" roughness={1} /></mesh>
      <mesh position={[0, 0.02, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[16, 44]} /><meshStandardMaterial color="#c9bda6" roughness={1} /></mesh>
      <mesh position={[0, 0.03, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[5, 44]} /><meshStandardMaterial color="#b0a28c" roughness={1} /></mesh>
      <Gate />
      <Hall />
      {trees.map((t, i) => <Tree key={i} position={[t.p[0], 0, t.p[1]]} phase={t.ph} />)}
      <Controller />
    </Canvas>
  )
}
