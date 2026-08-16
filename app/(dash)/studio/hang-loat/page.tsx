import { workspaceHienTai } from '@/lib/auth/current-workspace';
import EditorHangLoat from './editor-hang-loat';
import '../studio.css';

export const metadata = {
  title: 'Sinh hàng loạt bài đăng — Studio',
  description: 'Sinh nhiều bài đăng cùng lúc để đạt mục tiêu 10 bài/ngày.',
};

export default async function PageHangLoat() {
  const workspaceId = await workspaceHienTai();

  return (
    <div className="container-hang-loat">
      <h1>Sinh Hàng Loạt Bài Đăng</h1>
      <EditorHangLoat workspaceId={workspaceId} />
    </div>
  );
}
