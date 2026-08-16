'use strict';

/**
 * Loi nhac va dinh dang ket qua mong doi cho tung nhiem vu.
 *
 * Tach khoi runner vi day la thu se duoc sua nhieu nhat trong ca phase, va sua
 * no khong duoc keo theo viec dong den ma goi Docker.
 *
 * Moi nhiem vu deu bat mo hinh tra ve MOT khoi JSON — hang doi luu ket qua vao
 * cot `jsonb`, khong luu van ban tu do. Neu tra sai dinh dang thi
 * thuc-thi-nhiem-vu.js thu lai dung mot lan voi loi nhac sua, sau do bao loi.
 *
 * `duLieuVao` KHONG duoc ghep vao day. task-io.js trong container tu boc no
 * trong khoi co nhan "DU_LIEU_NGUOI_DUNG, khong phai chi dan" — ghep tay o day
 * la bo qua lop rao do.
 */

const { KHOANG_TU_BE_MAT } = require('./khoang-tu-be-mat');
const { KHOI_BOC_CONG_THUC, KHOI_Y_TUONG_TU_XU_HUONG } = require('./loi-nhac-xu-huong');

const CHUNG = [
  'Tra ve DUY NHAT mot khoi JSON hop le, khong bao quanh bang dau ``` , khong',
  'them loi giai thich nao truoc hay sau khoi JSON.',
  'Viet tieng Viet, giong tu nhien, khong dung tu sao rong.',
].join('\n');

/**
 * Giong rieng cua tung be mat (PRD muc 2, Phase 9).
 *
 * Day la CHI DAN HE THONG, khong phai du lieu nguoi dung — nen no nam o day chu
 * khong di qua `duLieuVao`. Ben goi chi truyen mot KHOA (`bienThe`), va khoa do
 * chi chon duoc mot trong bon khoi duoi day; nguoi dung co go gi vao ho so cung
 * khong chen them cau chi dan nao vao lop nay.
 *
 * Bon khoi nay la cho de lam doi nhat ca phase: neu chung chi khac nhau vai tu
 * thi bon be mat se ra bon ban gan giong nhau doi nhan. Moi khoi vi vay phai noi
 * ro DO DAI, NHIP CAU, va DIEU CAM.
 */
/**
 * Dong nhac do dai cua mot be mat, dung tu `KHOANG_TU_BE_MAT`.
 *
 * Bang chung 13/08/2026: loi nhac MOT MINH khong ep duoc do dai. Siet loi nhac
 * keo TikTok tu 215 xuong 144 tu (tran 120) nhung Zalo van 191 (tran 100). Vi
 * vay ngoai cac dong nhac nay con phai co cong dem tu sau khi sinh — xem
 * `lib/studio/cong-dem-tu.ts`.
 */
function dongDoDai(beMat) {
  const { toiThieu, toiDa } = KHOANG_TU_BE_MAT[beMat];
  return [
    `DO DAI BAT BUOC: ${toiThieu}-${toiDa} tu. Dem tu truoc khi tra ve.`,
    `Duoi ${toiThieu} tu hoac tren ${toiDa} tu deu la SAI, du noi dung hay den may.`,
  ].join('\n');
}

