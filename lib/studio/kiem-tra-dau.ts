/**
 * Kiểm tra tiếng Việt có dấu — buộc model tôn trọng dấu tiếng Việt.
 *
 * Tại sao: Model như Gemini/OpenAI có thể trả về tiếng Việt không dấu khi:
 * - Quá tải/timeout
 * - Token bị truncate
 * - Không tuân lệnh hoàn toàn
 *
 * Heuristic: Nếu output chứa từ tiếng Việt đặc trưng (như "khong", "co", "la", "va")
 * mà không có dấu tương ứng (không, có, là, và), thì reject.
 * Nếu output toàn ASCII không dấu (như "iPhone Optimization Tips"), không bắt.
 */

/** Bộ ký tự dấu tiếng Việt — từ gapDau() của lib/brand/quy-tac-ngon-ngu.ts */
const CKY_DAU_VIET =
  'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ' +
  'ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';

/** Từ tiếng Việt điển hình không dấu */
const TU_VIET_KHONG_DAU = /\b(khong|co|la|va|trong|toi|duoc|theo|hoac|nho|cung|dung|tuy|nay|day|o|nha|diem|cau|thay|them)\b/i;

/**
 * Kiểm tra chuỗi có chứa ít nhất một ký tự dấu tiếng Việt không.
 *
 * @param van_ban - Chuỗi cần kiểm tra (thường là output từ mô hình)
 * @returns true nếu có dấu, false nếu không dấu
 */
export function coChuaDau(van_ban: string | null | undefined): boolean {
  if (!van_ban || typeof van_ban !== 'string') return false;

  for (const ky of van_ban) {
    if (CKY_DAU_VIET.includes(ky)) return true;
  }

  return false;
}

/**
 * Cảnh báo + reject nếu output là tiếng Việt không dấu.
 *
 * Dùng trong `donKetQua*()` để phát hiện lỗi sớm.
 * Chỉ reject nếu có dấu hiệu tiếng Việt không dấu (từ điển hình như "khong", "co").
 * Nếu toàn ASCII, không bắt.
 *
 * @param van_ban - Output từ mô hình
 * @returns null nếu OK (có dấu hoặc ASCII), message lỗi nếu tiếng Việt không dấu
 */
export function kiemTraDauYeuCau(van_ban: string | null | undefined): string | null {
  if (!van_ban || typeof van_ban !== 'string') return null;

  // Nếu không có dấu nhưng có từ tiếng Việt điển hình không dấu, reject
  if (!coChuaDau(van_ban) && TU_VIET_KHONG_DAU.test(van_ban)) {
    return 'Output không có dấu tiếng Việt. Mô hình phải viết tiếng Việt CÓ DẤU.';
  }

  return null;
}

