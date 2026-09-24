# Hiểu và tái tạo cảm giác bắn

**Báo cáo AK74 và cẩm nang thực hành Gun Gameplay · 24/09/2026**

Người thực hiện dự án đã chơi thử và chấp nhận HIP/ADS của AK74. Bộ tài liệu này giải thích vì sao những lần dựng trước chưa đạt, chúng tôi đã đo và sửa gì, và cách dùng kinh nghiệm ấy cho khẩu tiếp theo. Nó cũng mở rộng từ chuyển động súng sang toàn bộ chuỗi input, mô phỏng, animation, âm thanh, VFX, mục tiêu và UI.

**Bài học chính:** có đúng asset chưa đủ. Cảm giác đến từ cách ghép asset trên đúng nền, đúng thời điểm, đúng hệ tọa độ; các phản hồi phải cùng diễn tả một hành động của người chơi. Sửa AK74 thành công hơn khi chúng tôi biến lời nhận xét “đầu súng rung quá nhiều” thành phép đo cụ thể, thay vì tiếp tục tăng/giảm một hệ số recoil chung.

## Đọc theo câu hỏi của bạn

| Bạn muốn hiểu | Chương nên đọc | Sau khi đọc, bạn làm được gì? |
|---|---|---|
| Đã làm gì để AK74 đạt tới hiện tại? | [01 · Toàn bộ quá trình hiệu chỉnh AK74](01-AK74-Case-Study.vi.md) | Theo được nguyên nhân → phép đo → bản sửa → kiểm chứng, cả những giả thuyết bị loại. |
| Ngoài recoil và shake còn những gì? | [02 · Nền tảng Gun Gameplay](02-Gunplay-Foundations.vi.md) | Phân biệt 22 nhóm kiến thức, biết lớp nào gây ra cảm giác và dùng bằng chứng nào để kiểm. |
| Làm tiếp một khẩu khác thế nào? | [03 · Quy trình tái tạo từng khẩu](03-Weapon-Reconstruction-Workflow.vi.md) | Đi qua 11 bước với đầu ra và điều kiện nghiệm thu rõ ràng. |
| Bắt đầu ghi chép và giao việc ở đâu? | [04 · Phiếu công việc để sao chép](04-Weapon-Worksheet.template.vi.md) | Lập hồ sơ source, asset, timing, ca thử, phép đo và những phần chưa biết. |

Nếu mới bắt đầu, đọc 01 trước để thấy một vấn đề thật. Sau đó dùng 02 như tài liệu tra cứu trong khi thực hiện 03 và điền 04. Không cần học thuộc mọi thuật ngữ trước khi làm bài thử đầu tiên.

## AK74 hiện đã đạt gì?

| Phần | Kết quả được phép kết luận |
|---|---|
| ADS | Đã sửa ghép Fire trên sai base, quỹ đạo ADS, tick/proxy và các lớp chuyển động chồng lặp; bạn chơi thử thấy ổn. |
| HIP liên thanh | Đã giảm delta HIP xuống 0,45 và nối pose 60 ms cho dữ liệu hiện tại; đầu súng không còn nhảy mạnh như bản trước; bạn chơi thử thấy ổn. |
| Kiểm chứng | Có đối chiếu ảnh/telemetry trước–sau, hồi quy các ca bắn/chuyển ADS và kiểm PIE riêng cho level. Biên nhận từng build được phân biệt trong chương 01. |
| Sai khác còn lại | Quỹ đạo ngang chưa khớp hoàn toàn; audio mixer, VFX, locomotion và hit feedback chưa được xác nhận đạt mức tương đương video. |
| Các khẩu khác | Có 10 profile chơi được trong lab; chưa có vòng hiệu chỉnh sâu và nghiệm thu như AK74 cho 9 khẩu còn lại. |