const GIONG_THEO_BE_MAT = {
  // Muc 10.2 cua content bible.
  fanpage: [
    'BE MAT: Fanpage Facebook.',
    'Vai tro cua kenh nay: giai thich sau, nuoi duong niem tin, chuyen doi.',
    'Uu tien dang: demo co caption chi tiet, quy trinh truoc-sau, case study dai,',
    'bai phan tich insight, FAQ va so sanh CO BOI CANH, feedback nguoi dung that.',
    dongDoDai('fanpage'),
    'Hai dong dau phai dung tron ven truoc nut "Xem them".',
    'Caption phai co bo cuc de doc: xuong dong tach y, khong doan van dac.',
    'MOT bai chi co MOT loi keu goi chinh. Nhieu CTA la khong dat.',
    'CAM: chep nguyen caption TikTok sang day — hanh vi nguoi doc khac han.',
  ].join('\n'),

  tiktok: [
    'BE MAT: TikTok.',
    'Vai tro cua kenh nay: mo rong nhan biet, tao nhu cau, chung minh nhanh.',
    'Cau truc bat buoc: Hook 1-2 giay -> Van de -> Demo/giai phap -> Ket qua -> CTA.',
    'Hook nam o 1-2 GIAY DAU. Khong chao hoi, khong "hom nay minh se chia se".',
    'MOT video giai quyet DUNG MOT y. Nhieu y trong mot video la khong dat.',
    'Cho thay hinh anh chung minh cang som cang tot.',
    'Caption ho tro ngu canh, KHONG chep lai toan bo loi thoai.',
    dongDoDai('tiktok'),
    'Khoang nay tuong duong 15-45 giay doc thanh tieng.',
    'Cau ngan, noi duoc thanh tieng.',
    'CAM: cau van viet dai; tu Han Viet trang trong.',
  ].join('\n'),

  // ============================ CANH BAO ============================
  // Hai khoi duoi day KHONG co trong content bible cua kenh — bible muc 10 chi
  // viet chien luoc cho TikTok va Fanpage. Chung duoc suy ra tu dinh vi va giong
  // thuong hieu (muc 1.6, 9.1), khong phai tu chien luoc kenh da chot.
  //
  // Truoc khi dung that cho hai be mat nay, chu du an can bo sung muc 10.3/10.4
  // vao bible. Hien tai coi day la GIA DINH, khong phai su that.
  // ==================================================================
  ho_so_ca_nhan: [
    'BE MAT: Trang ca nhan Facebook cua nguoi that.',
    'Giong: NGUOI THAT ke lai trai nghiem cua chinh minh. Xung "minh"/"toi".',
    'Bai nay PHAI doc ra khac han bai fanpage: neu doi ten nguoi dang ma van doc',
    'nhu bai thuong hieu thi la sai.',
    dongDoDai('ho_so_ca_nhan'),
    'Bat dau bang mot khoanh khac hoac mot cau noi that,',
    'khong bat dau bang cau gioi thieu san pham.',
    'Ban hang o day la he qua cua cau chuyen, khong phai muc dich mo dau.',
    'CAM: giong thong cao bao chi; liet ke tinh nang; tu "chung toi".',
  ].join('\n'),

  zalo: [
    'BE MAT: Zalo ca nhan.',
    'Giong: nhu dang nhan tin cho mot nguoi quen. Xung ho than mat, mot y chinh.',
    dongDoDai('zalo'),
    'Day la tin nhan, khong phai bai dang. Ngan hon han ba be mat kia.',
    'Ket bang mot cau hoi mo de nguoi nhan tra loi duoc — Zalo do bang tin nhan',
    'hoi, khong do bang luot xem.',
    'CAM: hashtag; emoji day dac; giong quang cao.',
  ].join('\n'),
};

/**
 * Giong thuong hieu — ap cho MOI be mat (content bible muc 9.1, 9.2, 9.3).
 *
 * Tach khoi `GIONG_THEO_BE_MAT` vi day la thu khong doi theo kenh. Bon be mat
 * khac nhau o nhip va do dai; con "khong than thanh hoa AI", "khong hua ket qua
 * tuyet doi" thi dung o dau cung dung.
 *
 * Bang thay the tu ngu o cuoi la rang buoc CUNG chu khong phai goi y: chung la
 * ranh gioi giua mot cau marketing va mot cau hua sai su that ve san pham.
 */
