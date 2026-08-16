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
            <strong>✅ Prompt ảnh đã sinh:</strong>
          </div>
          <div className="thong-ke" style={{ padding: '12px', backgroundColor: '#2a2a2a', borderRadius: '6px', marginTop: '8px' }}>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: '14px', color: '#e0e0e0' }}>
              {state.data.promptAnh}
            </p>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                navigator.clipboard.writeText(state.data!.promptAnh);
                alert('Đã sao chép prompt vào clipboard');
              }}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              📋 Sao chép prompt
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
