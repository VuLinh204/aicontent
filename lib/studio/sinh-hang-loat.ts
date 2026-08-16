/**
 * Moc 4: Sinh hang loat bai dang tu nhieu y tuong.
 *
 * Tai su dung deXuatYTuong() (Moc 1) -> sau do vong qua tung y tuong goi
 * bienSoanBai() (Moc 2). Khong viet lai logic goi mo hinh rieng cho moc nay.
 */

import { createRepo } from '@/lib/data-access';
import { deXuatYTuong } from './de-xuat';
import { bienSoanBai } from './bien-soan';
import type {
  ThamSoSinhHangLoat,
  KetQuaHangLoat,
  BaiTrongHangLoat,
  KetQuaStudio,
  BeMat,
} from './kieu';

/**
 * Cua chinh Moc 4: Sinh N y tuong, voi moi y tuong tao 1 bai dang.
 *
 * Luong chay:
 * 1. Goi deXuatYTuong() de sinh N y tuong, luu vao DB
 * 2. Truy van DB lay N y tuong chu dung (y tuong vua sinh co daDung=false)
 * 3. Vong qua tung y tuong, goi bienSoanBai() de tao bai
 * 4. Tra ve danh sach ket qua
 */
export async function sinhHangLoat(
  thamSo: ThamSoSinhHangLoat,
): Promise<KetQuaStudio<KetQuaHangLoat>> {
  const { workspaceId, beMat, soLuongYTuong } = thamSo;

  // --- Validation ---
  if (!workspaceId) {
    return { ok: false, loi: 'Thieu workspaceId' };
  }
  const BE_MAT_HOP_LE = new Set(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);
  if (!BE_MAT_HOP_LE.has(beMat)) {
    return { ok: false, loi: `Be mat khong hop le: ${beMat}` };
  }
  if (soLuongYTuong <= 0) {
    return { ok: false, loi: 'So luong y tuong phai >= 1' };
  }
  if (soLuongYTuong > 100) {
    return { ok: false, loi: 'So luong y tuong toi da 100' };
  }

  const repo = createRepo(workspaceId);

  // --- 1. Sinh N y tuong (luu vao DB) ---
  const ketQuaYTuong = await deXuatYTuong({
    workspaceId,
    beMat,
    soLuong: soLuongYTuong,
  });

  if (!ketQuaYTuong.ok) {
    return {
      ok: false,
      loi: `Khong sinh duoc y tuong: ${ketQuaYTuong.loi}`,
    };
  }

  // --- 2. Lay y tuong chu dung tu DB de co ID ---
  // Fetch theo thu tu moi nhat trc, chi lay nhung y tuong vua sinh
  // (co daDung=false va beMat dung)
  const danhSachYTuongTuDB = await repo.yTuong.layTheoBeMat(beMat, soLuongYTuong);
  const yTuongChuDung = danhSachYTuongTuDB.filter(
    (y: { daDung: boolean }) => !y.daDung
  );

  // Neu so luong < yeu cau, chi lay nhung co san
  const soLuongThucTe = Math.min(yTuongChuDung.length, soLuongYTuong);
  const yTuongCanXu = yTuongChuDung.slice(0, soLuongThucTe);

  if (yTuongCanXu.length === 0) {
    return {
      ok: false,
      loi: 'Khong co y tuong chu dung trong DB sau khi sinh.',
    };
  }

  // --- 3. Vong qua tung y tuong, tao bai dang ---
  const danhSachBai: BaiTrongHangLoat[] = [];
  let soBaiThanhCong = 0;
  let soBaiThatBai = 0;

  for (const yTuong of yTuongCanXu) {
    try {
      const ketQuaBai = await bienSoanBai({
        workspaceId,
        ideaId: yTuong.id,
        beMat,
      });

      if (ketQuaBai.ok) {
        danhSachBai.push({
          ideaId: yTuong.id,
          contentId: ketQuaBai.data.contentId,
          tieuDe: ketQuaBai.data.tieuDe,
          trangThai: 'thanh_cong',
        });
        soBaiThanhCong++;
      } else {
        danhSachBai.push({
          ideaId: yTuong.id,
          contentId: '',
          tieuDe: '',
          trangThai: 'that_bai',
          loi: ketQuaBai.loi,
        });
        soBaiThatBai++;
      }
    } catch (loi) {
      danhSachBai.push({
        ideaId: yTuong.id,
        contentId: '',
        tieuDe: '',
        trangThai: 'that_bai',
        loi: loi instanceof Error ? loi.message : String(loi),
      });
      soBaiThatBai++;
    }
  }

  return {
    ok: true,
    data: {
      soYTuongSinh: yTuongCanXu.length,
      soBaiTaoThanhCong: soBaiThanhCong,
      soBaiThatBai: soBaiThatBai,
      danhSachBai,
    },
    canhBao: ketQuaYTuong.canhBao,
  };
}