const GIONG_THUONG_HIEU = [
  'GIONG THUONG HIEU (ap dung cho moi be mat):',
  'Gan gui nhung co chuyen mon. Thang va thuc te. Giai thich bang ngon ngu doi thuong.',
  'Thau hieu su ban ron cua nguoi kinh doanh. Khuyen khich nguoi moi, khong phan xet.',
  'Chung minh bang demo va so lieu CO BOI CANH, khong bang tuyen bo.',
  '',
  'TUYET DOI KHONG:',
  '- Dung thuat ngu cong nghe nang ne, hoac than thanh hoa AI.',
  '- Giong quang cao phan mem xa la.',
  '- Cac tu "dot pha", "cach mang", "tu dong 100%".',
  '- Chi liet ke tinh nang.',
  '- Hua ket qua tuyet doi.',
  '- Ha thap CapCut hay cac trinh dung khac de nang san pham len.',
  '- Gay ap luc hoac lam nguoi doc thay minh kem coi.',
  '',
  'THAY THE TU NGU (bat buoc):',
  '- Thay "AI tu dong 100%" bang "AI ho tro dung, ban duyet ban cuoi".',
  '- Thay "ai cung ra video trong 5 phut" bang "thoi gian phu thuoc video va cau',
  '  hinh; day la ket qua demo thuc te".',
  '- Thay "khong can lam gi" bang "giam cac thao tac dung lap lai".',
  '- Thay "thay the editor" bang "giup ca nhan/team xu ly nhanh hon".',
  '- Thay "video chuyen nghiep ngay lap tuc" bang "video nhat quan va san sang',
  '  dang theo quy trinh da thiet lap".',
].join('\n');

