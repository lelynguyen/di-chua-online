import { useState } from 'react'
import { useStore } from '../store'
import { supabaseStatus } from '../lib/supabase'

export default function Home() {
  const { setScreen, setProfile, profile, quality, setQuality, history } = useStore()
  const [name, setName] = useState(profile.displayName === 'Khách tham quan' ? '' : profile.displayName)
  const totalMinutes = Math.round(history.reduce((a, h) => a + h.actualSeconds, 0) / 60)

  const enter = (guest: boolean) => {
    const displayName = guest ? 'Khách tham quan' : (name.trim() || 'Khách tham quan')
    setProfile({ displayName, isGuest: guest })
    setScreen('temple')
  }

  return (
    <div className="min-h-full overflow-y-auto bg-gradient-to-b from-[#2b1d0e] via-[#171310] to-[#171310] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-center tracking-[0.3em] text-amber-300/80 text-sm">NAM MÔ A DI ĐÀ PHẬT</p>
        <h1 className="mt-3 text-center text-4xl sm:text-5xl font-bold leading-tight">Đi Chùa Online</h1>
        <p className="mt-2 text-center text-amber-100/80">Không gian chùa 3D thanh tịnh — tham quan, ngồi thiền, nghe kinh, lần tràng hạt.</p>

        <div className="panel mt-8 rounded-2xl p-5">
          <label className="text-sm text-amber-100/80" htmlFor="displayName">Tên hiển thị (không bắt buộc)</label>
          <input id="displayName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: An Nhiên" className="mt-2" />
          <p className="mt-2 text-xs text-white/60">
            Bản MVP chạy chế độ khách trên trình duyệt, không yêu cầu và không lưu mật khẩu.
            {supabaseStatus}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="btn-gold flex-1 rounded-xl px-4 py-3" onClick={() => enter(false)}>Vào chùa</button>
            <button className="btn-ghost flex-1 rounded-xl px-4 py-3" onClick={() => enter(true)}>Tham quan thử (khách)</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="text-white/70">Chất lượng đồ họa
              <select className="mt-1" value={quality} onChange={(e) => setQuality(e.target.value as typeof quality)}>
                <option value="low">Low — nhẹ nhất</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-white/70">Lịch sử thiền của bạn</div>
              <div className="mt-1 font-bold">{history.length} buổi · {totalMinutes} phút</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
          {[
            ['🚶 Đi dạo 3D', 'WASD / phím mũi tên, kéo chuột xoay camera, joystick trên điện thoại.'],
            ['🧘 Ngồi thiền', 'Đến gần đệm thiền trong chánh điện, nhấn E, chọn 5–60 phút hoặc không giới hạn.'],
            ['📿 Tràng hạt & mõ', 'Lần hạt 108, gõ mõ, thỉnh chuông — âm thanh chỉ phát sau khi bạn chạm vào nút.'],
          ].map(([t, d]) => (
            <div key={t} className="panel rounded-2xl p-4"><div className="font-bold">{t}</div><p className="mt-1 text-white/70">{d}</p></div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Tượng Phật và kiến trúc trong bản này là mô hình thủ tục tạm thời, có thể thay bằng file GLB có giấy phép.
          Nội dung kinh hiển thị là trích dẫn ngắn tham khảo, chưa phải bản kinh đầy đủ.
        </p>
      </div>
    </div>
  )
}
