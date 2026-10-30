import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio/audioManager'
import { SUTRAS, SUTRA_NOTE } from '../data/sutras'
import { clearPersonalData, meditationElapsedMs, useStore } from '../store'
import { INTERACTABLES } from '../three/TempleScene'

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function Joystick() {
  const setJoystick = useStore((s) => s.setJoystick)
  const base = useRef<HTMLDivElement>(null)
  const active = useRef<number | null>(null)
  const update = (e: React.PointerEvent) => {
    const el = base.current; if (!el || active.current !== e.pointerId) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    const len = Math.hypot(x, y)
    const cl = len > 1 ? { x: x / len, y: y / len } : { x, y }
    setJoystick(cl)
  }
  return (
    <div ref={base} className="relative h-32 w-32 rounded-full bg-white/10 border border-white/25 touch-none select-none"
      onPointerDown={(e) => { active.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={update}
      onPointerUp={() => { active.current = null; setJoystick({ x: 0, y: 0 }) }}
      onPointerCancel={() => { active.current = null; setJoystick({ x: 0, y: 0 }) }}
      aria-label="Joystick di chuyển">
      <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/80" />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] text-white/70">Di chuyển</span>
    </div>
  )
}

function MeditationPanel() {
  const { meditation, nearby, startMeditation, pauseMeditation, resumeMeditation, endMeditation, setPanel, setFocusMode, focusMode } = useStore()
  const [minutes, setMinutes] = useState(10)
  const [spotId, setSpotId] = useState<string>(() => nearby?.kind === 'meditation' ? nearby.id : 'med-1')
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!meditation) return
    const id = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(id)
  }, [meditation])

  // Hết giờ: tự kết thúc và thỉnh một tiếng chuông (không cộng thêm thời gian).
  useEffect(() => {
    if (!meditation || meditation.plannedMinutes === 0 || meditation.status !== 'running') return
    if (meditationElapsedMs(meditation) >= meditation.plannedMinutes * 60000) {
      audio.bell()
      endMeditation()
    }
  }, [meditation, endMeditation])

  if (meditation) {
    const elapsed = meditationElapsedMs(meditation)
    const remaining = meditation.plannedMinutes === 0 ? null : meditation.plannedMinutes * 60000 - elapsed
    return (
      <div className="panel rounded-2xl p-5 max-w-md w-full">
        <h2 className="text-lg font-bold">Đang thiền — {meditation.spotId}</h2>
        <p className="mt-1 text-sm text-white/70">Thời gian thực hành (không tính lúc tạm dừng): <b className="text-white">{fmt(elapsed)}</b></p>
        <p className="mt-1 text-4xl font-bold text-amber-300">{remaining === null ? fmt(elapsed) : fmt(remaining)}</p>
        <p className="text-xs text-white/60">{remaining === null ? 'Không giới hạn — kết thúc khi bạn sẵn sàng.' : 'Thời gian còn lại'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {meditation.status === 'running'
            ? <button className="btn-ghost rounded-xl px-4 py-2" onClick={pauseMeditation}>⏸ Tạm dừng</button>
            : <button className="btn-gold rounded-xl px-4 py-2" onClick={resumeMeditation}>▶ Tiếp tục</button>}
          <button className="btn-gold rounded-xl px-4 py-2" onClick={() => { audio.bell(); endMeditation() }}>Kết thúc</button>
          <button className="btn-ghost rounded-xl px-4 py-2" onClick={() => setFocusMode(!focusMode)}>{focusMode ? 'Hiện giao diện' : 'Chế độ tập trung'}</button>
          <button className="btn-ghost rounded-xl px-4 py-2" onClick={() => setPanel('mala')}>📿 Tràng hạt</button>
        </div>
        <p className="mt-3 text-xs text-white/60">Mở tràng hạt trong lúc thiền: buổi thiền vẫn tiếp tục tính giờ.</p>
      </div>
    )
  }

  const spot = INTERACTABLES.find((i) => i.id === spotId) ?? INTERACTABLES[0]
  return (
    <div className="panel rounded-2xl p-5 max-w-md w-full">
      <h2 className="text-lg font-bold">Ngồi thiền</h2>
      <p className="mt-1 text-sm text-white/70">Hãy đến gần một đệm thiền trong chánh điện, hoặc chọn vị trí dưới đây (nhân vật sẽ ngồi vào vị trí đó).</p>
      <label className="mt-3 block text-sm text-white/70">Vị trí
        <select className="mt-1" value={spotId} onChange={(e) => setSpotId(e.target.value)}>
          {INTERACTABLES.filter((i) => i.kind === 'meditation').map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </label>
      <label className="mt-3 block text-sm text-white/70">Thời lượng
        <select className="mt-1" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[5, 10, 15, 30, 60, 0].map((m) => <option key={m} value={m}>{m === 0 ? 'Không giới hạn' : `${m} phút`}</option>)}
        </select>
      </label>
      <div className="mt-4 flex gap-2">
        <button className="btn-gold flex-1 rounded-xl px-4 py-3" onClick={() => startMeditation(spot, minutes)}>Bắt đầu ngồi thiền</button>
        <button className="btn-ghost rounded-xl px-4 py-3" onClick={() => setPanel('none')}>Đóng</button>
      </div>
    </div>
  )
}

