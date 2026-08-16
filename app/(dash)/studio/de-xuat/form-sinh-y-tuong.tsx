'use client';

/**
 * Form sinh ý tưởng — phần tương tác của trang /studio/de-xuat.
 *
 * Dùng useActionState (React 19) để gọi Server Action và hiển thị kết quả / lỗi.
 * Tách thành client component để giữ page.tsx là Server Component (đọc DB không
 * tốn bundle size phía trình duyệt).
 */

import { useActionState } from 'react';

import type { KetQuaHanhDong } from './actions';
import { hanhDongSinhYTuong } from './actions';

/** Tên hiển thị của từng bề mặt. */
const TEN_BE_MAT: Record<string, string> = {
  fanpage: 'Fanpage Facebook',
  ho_so_ca_nhan: 'Trang cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

const TRANG_THAI_BAN_DAU: KetQuaHanhDong | null = null;

export function FormSinhYTuong({ beMat }: { beMat: string }) {
  // useActionState: [state, action, isPending]
  // state = kết quả trả về từ Server Action sau khi submit
  const [ketQua, hanhDong, dangXuLy] = useActionState(
    async (_prev: KetQuaHanhDong | null, form: FormData) => {
      return hanhDongSinhYTuong(form);
    },
    TRANG_THAI_BAN_DAU,
  );

  return (
    <form action={hanhDong} className="form-sinh-y-tuong">
      {/* Bề mặt ẩn — đã chọn từ trang cha qua URL param hoặc mặc định */}
      <input type="hidden" name="beMat" value={beMat} />
      <input type="hidden" name="soLuong" value="5" />

      <div className="form-sinh-y-tuong__controls">
        <span className="form-sinh-y-tuong__be-mat">
          {TEN_BE_MAT[beMat] ?? beMat}
        </span>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={dangXuLy}
          id="btn-sinh-y-tuong"
        >
          {dangXuLy ? 'Đang sinh…' : '✦ Sinh ý tưởng hôm nay'}
        </button>
      </div>

      {/* Hiển thị kết quả / lỗi */}
      {ketQua && (
        <div
          className={`thong-bao ${ketQua.ok ? 'thong-bao--thanh-cong' : 'thong-bao--loi'}`}
          role="status"
          aria-live="polite"
        >
          {ketQua.ok ? (
            <>
              <span>✓ Đã sinh {ketQua.soLuong} ý tưởng mới.</span>
              {ketQua.canhBao.map((cb, i) => (
                <p key={i} className="thong-bao__canh-bao">⚠ {cb}</p>
              ))}
            </>
          ) : (
            <span>✕ {ketQua.loi}</span>
          )}
        </div>
      )}
    </form>
  );
}
