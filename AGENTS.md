# Context Rules: Life Hacks New Tab Extension

> [!NOTE]
> File này tự động được nạp khi AI làm việc trong thư mục `life-hacks-new-tab/`.

## 1. Phạm Vi Hoạt Động (Scope Limit)
- **Extension Target**: `life-hacks-new-tab` (Mẹo Vặt Mỗi Ngày).
- **Thư mục làm việc**: Bắt buộc chỉ thao tác trong `life-hacks-new-tab/`.
- **Lệnh Terminal**: `Cwd` phải luôn là `g:/My Drive/0-My Project/IT/3. Extension/life-hacks-new-tab`.

## 2. Thông Tin Extension & Entry Points
- **Tên**: Life Hacks New Tab - Mẹo Vặt Mỗi Ngày
- **Mô tả**: Thay thế giao diện New Tab của Chrome bằng mẹo vặt hữu ích, danh ngôn và dịch thuật.
- **Manifest Version**: V3 (`manifest.json`)
- **Chrome URL Override**: `chrome_url_overrides.newtab` -> `newtab.html`
- **Giao diện**: `newtab.html`, `newtab.css`
- **Mã nguồn logic**: `src/`
- **Dữ liệu mầm (Data)**: `data/`

## 3. Quy Tắc Chỉnh Sửa Code
- Mọi thay đổi về giao diện New Tab, CSS layout, hoặc logic tải/dịch mẹo vặt phải nằm trong `life-hacks-new-tab/`.
- Không thay đổi file cấu hình hay mã nguồn của các extension khác ngoài thư mục này.
