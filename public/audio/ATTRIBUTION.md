# Nguồn âm thanh — Đi Chùa Online

## Đã có trong app (bản thu thật)

Tất cả các file dưới đây là bản preview HQ trên Freesound, giấy phép CC0 1.0
(không bắt buộc ghi công, nhưng app vẫn ghi nguồn để tri ân và minh bạch).
Có thể thay bằng bản WAV đầy đủ cùng tên file mà không cần đổi code.

Lưu ý kỹ thuật: trong repo, các file mp3 được lưu dưới dạng
`*.mp3.b64` (text) vì connector GitHub chỉ push được file UTF-8.
Lúc build/dev, `scripts/decode-audio.mjs` (chạy qua `predev`/`prebuild`)
tự giải mã chúng thành `*.mp3` trong `public/audio/`. Nếu bạn upload file
`.mp3` thật lên repo bằng giao diện web GitHub, script sẽ không ghi đè
lên file đó trừ khi file `.b64` mới hơn.

- `bell.mp3` — “Bell at Daitokuji temple, Kyoto” — nahmandub, Freesound
  https://freesound.org/people/nahmandub/sounds/131348/ — CC0 1.0
  Chuông chùa thật, dài ~7,7 giây.
- `mok.mp3` — “Mokugyo” (mõ gỗ, Kohya-san, Nhật Bản) — jonopodmore, Freesound
  https://freesound.org/people/jonopodmore/sounds/607215/ — CC0 1.0
  Một tiếng mõ đơn, dài ~1,8 giây; app lặp lại theo nhịp người dùng chọn.
- `ambient.mp3` — “Birds Ambience Atmosphere early morning field slight breeze”
  — WavJunction.com, Freesound
  https://freesound.org/people/WavJunction.com/sounds/456766/ — CC0 1.0
  Chim, gió nhẹ buổi sớm, dài ~60 giây, phát lặp làm môi trường.

Nếu các file trên bị thiếu hoặc nạp lỗi, app tự dùng âm thanh tổng hợp
Web Audio làm dự phòng và vẫn hoạt động bình thường.

## Chưa có — tụng kinh thật

Chưa có bản tụng thật nào được tích hợp, kể cả Chú Đại Bi, vì chưa tìm được
bản thu có giấy phép dùng lại rõ ràng:

- Các bản tụng trên YouTube của các thầy/chùa, công ty truyền thông Phật giáo
  phần lớn có bản quyền đầy đủ — KHÔNG được tải về rồi đăng lại.
- Một số nguồn chỉ cho nghe cá nhân, không cho đăng lại — cũng KHÔNG dùng được.
- Album “Buddhist Chants” royalty-free trên Bandcamp (TERA MANGALA) là hướng
  mua bản quyền hợp lệ, nhưng chưa mua và chưa xác minh track Chú Đại Bi
  trong đó — không được ghi là đã có.

Cách thêm một bài tụng thật, khi đã có quyền:

1. Đặt file vào `public/audio/`, ví dụ `chu-dai-bi.mp3`.
2. Trong `src/data/sutras.ts`, đặt `audioUrl: '/audio/chu-dai-bi.mp3'` và
   `audioSource: 'Tên người tụng / nguồn + giấy phép'`.
3. Build lại và kiểm tra trình phát (phát/dừng/tua/lặp/tốc độ).

Không gắn link YouTube, link drive không rõ quyền, hay file tải lậu.
