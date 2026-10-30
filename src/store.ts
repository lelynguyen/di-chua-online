import { create } from 'zustand'

export type Quality = 'low' | 'medium' | 'high'
export type Panel = 'none' | 'meditation' | 'sutra' | 'audio' | 'mala' | 'settings' | 'profile'
export type InteractKind = 'meditation' | 'bell' | 'mok' | 'altar'

export interface Interactable {
  id: string
  kind: InteractKind
  label: string
  hint: string
  x: number
  z: number
}

export interface MeditationState {
  spotId: string
  spotX: number
  spotZ: number
  /** minutes, 0 = unlimited */
  plannedMinutes: number
  status: 'running' | 'paused'
  /** ms accumulated while running, excluding pauses */
  accumulatedMs: number
  /** timestamp of last resume, null when paused */
  lastResumeAt: number | null
}

export interface HistoryEntry {
  id: string
  date: string
  spotId: string
  plannedMinutes: number
  actualSeconds: number
}

export interface Profile {
  displayName: string
  isGuest: boolean
}

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } as T : fallback
  } catch { return fallback }
}
const loadArr = <T,>(key: string): T[] => {
  try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}

interface State {
  screen: 'home' | 'temple'
  profile: Profile
  quality: Quality
  volumes: Record<'ambient' | 'bell' | 'mok' | 'chant' | 'interaction', number>
  ambientOn: boolean
  mokOn: boolean
  mokTempo: number // beats per minute for auto-mok, 0 = manual only
  focusMode: boolean
  panel: Panel
  nearby: Interactable | null
  meditation: MeditationState | null
  malaCount: number
  malaShowCounter: boolean
  sutraId: string
  sutraMode: 'read' | 'listen'
  fontSize: number
  history: HistoryEntry[]
  joystick: { x: number; y: number }
  interactNonce: number
  setScreen: (s: State['screen']) => void
  setProfile: (p: Profile) => void
  setQuality: (q: Quality) => void
  setVolume: (k: keyof State['volumes'], v: number) => void
  setAmbientOn: (v: boolean) => void
  setMokOn: (v: boolean) => void
  setMokTempo: (v: number) => void
  setFocusMode: (v: boolean) => void
  setPanel: (p: Panel) => void
  setNearby: (n: Interactable | null) => void
  setJoystick: (j: { x: number; y: number }) => void
  startMeditation: (spot: Interactable, minutes: number) => void
  pauseMeditation: () => void
  resumeMeditation: () => void
  endMeditation: () => HistoryEntry | null
  cancelMeditation: () => void
  incrementMala: () => void
  resetMala: () => void
  setMalaShowCounter: (v: boolean) => void
  setSutra: (id: string) => void
  setSutraMode: (m: 'read' | 'listen') => void
  setFontSize: (n: number) => void
  requestInteract: () => void
}

export const useStore = create<State>((set, get) => ({
  screen: 'home',
  profile: load<Profile>('dco-profile', { displayName: 'Khách tham quan', isGuest: true }),
  quality: load<{ quality: Quality }>('dco-settings', { quality: 'medium' }).quality,
  volumes: load('dco-volumes', { ambient: 0.5, bell: 0.8, mok: 0.8, chant: 0.8, interaction: 0.7 }),
  ambientOn: false,
  mokOn: true,
  mokTempo: 0,
  focusMode: false,
  panel: 'none',
  nearby: null,
  meditation: null,
  malaCount: 0,
  malaShowCounter: true,
  sutraId: 'chu-dai-bi',
  sutraMode: 'read',
  fontSize: 18,
  history: loadArr<HistoryEntry>('dco-history'),
  joystick: { x: 0, y: 0 },
  interactNonce: 0,
  setScreen: (screen) => set({ screen }),
  setProfile: (profile) => { localStorage.setItem('dco-profile', JSON.stringify(profile)); set({ profile }) },
  setQuality: (quality) => { localStorage.setItem('dco-settings', JSON.stringify({ quality })); set({ quality }) },
  setVolume: (k, v) => { const volumes = { ...get().volumes, [k]: v }; localStorage.setItem('dco-volumes', JSON.stringify(volumes)); set({ volumes }) },
  setAmbientOn: (ambientOn) => set({ ambientOn }),
  setMokOn: (mokOn) => set({ mokOn }),
  setMokTempo: (mokTempo) => set({ mokTempo }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setPanel: (panel) => set({ panel }),
  setNearby: (nearby) => set({ nearby }),
  setJoystick: (joystick) => set({ joystick }),
  startMeditation: (spot, minutes) => set({
    meditation: { spotId: spot.id, spotX: spot.x, spotZ: spot.z, plannedMinutes: minutes, status: 'running', accumulatedMs: 0, lastResumeAt: Date.now() },
    panel: 'meditation',
  }),
  pauseMeditation: () => {
    const m = get().meditation; if (!m || m.status !== 'running' || !m.lastResumeAt) return
    set({ meditation: { ...m, status: 'paused', accumulatedMs: m.accumulatedMs + (Date.now() - m.lastResumeAt), lastResumeAt: null } })
  },
  resumeMeditation: () => {
    const m = get().meditation; if (!m || m.status !== 'paused') return
    set({ meditation: { ...m, status: 'running', lastResumeAt: Date.now() } })
  },
  endMeditation: () => {
    const m = get().meditation; if (!m) return null
    const actualMs = m.accumulatedMs + (m.status === 'running' && m.lastResumeAt ? Date.now() - m.lastResumeAt : 0)
    const entry: HistoryEntry = { id: `${Date.now()}`, date: new Date().toISOString(), spotId: m.spotId, plannedMinutes: m.plannedMinutes, actualSeconds: Math.round(actualMs / 1000) }
    const history = [entry, ...get().history].slice(0, 100)
    localStorage.setItem('dco-history', JSON.stringify(history))
    set({ meditation: null, history, panel: 'none' })
    return entry
  },
  cancelMeditation: () => set({ meditation: null, panel: 'none' }),
  incrementMala: () => set((s) => ({ malaCount: s.malaCount + 1 })),
  resetMala: () => set({ malaCount: 0 }),
  setMalaShowCounter: (malaShowCounter) => set({ malaShowCounter }),
  setSutra: (sutraId) => set({ sutraId }),
  setSutraMode: (sutraMode) => set({ sutraMode }),
  setFontSize: (fontSize) => set({ fontSize }),
  requestInteract: () => set((s) => ({ interactNonce: s.interactNonce + 1 })),
}))

export function meditationElapsedMs(m: MeditationState): number {
  return m.accumulatedMs + (m.status === 'running' && m.lastResumeAt ? Date.now() - m.lastResumeAt : 0)
}

export function clearPersonalData() {
  localStorage.removeItem('dco-profile')
  localStorage.removeItem('dco-history')
  localStorage.removeItem('dco-volumes')
  localStorage.removeItem('dco-settings')
}
