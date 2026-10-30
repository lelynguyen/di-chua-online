import * as THREE from 'three'

/**
 * Vật liệu thủ tục vẽ bằng canvas, tạo một lần và tái dùng.
 * Đây là bước cải thiện bề mặt (vân gỗ, đá, ngói) trước khi thay bằng
 * texture PBR / model GLB có giấy phép. Không tạo texture mới trong mỗi frame.
 */
function makeTexture(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function woodTexture(repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  return makeTexture(256, (ctx, s) => {
    ctx.fillStyle = '#7a5230'; ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += 32) {
      ctx.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.12})`; ctx.fillRect(0, y, s, 2)
      ctx.fillStyle = `rgba(255,220,160,${0.04 + Math.random() * 0.06})`; ctx.fillRect(0, y + 2, s, 3)
    }
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(40,22,8,${0.08 + Math.random() * 0.15})`
      ctx.lineWidth = 1
      const y = Math.random() * s
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(s * 0.3, y + (Math.random() - 0.5) * 6, s * 0.7, y + (Math.random() - 0.5) * 6, s, y); ctx.stroke()
    }
  }, repeatX, repeatY)
}

export function stoneTexture(repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  return makeTexture(256, (ctx, s) => {
    ctx.fillStyle = '#b8b0a0'; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 900; i++) {
      const g = 120 + Math.random() * 90
      ctx.fillStyle = `rgba(${g},${g - 10},${g - 25},0.35)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2)
    }
    ctx.strokeStyle = 'rgba(80,70,55,0.35)'; ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); let x = Math.random() * s, y = Math.random() * s; ctx.moveTo(x, y)
      for (let j = 0; j < 4; j++) { x += (Math.random() - 0.5) * 40; y += (Math.random() - 0.5) * 40; ctx.lineTo(x, y) }
      ctx.stroke()
    }
  }, repeatX, repeatY)
}

export function tileTexture(repeatX = 4, repeatY = 2): THREE.CanvasTexture {
  return makeTexture(256, (ctx, s) => {
    ctx.fillStyle = '#8e2f28'; ctx.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += 32) {
      for (let x = 0; x < s; x += 32) {
        const off = (y / 32) % 2 === 0 ? 0 : 16
        ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.15})`
        ctx.beginPath(); ctx.arc(x + off + 16, y + 16, 15, Math.PI, 0); ctx.fill()
        ctx.fillStyle = `rgba(255,180,140,${0.08 + Math.random() * 0.1})`
        ctx.beginPath(); ctx.arc(x + off + 12, y + 12, 10, Math.PI, 0); ctx.fill()
      }
    }
  }, repeatX, repeatY)
}
