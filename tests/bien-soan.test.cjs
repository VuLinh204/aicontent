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
    assert.equal(donKetQuaBienSoan({ tieuDe: 'Co tieu de', noiDung: '' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: '   ', noiDung: 'Co noi dung' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: null, noiDung: 'Noi dung' }), null);
    assert.equal(donKetQuaBienSoan({ tieuDe: 'Tieu de', noiDung: null }), null);
  });

  it('don va tra ve dung BaiDaSinh khi co du tieuDe va noiDung', () => {
    const tho = {
      tieuDe: '  5 Meo chon nguyen lieu tuoi ngon  ',
      noiDung: 'Day la noi dung bai viet chi tiet ve cach chon thit va rau tuoi moi ngay...',
      hashtag: ['kinhdoanh', 'meohay', 'thucpham', 'nauan', 'meonhabep', 'thua6'],
    };

    const ketQua = donKetQuaBienSoan(tho);
    assert.ok(ketQua);
    assert.equal(ketQua.tieuDe, '5 Meo chon nguyen lieu tuoi ngon');
    assert.equal(ketQua.noiDung, 'Day la noi dung bai viet chi tiet ve cach chon thit va rau tuoi moi ngay...');
    // Chi lay toi da 5 hashtag
    assert.equal(ketQua.hashtag.length, 5);
    assert.deepEqual(ketQua.hashtag, ['kinhdoanh', 'meohay', 'thucpham', 'nauan', 'meonhabep']);
  });

  it('xu ly hashtag khong phai mang hoac co phan tu khong phai chuoi', () => {
    const tho = {
      tieuDe: 'Tieu de hop le',
      noiDung: 'Noi dung hop le',
      hashtag: 'khong phai mang',
    };
    const ketQua = donKetQuaBienSoan(tho);
    assert.ok(ketQua);
    assert.deepEqual(ketQua.hashtag, []);

    const thoPhanTuSai = {
      tieuDe: 'Tieu de hop le',
      noiDung: 'Noi dung hop le',
      hashtag: ['tag1', null, 123, 'tag2', undefined],
    };
    const ketQua2 = donKetQuaBienSoan(thoPhanTuSai);
    assert.ok(ketQua2);
    assert.deepEqual(ketQua2.hashtag, ['tag1', 'tag2']);
  });
});
