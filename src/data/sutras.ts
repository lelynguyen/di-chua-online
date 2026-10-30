/**
 * Thư viện kinh — cấu trúc mở rộng được.
 *
 * QUAN TRỌNG VỀ NỘI DUNG: các mục dưới đây chỉ là THÔNG TIN MÔ TẢ và TRÍCH DẪN NGẮN
 * THAM KHẢO để minh họa giao diện. Chúng KHÔNG phải là bản kinh đầy đủ, KHÔNG được
 * giới thiệu là bản dịch chính thức, và phải được đối chiếu với bản in có uy tín
 * trước khi dùng cho nghi lễ hay công bố rộng rãi. Khi có bản dịch / bản thu có
 * giấy phép, chỉ cần thêm `fullTextUrl` hoặc `audioUrl` vào mục tương ứng.
 */
export interface Sutra {
  id: string
  title: string
  description: string
  /** Trích dẫn ngắn tham khảo, hiển thị kèm ghi chú kiểm chứng. */
  excerpt: string
  audioUrl?: string
  fullTextUrl?: string
}

export const SUTRAS: Sutra[] = [
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
  'Lưu ý: Nội dung hiển thị trong bản mẫu là trích dẫn ngắn tham khảo, không phải bản kinh đầy đủ và chưa thay thế bản dịch chính thức. Chế độ “Nghe” dùng giọng đọc tổng hợp của trình duyệt (nếu có), không phải bản tụng niệm đã thu âm.'
