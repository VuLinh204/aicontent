/**
 * Danh sách ý tưởng đã sinh — Server Component, đọc từ DB.
 *
 * Không phải Client Component vì dữ liệu đến từ DB (Server Action đã lưu).
 * Khi người dùng bấm "Sinh ý tưởng", Server Action chạy → revalidatePath('/studio/de-xuat')
 * → Next.js render lại trang → component này hiển thị danh sách mới.
 */

import type { Idea } from '@/lib/data-access/ideas';
import type { TruCot } from '@/lib/data-access/content-pillars';

type YTuongHienThi = Pick<
  Idea,
  | 'id'
  | 'beMat'
  | 'gocTiepCan'
  | 'cauMoDau'
  | 'lyDoDeXuat'
  | 'ngayTao'
> & {
  tenTruCot: string | null;
  tenChanDung: string | null;
};

// `Idea` từ DB không có trường `khamPha` vì schema hiện tại chưa có cột đó.
// Phần `nguonYTuong = 'may-de-xuat'` vẫn đủ để phân biệt nguồn ở mốc hiện tại.

type PropsDanhSach = {
  yTuong: Array<{
    id: string;
    tieuDe: string | null;
    beMat: string;
    truCot: string | null;
    chanDung: string | null;
    gocTiepCan?: string | null;
    cauMoDau: string | null;
    lyDoDeXuat: string | null;
    ngayTao: Date;
    nguonYTuong: string;
  }>;
};

/** Tên hiển thị ngắn của bề mặt. */
const NHAN_BE_MAT: Record<string, string> = {
  fanpage: 'Fanpage',
  ho_so_ca_nhan: 'Cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

/** Màu badge theo bề mặt. */
const MAU_BE_MAT: Record<string, string> = {
  fanpage: 'badge--blue',
  ho_so_ca_nhan: 'badge--green',
  tiktok: 'badge--purple',
  zalo: 'badge--cyan',
};

export function DanhSachYTuong({ yTuong }: PropsDanhSach) {
  if (yTuong.length === 0) {
    return (
      <div className="trong-rong" role="status">
        <p className="trong-rong__icon">💡</p>
        <p className="trong-rong__chu">
          Chưa có ý tưởng nào cho bề mặt này. Bấm <strong>✦ Sinh ý tưởng hôm nay</strong> ở trên để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <ul className="danh-sach-y-tuong" aria-label={`${yTuong.length} ý tưởng`}>
      {yTuong.map((y) => (
        <li key={y.id} className="y-tuong-card">
          <div className="y-tuong-card__dau">
            <div className="y-tuong-card__badges">
              <span className={`badge ${MAU_BE_MAT[y.beMat] ?? ''}`}>
                {NHAN_BE_MAT[y.beMat] ?? y.beMat}
              </span>
              {y.truCot && (
                <span className="badge badge--gray" title="Trụ cột nội dung">
                  📌 {y.truCot}
                </span>
              )}
              {y.chanDung && (
                <span className="badge badge--outline" title="Chân dung khách hàng">
                  👤 {y.chanDung}
                </span>
              )}
            </div>
          </div>

          <div className="y-tuong-card__than">
            <h3 className="y-tuong-card__tieu-de">
              {y.tieuDe ?? y.gocTiepCan ?? y.cauMoDau ?? '(Chưa có tiêu đề)'}
            </h3>

            {y.cauMoDau && y.cauMoDau !== y.tieuDe && (
              <div className="y-tuong-card__hook">
                <span className="y-tuong-card__nhan-phu">Hook / Mở đầu:</span>
                <p className="y-tuong-card__noi-dung-hook">"{y.cauMoDau}"</p>
              </div>
            )}

            {y.lyDoDeXuat && (
              <div className="y-tuong-card__ly-do">
                <span className="y-tuong-card__nhan-phu">Lý do đề xuất:</span>
                <p className="y-tuong-card__noi-dung-ly-do">{y.lyDoDeXuat}</p>
              </div>
            )}
          </div>

          <div className="y-tuong-card__chan">
            <time dateTime={y.ngayTao.toISOString()} className="y-tuong-card__ngay">
              🕒 {y.ngayTao.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
