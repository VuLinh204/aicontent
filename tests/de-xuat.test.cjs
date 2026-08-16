'use strict';

require('dotenv/config');
require('tsx/cjs');

/**
 * Bo kiem thu don vi cho Mốc 1: /studio/de-xuat (Nghiep vu de xuat y tuong).
 *
 * Kiem tra dung cac hop dong va rang buoc:
 *   1. donKetQuaDeXuat() don du lieu tho, dat null khi tru cot / chan dung khong ton tai (Rang buoc 2).
 *   2. raiTheoTruCot() phan bo dung 20% kham pha (TI_LE_KHAM_PHA) va theo ti le tru cot muc tieu.
 *   3. Chuan hoa dung be mat (fanpage, ho_so_ca_nhan, tiktok, zalo).
 */

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  TI_LE_KHAM_PHA,
  donKetQuaDeXuat,
  raiTheoTruCot,
} = require('../lib/studio/de-xuat.ts');

describe('Hop dong Mốc 1: TI_LE_KHAM_PHA', () => {
  it('TI_LE_KHAM_PHA phai dung bang 0.2 (20%)', () => {
    assert.equal(TI_LE_KHAM_PHA, 0.2);
  });
});

describe('donKetQuaDeXuat', () => {
  const tenTruCotThat = ['Chi meo huu ich', 'Xay long tin', 'Chao ban'];
  const tenChanDungThat = ['Chi Ha ban do an nha lam', 'Anh Tuan chuoi 3 cua hang'];

  it('tra ve mang rong neu du lieu tho khong hop le hoac thieu yTuong', () => {
    assert.deepEqual(donKetQuaDeXuat(null, tenTruCotThat, tenChanDungThat), []);
    assert.deepEqual(donKetQuaDeXuat({}, tenTruCotThat, tenChanDungThat), []);
    assert.deepEqual(donKetQuaDeXuat({ yTuong: 'khong phai mang' }, tenTruCotThat, tenChanDungThat), []);
  });

  it('giu dung ten tru cot va chan dung khi co trong ho so', () => {
    const tho = {
      yTuong: [
        {
          tieuDe: 'Meo chon nguyen lieu tuoi',
          truCot: 'Chi meo huu ich',
          chanDung: 'Chi Ha ban do an nha lam',
          gocTiepCan: 'Goc huong dan',
          cauMoDau: 'Lam sao de chon thit tuoi?',
          lyDoDeXuat: 'Phu hop chi Ha',
          beMat: 'fanpage',
          kham_pha: false,
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, tenTruCotThat, tenChanDungThat);
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].tieuDe, 'Meo chon nguyen lieu tuoi');
    assert.equal(ketQua[0].truCot, 'Chi meo huu ich');
    assert.equal(ketQua[0].chanDung, 'Chi Ha ban do an nha lam');
    assert.equal(ketQua[0].beMat, 'fanpage');
    assert.equal(ketQua[0].khamPha, false);
  });

  it('RANG BUOC 2: gan null neu tru cot hoac chan dung khong co trong ho so (khong tu bia)', () => {
    const tho = {
      yTuong: [
        {
          tieuDe: 'Y tuong voi ten bia',
          truCot: 'Tru cot tu bia ra 123',
          chanDung: 'Chan dung khong ton tai',
          gocTiepCan: 'Goc moi',
          cauMoDau: 'Cau mo dau',
          lyDoDeXuat: 'Ly do',
          beMat: 'fanpage',
          kham_pha: true,
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, tenTruCotThat, tenChanDungThat);
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].truCot, null, 'truCot khong khop phai thanh null');
    assert.equal(ketQua[0].chanDung, null, 'chanDung khong khop phai thanh null');
    assert.equal(ketQua[0].khamPha, true);
  });

  it('chuan hoa be mat thong minh va loc theo beMatYeuCau', () => {
    const tho = {
      yTuong: [
        { tieuDe: 'Bai 1', beMat: 'Fanpage Facebook', kham_pha: false },
        { tieuDe: 'Bai 2', beMat: 'Trang cá nhân', kham_pha: false },
        { tieuDe: 'Bai 3', beMat: 'TikTok', kham_pha: false },
        { tieuDe: 'Bai 4', beMat: 'Zalo', kham_pha: false },
      ],
    };

    const tatCa = donKetQuaDeXuat(tho, tenTruCotThat, tenChanDungThat);
    assert.equal(tatCa.length, 4);
    assert.equal(tatCa[0].beMat, 'fanpage');
    assert.equal(tatCa[1].beMat, 'ho_so_ca_nhan');
    assert.equal(tatCa[2].beMat, 'tiktok');
    assert.equal(tatCa[3].beMat, 'zalo');

    const chiFanpage = donKetQuaDeXuat(tho, tenTruCotThat, tenChanDungThat, 'fanpage');
    assert.equal(chiFanpage.length, 1);
    assert.equal(chiFanpage[0].beMat, 'fanpage');
  });

  it('bo qua y tuong khong co tieu de', () => {
    const tho = {
      yTuong: [
        { tieuDe: '', beMat: 'fanpage' },
        { tieuDe: '   ', beMat: 'fanpage' },
        { tieuDe: 'Hop le', beMat: 'fanpage' },
      ],
    };
    const ketQua = donKetQuaDeXuat(tho, tenTruCotThat, tenChanDungThat);
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].tieuDe, 'Hop le');
  });
});

