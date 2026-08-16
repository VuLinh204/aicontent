'use strict';

/**
 * Hai khoi loi nhac cho luong THEO DOI KENH NGOAI.
 *
 * TEP RIENG chu khong viet thang vao `loi-nhac-theo-nhiem-vu.js`: tep do da 279
 * dong, qua nguong 200 dong cua quy uoc du an. Hai khoi duoi day duoc ghep vao
 * loi nhac goc cua hai nhiem vu da co, khong tao nhiem vu moi va khong them gia
 * tri enum nao.
 */

/**
 * Ghep vao `cham-diem-lien-quan`.
 *
 * Mot luot goi lam HAI viec cho moi bai kenh ngoai: cham diem lien quan (do vao
 * cot `diem_lien_quan` da co san tu Phase 3) va boc cong thuc ke (vao
 * `cong_thuc`). Gop lai vi ca hai deu can doc het bai — tach ra la tra tien doc
 * hai lan cho cung mot noi dung.
 *
 * `kieuHook` la KHOA dong, khong phai van ban tu do: mo hinh chon mot trong tam
 * gia tri. Van ban tu do thi moi lan chay ra mot ten khac va khong bao gio gom
 * nhom duoc de thay "cach ke nao dang an".
 */
const KIEU_HOOK = [
  'cau-hoi-nguoc',
  'con-so-gay-soc',
  'chuyen-ca-nhan',
  'sai-lam-thuong-gap',
  'truoc-sau',
  'canh-bao',
  'huong-dan-tung-buoc',
  'khoe-ket-qua',
];

const KHOI_BOC_CONG_THUC = [
  '',
  'Ngoai diem lien quan, voi MOI bai con phai boc ra CACH KE cua no:',
  `- "kieuHook": chon DUNG MOT trong: ${KIEU_HOOK.join(', ')}.`,
  '- "chuDe": 2 den 4 tu khoa ngan noi bai nay noi ve chuyen gi. Danh tu, khong',
  '  phai cau. Vi du ["gia von", "mo quan an"].',
  'Cau truc day du:',
  '{"diemLienQuan": [{"id": string, "diem": number, "lyDo": string,' +
    ' "kieuHook": string, "chuDe": [string]}]}',
].join('\n');

/**
 * PHAN BAI TEST — ban tu viet khoi nay va ghep vao loi nhac `de-xuat-y-tuong`.
 *
 * RANG BUOC BAT BUOC, khong duoc bo:
 * mo hinh chi duoc thay CHU DE va CONG THUC KE cua bai nguoi ta, KHONG bao gio
 * thay nguyen van bai do. Do la khac biet giua "hoc cach ke" va "viet lai bai
 * cua nguoi ta" — viec sau vua khong dung duoc, vua la rui ro phap ly.
 *
 * Rang buoc nay phai duoc ep o TANG MA (ham dung loi nhac khong duoc nhan tham
 * so chua noi dung bai goc), khong phai chi nhac mo hinh bang chu.
 */
/**
 * Khối này hướng dẫn mô hình học từ xu hướng mà KHÔNG sao chép nội dung gốc.
 *
 * RÀNG BUỘC PHÁP LÝ: chỉ được mượn CHỦ ĐỀ và CÔNG THỨC KỂ (kiểu hook, độ dài,
 * dạng bài). Tuyệt đối không viết lại bài của người khác.
 *
 * Ràng buộc này được ép ở TẦNG THAM SỐ HÀM: `deXuatYTuong()` trong
 * lib/studio/de-xuat.ts chỉ truyền metadata vào đây, không có trường nào
 * chứa nội dung văn bản gốc (`noiDung`) của bài tham khảo.
 */
const KHOI_Y_TUONG_TU_XU_HUONG = [
  '',
  'Nếu dữ liệu đầu vào có mục "xuHuong", đây là METADATA (chủ đề + cách kể)',
  'của bài đang được nhiều người chú ý. Dùng để gợi ý ý tưởng MỚI phù hợp',
  'với thương hiệu — KHÔNG sao chép, KHÔNG viết lại bài đó.',
  '',
  'Cách học từ xu hướng (chỉ áp dụng khi có mục "xuHuong"):',
  '- "chuDe": danh sách từ khóa → ý tưởng nên xoay quanh chủ đề tương tự',
  '- "kieuHook": loại hook → dùng cùng loại hook cho ý tưởng mới',
  '- "dangBai": dạng bài → ưu tiên dạng bài có cách kể tương đương',
  '- "soChu": độ dài tham khảo → đề xuất độ dài tương tự nếu phù hợp bề mặt',
  '',
  'Với mỗi ý tưởng sinh từ xu hướng, điền "lyDoDeXuat" giải thích rõ:',
  'học gì từ xu hướng đó (chủ đề/hook) và tại sao phù hợp với thương hiệu này.',
].join('\n');

module.exports = { KIEU_HOOK, KHOI_BOC_CONG_THUC, KHOI_Y_TUONG_TU_XU_HUONG };
