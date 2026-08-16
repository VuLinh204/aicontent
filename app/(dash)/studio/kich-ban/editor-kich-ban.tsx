'use client';

/**
 * Editor kịch bản quay video — hiển thị cấu trúc phân cảnh.
 *
 * Client component vì cần useActionState và tương tác.
 */

import React, { useActionState, useState } from 'react';
import type { KetQuaSinhKichBan } from './actions';
import { hanhDongSinhKichBan } from './actions';

const TEN_BE_MAT: Record<string, string> = {
  fanpage: 'Fanpage Facebook',
  ho_so_ca_nhan: 'Trang cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

type Props = {
  ideaId: string;
  beMat: string;
  gocTiepCan: string | null;
  cauMoDau: string | null;
  tenTruCot: string | null;
  tenChanDung: string | null;
};

type Canh = {
  thoiLuongGiay: number;
  hinhAnh: string;
  loiThoai: string;
};

type KichBanHienThi = {
  tieuDe: string;
  phanCanh: Canh[];
};

export function EditorKichBan({
  ideaId,
  beMat,
  gocTiepCan,
  cauMoDau,
  tenTruCot,
  tenChanDung,
}: Props) {
  const [ketQuaSinh, hanhDong, dangSinh] = useActionState(
    async (_prev: KetQuaSinhKichBan | null, form: FormData) =>
      hanhDongSinhKichBan(form),
    null,
  );

  const [kichBan, setKichBan] = useState<KichBanHienThi | null>(null);
  const [canhDangXem, setCanhDangXem] = useState<number>(0);

  // Khi sinh thành công, set kichBan từ ketQuaSinh
  React.useEffect(() => {
    if (ketQuaSinh?.ok) {
      setKichBan({ tieuDe: ketQuaSinh.tieuDe, phanCanh: ketQuaSinh.phanCanh });
      setCanhDangXem(0);
    }
  }, [ketQuaSinh]);

  const tongCanhSinh = kichBan?.phanCanh.length ?? 0;

  const canhHienTai = kichBan?.phanCanh[canhDangXem];

  return (
    <div className="editor-kich-ban">
      {/* Thông tin ý tưởng */}
      <div className="editor-kich-ban__card-y-tuong">
        <div className="editor-kich-ban__meta">
          <span className="badge badge--blue">{TEN_BE_MAT[beMat] ?? beMat}</span>
          {tenTruCot && (
            <span className="badge badge--gray" title="Trụ cột nội dung">
              📌 {tenTruCot}
            </span>
          )}
          {tenChanDung && (
            <span className="badge badge--outline" title="Chân dung khách hàng">
              👤 {tenChanDung}
            </span>
          )}
        </div>

        <div className="editor-kich-ban__chi-tiet-grid">
          {gocTiepCan && (
            <div className="editor-kich-ban__box-info">
              <span className="editor-kich-ban__box-nhan">Góc tiếp cận</span>
              <p className="editor-kich-ban__box-noi-dung">{gocTiepCan}</p>
            </div>
          )}
          {cauMoDau && (
            <div className="editor-kich-ban__box-info">
              <span className="editor-kich-ban__box-nhan">Câu mở đầu</span>
              <p className="editor-kich-ban__box-noi-dung">{cauMoDau}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form sinh kịch bản */}
      {!ketQuaSinh?.ok && (
        <div className="sinh-kich-ban-form">
          <h2 className="sinh-kich-ban-form__tieu-de">Sinh kịch bản quay video</h2>
          <form action={hanhDong} className="sinh-kich-ban-form__form">
            <input type="hidden" name="ideaId" value={ideaId} />
            <input type="hidden" name="beMat" value={beMat} />
            <button
              type="submit"
              disabled={dangSinh}
              className="btn btn--primary"
              id="nút-sinh-kich-ban"
            >
              {dangSinh ? 'Đang sinh...' : 'Sinh kịch bản'}
            </button>
            {ketQuaSinh?.ok === false && (
              <div className="thong-bao-loi">
                <p>{ketQuaSinh.loi}</p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Hiển thị kịch bản đã sinh */}
      {ketQuaSinh?.ok && (
        <div className="kich-ban-hien-thi">
          <h2 className="kich-ban-hien-thi__tieu-de">
            Kịch bản: {ketQuaSinh.tieuDe}
          </h2>
          <p className="kich-ban-hien-thi__so-canh">
            Tổng cộng {tongCanhSinh} cảnh
          </p>

          {/* Phần hiển thị cảnh hiện tại */}
          {canhHienTai && (
            <div className="canh-hien-thi">
              <div className="canh-hien-thi__tieu-de">
                Cảnh {canhDangXem + 1}
              </div>

              <div className="canh-hien-thi__thoi-luong">
                <strong>Thời lượng:</strong> {canhHienTai.thoiLuongGiay} giây
              </div>

              <div className="canh-hien-thi__hinh-anh">
                <strong>Hình ảnh / Prompt:</strong>
                <p>{canhHienTai.hinhAnh}</p>
              </div>

              <div className="canh-hien-thi__loi-thoai">
                <strong>Lời thoại / Voice-over:</strong>
                <p>{canhHienTai.loiThoai}</p>
              </div>
            </div>
          )}

          {/* Điều hướng giữa các cảnh */}
          {tongCanhSinh > 1 && (
            <div className="kich-ban-dieu-huong">
              <button
                className="btn btn--sm"
                disabled={canhDangXem === 0}
                onClick={() => setCanhDangXem(Math.max(0, canhDangXem - 1))}
              >
                ← Cảnh trước
              </button>
              <span className="kich-ban-dieu-huong__vi-tri">
                {canhDangXem + 1} / {tongCanhSinh}
              </span>
              <button
                className="btn btn--sm"
                disabled={canhDangXem === tongCanhSinh - 1}
                onClick={() => setCanhDangXem(Math.min(tongCanhSinh - 1, canhDangXem + 1))}
              >
                Cảnh sau →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
