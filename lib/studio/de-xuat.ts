/**
 * Nghiệp vụ sinh ý tưởng nội dung — Mốc 1: /studio/de-xuat.
 *
 * LUỒNG:
 *   1. Đọc hồ sơ workspace (trụ cột, chân dung, xu hướng) qua lib/data-access
 *   2. Gọi mô hình qua chayNhiemVu() — không bao giờ gọi thẳng API
 *   3. donKetQuaDeXuat() dọn kết quả thô
 *   4. raiTheoTruCot() phân phối theo tỉ lệ mục tiêu
 *   5. Lưu vào bảng `ideas`
 *   6. Trả về KetQuaStudio<YTuongDeXuat[]>
 */

import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';

import type { BeMat, KetQuaStudio, YTuongDeXuat } from './kieu';

// ----------------------------------------------------------------
// Hằng số & kiểu xuất
// ----------------------------------------------------------------

/** 20% số lượng dành cho ý tưởng dò đường (khamPha = true). */
export const TI_LE_KHAM_PHA = 0.2;

export type ThamSoDeXuat = {
  workspaceId: string;
  beMat: BeMat;
  soLuong: number;
};

/** Trụ cột cùng tỉ lệ mục tiêu đặt trong hồ sơ. */
export type TruCotMucTieu = { ten: string; tiLeMucTieu: number | null };

// ----------------------------------------------------------------
// Hằng số nội bộ
// ----------------------------------------------------------------

/** Số xu hướng tối đa đưa vào lời nhắc. Đủ gợi ý mà không làm lời nhắc quá dài. */
const SO_XU_HUONG_TOI_DA = 10;

/** Số ý tưởng yêu cầu mô hình sinh ra (gấp đôi cần để có đủ sau khi lọc). */
const HE_SO_SINH_DU = 2;

/** Chuyển lỗi kỹ thuật từ worker/API sang thông báo người dùng hiểu được. */
function chuyenLoiMoHinh(loi: string | null | undefined): string {
  if (!loi) return 'Mô hình không trả về kết quả.';
  const thap = loi.toLowerCase();
  if (thap.includes('429') || thap.includes('quota') || thap.includes('rate limit')) {
    return [
      'Đã hết hạn mức gọi Gemini (quota).',
      'Chờ vài phút rồi thử lại, hoặc đặt AI_MODEL=gemini-3.1-flash-lite trong .env.',
      'Xem usage tại https://ai.dev/rate-limit',
    ].join(' ');
  }
  if (thap.includes('404') && thap.includes('gemini')) {
    return 'Model Gemini không còn khả dụng. Đặt AI_MODEL=gemini-3.1-flash-lite trong .env rồi thử lại.';
  }
  if (thap.includes('ai_provider') || thap.includes('thieu khoa api')) {
    return 'Chưa cấu hình AI: đặt AI_PROVIDER và GEMINI_API_KEY (hoặc OPENAI_API_KEY) trong .env.';
  }
  return loi;
}

// ----------------------------------------------------------------
// Kiểu nội bộ mô tả kết quả thô từ mô hình
// ----------------------------------------------------------------

type MucTho = {
  tieuDe?: unknown;
  truCot?: unknown;
  chanDung?: unknown;
  gocTiepCan?: unknown;
  cauMoDau?: unknown;
  lyDoDeXuat?: unknown;
  beMat?: unknown;
  kham_pha?: unknown; // mô hình trả về snake_case theo lời nhắc
};

/** Bề mặt hợp lệ — khớp enum `be_mat` trong DB. */
const BE_MAT_HOP_LE = new Set<string>(['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo']);

/**
 * Chuẩn hóa giá trị beMat thô từ mô hình.
 *
 * Mô hình hay trả "Fanpage Facebook", "Facebook" thay vì "fanpage" — nếu không
 * map lại thì donKetQuaDeXuat() loại hết ý tưởng fanpage và người dùng thấy lỗi
 * dù các tab khác (tiktok, zalo…) vẫn chạy bình thường.
 */
function chuanHoaBeMatTho(raw: unknown): BeMat | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase().replace(/\s+/g, '_');

  if (BE_MAT_HOP_LE.has(s)) return s as BeMat;

  // Ưu tiên kiểm tra cá nhân trước vì chuỗi có thể là "facebook_ca_nhan"
  if (
    s.includes('ca_nhan') ||
    s.includes('cá_nhân') ||
    s.includes('personal') ||
    s.includes('profile')
  ) {
    return 'ho_so_ca_nhan';
  }

  if (
    s.includes('fanpage') ||
    s.includes('facebook') ||
    s.includes('fb') ||
    s.includes('page')
  ) {
    return 'fanpage';
  }

  if (s.includes('tiktok')) return 'tiktok';
  if (s.includes('zalo')) return 'zalo';

  return null;
}

