'use client';

import { useActionState, useState } from 'react';
import { hanhDongSinhHangLoat } from './actions';
import type { KetQuaHangLoat } from '@/lib/studio/kieu';

interface EditorHangLoatProps {
  workspaceId: string;
}

export default function EditorHangLoat({ workspaceId }: EditorHangLoatProps) {
  const [soLuong, setSoLuong] = useState('5');
  const [beMat, setBeMat] = useState('fanpage');
  const [ketQua, thamSo, choDung] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const soLuongYTuong = parseInt(formData.get('soLuong') as string) || 1;
      const beMat = (formData.get('beMat') as 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo') || 'fanpage';
      return await hanhDongSinhHangLoat({ workspaceId, soLuongYTuong, beMat });
    },
    null,
  );

  return (
    <div className="editor-hang-loat">
      <form action={thamSo}>
        <div className="form-group">
          <label htmlFor="soLuong">Số lượng bài cần sinh:</label>
          <input
            id="soLuong"
            name="soLuong"
            type="number"
            min="1"
            max="20"
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
            disabled={choDung}
          />
        </div>

        <div className="form-group">
          <label htmlFor="beMat">Nền tảng:</label>
          <select
            id="beMat"
            name="beMat"
            value={beMat}
            onChange={(e) => setBeMat(e.target.value)}
            disabled={choDung}
          >
            <option value="fanpage">Facebook Fanpage</option>
            <option value="ho_so_ca_nhan">Hồ sơ cá nhân</option>
            <option value="tiktok">TikTok</option>
            <option value="zalo">Zalo</option>
          </select>
        </div>

        <button type="submit" className="btn btn--primary" disabled={choDung}>
          {choDung ? 'Đang sinh...' : 'Bắt đầu sinh'}
        </button>
      </form>

      {ketQua && ketQua.ok && (
        <div className="hang-loat-ket-qua">
          <h2>Kết Quả Sinh</h2>
          <div className="thong-ke">
            <div className="so">
              <span className="nhan">Tổng ý tưởng:</span>
              <span className="gia-tri">{ketQua.data.soYTuongSinh}</span>
            </div>
            <div className="so">
              <span className="nhan">Bài thành công:</span>
              <span className="gia-tri thanh-cong">{ketQua.data.soBaiTaoThanhCong}</span>
            </div>
            <div className="so">
              <span className="nhan">Bài thất bại:</span>
              <span className="gia-tri that-bai">{ketQua.data.soBaiThatBai}</span>
            </div>
          </div>

          <table className="hang-loat-bang">
            <thead>
              <tr>
                <th>ID Ý Tưởng</th>
                <th>Tiêu Đề</th>
                <th>Trạng Thái</th>
                <th>ID Nội Dung</th>
                <th>Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {ketQua.data.danhSachBai.map((bai, idx) => (
                <tr key={idx} className={`trang-thai-${bai.trangThai}`}>
                  <td className="id-tham-chieu">{bai.ideaId}</td>
                  <td>{bai.tieuDe}</td>
                  <td className="trang-thai">
                    {bai.trangThai === 'thanh_cong' ? '✓ Thành công' : '✗ Thất bại'}
                  </td>
                  <td className="id-tham-chieu">{bai.contentId}</td>
                  <td className="loi">{bai.loi}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ketQua.canhBao && ketQua.canhBao.length > 0 && (
            <div className="canh-bao">
              <h3>Cảnh báo</h3>
              <ul>
                {ketQua.canhBao.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {ketQua && !ketQua.ok && (
        <div className="loi-hang-loat">
          <h2>Lỗi</h2>
          <p>{ketQua.loi}</p>
        </div>
      )}
    </div>
  );
}
