/**
 * Moc 2: Bien soan bai dang tu 1 y tuong.
 *
 * Cua chinh: doc ho so -> dung du lieu vao (KHONG truyen noiDung bai goc —
 * Rang buoc 3) -> goi model 'viet-bai' -> don ket qua -> luu vao contents
 * (trang thai 'ban_nhap') -> tra KetQuaStudio<BaiDaSinh>.
 */

import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner/index';
import type { BaiDaSinh, KetQuaStudio, ThamSoBienSoan } from './kieu';
import { KHOANG_TU_BE_MAT } from '@/lib/model-runner/loi-nhac-theo-nhiem-vu';

const SO_XU_HUONG_TOI_DA = 3;

/**
 * Don ket qua tho cua mo hinh ve dung hinh dang BaiDaSinh.
 * Tra null neu thieu truong bat buoc.
 */
export function donKetQuaBienSoan(tho: unknown): BaiDaSinh | null {
  if (!tho || typeof tho !== 'object') return null;
  const obj = tho as Record<string, unknown>;

  const tieuDe = typeof obj.tieuDe === 'string' ? obj.tieuDe.trim() : '';
  const noiDung = typeof obj.noiDung === 'string' ? obj.noiDung.trim() : '';

  if (!tieuDe || !noiDung) return null;

  const hashtag: string[] = Array.isArray(obj.hashtag)
    ? obj.hashtag.filter((h): h is string => typeof h === 'string').slice(0, 5)
    : [];

  return { tieuDe, noiDung, hashtag };
}

/**
 * Cua chinh Moc 2.
 *
 * Ràng buộc 3 được ép tại tầng code: hàm `dungDuLieuVao` bên dưới
 * KHÔNG nhận tham số `noiDung` — không thể truyền nội dung gốc dù muốn.
 */
export async function bienSoanBai(
  thamSo: ThamSoBienSoan,
): Promise<KetQuaStudio<BaiDaSinh & { contentId: string }>> {
  const { workspaceId, ideaId, beMat } = thamSo;
  const repo = createRepo(workspaceId);

  // --- 1. Tải dữ liệu cần thiết ---
  const [idea, hoSo, truCotList, chanDungList, xuHuongList] = await Promise.all([
    repo.yTuong.layTheoId(ideaId),
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.tinHieuXuHuong.layDaBoc(SO_XU_HUONG_TOI_DA),
  ]);

  if (!idea) {
    return { ok: false, loi: 'Không tìm thấy ý tưởng. Có thể đã bị xóa.' };
  }

  if (idea.beMat !== beMat) {
    return { ok: false, loi: `Bề mặt không khớp: ý tưởng là "${idea.beMat}", yêu cầu "${beMat}".` };
  }

  const { toiThieu, toiDa } = (KHOANG_TU_BE_MAT as Record<string, { toiThieu: number; toiDa: number }>)[beMat] ?? { toiThieu: 100, toiDa: 300 };

  // Tìm tên trụ cột và chân dung từ ID (idea lưu ID, prompt cần tên)
  const truCotMap = new Map<string, string>(
    truCotList.map((tc: { id: string; ten: string }) => [tc.id, tc.ten]),
  );
  const chanDungMap = new Map<string, string>(
    chanDungList.map((cd: { id: string; ten: string }) => [cd.id, cd.ten]),
  );
  const tenTruCot = idea.pillarId ? (truCotMap.get(idea.pillarId) ?? null) : null;
  const tenChanDung = idea.personaId ? (chanDungMap.get(idea.personaId) ?? null) : null;

  // --- 2. Dựng duLieuVao — CHỈ metadata, không có noiDung bài gốc (Ràng buộc 3) ---
  // Ràng buộc được ép tại tầng code: không có tham số nào ở đây chứa
  // nội dung văn bản của bài người khác.
  const xuHuongMetadata = xuHuongList.slice(0, SO_XU_HUONG_TOI_DA).map((x: { id: string; congThuc: unknown; dangBai: string | null }) => ({
    id: x.id,
    chuDe: (x.congThuc as { chuDe?: string[] } | null)?.chuDe ?? [],
    kieuHook: (x.congThuc as { kieuHook?: string } | null)?.kieuHook ?? null,
    dangBai: x.dangBai,
  }));

  const duLieuVao: Record<string, unknown> = {
    bienThe: beMat,       // Khoá chọn khối giọng bề mặt trong prompt
    gocTiepCan: idea.gocTiepCan,
    cauMoDau: idea.cauMoDau,
    truCot: tenTruCot,
    chanDung: tenChanDung,
    epDoDai: `${toiThieu}-${toiDa}`,
    hoSo: hoSo
      ? {
          moTa: (hoSo as { moTa?: string | null }).moTa ?? null,
          giongDieu: (hoSo as { giongDieu?: string | null }).giongDieu ?? null,
          dieuCamKy: (hoSo as { dieuCamKy?: string | null }).dieuCamKy ?? null,
        }
      : null,
    xuHuong: xuHuongMetadata,
  };

  // --- 3. Gọi model qua hàng đợi ---
  let ketQuaJob;
  try {
    ketQuaJob = await chayNhiemVu({
      nhiemVu: 'viet-bai',
      duLieuVao: { ...duLieuVao, thoiDiem: Date.now() },
      moHinh: 'auto',
      khongGianLamViec: workspaceId,
    });
  } catch (loi) {
    return {
      ok: false,
      loi: `Không thể gửi yêu cầu sinh bài: ${loi instanceof Error ? loi.message : String(loi)}`,
    };
  }

  if (ketQuaJob.trangThai !== 'xong' || !ketQuaJob.ketQua) {
    const loiText = String(ketQuaJob.loi ?? 'Worker chưa hoàn thành.');
    const loiHienThi = loiText.includes('quota') || loiText.includes('429')
      ? 'Đã hết hạn mức gọi Gemini (quota). Chờ vài phút rồi thử lại.'
      : loiText;
    return { ok: false, loi: loiHienThi };
  }

  const bai = donKetQuaBienSoan(ketQuaJob.ketQua);
  if (!bai) {
    return { ok: false, loi: 'Mô hình trả về dữ liệu thiếu tiêu đề hoặc nội dung.' };
  }

  // --- 4. Lưu vào contents (ban_nhap) ---
  const content = await repo.contents.tao({
    ideaId: idea.id,
    beMat: beMat as typeof idea.beMat,
    pillarId: idea.pillarId,
    personaId: idea.personaId,
    productId: idea.productId,
    gocTiepCan: idea.gocTiepCan,
    cauMoDau: bai.tieuDe,     // tiêu đề / hook là câu mở đầu bài đăng
    noiDung: bai.noiDung,
    trangThai: 'ban_nhap',
    nguonYTuong: 'may-de-xuat',
    moHinhDaSinh: ketQuaJob.moHinh ?? null,
  });

  // --- 5. Đánh dấu idea đã dùng ---
  await repo.yTuong.danhDauDaDung(idea.id);

  const canhBao: string[] = [];

  return {
    ok: true,
    data: { ...bai, contentId: content.id },
    canhBao,
  };
}
