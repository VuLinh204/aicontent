require('tsx/cjs');

const test = require('node:test');
const assert = require('node:assert/strict');

const { donKetQuaSinhAnh } = require('../lib/studio/sinh-anh.ts');

test('donKetQuaSinhAnh chấp nhận prompt hợp lệ', () => {
  const ketQua = donKetQuaSinhAnh({
    promptAnh:
      'Một phụ nữ trẻ cầm ly cà phê trong cửa sổ sáng, phong cách ảnh thực, ánh sáng tự nhiên, 3D render.',
  });
  assert.equal(ketQua.promptAnh.includes('phụ nữ'), true);
});

test('donKetQuaSinhAnh từ chối prompt quá ngắn', () => {
  const ketQua = donKetQuaSinhAnh({ promptAnh: 'ngắn' });
  assert.equal(ketQua, null);
});