/**
 * Dọn kết quả thô của mô hình về đúng mảng YTuongDeXuat[].
 *
 * TẠI SAO set null thay vì lọc bỏ khi tên trụ cột / chân dung không khớp:
 *   - Lọc bỏ làm mất ý tưởng có thể hay — người dùng không thấy và không biết tại sao ít đề xuất.
 *   - set null giữ lại ý tưởng, UI có thể hiển thị "(chưa gán trụ cột)" để người dùng gán tay.
 *   - Ràng buộc "không bịa tên mới" vẫn được giữ vì null ≠ tên bịa (Ràng buộc 2).
 *
 * @param tho         Kết quả JSON thô từ mô hình (kiểu `unknown` vì mô hình có thể trả sai hình dạng)
 * @param tenTruCot   Danh sách tên trụ cột CÓ THẬT trong hồ sơ workspace
 * @param tenChanDung Danh sách tên chân dung CÓ THẬT trong hồ sơ workspace
 * @param beMatYeuCau Bề mặt đang yêu cầu đề xuất (nếu có)
 */
export function donKetQuaDeXuat(
  tho: unknown,
  tenTruCot: string[],
  tenChanDung: string[],
  beMatYeuCau?: BeMat,
): YTuongDeXuat[] {
  // Mô hình trả về { yTuong: [...] }
  const mang = (tho as { yTuong?: unknown })?.yTuong;
  if (!Array.isArray(mang)) return [];

  const tapTruCot = new Set(tenTruCot);
  const tapChanDung = new Set(tenChanDung);

  const ketQua: YTuongDeXuat[] = [];

  for (const m of mang as MucTho[]) {
    // Bỏ qua mục không phải object
    if (!m || typeof m !== 'object') continue;

    const tieuDe = typeof m.tieuDe === 'string' ? m.tieuDe.trim() : '';
    // Bỏ qua ý tưởng không có tiêu đề — không có tiêu đề là không dùng được
    if (!tieuDe) continue;

    // Kiểm tra trụ cột: chỉ chấp nhận TÊN CÓ THẬT, không chấp nhận tên bịa
    const truCotTho = typeof m.truCot === 'string' ? m.truCot.trim() : '';
    const truCot = tapTruCot.has(truCotTho) ? truCotTho : null;

    // Kiểm tra chân dung: tương tự
    const chanDungTho = typeof m.chanDung === 'string' ? m.chanDung.trim() : '';
    const chanDung = tapChanDung.has(chanDungTho) ? chanDungTho : null;

    // Kiểm tra bề mặt — chuẩn hóa alias, nếu thiếu thì fallback về beMatYeuCau
    let beMat = chuanHoaBeMatTho(m.beMat);
    if (!beMat && beMatYeuCau) {
      beMat = beMatYeuCau;
    }
    if (!beMat) continue;
    if (beMatYeuCau && beMat !== beMatYeuCau) continue;

    ketQua.push({
      tieuDe,
      truCot,
      chanDung,
      gocTiepCan: typeof m.gocTiepCan === 'string' ? m.gocTiepCan.trim() || null : null,
      cauMoDau: typeof m.cauMoDau === 'string' ? m.cauMoDau.trim() || null : null,
      lyDoDeXuat: typeof m.lyDoDeXuat === 'string' ? m.lyDoDeXuat.trim() || null : null,
      beMat,
      // Mô hình trả về snake_case theo lời nhắc ("kham_pha"), map về camelCase
      khamPha: m.kham_pha === true,
    });
  }

  return ketQua;
}

// ----------------------------------------------------------------
// raiTheoTruCot
// ----------------------------------------------------------------

/**
 * Rải ý tưởng theo tỉ lệ mục tiêu của từng trụ cột, cắt còn đúng `soLuong`.
 *
 * Thuật toán:
 *   1. Tách riêng ý tưởng khamPha (dò đường) — chúng không bị ép theo tỉ lệ trụ cột.
 *   2. Phần còn lại phân bổ theo tiLeMucTieu của từng trụ cột.
 *      Trụ cột không có tỉ lệ được đối xử bình đẳng (chia đều phần còn thừa).
 *   3. Ghép lại: khamPha trước, theo trụ cột sau.
 *   4. Bù trừ nếu một trong hai nhóm thiếu để luôn đạt tối đa `soLuong`.
 */
