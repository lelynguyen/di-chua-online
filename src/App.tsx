import { useEffect, useState } from 'react'
import Home from './components/Home'
import HUD from './components/HUD'
import TempleScene from './three/TempleScene'
import { audio } from './audio/audioManager'
import { useStore } from './store'

function webglSupported() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch { return false }
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const volumes = useStore((s) => s.volumes)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(Object.keys(volumes) as Array<keyof typeof volumes>).forEach((k) => audio.setVolume(k, volumes[k]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (screen !== 'temple') return
    const id = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(id)
  }, [screen])

  if (screen === 'home') return <Home />

  if (!webglSupported()) {
    return (
      <div className="flex h-full items-center justify-center bg-[#171310] p-6 text-center">
        <div className="panel max-w-md rounded-2xl p-6">
          <h1 className="text-xl font-bold">Thiết bị chưa hỗ trợ WebGL</h1>
          <p className="mt-2 text-sm text-white/70">
            Trình duyệt hoặc thiết bị này chưa bật WebGL nên chưa hiển thị được không gian 3D.
            Hãy thử Chrome / Edge / Safari bản mới, bật tăng tốc phần cứng, rồi vào lại.
          </p>
          <button className="btn-gold mt-4 rounded-xl px-4 py-2" onClick={() => useStore.getState().setScreen('home')}>Về trang chính</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#171310]">
      <div className="absolute inset-0">
        <TempleScene />
      </div>
      {!ready && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#171310]">
          <p className="text-2xl">🛕</p>
          <p className="mt-2 font-bold">Đang chuẩn bị không gian chùa…</p>
          <p className="mt-1 text-sm text-white/60">Mô hình được dựng trực tiếp bằng Three.js, không cần tải file 3D nặng.</p>
        </div>
      )}
      <HUD />
    </div>
  )
}