/** @type {Record<string, { loiNhac: string, truongBatBuoc: string[] }>} */
const LOI_NHAC = {
  // ---------------------------------------------------------------------
  // BA NHIEM VU DUOI DAY LA PHAN BAI TEST. `truongBatBuoc` va dong "Cau truc"
  // la HOP DONG DA CHOT — bo kiem thu cham diem bam vao dung hai thu do, doi
  // ten truong la truot. Rieng phan chi dan cho mo hinh de trong: viet loi nhac
  // chinh la phan duoc cham.
  //
  // Bon nhiem vu con lai ben duoi da viet san, doc chung de biet nha nay viet
  // loi nhac theo kieu gi.
  // ---------------------------------------------------------------------
  'viet-bai': {
    truongBatBuoc: ['tieuDe', 'noiDung'],
    loiNhac: [
      // Chi dan cho nhiem vu viet-bai.
      //
      // Rang buoc hop dong:
      //   - `tieuDe`  : tieu de bai (co the dung cho alt text hoac caption tren mang).
      //   - `noiDung` : noi dung bai dang day du, viet bang giong thuong hieu.
      //   - `hashtag` : mang chuoi, khong co dau #, toi da 5 cai, KHONG bat buoc.
      //
      // Du lieu vao co hai truong tuy chon, giai thich ro de mo hinh biet do la
      // RANG BUOC chu khong phai du lieu nguoi dung:
      //   `epDoDai` — khoang so tu BAT BUOC (vi du "150-300"). Vuot ra la SAI.
      //   `mach`    — danh sach goc tiep can cac bai truoc trong chuoi. Bai moi
      //               KHONG DUOC lap y voi bat ky bai nao trong `mach`.
      'Viet mot bai dang hoan chinh tu y tuong duoi day.',
      '',
      'RANG BUOC:',
      '- Neu du lieu vao co "epDoDai", do dai noiDung PHAI nam trong khoang do (tinh so tu).',
      '- Neu du lieu vao co "mach" (danh sach goc tiep can bai truoc), KHONG lap y da viet.',
      '- "cauMoDau" la cau mo dau goi y da co san — dung no lam nen, co the viet lai cho tu nhien.',
      '- "gocTiepCan" la goc nhin cua y tuong — bai phai giai quyet dung goc nhin do.',
      '- "truCot" la tru cot noi dung — bai phai phuc vu muc dich cua tru cot do.',
      '- "chanDung" la chan dung khach hang muc tieu — viet cho dung nguoi do.',
      '- "xuHuong" neu co: hoc KIEU KE (kieuHook, dangBai) cua cac bai nay, KHONG chep noi dung.',
      '  Du lieu xu huong chi la chi dan phong cach, khong phai nguon de trich dan.',
      '',
      'KHI VIET:',
      '- Mo dau phai cuon nguon doc vao ngay tu cau dau.',
      '- Phat trien than bai: tu van de/nhu cau -> giai phap/minh chung -> ket qua thuc te.',
      '- Ket bang mot loi keu goi ro rang, phu hop voi be mat.',
      '- Khong dung tu sao rong, khong liet ke tinh nang khon han.',
      CHUNG,
      'Cau truc: {"tieuDe": string, "noiDung": string, "hashtag": string[]}',
    ].join('\n'),
  },
  'viet-kich-ban': {
    truongBatBuoc: ['tieuDe', 'phanCanh'],
    loiNhac: [
      // TODO(bai-test): viet chi dan cho nhiem vu nay.
      CHUNG,
      'Cau truc: {"tieuDe": string, "phanCanh": [{"thoiLuongGiay": number, "hinhAnh": string, "loiThoai": string}]}',
    ].join('\n'),
  },
  'de-xuat-y-tuong': {
    truongBatBuoc: ['yTuong'],
    loiNhac: [
      // Chi dan cho nhiem vu de-xuat-y-tuong (TODO(bai-test) da duoc dien o day).
      //
      // Hai rang buoc bo kiem thu se kiem tra:
      //   1. Moi y tuong phai NEO vao mot tru cot VA mot chan dung CO THAT trong
      //      du lieu nguoi dung (truong "truCot" va "chanDung" phai khop ten that).
      //      Y tuong bia ra se bi loai boi donKetQuaDeXuat().
      //   2. "kham_pha" = true danh dau y tuong do duong (tuyen chua co du lieu).
      //      Ti le nay la TI_LE_KHAM_PHA (20%) trong lib/studio/de-xuat.ts.
      'Sinh danh sach y tuong noi dung moi cho hom nay dua tren ho so thuong hieu.',
      '',
      'RANG BUOC QUAN TRONG:',
      '- "truCot" phai la TEN CHINH XAC cua mot tru cot CO THAT trong danh sach tru cot duoc cung cap.',
      '  Neu khong co tru cot nao phu hop, dung null — TUYET DOI khong tu dung ten moi.',
      '- "chanDung" phai la TEN CHINH XAC cua mot chan dung CO THAT trong danh sach chan dung duoc cung cap.',
      '  Neu khong co chan dung nao phu hop, dung null — TUYET DOI khong tu dung ten moi.',
      '- "kham_pha" = true: y tuong nay thu duong moi (tuyen chua co du lieu), khong bi ep theo ti le tru cot.',
      '- "kham_pha" = false: y tuong bam sat mot tru cot da co (truCot phai khac null).',
      '- "beMat" chi duoc la mot trong: "fanpage", "ho_so_ca_nhan", "tiktok", "zalo".',
      '- MOI y tuong phai co "beMat" DUNG BANG gia tri "beMat" trong du lieu dau vao.',
      '',
      'Viet "lyDoDeXuat" giai thich ngan gon tai sao y tuong nay phu hop voi thuong hieu va chan dung do.',
      CHUNG,
      'Cau truc: {"yTuong": [{"tieuDe": string, "truCot": string|null, "chanDung": string|null,' +
        ' "gocTiepCan": string|null, "cauMoDau": string|null, "lyDoDeXuat": string|null,' +
        ' "beMat": "fanpage"|"ho_so_ca_nhan"|"tiktok"|"zalo", "kham_pha": boolean}]}',
      KHOI_Y_TUONG_TU_XU_HUONG,
    ].join('\n'),
  },
  'cham-chat-luong': {
    truongBatBuoc: ['diem'],
    loiNhac: [
      'Cham diem chat luong noi dung nguoi dung cung cap. Cham deu tay, khong sang tao.',
      'Moi tieu chi cham tu 0 den 10, kem mot cau ly do ngan.',
      CHUNG,
      'Cau truc: {"diem": {"<ten-tieu-chi>": {"diem": number, "lyDo": string}}, "tongKet": string}',
    ].join('\n'),
  },
  'phan-loai-binh-luan': {
    truongBatBuoc: ['phanLoai'],
    loiNhac: [
      'Phan loai tung binh luan trong du lieu nguoi dung cung cap.',
      'Nhan cho phep: "y_dinh_mua", "hoi_thong_tin", "khen", "che", "spam", "khac".',
      CHUNG,
      'Cau truc: {"phanLoai": [{"id": string, "nhan": string, "doTinCay": number}]}',
    ].join('\n'),
  },
  'boc-tach-ho-so': {
    // Bon khoa deu bat buoc CO MAT (mang rong van hop le). Neu chi bat 'hoSo'
    // thi mo hinh bo qua ba nhom kia van duoc coi la thanh cong, va man hinh
    // dan van ban im lang tra ve ho so trong.
    truongBatBuoc: ['hoSo', 'sanPham', 'chanDung', 'truCot'],
    loiNhac: [
      'Boc tach ho so thuong hieu tu van ban tho nguoi dung cung cap.',
      'Truong nao van ban khong noi thi de null. TUYET DOI khong tu bia.',
      'Nhom nao van ban khong nhac toi thi tra ve mang rong, khong tu nghi ra.',
      CHUNG,
      'Cau truc: {"hoSo": {"moTa": string|null, "giongDieu": string|null, "dieuCamKy": string|null}, "sanPham": [{"ten": string, "gia": string|null, "loiIch": string|null, "phanDoiThuongGap": string|null, "loiKeuGoi": string|null}], "chanDung": [{"ten": string, "doTuoi": string|null, "ngheNghiep": string|null, "noiDau": string|null, "mongMuon": string|null, "cauNoiThuongDung": string|null}], "truCot": [{"ten": string, "mucDich": string|null}]}',
    ].join('\n'),
  },
  'cham-diem-lien-quan': {
    truongBatBuoc: ['diemLienQuan'],
    loiNhac: [
      'Cham diem muc do lien quan giua tin xu huong va thuong hieu trong du lieu nguoi dung cung cap.',
      'Diem tu 0 den 100. Cham hang loat, deu tay.',
      CHUNG,
      'Cau truc: {"diemLienQuan": [{"id": string, "diem": number, "lyDo": string}]}',
      KHOI_BOC_CONG_THUC,
    ].join('\n'),
  },
};

