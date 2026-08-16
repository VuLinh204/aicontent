'use server';

/**
 * Server Action cho /studio/bien-soan.
 *
 * `workspaceId` lấy từ phiên đăng nhập qua workspaceHienTai() — không bao giờ
 * nhận từ form hay URL param. Bo quét Phase 5 cưỡng chế điều này.
 */

import { revalidatePath } from 'next/cache';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { bienSoanBai } from '@/lib/studio/bien-soan';
import type { BeMat } from '@/lib/studio/kieu';

const BE_MAT_HOP_LE = new Set<string>(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);

export type KetQuaBienSoan =
  | { ok: true; contentId: string; tieuDe: string; canhBao: string[] }
  | { ok: false; loi: string };

/**
 * Gọi khi người dùng bấm nút "Sinh bài" trên 1 ý tưởng.
 */
export async function hanhDongSinhBai(form: FormData): Promise<KetQuaBienSoan> {
  const workspaceId = await workspaceHienTai();

  const ideaId = form.get('ideaId');
  if (typeof ideaId !== 'string' || !ideaId.trim()) {
    return { ok: false, loi: 'Thiếu ID ý tưởng.' };
  }

  const beMat = form.get('beMat');
  if (typeof beMat !== 'string' || !BE_MAT_HOP_LE.has(beMat)) {
    return { ok: false, loi: 'Bề mặt không hợp lệ.' };
  }

  const ketQua = await bienSoanBai({
    workspaceId,
    ideaId: ideaId.trim(),
    beMat: beMat as BeMat,
  });

  if (!ketQua.ok) {
    return { ok: false, loi: ketQua.loi };
  }

  revalidatePath('/studio/bien-soan');

  return {
    ok: true,
    contentId: ketQua.data.contentId,
    tieuDe: ketQua.data.tieuDe,
    canhBao: ketQua.canhBao,
  };
}

/**
 * Lưu nội dung đã chỉnh sửa thủ công của người dùng.
 */
export async function hanhDongLuuNoiDung(
  contentId: string,
  noiDung: string,
): Promise<{ ok: boolean; loi?: string }> {
  const workspaceId = await workspaceHienTai();
  const { createRepo } = await import('@/lib/data-access');
  const repo = createRepo(workspaceId);

  const cap = await repo.contents.sua(contentId, {
    noiDung: noiDung.trim(),
    trangThai: 'san_sang',
  });

  if (!cap) {
    return { ok: false, loi: 'Không tìm thấy bài hoặc không có quyền sửa.' };
  }

  revalidatePath('/studio/bien-soan');
  return { ok: true };
}
