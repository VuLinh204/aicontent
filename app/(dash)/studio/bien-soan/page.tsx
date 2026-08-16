/**
 * Trang /studio/bien-soan — Mốc 2: Biên soạn bài đăng từ 1 ý tưởng.
 *
 * URL: /studio/bien-soan?ideaId=<uuid>&beMat=fanpage
 *
 * Server Component: đọc DB, resolve tên trụ cột/chân dung, truyền xuống
 * EditorBai (Client Component) để xử lý tương tác.
 */

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { EditorBai } from './editor-bai';
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
  title: 'Biên soạn bài đăng — Studio',
  description: 'Từ 1 ý tưởng sinh ra bài đăng hoàn chỉnh, sửa được ngay trên trang.',
};

export default async function TrangBienSoan({
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
      <div className="trang-bien-soan">
        <h1 className="trang__tieu-de">Biên soạn bài đăng</h1>
        <p className="trang__mo-ta">
          Chọn một ý tưởng bên dưới để sinh bài đăng hoàn chỉnh.
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
                    href={`/studio/bien-soan?ideaId=${y.id}&beMat=${y.beMat}`}
                    className="btn btn--secondary y-tuong-card__chon"
                    id={`chon-y-tuong-${y.id}`}
                  >
                    Viết bài từ ý tưởng này →
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // --- Đã chọn ideaId: load idea + bài cũ (nếu có) ---
  const [idea, baiCuList] = await Promise.all([
    repo.yTuong.layTheoId(ideaId),


    repo.contents.list({ beMat: bematParam as 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo', gioiHan: 1 }),
  ]);

  if (!idea) {
    return (
      <div className="trang-bien-soan">
        <h1 className="trang__tieu-de">Ý tưởng không tồn tại</h1>
        <p>Ý tưởng này không tồn tại hoặc đã bị xóa. <a href="/studio/bien-soan">Quay lại chọn ý tưởng khác</a>.</p>
      </div>
    );
  }

  const tenTruCot = idea.pillarId ? (truCotMap.get(idea.pillarId) ?? null) : null;
  const tenChanDung = idea.personaId ? (chanDungMap.get(idea.personaId) ?? null) : null;

  // Tìm bài cũ của đúng idea này (nếu người dùng đã sinh trước)
  const baiCuCuaIdea = baiCuList.find((c) => c.ideaId === ideaId) ?? null;

  return (
    <div className="trang-bien-soan">
      <div className="trang-bien-soan__header">
        <a href="/studio/bien-soan" className="trang-bien-soan__quay-lai">
          ← Chọn ý tưởng khác
        </a>
        <h1 className="trang__tieu-de">Biên soạn bài đăng</h1>
      </div>

      <EditorBai
        ideaId={idea.id}
        beMat={idea.beMat}
        gocTiepCan={idea.gocTiepCan}
        cauMoDau={idea.cauMoDau}
        tenTruCot={tenTruCot}
        tenChanDung={tenChanDung}
        baiCu={baiCuCuaIdea
          ? {
            id: baiCuCuaIdea.id,
            tieuDe: baiCuCuaIdea.cauMoDau,
            noiDung: baiCuCuaIdea.noiDung,
            trangThai: baiCuCuaIdea.trangThai,
          }
          : null}
      />
    </div>
  );
}
