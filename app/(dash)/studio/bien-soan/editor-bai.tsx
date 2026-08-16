'use client';

/**
 * Editor bài đăng — hiển thị bài đã sinh, cho phép sửa nội dung.
 *
 * Client component vì cần useActionState và textarea tương tác.
 */

import { useActionState, useRef, useState } from 'react';

import type { KetQuaBienSoan } from './actions';
import { hanhDongLuuNoiDung, hanhDongSinhBai } from './actions';

const TEN_BE_MAT: Record<string, string> = {
  fanpage: 'Fanpage Facebook',
  ho_so_ca_nhan: 'Trang cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

type BaiHienThi = {
  id: string;
  tieuDe: string | null;
  noiDung: string | null;
  hashtag?: string[];
  trangThai: string;
};

type Props = {
  ideaId: string;
  beMat: string;
  gocTiepCan: string | null;
  cauMoDau: string | null;
  tenTruCot: string | null;
  tenChanDung: string | null;
  baiCu: BaiHienThi | null;
};

export function EditorBai({
  ideaId,
  beMat,
  gocTiepCan,
  cauMoDau,
  tenTruCot,
  tenChanDung,
  baiCu,
}: Props) {
  const [ketQuaSinh, hanhDong, dangSinh] = useActionState(
    async (_prev: KetQuaBienSoan | null, form: FormData) => hanhDongSinhBai(form),
    null,
  );

  // Quản lý nội dung textarea
  const [noiDungSua, setNoiDungSua] = useState<string>(baiCu?.noiDung ?? '');
  const [luuThanhCong, setLuuThanhCong] = useState(false);
  const [daChep, setDaChep] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const soTu = noiDungSua.trim() ? noiDungSua.trim().split(/\s+/).length : 0;
  const soKyTu = noiDungSua.length;

  async function luuNoiDung() {
    const contentId = ketQuaSinh?.ok ? ketQuaSinh.contentId : baiCu?.id;
    if (!contentId || !textareaRef.current) return;
    setDangLuu(true);
    const ket = await hanhDongLuuNoiDung(contentId, textareaRef.current.value);
    setDangLuu(false);
    if (ket.ok) setLuuThanhCong(true);
  }

  async function saoChepNoiDung() {
    if (!textareaRef.current?.value) return;
    try {
      await navigator.clipboard.writeText(textareaRef.current.value);
      setDaChep(true);
      setTimeout(() => setDaChep(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="editor-bai">
      {/* Thông tin ý tưởng */}
      <div className="editor-bai__card-y-tuong">
        <div className="editor-bai__meta">
          <span className="badge badge--blue">{TEN_BE_MAT[beMat] ?? beMat}</span>
          {tenTruCot && (
            <span className="badge badge--gray" title="Trụ cột nội dung">📌 {tenTruCot}</span>
          )}
          {tenChanDung && (
            <span className="badge badge--outline" title="Chân dung khách hàng">👤 {tenChanDung}</span>
          )}
        </div>

        <div className="editor-bai__chi-tiet-grid">
          {gocTiepCan && (
            <div className="editor-bai__box-info">
              <span className="editor-bai__box-nhan">Góc tiếp cận</span>
              <p className="editor-bai__box-chu">{gocTiepCan}</p>
            </div>
          )}
          {cauMoDau && (
            <div className="editor-bai__box-info editor-bai__box-info--hook">
              <span className="editor-bai__box-nhan">Hook gợi ý</span>
              <p className="editor-bai__box-chu">{cauMoDau}</p>
            </div>
          )}
        </div>

        {/* Form sinh bài */}
        <form action={hanhDong} className="editor-bai__form-sinh">
          <input type="hidden" name="ideaId" value={ideaId} />
          <input type="hidden" name="beMat" value={beMat} />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={dangSinh}
            id="btn-sinh-bai"
          >
            {dangSinh ? '⏳ Đang sinh bài đăng…' : '✦ Sinh bài từ ý tưởng này'}
          </button>
        </form>

        {/* Phản hồi sau khi sinh */}
        {ketQuaSinh && !ketQuaSinh.ok && (
          <div className="thong-bao thong-bao--loi" role="alert" aria-live="polite">
            <span>✕ {ketQuaSinh.loi}</span>
          </div>
        )}
        {ketQuaSinh?.ok && (
          <div className="thong-bao thong-bao--thanh-cong" role="status">
            <span>✓ Đã sinh bài: <strong>{ketQuaSinh.tieuDe}</strong></span>
            {ketQuaSinh.canhBao.map((cb, i) => (
              <p key={i} className="thong-bao__canh-bao">⚠ {cb}</p>
            ))}
          </div>
        )}
      </div>

      {/* Editor nội dung — hiện khi đã có bài (cũ hoặc vừa sinh) */}
      {(baiCu || ketQuaSinh?.ok) && (
        <div className="editor-bai__vung-sua">
          <div className="editor-bai__sua-header">
            <div className="editor-bai__sua-title-group">
              <h2 className="editor-bai__label">Nội dung bài đăng</h2>
              {baiCu?.trangThai && (
                <span className="badge badge--green">
                  {baiCu.trangThai === 'san_sang' ? 'Sẵn sàng đăng' : baiCu.trangThai}
                </span>
              )}
            </div>

            <div className="editor-bai__thong-ke">
              <span><strong>{soTu}</strong> từ</span>
              <span>•</span>
              <span><strong>{soKyTu}</strong> ký tự</span>
            </div>
          </div>

          <div className="editor-bai__textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="editor-bai__textarea"
              defaultValue={baiCu?.noiDung ?? ''}
              key={ketQuaSinh?.ok ? ketQuaSinh.contentId : baiCu?.id}
              rows={16}
              spellCheck={false}
              placeholder="Nội dung bài đăng sẽ hiện ra tại đây sau khi sinh…"
              onChange={(e) => {
                setNoiDungSua(e.target.value);
                setLuuThanhCong(false);
              }}
              aria-label="Nội dung bài đăng"
            />
          </div>

          <div className="editor-bai__hanh-dong">
            <div className="editor-bai__hanh-dong-left">
              <button
                type="button"
                className="btn btn--primary"
                onClick={luuNoiDung}
                disabled={dangLuu}
                id="btn-luu-bai"
              >
                {dangLuu ? 'Đang lưu…' : '💾 Lưu thay đổi'}
              </button>
              {luuThanhCong && (
                <span className="editor-bai__da-luu" role="status">✓ Đã lưu thành công</span>
              )}
            </div>

            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={saoChepNoiDung}
              title="Sao chép nội dung vào bộ nhớ tạm"
            >
              {daChep ? '✓ Đã chép' : '📋 Sao chép'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
