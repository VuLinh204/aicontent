/**
 * Mốc 5: Sinh ảnh cho bài đăng từ nội dung bài.
 *
 * Tái sử dụng chayNhiemVu() để gọi mô hình sinh prompt ảnh,
 * rồi lưu asset vào DB.
 */

import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';
import type { ThamSoSinhAnh, KetQuaSinhAnh, KetQuaStudio } from './kieu';

/**
 * Validation output từ mô hình khi sinh prompt ảnh.
 */
export function donKetQuaSinhAnh(tho: unknown): {
  promptAnh: string;
} | null {
  if (!tho || typeof tho !== 'object') return null;

  const obj = tho as { promptAnh?: unknown };
  const prompt = typeof obj.promptAnh === 'string' ? obj.promptAnh.trim() : '';

  if (!prompt || prompt.length < 10) return null;

  return { promptAnh: prompt };
}

/**
 * Hàm chính Mốc 5: Sinh ảnh từ nội dung bài đăng.
 *
 * Luồng chạy:
 * 1. Đọc bài dăng từ DB (tiêu đề, nội dung)
 * 2. Gọi mô hình qua chayNhiemVu() để sinh prompt ảnh
 * 3. Dọn kết quả
 * 4. Lưu asset (ảnh metadata) vào DB
 * 5. Trả về kết quả
 */
export async function sinhAnh(
  thamSo: ThamSoSinhAnh,
): Promise<KetQuaStudio<KetQuaSinhAnh>> {
  const { workspaceId, contentId, beMat } = thamSo;

  // --- Validation ---
  if (!workspaceId || !contentId) {
    return { ok: false, loi: 'Thiếu workspaceId hoặc contentId' };
  }

  const repo = createRepo(workspaceId);

  // --- 1. Đọc bài đăng ---
  const bai = await repo.contents.layTheoId(contentId);
  if (!bai) {
    return {
      ok: false,
      loi: 'Không tìm thấy bài đăng',
    };
  }

  if (bai.beMat !== beMat) {
    return {
      ok: false,
      loi: `Bề mặt không khớp: bài có beMat=${bai.beMat}, yêu cầu ${beMat}`,
    };
  }

  // --- 2. Chuẩn bị dữ liệu đầu vào cho mô hình ---
  // Chỉ truyền metadata, KHÔNG truyền nội dung văn bản gốc (ràng buộc 3)
  const duLieuVao = {
    tieuDe: bai.cauMoDau || 'Tiêu đề bài đăng',
    // Tóm tắt nội dung (không toàn bộ văn bản) để tránh context quá dài
    noiDungTomTat: bai.noiDung?.slice(0, 500) || '',
    beMat,
    bienThe: beMat,
  };

  // --- 3. Gọi mô hình qua hàng đợi ---
  let ketQuaJob;
  try {
    ketQuaJob = await chayNhiemVu({
      nhiemVu: 'sinh-anh' as const,
      duLieuVao,
      moHinh: 'auto',
      khongGianLamViec: workspaceId,
    });
  } catch (loi) {
    return {
      ok: false,
      loi: `Không thể gửi yêu cầu sinh ảnh: ${loi instanceof Error ? loi.message : String(loi)}`,
    };
  }

  if (ketQuaJob.trangThai !== 'xong' || !ketQuaJob.ketQua) {
    return {
      ok: false,
      loi: `Mô hình không sinh được ảnh: ${ketQuaJob.loi || 'Không xác định'}`,
    };
  }

  // --- 4. Dọn kết quả ---
  const ketQuaDon = donKetQuaSinhAnh(ketQuaJob.ketQua);
  if (!ketQuaDon) {
    return {
      ok: false,
      loi: 'Prompt ảnh từ mô hình không hợp lệ',
    };
  }

  // --- 5. Lưu asset vào DB ---
  let assetId = '';
  try {
    const asset = await repo.asset.tao({
      contentId,
      loai: 'anh',
      duongDan: null, // Đường dẫn sẽ được điền sau khi sinh ảnh thực
      urlNgoai: null,
    });
    assetId = asset.id;
  } catch (loi) {
    return {
      ok: false,
      loi: `Lỗi lưu asset: ${loi instanceof Error ? loi.message : String(loi)}`,
    };
  }

  return {
    ok: true,
    data: {
      contentId,
      assetId,
      promptAnh: ketQuaDon.promptAnh,
    },
    canhBao: [],
  };
}
