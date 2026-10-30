import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const GOLD = '#c9972f'
const STONE = '#b8b0a0'

/**
 * Tượng Phật thủ tục hiện tại — giữ làm phương án dự phòng.
 * Chỉ bị thay thế khi có file GLB có giấy phép trong public/models/buddha.glb
 * (xem public/models/MODELS.md). Tượng không bao giờ được bấm/kéo trong 3D.
 */
export function Buddha() {
  return (
    <group position={[0, 0.6, -19]}>
      <mesh position={[0, 0.15, 0]} receiveShadow><cylinderGeometry args={[1.7, 1.9, 0.3, 24]} /><meshStandardMaterial color={STONE} roughness={0.9} /></mesh>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[1.4, 1.6, 0.3, 24]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.45} /></mesh>
      <mesh position={[0, 0.95, 0]} castShadow><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 0.95, 0]} scale={[1.05, 0.45, 0.85]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.95, 0]} castShadow><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.95, 0]} scale={[0.78, 1.05, 0.58]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 3.15, 0]} castShadow><sphereGeometry args={[0.44, 24, 18]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 3.55, 0]}><sphereGeometry args={[0.18, 16, 12]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 3.05, -0.42]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.95, 0.06, 10, 32]} /><meshStandardMaterial color="#e8c766" emissive="#a67c1a" emissiveIntensity={0.5} /></mesh>
      <mesh position={[-0.55, 1.55, 0.35]} rotation={[0, 0, 0.9]} castShadow><capsuleGeometry args={[0.14, 0.7, 4, 10]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0.55, 1.55, 0.35]} rotation={[0, 0, -0.9]} castShadow><capsuleGeometry args={[0.14, 0.7, 4, 10]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
      <mesh position={[0, 1.15, 0.55]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.4} /></mesh>
    </group>
  )
}

/**
 * Nạp tượng có giấy phép nếu có, ngược lại dùng tượng thủ tục.
 * Không dùng Suspense/useGLTF ở đây để file thiếu (404) không làm sập cảnh:
 * GLTFLoader báo lỗi thì giữ nguyên tượng thủ tục và chỉ ghi warn vào console.
 * Model được căn giữa và co về chiều cao ~3,2 m, đặt trên đài sen ở y = 0,6.
 */
export function LicensedBuddha() {
  const [scene, setScene] = useState<THREE.Group | null>(null)
  useEffect(() => {
    let alive = true
    new GLTFLoader().load('/models/buddha.glb', (gltf) => {
      if (!alive) return
      const obj = gltf.scene
      const box = new THREE.Box3().setFromObject(obj)
      const size = new THREE.Vector3()
      box.getSize(size)
      if (size.y > 0) {
        const s = 3.2 / size.y
        obj.scale.setScalar(s)
        const center = new THREE.Vector3()
        box.getCenter(center)
        obj.position.set(-center.x * s, 0.6 - box.min.y * s, -center.z * s)
        obj.traverse((c) => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true } })
      }
      setScene(obj)
    }, undefined, (err) => {
      // Chưa có file hoặc nạp lỗi: giữ tượng thủ tục, không chặn app.
      console.warn('Chưa nạp được /models/buddha.glb, dùng tượng thủ tục:', err)
    })
    return () => { alive = false }
  }, [])
  if (!scene) return <Buddha />
  return <primitive object={scene} />
}