export function raiTheoTruCot(
  yTuongTho: YTuongDeXuat[],
  truCotMucTieu: TruCotMucTieu[],
  soLuong: number,
): YTuongDeXuat[] {
  if (soLuong <= 0 || yTuongTho.length === 0) return [];

  // Số chỗ dành cho ý tưởng dò đường
  const soKhamPha = Math.round(soLuong * TI_LE_KHAM_PHA);
  const nhomKhamPha = yTuongTho.filter((y) => y.khamPha);
  const nhomBinh = yTuongTho.filter((y) => !y.khamPha);

  // Chọn ý tưởng dò đường (lấy tối đa soKhamPha hoặc số có sẵn)
  const chonKhamPha = nhomKhamPha.slice(0, soKhamPha);

  // Số chỗ còn lại dành cho nhóm bình thường
  const soTheoTruCot = soLuong - chonKhamPha.length;
  const chonBinh = raiNhomBinhThuong(nhomBinh, truCotMucTieu, soTheoTruCot);

  const ketQua = [...chonKhamPha, ...chonBinh];

  // Nếu vẫn chưa đủ soLuong (do nhóm bình thiếu), lấy thêm từ phần còn lại chưa chọn
  if (ketQua.length < soLuong) {
    const daChon = new Set(ketQua);
    for (const y of yTuongTho) {
      if (ketQua.length >= soLuong) break;
      if (!daChon.has(y)) {
        ketQua.push(y);
        daChon.add(y);
      }
    }
  }

  return ketQua.slice(0, soLuong);
}

/**
 * Phân bổ ý tưởng bình thường theo tỉ lệ trụ cột.
 *
 * Dùng thuật toán "largest remainder" để tổng luôn đúng bằng `tong`.
 */
function raiNhomBinhThuong(
  yTuong: YTuongDeXuat[],
  truCotMucTieu: TruCotMucTieu[],
  tong: number,
): YTuongDeXuat[] {
  if (tong <= 0 || yTuong.length === 0) return [];

  // Gom ý tưởng theo trụ cột
  const theoTruCot = new Map<string, YTuongDeXuat[]>();
  const khongTruCot: YTuongDeXuat[] = [];

  for (const y of yTuong) {
    if (y.truCot) {
      const nhom = theoTruCot.get(y.truCot) ?? [];
      nhom.push(y);
      theoTruCot.set(y.truCot, nhom);
    } else {
      khongTruCot.push(y);
    }
  }

  // Tính tổng tỉ lệ có giá trị
  const tongTiLe = truCotMucTieu.reduce((s, tc) => s + (tc.tiLeMucTieu ?? 0), 0);

  // Tính số slot cho mỗi trụ cột (phần thực)
  const slots = truCotMucTieu.map((tc) => {
    const tiLe = tongTiLe > 0 ? (tc.tiLeMucTieu ?? 0) / tongTiLe : 1 / (truCotMucTieu.length || 1);
    return { ten: tc.ten, phan: tiLe * tong };
  });

  // Làm tròn theo largest remainder
  let tongDaLam = 0;
  const rounded = slots.map((s) => {
    const n = Math.floor(s.phan);
    tongDaLam += n;
    return { ten: s.ten, so: n, du: s.phan - n };
  });
  let conLai = tong - tongDaLam;
  rounded.sort((a, b) => b.du - a.du);
  for (const r of rounded) {
    if (conLai <= 0) break;
    r.so += 1;
    conLai -= 1;
  }

  // Chọn ý tưởng theo số slot
  const ketQua: YTuongDeXuat[] = [];
  for (const r of rounded) {
    const nhom = theoTruCot.get(r.ten) ?? [];
    ketQua.push(...nhom.slice(0, r.so));
  }

  // Phần còn dư chỗ → điền thêm ý tưởng không có trụ cột hoặc các trụ cột còn dư
  const conCho = tong - ketQua.length;
  if (conCho > 0) {
    const daLay = new Set(ketQua);
    const chuaLay = yTuong.filter((y) => !daLay.has(y));
    ketQua.push(...chuaLay.slice(0, conCho));
  }

  return ketQua.slice(0, tong);
}

// ----------------------------------------------------------------
// deXuatYTuong — cửa chính
// ----------------------------------------------------------------

/**
 * Cửa chính: sinh ý tưởng nội dung cho hôm nay.
 *
 * Không gọi thẳng API mô hình — đi qua chayNhiemVu() để đảm bảo:
 *   - Vào hàng đợi, worker xử lý riêng
 *   - Giới hạn số việc chạy đồng thời
 *   - Có thể thử lại khi lỗi
 */