**Không gọi kết quả này là 1:1.** “Bạn chơi thấy ổn”, “logic chạy đúng” và “các đại lượng đã đo gần video” là ba loại bằng chứng khác nhau. Bộ tài liệu giữ nguyên giới hạn ấy để bạn biết chính xác mình đang tiến bộ ở đâu.

## Xem và chơi lại bằng chứng

- [Mở level AK74 trong Editor (workspace)](../../references.html#local-d4583e0315c6): `/Game/WardogsLab/VideoGameplay/Maps/L_AK74_HIPTest`. Nhấn Play, click viewport, rồi Enter / DEPLOY LOADOUT. Chuột trái bắn HIP, chuột phải ADS, R reload; Shift+F1 trả chuột về Editor. Liên kết launcher có thể cần mở bằng Explorer tùy trình duyệt.
- [Đối chiếu ADS/camera AK74 (workspace)](../../references.html#local-e3d92080dd81) và [đối chiếu HIP nguồn / trước / sau (workspace)](../../references.html#local-cd2c97b9a0e6).
- [Hồ sơ đo HIP và giới hạn tracking](../reports/AK74-HIP-Measurement-Readme.vi.md).
- [Receipt bản HIP](../evidence/AK74HipFocus-validation-summary.json) và [receipt level/PIE](../evidence/AK74EditorLevel-validation.json).

Đo video không tiết lộ toàn bộ input, FOV, native graph hoặc luật damage của người quay. Dữ liệu trong tài liệu luôn cần một nhãn: **asset đọc được**, **đo được**, **nguồn cộng đồng**, **lựa chọn của lab**, hoặc **chưa biết**.

## Từ kiến thức tới source hiện tại

Các file dưới đây là điểm bắt đầu điều tra, không phải chỉ cần đổi một số trong mỗi file là tái tạo được mọi khẩu.

| Trách nhiệm | Điểm đọc code/dữ liệu |
|---|---|
| Luật bắn, đạn, spread và đường bắn | [WardogsWeaponComponent.cpp (workspace)](../../references.html#local-3e41113eb56a), [WardogsWeaponProfile.h (workspace)](../../references.html#local-c6fcf28bfce9) |
| Trạng thái và trình diễn gameplay FP | [WardogsVideoGameplay.cpp (workspace)](../../references.html#local-0e8d18a5a3cf) |
| Đánh giá pose và ghép animation | [WardogsGunStudyAnimInstance.cpp (workspace)](../../references.html#local-47f823871c25) |
| Hệ số HIP đang được chấp nhận | [AK74HipFire.json](../evidence/AK74HipFire.json) |
| Calibration Showcase và nhận diện level test | [WardogsShowcaseCalibration.cpp (workspace)](../../references.html#local-b257b772a77e) |
| HUD và widget gameplay | [WardogsVideoWidget.cpp (workspace)](../../references.html#local-49332a347497) |

Bước tiếp theo hợp lý là giữ AK74 làm baseline, hoàn thiện một lớp còn thiếu bằng A/B có bằng chứng, hoặc chọn **một** khẩu tiếp theo và lập worksheet mới. Dùng lại phương pháp; không nhân bản các hệ số AK74 sang cả kho súng.

## Cách dùng bộ tài liệu

Bản online có mục lục theo chương và theo chủ đề; có thể dùng tìm kiếm của trình duyệt và nút In / lưu PDF. Các chương Markdown, báo cáo bổ trợ và receipt được lưu trong repo. Liên kết có nhãn “workspace” dẫn tới danh mục file cần mở trên máy chứa WardogsAssetLab; website không khởi chạy Unreal hay cung cấp các video/capture và asset game đó. Sao chép phiếu 04 để làm việc với khẩu tiếp theo.

Lượt này tổng hợp kiến thức và quy trình; không thay đổi gameplay đã được bạn chấp nhận. Những bài tập và hạng mục đề xuất trong cẩm nang là công việc tiếp theo, không phải tính năng vừa được triển khai.
