# Prompt cho IDE (Claude Code / Cursor / Copilot)

Dán nguyên văn phần dưới đây làm system/context prompt, rồi giao từng mốc một — đừng giao cả 5 mốc cùng lúc, dễ bị AI làm tràn lan và phá hợp đồng.

---

## PHẦN 1 — Bối cảnh & ràng buộc bắt buộc (dán 1 lần, giữ nguyên suốt session)

```
Tôi đang làm bài test cho repo Next.js (App Router) + PostgreSQL + Drizzle,
tên "aicontent-test". Đây là ứng dụng giúp chủ shop nhỏ sinh ý tưởng nội dung
mạng xã hội, từ ý tưởng ra bài đăng, kịch bản quay, ảnh.

QUY ƯỚC BẮT BUỘC CỦA REPO — không được vi phạm dù ở bất kỳ mốc nào:

1. Mọi truy vấn CSDL phải đi qua lib/data-access/. Không viết SQL/Drizzle
   trực tiếp ở app/ hay lib/studio/. Có tests/data-access-guard.test.cjs
   quét chặn đường vòng — nếu tôi cần ngoại lệ thật sự cần thiết, phải khai
   tên tệp trong tests/quet-tang-truy-cap.cjs, KHÔNG được nới lỏng regex quét.

2. Không được bịa tên trụ cột nội dung (content_pillars) hoặc chân dung khách
   hàng (personas). Nếu mô hình trả về tên không khớp với dữ liệu có thật
   trong hồ sơ workspace, phải gán null cho trường đó — không tự thêm tên mới.

3. Khi dùng dữ liệu bài của kênh mình follow (trend_signals) làm tham khảo:
   chỉ được mượn CHỦ ĐỀ và CÔNG THỨC KỂ (loại hook, độ dài, dạng bài).
   TUYỆT ĐỐI không đưa nguyên văn nội dung bài gốc vào lời nhắc gọi mô hình.
   Ràng buộc này phải ép ở TẦNG THAM SỐ HÀM: hàm dựng lời nhắc (ví dụ trong
   lib/model-runner/loi-nhac-xu-huong.js) không được có tham số nào chứa
   nội dung văn bản gốc của bài tham khảo — chỉ nhận metadata (chủ đề, dạng
   bài, độ dài, loại hook...), không nhận trường "noiDung" hay tương đương.

4. Mỗi ý tưởng sinh ra từ một bài tham khảo (trend_signals) phải lưu lại
   liên kết trỏ về đúng bài đó (id của trend_signal), để người dùng bấm vào
   xem được nguồn gốc.

5. Web app KHÔNG được gọi thẳng nhà cung cấp mô hình (Gemini) từ code trong
   app/ hay lib/studio/. Mọi lời gọi mô hình phải đi qua đúng một cửa:
   chayNhiemVu() trong lib/model-runner/index.js. Hàm này đẩy việc vào bảng
   jobs, worker riêng (workers/model/index.js) xử lý rồi trả kết quả — không
   gọi API đồng bộ trực tiếp từ route handler.

QUY ƯỚC MÃ NGUỒN:
- CommonJS ở lib/model-runner, lib/queue, workers. TypeScript ở phần còn lại.
- Tên biến, tên hàm, tên cột viết tiếng Việt không dấu (kebab-case cho tên
  tệp, ví dụ sinh-kich-ban.ts — không phải utils.ts). Đây là quy ước có chủ
  ý của repo, giữ nguyên phong cách này, không chuyển sang tiếng Anh.
- app/ xử lý HTTP và giao diện; lib/ là nghiệp vụ thuần, không import "next".
- Tệp quá 200 dòng thì tách theo ranh giới nghiệp vụ.
- Comment giải thích TẠI SAO, không mô tả lại code.
- Không tạo abstraction cho chỗ chỉ dùng một lần.

Sau mỗi mốc hoàn thành, dừng lại, đừng tự ý làm tiếp mốc sau — tôi sẽ tự
chạy test và commit trước khi giao mốc tiếp theo.
```

---

## PHẦN 2 — Giao lần lượt từng mốc

### Mốc 1 (bắt buộc, làm trước và làm chắc nhất)

