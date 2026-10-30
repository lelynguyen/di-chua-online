# Đi Chùa Online — Virtual Buddhist Temple

Không gian chùa Phật giáo 3D chạy thật trên web: tham quan, đi dạo, ngồi thiền,
nghe/đọc kinh, lần tràng hạt, gõ mõ và thỉnh chuông. Giao diện tiếng Việt,
mobile-first, có joystick trên màn hình cảm ứng.

## Chạy local

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # kiểm tra TypeScript + build production
npm run preview    # chạy bản build
```

## Điều khiển

- **WASD / phím mũi tên**: di chuyển nhân vật (góc nhìn người thứ ba).
- **Kéo chuột**: xoay camera. **Lăn chuột**: zoom.
- **Phím E** hoặc nút tương tác khi đến gần: ngồi thiền, thỉnh chuông, gõ mõ, mở kinh.
- **Điện thoại**: joystick góc dưới trái, các nút góc dưới phải.

## Tính năng MVP đã có

- **Thế giới 3D (React Three Fiber + Three.js)**: cổng tam quan, sân chùa, hồ sen,
  chánh điện, tượng Phật, cây, tháp chuông, bàn mõ; va chạm AABB/vòng tròn để
  nhân vật không xuyên tường, tượng, hồ.
- **Thiền**: 6 đệm thiền trong chánh điện, camera tự chuyển khi ngồi, chọn
  5/10/15/30/60 phút hoặc không giới hạn, tạm dừng/tiếp tục/kết thúc.
  Thời gian lưu là thời gian thực (không cộng lúc tạm dừng), lưu vào
  `localStorage` trên trình duyệt.
- **Âm thanh (`src/audio/audioManager.ts`, độc lập với engine 3D)**: ưu tiên bản thu
  thật CC0 trong `public/audio/` (chuông chùa, mõ, chim/gió — xem
  `public/audio/ATTRIBUTION.md`); nếu file thiếu thì dùng Web Audio tổng hợp làm
  dự phòng. Volume riêng từng kênh; có compressor chống méo khi chồng tiếng.
  **Không tự phát tiếng khi mở trang.**
- **Tràng hạt**: 108 hạt/vòng, ẩn/hiện bộ đếm, đặt lại. Số lần lần hạt chỉ là
  công cụ đếm, không được trình bày như công đức.
- **Kinh sách**: thư viện mở rộng được (`src/data/sutras.ts`) với Chú Đại Bi,
  Bát Nhã Tâm Kinh, Kinh Pháp Cú, Kinh A Di Đà, kèm trình phát tụng thật
  (phát/dừng/tua/lặp/tốc độ) khi bài có file có giấy phép. Xem ghi chú kiểm
  chứng bên dưới.
- **Tài khoản**: chế độ khách trên trình duyệt, tên hiển thị, lịch sử thiền,
  cài đặt chất lượng Low/Medium/High, xóa dữ liệu cá nhân.
- **Hiệu năng**: Low tắt bóng đổ, Medium/High tăng dần độ phân giải bóng và
  pixel ratio; có màn hình tải và phương án thay thế khi WebGL không hỗ trợ.

## Ghi chú trung thực về nội dung và tài nguyên

- **Tượng Phật và kiến trúc** trong bản này là mô hình thủ tục dựng bằng
  hình học Three.js, dùng làm bản tạm rõ ràng. Để thay bằng mô hình chuẩn:
  đặt file GLB có giấy phép vào `public/models/` và thay component `Buddha`
  trong `src/three/TempleScene.tsx` bằng loader GLB.
- **Kinh sách**: các mục hiện tại chỉ là mô tả và trích dẫn ngắn tham khảo,
  **không phải bản kinh đầy đủ và không phải bản dịch chính thức**. Phải đối
  chiếu với bản in có uy tín trước khi dùng cho nghi lễ hay công bố rộng rãi.
  Chế độ “Nghe” dùng giọng đọc tổng hợp của trình duyệt, không phải bản tụng
  niệm đã thu âm. Khi có bản dịch/bản thu có giấy phép, thêm `audioUrl` hoặc
  `fullTextUrl` vào `src/data/sutras.ts`.
- **Âm thanh**: chuông/mõ/môi trường dùng bản thu thật CC0 (xem
  `public/audio/ATTRIBUTION.md`), dự phòng bằng Web Audio khi file thiếu.
  Chưa có bản tụng thật nào được tích hợp, kể cả Chú Đại Bi, vì chưa có file
  có giấy phép dùng lại rõ ràng — không dùng bản thu lậu hay giọng máy giả
  làm tụng thật.

## Tài khoản thật với Supabase (Giai đoạn 4, chưa bật)

MVP **không tự viết hệ thống lưu mật khẩu**. Khi triển khai thật:

1. Tạo project Supabase, bật Supabase Auth (email/OAuth).
2. Áp dụng `supabase/schema.sql` (Row Level Security: mỗi tài khoản chỉ
   đọc/ghi dữ liệu của chính mình; lời nguyện mặc định riêng tư).
3. Đặt biến môi trường public (không bao giờ đặt service-role key vào frontend):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, rồi cài
   `@supabase/supabase-js` và thay hồ sơ local bằng Supabase Auth.

## Triển khai

- **Vercel / Cloudflare Pages**: trỏ vào repo, build command `npm run build`,
  output directory `dist`. Không cần biến môi trường cho bản MVP.
- Sau khi có Supabase, thêm 2 biến public ở trên vào cấu hình deploy.

## Cấu trúc

```
src/
  App.tsx                 Màn hình chính / vào chùa / fallback WebGL
  store.ts                Zustand: thiền, tràng hạt, âm lượng, hồ sơ, cài đặt
  audio/audioManager.ts   Web Audio: chuông, mõ, môi trường, lần hạt
  data/sutras.ts          Thư viện kinh (mở rộng được)
  three/TempleScene.tsx   Cổng, sân, chánh điện, nhân vật, camera, va chạm
  components/Home.tsx     Trang giới thiệu + vào chùa
  components/HUD.tsx      Joystick, thiền, kinh, âm thanh, tràng hạt, cài đặt
  lib/supabase.ts         Trạng thái cấu hình Supabase (chưa bật)
supabase/schema.sql       Bảng + RLS cho Giai đoạn 4
```

## Giới hạn đã biết (bản MVP)

- Chưa có nhiều người cùng tham quan, đồng bộ thời gian thực, phòng thiền riêng,
  thả hoa đăng, hay lịch thiền chung — kiến trúc đã tách store/audio/scene để
  bổ sung sau mà không phải viết lại lõi.
- Chưa đo FPS trên thiết bị thật, nên không tuyên bố đạt 60/30 FPS.
- Chưa có file GLB, bản thu tụng kinh hay bản dịch kinh đầy đủ có giấy phép
  (xem ghi chú ở trên).
