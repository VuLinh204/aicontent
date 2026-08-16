/**
 * Moc 3: Sinh kich ban quay video tu 1 y tuong.
 *
 * Cua chinh: doc ho so -> dung du lieu vao (KHONG truyen noiDung bai goc —
 * Rang buoc 3) -> goi model 'viet-kich-ban' -> don ket qua -> tra
 * KetQuaStudio<KichBan>.
 */

import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner/index';
import type { KichBan, ThamSoSinhKichBan, KetQuaStudio } from './kieu';
import { KHOANG_TU_BE_MAT } from '@/lib/model-runner/loi-nhac-theo-nhiem-vu';
import { kiemTraDauYeuCau } from './kiem-tra-dau';

const SO_XU_HUONG_TOI_DA = 3;

/**
 * Don ket qua tho cua mo hinh ve dung hinh dang KichBan.
 * Tra null neu thieu truong bat buoc, phanCanh khong phai mang, hoac khong co dau.
 */
export function donKetQuaKichBan(tho: unknown): KichBan | null {
  if (!tho || typeof tho !== 'object') return null;
  const obj = tho as Record<string, unknown>;

  const tieuDe = typeof obj.tieuDe === 'string' ? obj.tieuDe.trim() : '';
  if (!tieuDe) return null;

  // Kiểm tra dấu tiếng Việt
  const loiDau = kiemTraDauYeuCau(tieuDe);
  if (loiDau) return null;

  if (!Array.isArray(obj.phanCanh)) return null;

  const phanCanh = obj.phanCanh
    .map((canh: unknown) => {
      if (!canh || typeof canh !== 'object') return null;
      const c = canh as Record<string, unknown>;

      const thoiLuongGiay = typeof c.thoiLuongGiay === 'number' ? c.thoiLuongGiay : null;
      const hinhAnh = typeof c.hinhAnh === 'string' ? c.hinhAnh.trim() : '';
      const loiThoai = typeof c.loiThoai === 'string' ? c.loiThoai.trim() : '';

      if (thoiLuongGiay === null || !hinhAnh || !loiThoai) return null;

      // Kiểm tra dấu trong hình ảnh và lời thoại
      if (kiemTraDauYeuCau(hinhAnh) || kiemTraDauYeuCau(loiThoai)) return null;

      return { thoiLuongGiay, hinhAnh, loiThoai };
    })
    .filter((canh): canh is { thoiLuongGiay: number; hinhAnh: string; loiThoai: string } =>
      canh !== null,
    );

  if (phanCanh.length === 0) return null;

  return { tieuDe, phanCanh };
}

/**
 * Cua chinh Moc 3.
 *
 * Ràng buộc 3 được ép tại tầng code: hàm `dungDuLieuVao` bên dưới
 * KHÔNG nhận tham số `noiDung` — không thể truyền nội dung gốc dù muốn.
 */
export async function sinhKichBan(
  thamSo: ThamSoSinhKichBan,
): Promise<KetQuaStudio<KichBan>> {
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
  const xuHuongMetadata = xuHuongList.slice(0, SO_XU_HUONG_TOI_DA).map((x: { id: string; congThuc: unknown; dangBai: string | null }) => ({
    id: x.id,
    chuDe: (x.congThuc as { chuDe?: string[] } | null)?.chuDe ?? [],
    kieuHook: (x.congThuc as { kieuHook?: string } | null)?.kieuHook ?? null,
    dangBai: x.dangBai,
  }));

  const duLieuVao: Record<string, unknown> = {
    bienThe: beMat,
    gocTiepCan: idea.gocTiepCan,
    cauMoDau: idea.cauMoDau,
    truCot: tenTruCot,
    chanDung: tenChanDung,
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
      nhiemVu: 'viet-kich-ban',
      duLieuVao: { ...duLieuVao, thoiDiem: Date.now() },
      moHinh: 'auto',
      khongGianLamViec: workspaceId,
    });
  } catch (loi) {
    return {
      ok: false,
      loi: `Không thể gửi yêu cầu sinh kịch bản: ${loi instanceof Error ? loi.message : String(loi)}`,
    };
  }

  if (ketQuaJob.trangThai !== 'xong' || !ketQuaJob.ketQua) {
    const loiText = String(ketQuaJob.loi ?? 'Worker chưa hoàn thành.');
    const loiHienThi = loiText.includes('quota') || loiText.includes('429')
      ? 'Đã hết hạn mức gọi Gemini (quota). Chờ vài phút rồi thử lại.'
      : loiText;
    return { ok: false, loi: loiHienThi };
  }

  const kichBan = donKetQuaKichBan(ketQuaJob.ketQua);
  if (!kichBan) {
    return { ok: false, loi: 'Mô hình trả về dữ liệu thiếu tiêu đề hoặc phân cảnh.' };
  }

  return {
    ok: true,
    data: kichBan,
    canhBao: [],
  };
}
