'use server';

/**
 * Server Action cho /studio/de-xuat.
 *
 * `workspaceId` lấy từ phiên đăng nhập qua workspaceHienTai() — không bao giờ
 * nhận từ form hay URL param. Bo quét Phase 5 cưỡng chế điều này.
 */

import { revalidatePath } from 'next/cache';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { deXuatYTuong, type ThamSoDeXuat } from '@/lib/studio/de-xuat';
import type { BeMat } from '@/lib/studio/kieu';

/** Các bề mặt hợp lệ để validate input từ form. */
const BE_MAT_HOP_LE = new Set<string>(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);

/** Số ý tưởng mặc định mỗi lần sinh. */
const SO_LUONG_MAC_DINH = 5;

export type KetQuaHanhDong =
  | { ok: true; soLuong: number; canhBao: string[] }
  | { ok: false; loi: string };

/**
 * Gọi khi người dùng bấm nút "Sinh ý tưởng".
 *
 * Validate bề mặt từ form, rồi gọi deXuatYTuong() trong lib/studio.
 * Không viết SQL ở đây — toàn bộ đi qua lib/studio và lib/data-access.
 */
export async function hanhDongSinhYTuong(form: FormData): Promise<KetQuaHanhDong> {
  const workspaceId = await workspaceHienTai();

  const beMat = form.get('beMat');
  if (typeof beMat !== 'string' || !BE_MAT_HOP_LE.has(beMat)) {
    return { ok: false, loi: 'Bề mặt không hợp lệ. Chọn một trong: Fanpage, Trang cá nhân, TikTok, Zalo.' };
  }

  const soLuongRaw = form.get('soLuong');
  const soLuong = soLuongRaw ? parseInt(String(soLuongRaw), 10) : SO_LUONG_MAC_DINH;
  if (!Number.isInteger(soLuong) || soLuong < 1 || soLuong > 20) {
    return { ok: false, loi: 'Số lượng phải từ 1 đến 20.' };
  }

  const thamSo: ThamSoDeXuat = {
    workspaceId,
    beMat: beMat as BeMat,
    soLuong,
  };

  const ketQua = await deXuatYTuong(thamSo);

  if (!ketQua.ok) {
    return { ok: false, loi: ketQua.loi };
  }

  // Làm mới trang sau khi lưu thành công
  revalidatePath('/studio/de-xuat');

  return {
    ok: true,
    soLuong: ketQua.data.length,
    canhBao: ketQua.canhBao,
  };
}


