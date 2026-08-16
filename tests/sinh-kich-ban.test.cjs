'use strict';

require('dotenv/config');
require('tsx/cjs');

/**
 * Bo kiem thu don vi cho Mốc 3: /studio/kich-ban (Sinh kich ban quay video tu 1 y tuong).
 *
 * Kiem tra dung cac hop dong va rang buoc:
 *   1. donKetQuaKichBan() don du lieu tho, kiem tra tieuDe va phanCanh bat buoc.
 *   2. Moi canh phai co thoiLuongGiay (number), hinhAnh (string), loiThoai (string).
 *   3. Canh khong hop le (thieu truong hoac sai kieu) se bi loc bo.
 *   4. Neu phanCanh trong va truong, tra ve null.
 */

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { donKetQuaKichBan } = require('../lib/studio/sinh-kich-ban.ts');

describe('donKetQuaKichBan', () => {
  it('tra ve null neu du lieu tho khong phai object hoac null/undefined', () => {
    assert.equal(donKetQuaKichBan(null), null);
    assert.equal(donKetQuaKichBan(undefined), null);
    assert.equal(donKetQuaKichBan('khong phai object'), null);
    assert.equal(donKetQuaKichBan(123), null);
  });

  it('tra ve null neu thieu tieuDe', () => {
    assert.equal(
      donKetQuaKichBan({
        tieuDe: '',
        phanCanh: [{ thoiLuongGiay: 5, hinhAnh: 'Anh 1', loiThoai: 'Loi 1' }],
      }),
      null,
    );
    assert.equal(
      donKetQuaKichBan({
        tieuDe: '   ',
        phanCanh: [{ thoiLuongGiay: 5, hinhAnh: 'Anh 1', loiThoai: 'Loi 1' }],
      }),
      null,
    );
    assert.equal(
      donKetQuaKichBan({
        tieuDe: null,
        phanCanh: [{ thoiLuongGiay: 5, hinhAnh: 'Anh 1', loiThoai: 'Loi 1' }],
      }),
      null,
    );
  });

  it('tra ve null neu phanCanh khong phai mang', () => {
    assert.equal(
      donKetQuaKichBan({
        tieuDe: 'Kich ban hop le',
        phanCanh: 'khong phai mang',
      }),
      null,
    );
    assert.equal(
      donKetQuaKichBan({
        tieuDe: 'Kich ban hop le',
        phanCanh: null,
      }),
      null,
    );
  });

  it('tra ve null neu phanCanh trong rong sau khi loc canh khong hop le', () => {
    const kichBan = donKetQuaKichBan({
      tieuDe: 'Kich ban',
      phanCanh: [
        { thoiLuongGiay: null, hinhAnh: 'Anh', loiThoai: 'Loi' }, // thieu thoiLuongGiay
        { thoiLuongGiay: 5, hinhAnh: '', loiThoai: 'Loi' }, // hinhAnh trong
        { thoiLuongGiay: 5, hinhAnh: 'Anh', loiThoai: '' }, // loiThoai trong
      ],
    });
    assert.equal(kichBan, null);
  });

  it('don va tra ve dung KichBan khi co du tieuDe va phanCanh hop le', () => {
    const tho = {
      tieuDe: '  Kich ban quay hang ngay  ',
      phanCanh: [
        { thoiLuongGiay: 5, hinhAnh: 'Shopkeeper dang chuẩn bị hàng', loiThoai: 'Mỗi sáng, tôi bắt đầu...' },
        { thoiLuongGiay: 8, hinhAnh: 'Khách vào shop', loiThoai: 'Khách hàng đến...' },
        { thoiLuongGiay: 3, hinhAnh: 'Cảm ơn và tạm biệt', loiThoai: 'Cảm ơn đã ghé thăm!' },
      ],
    };

    const ketQua = donKetQuaKichBan(tho);
    assert.ok(ketQua);
    assert.equal(ketQua.tieuDe, 'Kich ban quay hang ngay');
    assert.equal(ketQua.phanCanh.length, 3);
    assert.deepEqual(ketQua.phanCanh[0], {
      thoiLuongGiay: 5,
      hinhAnh: 'Shopkeeper dang chuẩn bị hàng',
      loiThoai: 'Mỗi sáng, tôi bắt đầu...',
    });
  });

  it('loc ra canh khong hop le (thieu truong hoac sai kieu)', () => {
    const tho = {
      tieuDe: 'Kich ban',
      phanCanh: [
        { thoiLuongGiay: 5, hinhAnh: 'Anh 1', loiThoai: 'Loi 1' }, // hop le
        { thoiLuongGiay: 'khong phai so', hinhAnh: 'Anh 2', loiThoai: 'Loi 2' }, // sai kieu
        { thoiLuongGiay: 3, hinhAnh: null, loiThoai: 'Loi 3' }, // hinhAnh sai
        null, // khong phai object
        { thoiLuongGiay: 4, hinhAnh: 'Anh 4', loiThoai: 'Loi 4' }, // hop le
      ],
    };

    const ketQua = donKetQuaKichBan(tho);
    assert.ok(ketQua);
    assert.equal(ketQua.phanCanh.length, 2);
    assert.deepEqual(ketQua.phanCanh[0], {
      thoiLuongGiay: 5,
      hinhAnh: 'Anh 1',
      loiThoai: 'Loi 1',
    });
    assert.deepEqual(ketQua.phanCanh[1], {
      thoiLuongGiay: 4,
      hinhAnh: 'Anh 4',
      loiThoai: 'Loi 4',
    });
  });

  it('trim whitespace o hinhAnh va loiThoai', () => {
    const tho = {
      tieuDe: 'Kich ban',
      phanCanh: [
        { thoiLuongGiay: 5, hinhAnh: '  Anh co khoang trang  ', loiThoai: '   Loi co khoang trang   ' },
      ],
    };

    const ketQua = donKetQuaKichBan(tho);
    assert.ok(ketQua);
    assert.deepEqual(ketQua.phanCanh[0], {
      thoiLuongGiay: 5,
      hinhAnh: 'Anh co khoang trang',
      loiThoai: 'Loi co khoang trang',
    });
  });
});