function SutraPanel() {
  const { sutraId, setSutra, sutraMode, setSutraMode, fontSize, setFontSize, setPanel } = useStore()
  const [speaking, setSpeaking] = useState(false)
  const sutra = SUTRAS.find((s) => s.id === sutraId) ?? SUTRAS[0]

  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* noop */ } }, [])
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* noop */ } }, [sutraId])

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) { alert('Trình duyệt này không hỗ trợ giọng đọc tổng hợp.'); return }
    if (speaking) { window.speechSynthesis.pause(); setSpeaking(false); return }
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setSpeaking(true); return }
    const u = new SpeechSynthesisUtterance(sutra.excerpt)
    u.lang = 'vi-VN'; u.rate = 0.9
    u.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(u); setSpeaking(true)
  }

  return (
    <div className="panel rounded-2xl p-5 max-w-lg w-full max-h-[75vh] overflow-y-auto">
      <div className="flex justify-between items-start gap-3">
        <h2 className="text-lg font-bold">Kinh sách</h2>
        <button className="btn-ghost rounded-lg px-3 py-1" onClick={() => { window.speechSynthesis?.cancel(); setPanel('none') }}>Đóng</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUTRAS.map((s) => (
          <button key={s.id} className={`rounded-xl px-3 py-2 text-sm ${s.id === sutraId ? 'btn-gold' : 'btn-ghost'}`} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setSutra(s.id) }}>{s.title}</button>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/70">{sutra.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={`rounded-xl px-3 py-2 text-sm ${sutraMode === 'read' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setSutraMode('read')}>📖 Đọc kinh</button>
        <button className={`rounded-xl px-3 py-2 text-sm ${sutraMode === 'listen' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setSutraMode('listen')}>🔊 Nghe (giọng máy)</button>
        {sutraMode === 'listen' && <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={toggleSpeech}>{speaking ? '⏸ Dừng đọc' : '▶ Đọc trích dẫn'}</button>}
        <label className="text-sm text-white/70 ml-auto">Cỡ chữ
          <input type="range" min={14} max={28} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24" />
        </label>
      </div>
      <p className="mt-4 leading-relaxed text-amber-50" style={{ fontSize }}>{sutra.excerpt}</p>
      <p className="mt-4 text-xs text-white/60">{SUTRA_NOTE}</p>
    </div>
  )
}

function AudioPanel() {
  const { volumes, setVolume, ambientOn, setAmbientOn, mokOn, setMokOn, mokTempo, setMokTempo, setPanel } = useStore()
  const [autoMok, setAutoMok] = useState(false)
  useEffect(() => {
    if (!autoMok || !mokOn || mokTempo <= 0) return
    const id = setInterval(() => audio.mok(), 60000 / mokTempo)
    return () => clearInterval(id)
  }, [autoMok, mokOn, mokTempo])

  const slider = (label: string, key: keyof typeof volumes) => (
    <label className="block text-sm text-white/80">{label}: {Math.round(volumes[key] * 100)}%
      <input type="range" min={0} max={1} step={0.05} value={volumes[key]}
        onChange={(e) => { const v = Number(e.target.value); setVolume(key, v); audio.setVolume(key, v) }} className="w-full" />
    </label>
  )
  return (
    <div className="panel rounded-2xl p-5 max-w-md w-full">
      <div className="flex justify-between"><h2 className="text-lg font-bold">Âm thanh</h2><button className="btn-ghost rounded-lg px-3 py-1" onClick={() => setPanel('none')}>Đóng</button></div>
      <p className="mt-1 text-xs text-white/60">Âm thanh chỉ bắt đầu sau khi bạn bật — không tự phát khi mở trang.</p>
      <div className="mt-3 space-y-3">
        <button className={`w-full rounded-xl px-4 py-2 ${ambientOn ? 'btn-gold' : 'btn-ghost'}`} onClick={() => {
          audio.unlock()
          if (ambientOn) { audio.stopAmbient(); setAmbientOn(false) } else { audio.startAmbient(); setAmbientOn(true) }
        }}>{ambientOn ? '🔇 Tắt âm thanh môi trường' : '🌿 Bật âm thanh môi trường'}</button>
        {slider('Âm thanh môi trường', 'ambient')}
        {slider('Chuông', 'bell')}
        {slider('Mõ', 'mok')}
        {slider('Giọng đọc / tụng', 'chant')}
        {slider('Tương tác (tràng hạt)', 'interaction')}
      </div>
      <div className="mt-4 border-t border-white/15 pt-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mokOn} onChange={(e) => setMokOn(e.target.checked)} className="w-4" /> Bật tiếng mõ</label>
        <label className="mt-2 block text-sm text-white/80">Nhịp mõ tự động (nhịp/phút, 0 = chỉ gõ tay)
          <select className="mt-1" value={mokTempo} onChange={(e) => setMokTempo(Number(e.target.value))}>
            {[0, 30, 45, 60, 90].map((v) => <option key={v} value={v}>{v === 0 ? 'Chỉ gõ tay' : `${v} nhịp/phút`}</option>)}
          </select>
        </label>
        <div className="mt-2 flex gap-2">
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => { audio.unlock(); audio.mok() }}>Gõ mõ ngay</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => { audio.unlock(); audio.bell() }}>Thỉnh chuông</button>
          {mokTempo > 0 && <button className={`rounded-xl px-3 py-2 text-sm ${autoMok ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setAutoMok(!autoMok)}>{autoMok ? 'Dừng mõ tự động' : 'Mõ tự động'}</button>}
        </div>
      </div>
    </div>
  )
}