```
MỐC 1 — /studio/de-xuat: sinh ý tưởng nội dung hôm nay.

Đọc trước các tệp sau để hiểu dữ liệu có sẵn, đừng đoán schema:
- lib/data-access/insights.ts
- lib/data-access/personas.ts
- lib/data-access/tin-hieu-xu-huong.ts
- db/schema/ (toàn bộ, để biết đúng tên cột)
- lib/model-runner/loi-nhac-theo-nhiem-vu.js (đọc 4 nhiệm vụ đã viết sẵn để
  biết văn phong viết lời nhắc của repo này, rồi hoàn thiện phần TODO(bai-test))
- lib/model-runner/index.js (để biết chayNhiemVu() hoạt động thế nào,
  không được bỏ qua hàng đợi)

Tạo lib/studio/kieu.ts với đúng kiểu sau (không đổi tên trường):

export type YTuongDeXuat = {
  tieuDe: string;
  truCot: string | null;      // phải khớp một trụ cột CÓ THẬT trong hồ sơ
  chanDung: string | null;    // phải khớp một chân dung CÓ THẬT trong hồ sơ
  gocTiepCan: string | null;
  cauMoDau: string | null;
  lyDoDeXuat: string | null;
  beMat: BeMat;                // 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo'
  khamPha: boolean;            // ý tưởng dò đường, thuộc tuyến chưa có dữ liệu
};

Tạo lib/studio/de-xuat.ts export đúng những tên sau, đúng chữ ký, không đổi:

export const TI_LE_KHAM_PHA = 0.2;

export type ThamSoDeXuat = {
  workspaceId: string;
  beMat: BeMat;
  soLuong: number;
};

export type TruCotMucTieu = { ten: string; tiLeMucTieu: number | null };

// Dọn kết quả thô của mô hình (JSON string hoặc object không chắc hình dạng)
// về đúng mảng YTuongDeXuat[]. Bất kỳ trường nào không khớp dữ liệu thật
// (trụ cột, chân dung không tồn tại trong hồ sơ) phải set về null, không throw,
// không tự bịa. Ghi rõ lý do trong comment tại sao chọn set null thay vì lọc bỏ.
export function donKetQuaDeXuat(tho: unknown, /* các tham số hồ sơ cần để đối chiếu */): YTuongDeXuat[]

// Nhận danh sách ý tưởng thô đã dọn, rải theo tỉ lệ mục tiêu của từng trụ cột
// (truCotMucTieu), cắt còn đúng soLuong phần tử. TI_LE_KHAM_PHA quyết định
// bao nhiêu % trong soLuong dành cho ý tưởng khamPha=true (tuyến chưa có
// dữ liệu, không bị ép theo tỉ lệ trụ cột).
export function raiTheoTruCot(
  yTuongTho: YTuongDeXuat[],
  truCotMucTieu: TruCotMucTieu[],
  soLuong: number,
): YTuongDeXuat[]

// Cửa chính: đọc hồ sơ workspace (qua lib/data-access), gọi mô hình qua
// chayNhiemVu(), dọn bằng donKetQuaDeXuat(), rải bằng raiTheoTruCot(),
// lưu kết quả (nếu có bảng lưu ý tưởng, kiểm tra db/schema trước khi thêm
// bảng mới), trả về KetQuaStudio<YTuongDeXuat[]>.
export async function deXuatYTuong(thamSo: ThamSoDeXuat): Promise<KetQuaStudio<YTuongDeXuat[]>>

Sau đó dựng route/UI tối thiểu ở app/(dash)/studio/de-xuat/ để gọi được
deXuatYTuong() và hiển thị danh sách ý tưởng, có nút lưu.

Ràng buộc bổ sung riêng cho mốc này:
- Với ý tưởng sinh từ trend_signals: chỉ truyền metadata (chủ đề, dạng bài,
  độ dài, loại hook) vào lời nhắc, và lưu id của trend_signal gốc để hiển thị
  link nguồn — không truyền nội dung văn bản gốc.
- Viết xong, tự kiểm tra: `npx tsc --noEmit` và chạy thử `node --test tests/`
  liên quan tới de-xuat, báo lại kết quả trước khi tôi commit.
```

### Mốc 2 (sau khi mốc 1 chạy chắc)

```
MỐC 2 — /studio/bien-soan: từ 1 ý tưởng (YTuongDeXuat) sinh bài đăng hoàn
chỉnh, sửa được trên giao diện.

Tái sử dụng chayNhiemVu() và cấu trúc lib/studio/ giống mốc 1 (đặt tên tệp
theo kiểu bien-soan.ts). Input là một YTuongDeXuat đã lưu (lấy theo id) hoặc
nguyên object, output là nội dung bài đăng theo giọng thương hiệu trong
brand_profiles. Cho phép người dùng sửa bản nháp và lưu lại vào contents với
trạng thái nháp (kiểm tra db/schema/ để dùng đúng trạng thái đã định nghĩa,
đừng tự thêm giá trị enum mới nếu chưa có).
```

### Mốc 3

```
MỐC 3 — Kịch bản quay video, từ 1 ý tưởng.

Output phải là cấu trúc phân cảnh (mảng các cảnh, mỗi cảnh có: hình dung
cảnh quay, lời thoại/voice-over, thời lượng gợi ý) — không phải một đoạn văn
xuôi. Định nghĩa kiểu rõ ràng trong lib/studio/kieu.ts trước khi viết hàm sinh.
```

### Mốc 4

```
MỐC 4 — /studio/hang-loat: sinh nhiều bài trong 1 lượt, phục vụ mục tiêu
10 bài Facebook/ngày.

Tái sử dụng deXuatYTuong() (mốc 1) rồi lặp qua từng ý tưởng gọi hàm sinh nội
dung (mốc 2) — không viết lại logic gọi mô hình riêng cho mốc này. Cân nhắc
giới hạn tốc độ / hàng đợi vì đây có thể là nhiều job cùng lúc, kiểm tra
lib/queue/ đã có cơ chế gì trước khi tự làm mới.
```

### Mốc 5

```
MỐC 5 — Sinh ảnh cho bài đăng.

Kiểm tra lib/model-runner/ xem đã có runner nào hỗ trợ sinh ảnh chưa trước
khi thêm provider mới. Vẫn phải đi qua chayNhiemVu(), không gọi thẳng API ảnh
từ route.
```

---

## Ghi chú khi dùng

- Dán Phần 1 làm ngữ cảnh nền, rồi dán từng mốc một theo thứ tự — đừng dán hết một lúc, AI dễ tự "tiện tay" làm luôn mốc sau và bỏ qua bước tự kiểm tra.
- Sau mỗi mốc: `npx tsc --noEmit && node --test tests/`, xanh mới commit, xanh mới giao mốc tiếp theo.
- Nếu AI đề xuất sửa `tests/data-access-guard.test.cjs` hoặc nới lỏng regex quét — từ chối, đây là lá chắn bảo mật, không phải quy ước phong cách.
