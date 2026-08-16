/**
 * Repo bang `ideas` — y tuong noi dung may de xuat hoac nguoi tu nhap (Phase 9).
 */

import { and, desc, eq } from 'drizzle-orm';
import { ideas } from '@/db/schema/index';

import { crudTheoWorkspace } from './crud-theo-workspace';
import type { KetNoiDrizzle } from './guard';

export type Idea = typeof ideas.$inferSelect;

export function ideasRepo(db: KetNoiDrizzle, workspaceId: string) {
  const base = crudTheoWorkspace(db, workspaceId, ideas);
  return {
    ...base,
    async layTheoBeMat(beMat: string, gioiHan = 50): Promise<Idea[]> {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return (db as any)
        .select()
        .from(ideas)
        .where(and(eq(ideas.workspaceId, workspaceId), eq(ideas.beMat, beMat as any)))
        .orderBy(desc(ideas.ngayTao))
        .limit(gioiHan);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    },
  };
}
