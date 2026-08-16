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

    async layTheoId(id: string): Promise<Idea | null> {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const [dong] = await (db as any)
        .select()
        .from(ideas)
        .where(and(eq(ideas.workspaceId, workspaceId), eq(ideas.id, id)))
        .limit(1);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      return dong ?? null;
    },

    async danhDauDaDung(id: string): Promise<void> {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (db as any)
        .update(ideas)
        .set({ daDung: true })
        .where(and(eq(ideas.workspaceId, workspaceId), eq(ideas.id, id)));
      /* eslint-enable @typescript-eslint/no-explicit-any */
    },
  };
}
