/**
 * Thư viện kinh — cấu trúc mở rộng được.
 *
 * QUAN TRỌNG VỀ NỘI DUNG: các mục dưới đây chỉ là THÔNG TIN MÔ TẢ và TRÍCH DẪN NGẮN
 * THAM KHẢO để minh họa giao diện. Chúng KHÔNG phải là bản kinh đầy đủ, KHÔNG được
 * giới thiệu là bản dịch chính thức, và phải được đối chiếu với bản in có uy tín
 * trước khi dùng cho nghi lễ hay công bố rộng rãi.
 *
 * ÂM THANH TỤNG THẬT: chỉ gắn `audioUrl` khi file đó có giấy phép dùng lại rõ ràng
 * (mua bản quyền, CC, hoặc chủ sở hữu cho phép) và ghi rõ nguồn/giấy phép vào
 * `audioSource`. Không gắn link YouTube hay file tải lậu. File đặt trong
 * public/audio/, ví dụ public/audio/chu-dai-bi.mp3 rồi đặt audioUrl: '/audio/chu-dai-bi.mp3'.
 */
export interface Sutra {
  id: string
  title: string
  description: string
  /** Trích dẫn ngắn tham khảo, hiển thị kèm ghi chú kiểm chứng. */
  excerpt: string
  /** Bản tụng thật có giấy phép; nếu trống nghĩa là CHƯA CÓ, không được giả vờ là có. */
  audioUrl?: string
  audioSource?: string
  fullTextUrl?: string
}

export const SUTRAS: Sutra[] = [
  {
    id: 'chu-dai-bi',
    title: 'Chú Đại Bi (Đại Bi Tâm Đà La Ni)',
    description: 'Thần chú của Bồ Tát Quán Thế Âm, thường trì tụng cầu an và phát khởi lòng từ bi. Bản tụng thật đang chờ file có giấy phép — xem ghi chú bên dưới.',
    excerpt:
      'Chưa có bản tụng thật và chưa có toàn văn trong bản này. Khi có file tụng có giấy phép, bài này sẽ phát bằng bản thu thật, kèm lời hiển thị và ghi rõ nguồn/người tụng.',
  },
  {
    id: 'bat-nha',
    title: 'Bát Nhã Tâm Kinh',
    description: 'Kinh ngắn về tánh Không và trí tuệ Bát Nhã. Phù hợp đọc chậm, tụng niệm trong lúc thiền.',
    excerpt:
      'Trích dẫn tham khảo: “Quán Tự Tại Bồ Tát, hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.”',
  },
  {
    id: 'phap-cu',
    title: 'Kinh Pháp Cú (Dhammapada)',
    description: 'Tuyển tập những lời dạy ngắn gọn, thiết thực cho đời sống hằng ngày.',
    excerpt:
      'Trích dẫn tham khảo (Phẩm Song Yếu): “Tâm dẫn đầu các pháp, tâm làm chủ, tâm tạo tác. Nếu nói hay làm với tâm ô nhiễm, khổ não sẽ theo sau như bánh xe lăn theo chân bò kéo xe.”',
  },
  {
    id: 'a-di-da',
    title: 'Kinh A Di Đà',
    description: 'Kinh mô tả cõi Tây Phương Cực Lạc và hạnh nguyện niệm Phật. Bản đầy đủ đang chờ bản dịch có giấy phép.',
    excerpt:
      'Chưa có trích dẫn đầy đủ trong bản mẫu này. Vui lòng đối chiếu bản in chính thức trước khi sử dụng.',
  },
]

export const SUTRA_NOTE =
  'Lưu ý: Nội dung hiển thị là trích dẫn ngắn tham khảo, không phải bản kinh đầy đủ và chưa thay thế bản dịch chính thức. Chỉ những bài có ghi nguồn bản thu mới phát bằng giọng tụng thật; các bài chưa có file sẽ nói rõ là chưa có, thay vì dùng giọng máy giả làm tụng thật.'
