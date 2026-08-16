import type { Metadata } from 'next';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';

import { FormSinhYTuong } from './form-sinh-y-tuong';
import { DanhSachYTuong } from './danh-sach-y-tuong';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Đề xuất hôm nay — AI Content',
  description: 'Sinh ý tưởng nội dung mạng xã hội dựa trên hồ sơ thương hiệu và xu hướng.',
};

/**
 * Trang /studio/de-xuat — Server Component.
 *
 * Đọc ý tưởng đã lưu từ DB, render form + danh sách.
 * Khi người dùng submit form → Server Action chạy → revalidatePath → trang render lại.
 */
export default async function TrangDeXuat({
  searchParams,
}: {
  searchParams: Promise<{ beMat?: string }>;
}) {
  const { beMat: beMhayMat } = await searchParams;

  // Mặc định bề mặt là fanpage nếu không có trong URL
  const BE_MAT_MAC_DINH = 'fanpage';
  const BE_MAT_HOP_LE = new Set(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);
  const beMat = beMhayMat && BE_MAT_HOP_LE.has(beMhayMat) ? beMhayMat : BE_MAT_MAC_DINH;

  // Đọc ý tưởng đã sinh theo đúng bề mặt từ DB, kèm danh sách trụ cột & chân dung để hiển thị badge
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  const [danhSachYTuong, truCotList, chanDungList] = await Promise.all([
    repo.yTuong.layTheoBeMat(beMat, 20),
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  const truCotMap = new Map<string, string>(
    truCotList.map((tc: { id: string; ten: string }) => [tc.id, tc.ten]),
  );
  const chanDungMap = new Map<string, string>(
    chanDungList.map((cd: { id: string; ten: string }) => [cd.id, cd.ten]),
  );

  const yTuongHienThi = danhSachYTuong.map((y) => ({
    id: y.id,
    tieuDe: y.gocTiepCan ?? y.cauMoDau,
    beMat: y.beMat,
    truCot: y.pillarId ? (truCotMap.get(y.pillarId) ?? null) : null,
    chanDung: y.personaId ? (chanDungMap.get(y.personaId) ?? null) : null,
    gocTiepCan: y.gocTiepCan,
    cauMoDau: y.cauMoDau,
    lyDoDeXuat: y.lyDoDeXuat,
    ngayTao: y.ngayTao,
    nguonYTuong: y.nguonYTuong,
  }));

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">✦ Studio</span>
          <h1 className="page-title">Đề xuất hôm nay</h1>
          <p className="page-sub">
            Máy phân tích hồ sơ thương hiệu và xu hướng kênh bạn theo dõi để đề xuất{' '}
            <strong>ý tưởng bài đăng</strong> phù hợp. Bấm để sinh mới mỗi ngày.
          </p>
        </div>
      </div>

      {/* Bộ chọn bề mặt */}
      <nav className="chon-be-mat" aria-label="Chọn bề mặt đăng bài">
        {(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo'] as const).map((bm) => (
          <a
            key={bm}
            href={`/studio/de-xuat?beMat=${bm}`}
            className={`btn btn--sm ${bm === beMat ? 'btn--primary' : 'btn--ghost'}`}
            aria-current={bm === beMat ? 'page' : undefined}
            id={`tab-be-mat-${bm}`}
          >
            {/* Emoji đơn giản để phân biệt nhanh */}
            {bm === 'fanpage' && '📘 Fanpage'}
            {bm === 'ho_so_ca_nhan' && '👤 Cá nhân'}
            {bm === 'tiktok' && '🎵 TikTok'}
            {bm === 'zalo' && '💬 Zalo'}
          </a>
        ))}
      </nav>

      {/* Form sinh ý tưởng */}
      <section className="panel" aria-label="Sinh ý tưởng mới">
        <FormSinhYTuong beMat={beMat} />
      </section>

      {/* Danh sách ý tưởng đã sinh */}
      <section className="panel" aria-label="Ý tưởng đã sinh">
        <div className="panel__dau">
          <h2 className="panel__tieu-de">
            Ý tưởng gần nhất
            {yTuongHienThi.length > 0 && (
              <span className="badge badge--gray">{yTuongHienThi.length}</span>
            )}
          </h2>
        </div>
        <DanhSachYTuong yTuong={yTuongHienThi} />
      </section>
    </>
  );
}
