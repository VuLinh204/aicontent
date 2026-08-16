/**
 * Kiểu dùng chung cho toàn bộ lib/studio/.
 *
 * Tách thành file riêng để các module khác trong lib/studio/ import mà không
 * kéo theo logic nghiệp vụ — tránh circular dependency khi mốc sau dùng lại
 * kiểu từ mốc trước.
 */

/** Bốn bề mặt đăng bài — phải khớp enum `be_mat` trong db/schema/content.ts. */
export type BeMat = 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';

/**
 * Một ý tưởng do máy đề xuất.
 *
 * Hai trường `truCot` và `chanDung` phải khớp TÊN có thật trong hồ sơ workspace.
 * Nếu mô hình trả về tên không khớp → set null, không tự bịa tên mới.
 * Xem `donKetQuaDeXuat()` trong de-xuat.ts để hiểu tại sao chọn null thay vì lọc bỏ.
 */
export type YTuongDeXuat = {
  tieuDe: string;
  truCot: string | null;   // phải khớp một trụ cột CÓ THẬT trong hồ sơ
  chanDung: string | null; // phải khớp một chân dung CÓ THẬT trong hồ sơ
  gocTiepCan: string | null;
  cauMoDau: string | null;
  lyDoDeXuat: string | null;
  beMat: BeMat;            // 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo'
  khamPha: boolean;        // ý tưởng dò đường, thuộc tuyến chưa có dữ liệu
};

/**
 * Kết quả chung của một lượt gọi Studio.
 *
 * - `ok: true`  → `data` có giá trị, `canhBao` là mảng cảnh báo không nghiêm trọng
 * - `ok: false` → `loi` mô tả lý do thất bại, `data` không có
 */
export type KetQuaStudio<T> =
  | { ok: true; data: T; canhBao: string[] }
  | { ok: false; loi: string };

/**
 * Tham số đầu vào để biên soạn một bài đăng từ ý tưởng.
 */
export type ThamSoBienSoan = {
  workspaceId: string;
  ideaId: string;
  beMat: BeMat;
};

/**
 * Bài đăng đã sinh ra bởi mô hình.
 *
 * Hợp đồng Mốc 2: truongBatBuoc = ['tieuDe', 'noiDung'] trong loi-nhac-theo-nhiem-vu.js.
 */
export type BaiDaSinh = {
  tieuDe: string;
  noiDung: string;
  hashtag: string[];
};
