/**
 * AudioManager độc lập với engine 3D.
 * - Không tự phát tiếng khi mở trang: mọi âm thanh chỉ bắt đầu sau thao tác của người dùng.
 * - Chuông / mõ / môi trường được tổng hợp bằng Web Audio API (không dùng file thu âm
 *   chưa rõ giấy phép). Đây là âm thanh mẫu, có thể thay bằng file có giấy phép trong
 *   thư mục public/audio/ mà không cần đổi giao diện gọi hàm.
 * - Một DynamicsCompressor chung ngăn chồng tiếng gây méo (clipping).
 */
export type Channel = 'ambient' | 'bell' | 'mok' | 'chant' | 'interaction'

class AudioManager {
  private ctx: AudioContext | null = null
  private gains: Record<Channel, GainNode | null> = { ambient: null, bell: null, mok: null, chant: null, interaction: null }
  private volumes: Record<Channel, number> = { ambient: 0.5, bell: 0.8, mok: 0.8, chant: 0.8, interaction: 0.7 }
  private ambientNodes: { stop: () => void } | null = null
  private lastBellAt = 0
  private lastMokAt = 0

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

  bell() {
    this.unlock(); if (!this.ctx || !this.out('bell')) return
    const now = this.ctx.currentTime
    // Giới hạn chồng tiếng: bỏ qua tiếng chuông mới nếu tiếng trước chưa đầy 250ms.
    if (now - this.lastBellAt < 0.25) return
    this.lastBellAt = now
    // Chuông chùa: các partial không hài hòa, decay dài.
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
    // Tiếng mõ: sine ngắn ~880Hz + một chút nhiễu gỗ.
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

  startAmbient() {
    this.unlock(); if (!this.ctx || !this.out('ambient') || this.ambientNodes) return
    const ctx = this.ctx
    // Tiếng gió / lá nhẹ: nhiễu hồng qua lowpass, gain dao động chậm.
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
