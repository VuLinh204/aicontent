import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import '../studio.css';
import { SinhAnhEditor } from './editor-sinh-anh';

export const metadata = {
  title: 'Sinh ảnh — Studio',
  description: 'Sinh prompt ảnh cho bài đăng từ nội dung đã có.',
};

export default async function Page() {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  const baiChuaCoAnh = await repo.contents.list({
    gioiHan: 20,
    beMat: 'fanpage',
  });

  return (
    <div className="container-hang-loat">
      <SinhAnhEditor workspaceId={workspaceId} baiDang={baiChuaCoAnh} />
    </div>
  );
}
