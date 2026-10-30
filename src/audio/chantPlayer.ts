/**
 * Trình phát tụng kinh bằng bản thu thật (HTMLAudioElement).
 * - Chỉ phát sau thao tác của người dùng; hỗ trợ phát/dừng, tua, lặp 1 bài,
 *   tốc độ phát và volume riêng kênh chant (đồng bộ với AudioManager).
 * - Không dùng giọng đọc máy ở đây: nếu bài chưa có audioUrl, giao diện phải
 *   nói rõ là chưa có bản tụng thật có giấy phép, thay vì giả vờ đó là tụng thật.
 */
export type RepeatMode = 'off' | 'one'

type Listener = (state: { playing: boolean; current: number; duration: number }) => void

class ChantPlayer {
  private el: HTMLAudioElement | null = null
  private listeners = new Set<Listener>()
  private repeat: RepeatMode = 'off'
  trackUrl: string | null = null

  onChange(fn: Listener) { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }

  private emit() {
    const s = { playing: !!this.el && !this.el.paused, current: this.el?.currentTime ?? 0, duration: this.el?.duration || 0 }
    this.listeners.forEach((fn) => fn(s))
  }

  load(url: string) {
    this.stop()
    this.trackUrl = url
    this.el = new Audio(url)
    this.el.preload = 'metadata'
    this.el.addEventListener('timeupdate', () => this.emit())
    this.el.addEventListener('loadedmetadata', () => this.emit())
    this.el.addEventListener('play', () => this.emit())
    this.el.addEventListener('pause', () => this.emit())
    this.el.addEventListener('ended', () => {
      if (this.repeat === 'one' && this.el) { this.el.currentTime = 0; void this.el.play() } else this.emit()
    })
  }

  async play() { if (this.el) await this.el.play() }
  pause() { this.el?.pause(); this.emit() }
  stop() { if (this.el) { this.el.pause(); this.el.src = ''; this.el = null } this.emit() }
  seek(seconds: number) { if (this.el) { this.el.currentTime = seconds; this.emit() } }
  setRate(rate: number) { if (this.el) this.el.playbackRate = rate }
  setVolume(v: number) { if (this.el) this.el.volume = v }
  setRepeat(mode: RepeatMode) { this.repeat = mode }
  get playing() { return !!this.el && !this.el.paused }
}

export const chantPlayer = new ChantPlayer()