describe('raiTheoTruCot', () => {
  const truCotMucTieu = [
    { ten: 'Chi meo', tiLeMucTieu: 0.5 },
    { ten: 'Xay tin', tiLeMucTieu: 0.3 },
    { ten: 'Chao ban', tiLeMucTieu: 0.2 },
  ];

  const taoYTuong = (tieuDe, truCot, khamPha = false) => ({
    tieuDe,
    truCot,
    chanDung: null,
    gocTiepCan: null,
    cauMoDau: null,
    lyDoDeXuat: null,
    beMat: 'fanpage',
    khamPha,
  });

  it('phan bo dung 20% cho y tuong kham pha va cat con dung soLuong', () => {
    const danhSach = [
      taoYTuong('KP 1', null, true),
      taoYTuong('KP 2', null, true),
      taoYTuong('Meo 1', 'Chi meo', false),
      taoYTuong('Meo 2', 'Chi meo', false),
      taoYTuong('Tin 1', 'Xay tin', false),
      taoYTuong('Tin 2', 'Xay tin', false),
      taoYTuong('Ban 1', 'Chao ban', false),
      taoYTuong('Ban 2', 'Chao ban', false),
    ];

    const ketQua = raiTheoTruCot(danhSach, truCotMucTieu, 5);
    assert.equal(ketQua.length, 5);

    // 5 * 0.2 = 1 y tuong kham pha
    const soKhamPha = ketQua.filter((y) => y.khamPha).length;
    assert.equal(soKhamPha, 1);

    // 4 y tuong con lai duoc chia theo ti le 50% / 30% / 20%
    const soChiMeo = ketQua.filter((y) => y.truCot === 'Chi meo').length;
    const soXayTin = ketQua.filter((y) => y.truCot === 'Xay tin').length;
    const soChaoBan = ketQua.filter((y) => y.truCot === 'Chao ban').length;

    assert.ok(soChiMeo >= 1);
    assert.equal(soChiMeo + soXayTin + soChaoBan, 4);
  });

  it('bu tru neu nhom kham pha hoac nhom binh thuong khong du y tuong', () => {
    // Chi co 1 y tuong kham pha va nhieu y tuong thuong
    const danhSach = [
      taoYTuong('Meo 1', 'Chi meo', false),
      taoYTuong('Meo 2', 'Chi meo', false),
      taoYTuong('Meo 3', 'Chi meo', false),
      taoYTuong('Tin 1', 'Xay tin', false),
      taoYTuong('Ban 1', 'Chao ban', false),
    ];

    // Khong co kham pha nao nhung van phai tra du 5
    const ketQua = raiTheoTruCot(danhSach, truCotMucTieu, 5);
    assert.equal(ketQua.length, 5);
  });

  it('tra ve rong khi soLuong <= 0 hoac danh sach rong', () => {
    assert.deepEqual(raiTheoTruCot([], truCotMucTieu, 5), []);
    assert.deepEqual(raiTheoTruCot([taoYTuong('A', 'Chi meo')], truCotMucTieu, 0), []);
  });
});
