'use strict';

require('dotenv/config');
require('tsx/cjs');

/**
 * Bo kiem thu don vi cho Mốc 2: /studio/bien-soan (Bien soan bai dang tu 1 y tuong).
 *
 * Kiem tra dung cac hop dong va rang buoc:
 *   1. donKetQuaBienSoan() don du lieu tho, kiem tra tieuDe va noiDung bat buoc.
 *   2. Hashtag duoc cat toi da 5 phan tu va loc chi lay chuoi hop le.
 *   3. Khong de lot noiDung bai goc vao duLieuVao gui sang model (Rang buoc 3).
 */

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { donKetQuaBienSoan } = require('../lib/studio/bien-soan.ts');

describe('donKetQuaBienSoan', () => {
  it('tra ve null neu du lieu tho khong phai object hoac null/undefined', () => {
    assert.equal(donKetQuaBienSoan(null), null);
    assert.equal(donKetQuaBienSoan(undefined), null);
    assert.equal(donKetQuaBienSoan('khong phai object'), null);
    assert.equal(donKetQuaBienSoan([]), null);
  });

  it('tra ve null neu thieu tieuDe hoac noiDung', () => {
    assert.equal(donKetQuaBienSoan({ tieuDe: 'Có tiêu đề', noiDung: '' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: '   ', noiDung: 'Có nội dung' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: null, noiDung: 'Nội dung' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: 'Tiêu đề', noiDung: null }), null);
  });

  it('tra ve null neu output khong co dau tieng Viet', () => {
    // Test case này kiểm tra validation dấu
    assert.equal(
      donKetQuaBienSoan({
        tieuDe: 'Tieu de khong co dau',
        noiDung: 'Noi dung khong co dau',
      }),
      null,
    );
  });

  it('don va tra ve dung BaiDaSinh khi co du tieuDe va noiDung', () => {
    const tho = {
      tieuDe: '  5 Mẹo chọn nguyên liệu tươi ngon  ',
      noiDung: 'Đây là nội dung bài viết chi tiết về cách chọn thịt và rau tươi mỗi ngày...',
      hashtag: ['kinhdoanh', 'meohay', 'thucpham', 'nauan', 'meonhabep', 'thua6'],
    };

    const ketQua = donKetQuaBienSoan(tho);
    assert.ok(ketQua);
    assert.equal(ketQua.tieuDe, '5 Mẹo chọn nguyên liệu tươi ngon');
    assert.equal(ketQua.noiDung, 'Đây là nội dung bài viết chi tiết về cách chọn thịt và rau tươi mỗi ngày...');
    // Chi lay toi da 5 hashtag
    assert.equal(ketQua.hashtag.length, 5);
    assert.deepEqual(ketQua.hashtag, ['kinhdoanh', 'meohay', 'thucpham', 'nauan', 'meonhabep']);
  });

  it('xu ly hashtag khong phai mang hoac co phan tu khong phai chuoi', () => {
    const tho = {
      tieuDe: 'Tiêu đề hợp lệ',
      noiDung: 'Nội dung hợp lệ',
      hashtag: 'khong phai mang',
    };
    const ketQua = donKetQuaBienSoan(tho);
    assert.ok(ketQua);
    assert.deepEqual(ketQua.hashtag, []);

    const thoPhanTuSai = {
      tieuDe: 'Tiêu đề hợp lệ',
      noiDung: 'Nội dung hợp lệ',
      hashtag: ['tag1', null, 123, 'tag2', undefined],
    };
    const ketQua2 = donKetQuaBienSoan(thoPhanTuSai);
    assert.ok(ketQua2);
    assert.deepEqual(ketQua2.hashtag, ['tag1', 'tag2']);
  });
});