export async function deXuatYTuong(
  thamSo: ThamSoDeXuat,
): Promise<KetQuaStudio<YTuongDeXuat[]>> {
  const { workspaceId, beMat, soLuong } = thamSo;

  // --- 1. Đọc hồ sơ workspace qua lib/data-access ---
  const repo = createRepo(workspaceId);

  const [truCotList, chanDungList] = await Promise.all([
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  // --- 2. Lấy xu hướng đã bóc công thức ---
  const daTaiXuHuong = await repo.tinHieuXuHuong.layDaBoc(SO_XU_HUONG_TOI_DA);

  const tenTruCot = truCotList.map((tc: { ten: string }) => tc.ten);
  const tenChanDung = chanDungList.map((cd: { ten: string }) => cd.ten);

  const truCotMucTieu: TruCotMucTieu[] = truCotList.map((tc: { ten: string; tiLeMucTieu: string | null }) => ({
    ten: tc.ten,
    // tiLeMucTieu là numeric string từ Drizzle (kiểu `numeric`)
    tiLeMucTieu: tc.tiLeMucTieu ? parseFloat(tc.tiLeMucTieu) : null,
  }));

  // --- 3. Dựng dữ liệu đầu vào cho mô hình ---
  // CHỈ truyền metadata của xu hướng, không truyền nội dung văn bản gốc (noiDung).
  // Đây là ràng buộc pháp lý được ép ở tầng tham số hàm (Ràng buộc 3).
  const xuHuongMetadata = daTaiXuHuong.slice(0, SO_XU_HUONG_TOI_DA).map((x) => ({
    id: x.id,
    chuDe: (x.congThuc as { chuDe?: string[] } | null)?.chuDe ?? [],
    kieuHook: (x.congThuc as { kieuHook?: string } | null)?.kieuHook ?? null,
    dangBai: x.dangBai,
    soChu: (x.congThuc as { soChu?: number } | null)?.soChu ?? null,
    // KHÔNG có trường noiDung — ràng buộc được ép ở đây
  }));

  const duLieuVao = {
    beMat,
    bienThe: beMat, // chọn khối giọng bề mặt trong lời nhắc (thuc-thi-nhiem-vu.js)
    soLuong: soLuong * HE_SO_SINH_DU, // sinh dư để sau lọc vẫn đủ
    truCot: tenTruCot,
    chanDung: tenChanDung,
    xuHuong: xuHuongMetadata, // chỉ metadata, không có text gốc
  };

  // --- 4. Gọi mô hình qua hàng đợi ---
  let ketQuaJob;
  try {
    ketQuaJob = await chayNhiemVu({
      nhiemVu: 'de-xuat-y-tuong',
      duLieuVao: { ...duLieuVao, thoiDiem: Date.now() },
      moHinh: 'auto',
      khongGianLamViec: workspaceId,
    });
  } catch (loi) {
    return {
      ok: false,
      loi: `Không thể gửi yêu cầu sinh ý tưởng: ${loi instanceof Error ? loi.message : String(loi)}`,
    };
  }

  if (ketQuaJob.trangThai !== 'xong' || !ketQuaJob.ketQua) {
    return {
      ok: false,
      loi: chuyenLoiMoHinh(ketQuaJob.loi),
    };
  }

  // --- 5. Dọn và rải kết quả ---
  const daDon = donKetQuaDeXuat(ketQuaJob.ketQua, tenTruCot, tenChanDung, beMat);
  const daRai = raiTheoTruCot(daDon, truCotMucTieu, soLuong);

  if (daRai.length === 0) {
    return {
      ok: false,
      loi: 'Mô hình không sinh được ý tưởng hợp lệ nào. Thử lại hoặc kiểm tra hồ sơ thương hiệu.',
    };
  }

  // --- 6. Lưu vào bảng ideas ---
  const canhBao: string[] = [];

  try {
    await Promise.all(
      daRai.map(async (y) => {
        // Tìm UUID của trụ cột và chân dung để lưu FK
        const pillar = truCotList.find((tc: { ten: string }) => tc.ten === y.truCot);
        const persona = chanDungList.find((cd: { ten: string }) => cd.ten === y.chanDung);

        await repo.yTuong.tao({
          beMat: y.beMat,
          gocTiepCan: y.gocTiepCan || y.tieuDe,
          pillarId: pillar?.id ?? null,
          personaId: persona?.id ?? null,
          cauMoDau: y.cauMoDau || y.tieuDe,
          lyDoDeXuat: y.lyDoDeXuat,
          nguonYTuong: 'may-de-xuat',
          trendSignalId: null,
          modelRunId: null,
          daDung: false,
        });
      }),
    );
  } catch (loi) {
    // Lưu lỗi nhưng vẫn trả về kết quả — người dùng đã chờ, không nên báo lỗi lưu là thất bại hoàn toàn
    canhBao.push(`Lưu ý tưởng vào cơ sở dữ liệu gặp lỗi: ${loi instanceof Error ? loi.message : String(loi)}`);
  }

  return {
    ok: true,
    data: daRai,
    canhBao,
  };
}


