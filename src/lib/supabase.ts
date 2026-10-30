/**
 * Điểm kết nối Supabase (chuẩn bị cho Giai đoạn 4).
 *
 * MVP chạy ở chế độ local: KHÔNG lưu mật khẩu, KHÔNG tự viết hệ thống xác thực.
 * Người dùng vào bằng hồ sơ khách lưu trên trình duyệt của chính họ.
 *
 * Khi triển khai thật, đặt VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY (chỉ public
 * anon key, không bao giờ đặt service-role key vào frontend) rồi dùng Supabase Auth
 * (email / OAuth) thay cho hồ sơ local. Xem supabase/schema.sql cho RLS.
 */
export const supabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabaseStatus = supabaseConfigured
  ? 'Đã cấu hình biến môi trường Supabase — cần cài @supabase/supabase-js và bật Supabase Auth trước khi dùng đăng nhập thật.'
  : 'Chưa cấu hình Supabase — đang chạy chế độ khách trên trình duyệt (không có tài khoản máy chủ, không lưu mật khẩu).'