function MalaPanel() {
  const { malaCount, incrementMala, resetMala, malaShowCounter, setMalaShowCounter, setPanel, meditation } = useStore()
  const inCycle = malaCount % 108
  const cycles = Math.floor(malaCount / 108)
  const [justDone, setJustDone] = useState(false)
  const press = () => {
    audio.unlock(); audio.tick()
    const next = malaCount + 1
    incrementMala()
    if (next % 108 === 0) { setJustDone(true); setTimeout(() => setJustDone(false), 3000) }
  }
  return (
    <div className="panel rounded-2xl p-5 max-w-md w-full text-center">
      <div className="flex justify-between"><h2 className="text-lg font-bold">Tràng hạt</h2><button className="btn-ghost rounded-lg px-3 py-1" onClick={() => setPanel('none')}>Đóng</button></div>
      {meditation && <p className="mt-1 text-sm text-emerald-300">Đang thiền — tràng hạt vẫn dùng được.</p>}
      <button onClick={press} className="mx-auto mt-4 block h-36 w-36 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 text-5xl shadow-xl active:scale-95 transition" aria-label="Lần một hạt">📿</button>
      <p className="mt-2 text-sm text-white/70">Chạm vào tràng hạt để lần một hạt.</p>
      {malaShowCounter && (
        <div className="mt-3">
          <p className="text-3xl font-bold">{inCycle} / 108 hạt</p>
          <p className="text-sm text-white/70">Tổng đã lần: {malaCount} hạt · {cycles} vòng</p>
          <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-white/15"><div className="h-full bg-amber-400" style={{ width: `${(inCycle / 108) * 100}%` }} /></div>
        </div>
      )}
      {justDone && <p className="mt-3 text-emerald-300">Đã đủ một vòng 108 hạt. Bạn có thể tiếp tục hoặc dừng lại nghỉ ngơi.</p>}
      <p className="mt-3 text-xs text-white/60">Số lần lần hạt chỉ là công cụ đếm để hỗ trợ thực hành, không đồng nghĩa với công đức.</p>
      <div className="mt-3 flex justify-center gap-2">
        <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setMalaShowCounter(!malaShowCounter)}>{malaShowCounter ? 'Ẩn bộ đếm' : 'Hiện bộ đếm'}</button>
        <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={resetMala}>Đặt lại</button>
      </div>
    </div>
  )
}

