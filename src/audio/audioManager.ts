/**
 * AudioManager độc lập với engine 3D.
 * - Không tự phát tiếng khi mở trang: mọi âm thanh chỉ bắt đầu sau thao tác của người dùng.
 * - Ưu tiên bản thu thật: chuông, mõ, môi trường được nạp từ public/audio/ khi có file
 *   (xem public/audio/ATTRIBUTION.md — toàn bộ file hiện tại là CC0 trên Freesound,
 *   bản preview HQ; có thể thay bằng bản WAV đầy đủ cùng tên file mà không đổi code).
 *   Nếu file thiếu hoặc nạp lỗi, tự động dùng âm thanh tổng hợp Web Audio làm dự phòng.
 * - Một DynamicsCompressor chung ngăn chồng tiếng gây méo (clipping).
 */
export type Channel = 'ambient' | 'bell' | 'mok' | 'chant' | 'interaction'
type SampleName = 'bell' | 'mok' | 'ambient'

class AudioManager {
  private ctx: AudioContext | null = null
  private gains: Record<Channel, GainNode | null> = { ambient: null, bell: null, mok: null, chant: null, interaction: null }
  private volumes: Record<Channel, number> = { ambient: 0.5, bell: 0.8, mok: 0.8, chant: 0.8, interaction: 0.7 }
  private ambientNodes: { stop: () => void } | null = null
  private lastBellAt = 0
  private lastMokAt = 0
  private buffers: Partial<Record<SampleName, AudioBuffer>> = {}
  private loading: Partial<Record<SampleName, Promise<AudioBuffer | null>>> = {}

  /** Phải được gọi từ một thao tác của người dùng (click / chạm). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      const comp = this.ctx.createDynamicsCompressor()
      comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 6
      comp.connect(this.ctx.destination)
      const masterGain = this.ctx.createGain()
      masterGain.gain.value = 1
      masterGain.connect(comp)
      const channels: Channel[] = ['ambient', 'bell', 'mok', 'chant', 'interaction']
      for (const ch of channels) {
        const g = this.ctx.createGain()
        g.gain.value = this.volumes[ch]
        g.connect(masterGain)
        this.gains[ch] = g
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setVolume(ch: Channel, v: number) {
    this.volumes[ch] = v
    if (this.ctx && this.gains[ch]) this.gains[ch]!.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05)
  }

  private out(ch: Channel): GainNode | null { return this.gains[ch] }

  private loadSample(name: SampleName): Promise<AudioBuffer | null> {
    if (this.buffers[name]) return Promise.resolve(this.buffers[name]!)
    if (!this.loading[name]) {
      this.loading[name] = (async () => {
        try {
          if (!this.ctx) return null
          const res = await fetch(`/audio/${name}.mp3`)
          if (!res.ok) return null
          const buf = await this.ctx.decodeAudioData(await res.arrayBuffer())
          this.buffers[name] = buf
          return buf
        } catch { return null }
      })()
    }
    return this.loading[name]!
  }

  /** Nạp trước các bản thu thật (không phát tiếng) sau thao tác đầu tiên của người dùng. */
  preloadSamples() {
    this.unlock()
    if (!this.ctx) return
    void this.loadSample('bell'); void this.loadSample('mok'); void this.loadSample('ambient')
  }

  private playBuffer(name: 'bell' | 'mok', channel: Channel): boolean {
    const buf = this.buffers[name]
    if (!this.ctx || !buf || !this.out(channel)) return false
    const src = this.ctx.createBufferSource(); src.buffer = buf
    src.connect(this.out(channel)!)
    src.start()
    return true
  }

  bell() {
    this.unlock(); if (!this.ctx || !this.out('bell')) return
    const now = this.ctx.currentTime
    if (now - this.lastBellAt < 0.25) return
    this.lastBellAt = now
    // Bản thu thật nếu đã nạp; nếu chưa, bắt đầu nạp và dùng tổng hợp lần này.
    if (this.playBuffer('bell', 'bell')) return
    void this.loadSample('bell')
    const partials: Array<[number, number]> = [[196, 0.5], [294, 0.32], [392, 0.22], [523, 0.14], [784, 0.07]]
    partials.forEach(([freq, amp]) => {
      const osc = this.ctx!.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq
      const g = this.ctx!.createGain()
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(amp, now + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 5)
      osc.connect(g); g.connect(this.out('bell')!)
      osc.start(now); osc.stop(now + 5.2)
    })
  }

  mok() {
    this.unlock(); if (!this.ctx || !this.out('mok')) return
    const now = this.ctx.currentTime
    if (now - this.lastMokAt < 0.08) return
    this.lastMokAt = now
    if (this.playBuffer('mok', 'mok')) return
    void this.loadSample('mok')
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(920, now); osc.frequency.exponentialRampToValueAtTime(720, now + 0.08)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.9, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(g); g.connect(this.out('mok')!); osc.start(now); osc.stop(now + 0.2)
  }

  tick() {
    this.unlock(); if (!this.ctx || !this.out('interaction')) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 1700
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(g); g.connect(this.out('interaction')!); osc.start(now); osc.stop(now + 0.06)
  }

  async startAmbient() {
    this.unlock(); if (!this.ctx || !this.out('ambient') || this.ambientNodes) return
    const ctx = this.ctx
    // Ưu tiên bản thu thật (chim, gió nhẹ); nếu chưa có, dùng nhiễu tổng hợp.
    const real = await this.loadSample('ambient')
    if (real && this.out('ambient')) {
      const src = ctx.createBufferSource(); src.buffer = real; src.loop = true
      const g = ctx.createGain(); g.gain.value = 0.6
      src.connect(g); g.connect(this.out('ambient')!)
      src.start()
      this.ambientNodes = { stop: () => { try { src.stop() } catch { /* already stopped */ } } }
      return
    }
    if (this.ambientNodes) return
    const len = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2 }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420
    const g = ctx.createGain(); g.gain.value = 0.22
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.08
    lfo.connect(lfoGain); lfoGain.connect(g.gain)
    src.connect(filter); filter.connect(g); g.connect(this.out('ambient')!)
    src.start(); lfo.start()
    this.ambientNodes = { stop: () => { try { src.stop(); lfo.stop() } catch { /* already stopped */ } } }
  }

  stopAmbient() {
    this.ambientNodes?.stop(); this.ambientNodes = null
  }

  get ambientPlaying() { return this.ambientNodes !== null }
}

export const audio = new AudioManager()
