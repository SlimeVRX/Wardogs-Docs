# Wardogs Docs

Đọc online: **https://slimevrx.github.io/Wardogs-Docs/**

Nút **Nền tối** ở đầu trang bật/tắt night mode và lưu lựa chọn trong trình duyệt. Khi chưa chọn, website dùng giao diện sáng/tối của hệ điều hành. Chế độ in giữ nền sáng.

Cẩm nang tiếng Việt về Gun Gameplay, dựa trên quá trình hiệu chỉnh AK74 trong WardogsAssetLab:

- Lịch sử từ lỗi ghép pose ADS và rung HIP tới bản đã được chơi thử chấp nhận.
- 22 chủ đề nền tảng: animation, timing, input, camera, spread, ballistics, reload, âm thanh, VFX, hit feedback, UI và networking.
- Quy trình 11 bước để nghiên cứu và hiệu chỉnh từng khẩu.
- Phiếu công việc cho mỗi vũ khí; 11 báo cáo bổ trợ cùng config/receipt lịch sử.

Đây là nghiên cứu độc lập, không phải tài liệu chính thức của WARDOGS/BULKHEAD. Kết quả chưa được chứng nhận là bản sao 1:1.

## Nội dung và cách cập nhật

Các chương nằm trong `content/handbook/`; báo cáo bổ trợ ở `content/reports/`. HTML đã build được commit để GitHub Pages phục vụ trực tiếp từ **main / root**. `.nojekyll` giữ nguyên các file tĩnh.

```sh
node scripts/build.mjs
```

Sau khi sửa Markdown, build lại, commit nội dung và HTML rồi push. GitHub Pages tự triển khai commit mới. Cần Node.js 20 trở lên; parser Markdown đã được kèm license trong `vendor/`, không cần cài dependency.

Nếu có workspace gốc gồm các thư mục ngang hàng `Wardogs-Docs`, `WardogsAssetLab`, `WardogsPorting`, có thể nhập lại danh sách tài liệu được chọn:

```sh
node scripts/sync-from-lab.mjs
node scripts/build.mjs
```

`sync` ghi lại các bản sao tài liệu đã chọn; không chạy nếu muốn giữ các chỉnh sửa chỉ có trong repo tài liệu. Có thể truyền thư mục workspace khác: `node scripts/sync-from-lab.mjs <workspace>`.

## Phạm vi xuất bản

Repo chỉ chứa tài liệu biên soạn, config hiệu chỉnh và một số receipt đã bỏ đường dẫn tuyệt đối. Không chứa archive key, game package, mesh/animation/audio/video hoặc cây capture ảnh. Những tham chiếu cần project gốc được liệt kê rõ tại [Báo cáo & bằng chứng](https://slimevrx.github.io/Wardogs-Docs/references.html).

Các báo cáo giữ lịch sử từng build; số kiểm tra của một build không chứng minh một build khác đã chạy lại toàn bộ test. Hash nguồn và đường dẫn tương đối có trong `content/catalog.json`.