/**
 * Loi nhac sua khi lan chay dau tra ve khong phai JSON.
 * Chi dung DUNG MOT LAN — vong lap "sua roi sua nua" dot het thoi gian cho va
 * ca quota thue bao ma ti le cuu duoc thi rat thap.
 */
function loiNhacSuaDinhDang(nhiemVu, loiPhanTich) {
  const goc = layLoiNhac(nhiemVu);
  return [
    'Lan tra loi truoc SAI DINH DANG va da bi bo.',
    `Ly do: ${loiPhanTich}`,
    'Lan nay chi in ra khoi JSON, ky tu dau tien phai la { va ky tu cuoi la }.',
    '',
    goc.loiNhac,
  ].join('\n');
}

function layLoiNhac(nhiemVu) {
  const muc = LOI_NHAC[nhiemVu];
  if (!muc) throw new Error(`layLoiNhac: chua co loi nhac cho nhiem vu ${nhiemVu}`);
  return muc;
}

/**
 * Ghep khoi giong cua mot be mat vao loi nhac goc.
 *
 * `bienThe` la KHOA chu khong phai van ban: gia tri la khoa khong biet thi tra
 * ve loi nhac goc, khong bao gio ghep chuoi nguoi goi truyen vao. Nho vay mot
 * gia tri bi sua doc cung chi chon nham mot trong bon khoi da viet san.
 */
function ghepGiongBeMat(loiNhac, bienThe) {
  const khoi = GIONG_THEO_BE_MAT[bienThe];
  if (!khoi) return loiNhac;
  // Giong thuong hieu di kem be mat: khoa be mat hop le nghia la day la mot
  // nhiem vu VIET, ma da viet thi luon phai theo giong thuong hieu.
  return `${loiNhac}\n\n${GIONG_THUONG_HIEU}\n\n${khoi}`;
}

module.exports = {
  KHOANG_TU_BE_MAT,
  LOI_NHAC,
  GIONG_THEO_BE_MAT,
  GIONG_THUONG_HIEU,
  ghepGiongBeMat,
  layLoiNhac,
  loiNhacSuaDinhDang,
};
