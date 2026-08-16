'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhHangLoat } from '@/lib/studio/sinh-hang-loat';
import type { KetQuaStudio, KetQuaHangLoat } from '@/lib/studio/kieu';

export async function hanhDongSinhHangLoat(thamSo: {
  workspaceId: string;
  soLuongYTuong: number;
  beMat: 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';
}): Promise<KetQuaStudio<KetQuaHangLoat>> {
  const workspaceId = await workspaceHienTai();
  if (workspaceId !== thamSo.workspaceId) {
    return { ok: false, loi: 'Không có quyền truy cập' };
  }

  return await sinhHangLoat({
    workspaceId: thamSo.workspaceId,
    beMat: thamSo.beMat,
    soLuongYTuong: thamSo.soLuongYTuong,
  });
}
