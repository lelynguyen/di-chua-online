# Model 3D có giấy phép — Đi Chùa Online

## Cách app dùng model

- App tự tìm `public/models/buddha.glb` lúc chạy (`src/three/Models.tsx`,
  `LicensedBuddha`). Nếu không có file hoặc nạp lỗi, app giữ nguyên tượng
  thủ tục hiện tại, không sập cảnh.
- Model được tự căn giữa và co về chiều cao ~3,2 m, đặt trên đài sen.
  Tượng không bao giờ được bấm/kéo trong 3D.
- Vì connector GitHub chỉ push được file UTF-8, file `.glb` nhị phân có thể
  lưu dưới dạng `buddha.glb.b64` (text) — script `scripts/decode-audio.mjs`
  (chạy qua `predev`/`prebuild`) sẽ giải mã thành `buddha.glb` lúc build.
  Ngoài ra, bạn cũng có thể upload trực tiếp file `.glb` lên repo bằng
  giao diện web GitHub vào thư mục `public/models/`.

## Danh sách ứng viên đã tìm (chưa mua, chưa tải — cần bạn chọn)

Kết quả tìm kiếm ngày 2026-10-30 cho thấy **không có tượng Phật ngồi thiền
GLB miễn phí, đúng pháp tướng, dùng ngay cho web**:

1. **Sketchfab — các tượng Phật CC-BY** (ví dụ: Gandhara Buddha đứng,
   Tian Tan Buddha đứng, Medicine Buddha, Hotei cười): giấy phép cho phép
   dùng lại nếu ghi công, nhưng phần lớn là **tượng đứng hoặc Hotei**, không
   phải tượng ngồi kiết già cho chính điện. Dùng sai pháp tướng còn tệ hơn
   dùng tượng thủ tục. Cần tải về, xem trước, rồi mới quyết.
2. **Meshy AI — gallery CC0**: model AI tạo sẵn, ghi là CC0, nhưng pháp
   tướng và chất lượng cần kiểm chứng từng model; không nên chọn bừa chỉ
   vì “miễn phí”.
3. **CGTrader — “3D Buddha Statue Model in Meditation Pose on Lotus Base”,
   $4, định dạng FBX**: đúng dáng ngồi thiền, nhưng là FBX (không phải
   GLB), cần chuyển đổi qua Blender và kiểm tra điều khoản giấy phép của
   CGTrader trước khi mua. **Chưa mua, chưa xác minh.**
4. **itch.io — “Aged statue of the sitting Buddha” của ManNeko, từ $6**:
   dáng ngồi, trang mô tả nói dùng cá nhân/thương mại được, nhưng là
   asset game/3D print, cần kiểm tra định dạng file và phong cách “tượng
   cổ” có hợp chính điện vàng hay không. **Chưa mua, chưa xác minh.**
5. **Kiến trúc chùa**: chưa có model chùa Việt miễn phí sẵn. Các model
   pagoda miễn phí trên CGTrader là chùa Nhật/Trung (FBX), hoặc pack
   Unreal (Cambodia temples, đã hết đợt miễn phí tháng 10/2024). Thay kiến
   trúc bằng model Nhật/Trung sẽ làm mất bản sắc chùa Việt, nên giữ kiến
   trúc thủ tục hiện tại cho đến khi có model phù hợp hoặc đặt làm riêng.

## Quy trình khi bạn chọn được model

1. Bạn chọn 1 ứng viên (hoặc gửi file bạn có quyền dùng).
2. Kiểm tra: dáng ngồi kiết già, tay thiền định, không phải Hotei/đứng;
   giấy phép cho phép đăng lại trong app web; định dạng GLB hoặc chuyển
   được sang GLB; dung lượng hợp lý cho mobile (ưu tiên < 10 MB).
3. Đặt file vào `public/models/buddha.glb` (hoặc `.glb.b64`), ghi nguồn
   và giấy phép vào file này, build lại, kiểm tra trên link Vercel.
