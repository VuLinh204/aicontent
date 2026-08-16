'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhAnh } from '@/lib/studio/sinh-anh';
import type { KetQuaSinhAnh, KetQuaStudio } from '@/lib/studio/kieu';

export async function hanhDongSinhAnh({
  workspaceId,
  contentId,
}: {
  workspaceId: string;
  contentId: string;
}): Promise<KetQuaStudio<KetQuaSinhAnh>> {
  const id = await workspaceHienTai();
  if (id !== workspaceId) {
    return { ok: false, loi: 'Không có quyền truy cập' };
  }

  return sinhAnh({
    workspaceId: id,
    contentId,
    beMat: 'fanpage',
  });
}
