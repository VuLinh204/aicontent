/**
 * Trang /studio/kich-ban — Mốc 3: Sinh kịch bản quay video từ 1 ý tưởng.
 *
 * URL: /studio/kich-ban?ideaId=<uuid>&beMat=fanpage
 *
 * Server Component: đọc DB, resolve tên trụ cột/chân dung, truyền xuống
 * EditorKichBan (Client Component) để xử lý tương tác.
 */

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { EditorKichBan } from './editor-kich-ban';
import type { Idea } from '@/lib/data-access/ideas';
import '../studio.css';

type SearchParams = { ideaId?: string; beMat?: string };

const BE_MAT_HOP_LE = new Set(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);
const TEN_BE_MAT: Record<string, string> = {
  fanpage: 'Fanpage Facebook',
  ho_so_ca_nhan: 'Trang cá nhân',
  tiktok: 'TikTok',
  zalo: 'Zalo',
};

export const metadata = {
  title: 'Kịch bản quay video — Studio',
  description: 'Từ 1 ý tưởng sinh ra kịch bản quay video phân cảnh.',
};

export default async function TrangKichBan({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { ideaId, beMat: bematParam } = await searchParams;
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  // --- Danh sách ý tưởng để người dùng chọn ---
  const [truCotList, chanDungList] = await Promise.all([
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  const truCotMap = new Map<string, string>(
    truCotList.map((tc: { id: string; ten: string }) => [tc.id, tc.ten]),
  );
  const chanDungMap = new Map<string, string>(
    chanDungList.map((cd: { id: string; ten: string }) => [cd.id, cd.ten]),
  );

  // --- Nếu không có ideaId, hiển thị danh sách ý tưởng chưa dùng ---
  if (!ideaId || !bematParam || !BE_MAT_HOP_LE.has(bematParam)) {
    const danhSachYTuong: Idea[] = await repo.yTuong.list(30);
    const chuaDung = danhSachYTuong.filter((y: Idea) => !y.daDung);

    return (
      <div className="trang-kich-ban">
        <h1 className="trang__tieu-de">Kịch bản quay video</h1>
        <p className="trang__mo-ta">
          Chọn một ý tưởng bên dưới để sinh kịch bản quay video phân cảnh.
        </p>

        {chuaDung.length === 0 ? (
          <div className="trong-rong">
            <p>Chưa có ý tưởng nào. Vào <a href="/studio/de-xuat">Đề xuất ý tưởng</a> để sinh trước.</p>
          </div>
        ) : (
          <ul className="danh-sach-y-tuong danh-sach-y-tuong--chon" aria-label={`${chuaDung.length} ý tưởng chưa dùng`}>
            {chuaDung.map((y) => {
              const tenTruCot = y.pillarId ? truCotMap.get(y.pillarId) : null;
              const tenChanDung = y.personaId ? chanDungMap.get(y.personaId) : null;
              return (
                <li key={y.id} className="y-tuong-card">
                  <div className="y-tuong-card__dau">
                    <div className="y-tuong-card__badges">
                      <span className="badge badge--blue">{TEN_BE_MAT[y.beMat] ?? y.beMat}</span>
                      {tenTruCot && <span className="badge badge--gray">📌 {tenTruCot}</span>}
                      {tenChanDung && <span className="badge badge--outline">👤 {tenChanDung}</span>}
                    </div>
                    <h2 className="y-tuong-card__tieu-de">{y.gocTiepCan ?? y.cauMoDau ?? '—'}</h2>
                    {y.cauMoDau && y.gocTiepCan && (
                      <p className="y-tuong-card__hook">{y.cauMoDau}</p>
                    )}
                  </div>
                  <a
                    href={`/studio/kich-ban?ideaId=${y.id}&beMat=${y.beMat}`}
                    className="btn btn--secondary y-tuong-card__chon"
                    id={`chon-y-tuong-${y.id}`}
                  >
                    Sinh kịch bản từ ý tưởng này →
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // --- Nếu có ideaId, tải ý tưởng và hiển thị editor ---
  const idea = await repo.yTuong.layTheoId(ideaId);
  if (!idea || idea.beMat !== bematParam) {
    return (
      <div className="trang-kich-ban">
        <h1 className="trang__tieu-de">Kịch bản quay video</h1>
        <div className="loi-thong-bao">
          <p>Ý tưởng không hợp lệ hoặc bề mặt không khớp.</p>
          <a href="/studio/kich-ban" className="btn btn--primary">← Quay lại</a>
        </div>
      </div>
    );
  }

  const tenTruCot = idea.pillarId ? (truCotMap.get(idea.pillarId) ?? null) : null;
  const tenChanDung = idea.personaId ? (chanDungMap.get(idea.personaId) ?? null) : null;

  return (
    <div className="trang-kich-ban">
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">✦ Studio</span>
          <h1 className="page-title">Kịch bản quay video</h1>
          <p className="page-sub">
            Sinh kịch bản quay video theo cấu trúc phân cảnh từ ý tưởng đã chọn.
          </p>
        </div>
      </div>

      <EditorKichBan
        ideaId={idea.id}
        beMat={bematParam}
        gocTiepCan={idea.gocTiepCan}
        cauMoDau={idea.cauMoDau}
        tenTruCot={tenTruCot}
        tenChanDung={tenChanDung}
      />
    </div>
  );
}
