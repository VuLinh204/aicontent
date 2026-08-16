'use client';

import { useActionState, useMemo, useState } from 'react';
import type { KetQuaStudio, KetQuaSinhAnh } from '@/lib/studio/kieu';
import { hanhDongSinhAnh } from './actions';

const initialState: KetQuaStudio<KetQuaSinhAnh> = {
  ok: false,
  loi: '',
};

export function SinhAnhEditor({
  workspaceId,
  baiDang,
}: {
  workspaceId: string;
  baiDang: Array<{ id: string; cauMoDau: string | null; noiDung: string | null; beMat: string }>;
}) {
  const [selectedId, setSelectedId] = useState<string>(baiDang[0]?.id ?? '');
  const [state, formAction, isPending] = useActionState<
    KetQuaStudio<KetQuaSinhAnh>,
    FormData
  >(
    async (
      _prevState: KetQuaStudio<KetQuaSinhAnh>,
      _formData: FormData,
    ): Promise<KetQuaStudio<KetQuaSinhAnh>> => {
      if (!selectedId) {
        return { ok: false, loi: 'Chưa chọn bài để sinh ảnh' };
      }
      return hanhDongSinhAnh({ workspaceId, contentId: selectedId });
    },
    initialState,
  );

  const selected = useMemo(
    () => baiDang.find((item) => item.id === selectedId) ?? baiDang[0],
    [baiDang, selectedId],
  );

  return (
    <section className="editor-hang-loat">
      <h2>Sinh ảnh cho bài đăng</h2>
      <form action={formAction} className="hang-loat-controls">
        <label>
          Bài đăng
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {baiDang.map((item) => (
              <option key={item.id} value={item.id}>
                {item.cauMoDau || 'Bài không có tiêu đề'}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Đang sinh...' : 'Sinh ảnh'}
        </button>
      </form>

      {selected && (
        <div className="hang-loat-ket-qua">
          <div className="thong-ke">
            <strong>Tiêu đề:</strong> {selected.cauMoDau || 'Chưa có tiêu đề'}
          </div>
          <div className="thong-ke">
            <strong>Nội dung:</strong> {selected.noiDung ? selected.noiDung.slice(0, 180) : 'Chưa có nội dung'}
          </div>
        </div>
      )}

      {'loi' in state && state.loi ? <div className="loi-hang-loat">{state.loi}</div> : null}
      {state.ok && state.data ? (
        <div className="hang-loat-ket-qua">
          <div className="thong-ke">
            <strong>Prompt ảnh:</strong> {state.data.promptAnh}
          </div>
          <div className="thong-ke">
            <strong>Asset ID:</strong> {state.data.assetId}
          </div>
        </div>
      ) : null}
    </section>
  );
}
