'use server';

/**
 * Server Action cho /studio/kich-ban.
 *
 * `workspaceId` lấy từ phiên đăng nhập qua workspaceHienTai() — không bao giờ
 * nhận từ form hay URL param.
 */

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhKichBan } from '@/lib/studio/sinh-kich-ban';
import type { BeMat } from '@/lib/studio/kieu';

const BE_MAT_HOP_LE = new Set<string>(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);

export type KetQuaSinhKichBan =
  | {
      ok: true;
      tieuDe: string;
      phanCanh: { thoiLuongGiay: number; hinhAnh: string; loiThoai: string }[];
      canhBao: string[];
    }
  | { ok: false; loi: string };

/**
 * Gọi khi người dùng bấm nút "Sinh kịch bản" trên 1 ý tưởng.
 */
export async function hanhDongSinhKichBan(form: FormData): Promise<KetQuaSinhKichBan> {
  const workspaceId = await workspaceHienTai();

  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || !ideaId.trim()) {
    return { ok: false, loi: 'Thiếu ID ý tưởng.' };
  }

  const beMat = form.get('beMat');
  if (typeof beMat !== 'string' || !BE_MAT_HOP_LE.has(beMat)) {
    return { ok: false, loi: 'Bề mặt không hợp lệ.' };
  }

  const ketQua = await sinhKichBan({
    workspaceId,
    ideaId: ideaId.trim(),
    beMat: beMat as BeMat,
  });

  if (!ketQua.ok) {
    return { ok: false, loi: ketQua.loi };
  }

  return {
    ok: true,
    tieuDe: ketQua.data.tieuDe,
    phanCanh: ketQua.data.phanCanh,
    canhBao: ketQua.canhBao,
  };
}
