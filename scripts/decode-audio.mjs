/**
 * Giải mã các file âm thanh từ dạng base64 text sang mp3 trước khi build/dev.
 *
 * Lý do: connector GitHub của Muse chỉ push được file UTF-8, không push được
 * file mp3 nhị phân trực tiếp. Vì vậy repo lưu `public/audio/*.mp3.b64`
 * (text ASCII, cùng nội dung, cùng giấy phép CC0 — xem ATTRIBUTION.md).
 * Script này chạy tự động qua `predev` / `prebuild` trong package.json.
 *
 * Quy tắc: chỉ giải mã khi file .mp3 chưa có, hoặc file .b64 mới hơn file .mp3.
 * Nếu bạn upload file .mp3 thật lên repo bằng giao diện web GitHub, script
 * sẽ không ghi đè lên file đó (trừ khi bạn cập nhật cả file .b64 mới hơn).
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio')
if (!existsSync(dir)) process.exit(0)

for (const name of readdirSync(dir)) {
  if (!name.endsWith('.mp3.b64')) continue
  const b64Path = join(dir, name)
  const mp3Path = join(dir, name.slice(0, -4))
  const b64Time = statSync(b64Path).mtimeMs
  const mp3Time = existsSync(mp3Path) ? statSync(mp3Path).mtimeMs : 0
  if (mp3Time >= b64Time) continue
  const mp3 = Buffer.from(readFileSync(b64Path, 'utf8').replace(/\s/g, ''), 'base64')
  writeFileSync(mp3Path, mp3)
  console.log(`Decoded audio: ${name} -> ${mp3Path.split('/').pop()} (${mp3.length} bytes)`)
}