function SettingsPanel() {
  const { quality, setQuality, profile, setProfile, history, setPanel, setScreen } = useStore()
  const [name, setName] = useState(profile.displayName)
  const [deleted, setDeleted] = useState(false)
  return (
    <div className="panel rounded-2xl p-5 max-w-md w-full max-h-[75vh] overflow-y-auto">
      <div className="flex justify-between"><h2 className="text-lg font-bold">Cài đặt & hồ sơ</h2><button className="btn-ghost rounded-lg px-3 py-1" onClick={() => setPanel('none')}>Đóng</button></div>
      <label className="mt-3 block text-sm text-white/80">Tên hiển thị
        <input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button className="btn-ghost mt-2 rounded-xl px-3 py-2 text-sm" onClick={() => setProfile({ ...profile, displayName: name.trim() || 'Khách tham quan' })}>Lưu tên</button>
      <label className="mt-4 block text-sm text-white/80">Chất lượng đồ họa
        <select className="mt-1" value={quality} onChange={(e) => setQuality(e.target.value as typeof quality)}>
          <option value="low">Low — tắt bóng, ít hiệu ứng</option>
          <option value="medium">Medium</option>
          <option value="high">High — bóng nét, nhiều hiệu ứng</option>
        </select>
      </label>
      <div className="mt-4">
        <h3 className="font-bold">Lịch sử thiền</h3>
        {history.length === 0 ? <p className="mt-1 text-sm text-white/60">Chưa có buổi thiền nào được lưu.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {history.slice(0, 20).map((h) => (
              <li key={h.id} className="flex justify-between gap-2 text-white/80">
                <span>{new Date(h.date).toLocaleString('vi-VN')} · {h.spotId}</span>
                <span>{fmt(h.actualSeconds * 1000)} / {h.plannedMinutes === 0 ? '∞' : `${h.plannedMinutes}′`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="mt-5 w-full rounded-xl bg-red-900/70 border border-red-400/40 px-4 py-2 text-sm" onClick={() => { clearPersonalData(); setDeleted(true); setProfile({ displayName: 'Khách tham quan', isGuest: true }) }}>Xóa dữ liệu cá nhân trên trình duyệt này</button>
      {deleted && <p className="mt-2 text-sm text-emerald-300">Đã xóa hồ sơ, lịch sử và cài đặt đã lưu trên trình duyệt này.</p>}
      <button className="btn-ghost mt-3 w-full rounded-xl px-4 py-2" onClick={() => setScreen('home')}>Về trang chính</button>
    </div>
  )
}

export default function HUD() {
  const { nearby, panel, setPanel, meditation, focusMode, setFocusMode, profile, setScreen, requestInteract, endMeditation, setNearby } = useStore()

  const exitTemple = () => {
    if (meditation) endMeditation()
    audio.stopAmbient()
    setPanel('none'); setNearby(null); setScreen('home')
  }

  if (focusMode) {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3">
        <div className="flex justify-end pointer-events-auto">
          <button className="btn-ghost rounded-xl px-4 py-2 text-sm" onClick={() => setFocusMode(false)}>Hiện giao diện</button>
        </div>
        {meditation && panel === 'meditation' && <div className="flex justify-center pointer-events-auto"><MeditationPanel /></div>}
        {panel !== 'meditation' && panel !== 'none' && (
          <div className="flex justify-center pointer-events-auto">
            {panel === 'mala' && <MalaPanel />}
            {panel === 'sutra' && <SutraPanel />}
          </div>
        )}
        <div />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
      {/* Thanh trên */}
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="panel rounded-xl px-3 py-2 text-sm">
          <div className="font-bold">🛕 Đi Chùa Online</div>
          <div className="text-white/70 text-xs">Xin chào, {profile.displayName} · {meditation ? 'Đang thiền' : 'Đang tham quan'}</div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setFocusMode(true)}>Tập trung</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={exitTemple}>Thoát chùa</button>
        </div>
      </div>

      <div className="flex-1" />

      {/* Nhắc tương tác */}
      {nearby && !meditation && (
        <div className="mx-auto mb-3 pointer-events-auto">
          <button className="btn-gold rounded-full px-5 py-3 shadow-xl pulse-soft" onClick={() => requestInteract()}>
            {nearby.label} — {nearby.hint}
          </button>
        </div>
      )}
      {meditation && (
        <div className="mx-auto mb-3 panel rounded-full px-4 py-2 text-sm">🧘 Đang thiền tại {meditation.spotId} — mở bảng thiền để tạm dừng / kết thúc.</div>
      )}

      {/* Panel giữa */}
      {panel !== 'none' && (
        <div className="pointer-events-auto mx-auto mb-3 w-full max-w-lg px-3 flex justify-center">
          {panel === 'meditation' && <MeditationPanel />}
          {panel === 'sutra' && <SutraPanel />}
          {panel === 'audio' && <AudioPanel />}
          {panel === 'mala' && <MalaPanel />}
          {panel === 'settings' && <SettingsPanel />}
          {panel === 'profile' && <SettingsPanel />}
        </div>
      )}

      {/* Thanh dưới */}
      <div className="pointer-events-auto flex items-end justify-between gap-3 p-3">
        <div className="hidden sm:block"><Joystick /></div>
        <div className="sm:hidden"><Joystick /></div>
        <div className="flex flex-wrap justify-end gap-2 max-w-[60%]">
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setPanel(panel === 'meditation' ? 'none' : 'meditation')}>🧘 Thiền</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setPanel(panel === 'sutra' ? 'none' : 'sutra')}>📖 Kinh</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setPanel(panel === 'audio' ? 'none' : 'audio')}>🔊 Âm thanh</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setPanel(panel === 'mala' ? 'none' : 'mala')}>📿 Tràng hạt</button>
          <button className="btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => setPanel(panel === 'settings' ? 'none' : 'settings')}>⚙️ Cài đặt</button>
        </div>
      </div>
      <p className="pointer-events-none pb-2 text-center text-[11px] text-white/50">WASD / mũi tên để đi · Kéo chuột xoay camera · Phím E để tương tác · Trên điện thoại dùng joystick.</p>
    </div>
  )
}
