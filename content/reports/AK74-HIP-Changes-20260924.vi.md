# AK74: sửa rung đầu súng khi giữ cò HIP

Lần này tập trung vào cảm giác **bắn không ngắm khi giữ chuột trái**. Bản cũ có hai vấn đề đo được: chuyển động súng quá lớn, và mỗi phát mới cắt chuyển động đang hồi về để quay lại đầu clip. Người chơi thấy đầu súng văng qua lại mặc dù nhịp bắn và đường giật camera đã khá gần video.

Chạy [Play-Showcase.cmd (workspace)](../../references.html#local-f9879bb2b54a), chọn AK74 và nhấn Enter. Giữ chuột trái ở HIP, sau đó giữ chuột phải để thử ADS. [Trang đối chiếu HIP (workspace)](../../references.html#local-cd2c97b9a0e6) cho xem nguồn, bản trước và bản sau cùng frame, có bước từng frame và phát chậm.

## Đã sửa gì

| Thành phần | Thay đổi chạy thật |
|---|---|
| Biên độ animation HIP | Dùng 45% delta recoil của clip so với idle. Không thu nhỏ mesh hoặc thay vị trí súng lúc đứng yên. |
| Nối các phát liên thanh | Giữ pose của phát cũ tại đúng thời điểm phát mới, rồi chuyển sang pose mới trong 60 ms. Không reset ngay sang đầu clip mỗi phát. |
| Phát đầu tiên | Dùng ngay clip bắn với biên độ mới; không lấy pose cũ hoặc đợi hết thời gian blend. |
| Nhịp và cơ khí | Vẫn 650 RPM / 92,31 ms mỗi phát; bắn đạn, trừ đạn, bolt, flash và request sound theo lịch cũ. |
| Bắn bắt đầu ở ADS | Giữ nhánh animation ADS đã sửa ở lần trước. |
| HIP rồi đưa lên ngắm | Clip đã bắt đầu ở HIP giữ calibration của nó trên nền đang chuyển vào ADS; phát tiếp theo chọn clip theo tư thế lúc bắn. |

Thông số ở [AK74HipFire.json](../evidence/AK74HipFire.json). Chúng là kết quả hiệu chỉnh bản dựng từ hình ảnh và chuyển động đo được, **không phải thông số AnimGraph gốc vừa được khôi phục**. Tài nguyên cooked chưa cung cấp đầy đủ graph, IK, authored additive base và logic phối hợp của game.

## Đo từng frame như thế nào

Nguồn là [All Weapons Showcase](https://www.youtube.com/watch?v=bxMd6SvtJi8), đoạn AK74 HIP liên thanh, mốc phát đầu nhìn thấy **416,200 giây**. Nguồn giữ 1920×1080/60fps. Lab chạy gameplay thật ở bước thời gian 1/60 giây và ghi PNG 960×540 cùng telemetry. Đo tọa độ trên ảnh native; chỉ nhân số đo lab lên hai để so sánh theo pixel 1080p.

Ba đối tượng được phân biệt:

1. **Cảnh nền:** cho biết camera đang quay. Lần sửa HIP này không đổi đường giật camera.
2. **Thân súng gần thước ngắm sau:** cho biết độ lùi, phóng to và dịch chuyển của viewmodel.
3. **Đầu ruồi phía trước:** cho biết phần người chơi thấy rung ở đầu nòng. Dùng so khớp hình dạng riêng từng frame để tránh lỗi bám điểm tích lũy.

Mỗi đoạn lấy vị trí ở frame phát đầu làm mốc; không kéo dịch thời gian để làm số đẹp hơn. Sai lệch một frame của thời điểm phát đầu được báo riêng. So sánh 61 frame / giây đầu, lúc cả nguồn và lab đều giữ cò. Không dùng phần đuôi sau khi lab nhả cò để suy rằng input của hai bên giống nhau. Đây là đo quỹ đạo tương đối, không phải chứng minh vị trí tuyệt đối, shader hoặc toàn bộ ảnh trùng nhau.

Số liệu, bảng ứng viên và giới hạn phép đo ở [hồ sơ HIP](AK74-HIP-Measurement-Readme.vi.md). [Ghi chú source](AK74-HIP-Mechanisms-20260924.vi.md) ghi rõ điều nào lấy từ montage và điều nào do lab thêm.

Kết quả bản cuối `05C648EC48FE6B757AA51DBA378ACAD1`, trong 61 frame đầu; đơn vị pixel quy về 1080p:

| Phép đo | Video nguồn | Trước sửa | Sau sửa |
|---|---:|---:|---:|
| Sai lệch quỹ đạo đầu ruồi so với nguồn, RMS XY | — | 14,93 | 8,98 |
| Bước nhảy lớn nhất của đầu ruồi giữa hai frame | 7,90 | 21,62 | 4,09 |
| Sai lệch quỹ đạo thân súng gần thước ngắm sau, RMS XY | — | 15,95 | 6,99 |

Như vậy quỹ đạo đầu ruồi gần nguồn hơn khoảng 40% theo phép đo này. Tuy nhiên bản mới dao động ít hơn nguồn và vẫn thiếu chuyển động ngang sang phải; **4,09 nhỏ hơn 7,90 không có nghĩa là chính xác hơn ở mọi frame**. Còn khoảng 9 pixel sai lệch quỹ đạo, nên không gọi là 1:1.

## Vì sao có animation gốc vẫn chưa có cảm giác bắn gốc?

Một clip chỉ mô tả **một lớp chuyển động theo thời gian**. Game còn quyết định nền nào ở phía dưới nó, weight bao nhiêu, khi phát kế tiếp đến thì tiếp tục, cộng hay thay clip, và camera có chuyển động riêng hay không. Chạy đúng asset nhưng ghép sai vẫn cho ra cảm giác khác hẳn.

Trong clip đang dùng, một phát HIP chưa hồi xong sau 92 ms; đến khoảng 150–200 ms mới về gần idle. Nhưng AK74 đã bắn phát tiếp ở 92 ms. Nếu cứ đặt thời gian clip về đầu, súng đang ở phía sau bị nhảy ra phía trước trong một frame. Đây là **gián đoạn animation**, không phải tăng độ giật vật lý. Nối hai pose xử lý chính gián đoạn này.

Có thể hiểu cảm giác bắn thành năm phần:

| Phần | Bạn nhìn hoặc cảm thấy gì? | Vai trò trong lần sửa |
|---|---|---|
| Nhịp bắn | Khoảng cách giữa tiếng nổ và từng phát đạn | Giữ lịch 650 RPM; không chậm súng để giấu rung. |
| Camera recoil | Toàn bộ thế giới/tâm nhìn nâng lên; cần ghìm chuột | Giữ phần đã đo và sửa trước đó. |
| Viewmodel recoil | Tay và súng giật trong màn hình | Giảm biên độ HIP, nối các phát thay vì cắt pose. |
| Sway và locomotion | Lắc theo chuột, đi, chạy và chuyển tư thế | Tiếp tục dùng nền chuyển động hiện có; recoil là lớp ghép. |
| Phản hồi | Flash, khói, vỏ đạn, bolt và tiếng nổ | Giữ đường kích hoạt hiện tại; chưa chứng minh VFX/audio giống từng frame/sample. |

Đầu súng cũng không nên đứng bất động: video nguồn vẫn có cú giật nhỏ có nhịp. Mục tiêu là giữ nhịp ấy, giảm những bước nhảy quá lớn do bản dựng tạo ra.

## Phương án đã thử nhưng không chọn

Thử giảm riêng rotation quanh `weapon_r` có giúp một số frame đầu ruồi, nhưng làm thân súng lệch nguồn hơn. Khác biệt đầu ruồi quá nhỏ để vượt chắc chắn sai số đo. Vì vậy bản chạy đặt `rotationScale=1`, tức node này đi qua nguyên pose; nó chỉ còn là khả năng thí nghiệm có giới hạn. Không lấy việc súng ít chuyển động hơn làm bằng chứng tự động rằng nó giống video hơn.

## Phạm vi kết luận

Đã xử lý hai nguyên nhân rõ của HIP liên thanh: độ văng quá lớn và nhảy pose khi retrigger. **Chưa đạt sao chép 1:1 từng frame.** Hướng dịch ngang trung bình của đầu ruồi vẫn khác nguồn; graph và input gốc chưa biết. Camera/FOV, đồ họa, VFX và mixer cũng phải được phân biệt khi so hình hoặc đánh giá cảm giác. Không dùng số lượng bài test qua để thay cho bằng chứng hình ảnh.

Kết quả kiểm tra bản cuối được ghi ở [receipt HIP](../evidence/AK74HipFocus-validation-summary.json), [audit runtime (workspace)](../../references.html#local-de21cf1b6ec0) và trang đối chiếu. Bộ kiểm tra riêng còn so telemetry ADS với bản bạn đã chấp nhận, thay vì chỉ kiểm tra ADS vẫn bắn được.

Bảy ca đã capture 846 frame: HIP/ADS bắn đơn, HIP/ADS giữ cò, HIP bắn một phát rồi ngắm, giữ cò vào ADS, giữ cò ra HIP. Audit không thấy lỗi pose, lịch bắn hoặc lịch sử pose lẫn giữa các clip. Hai ca bắt đầu bắn ở ADS trùng telemetry bản được chấp nhận trước đó: sai khác lớn nhất của vị trí/quaternion xương súng, góc controller và thời gian clip đều bằng 0 ở các mẫu ghi lại. Đây là kiểm tra chuyển động; không phải lời khẳng định mọi pixel hoặc âm thanh giống nhau.

Kiểm thêm HIP giữ cò đến hết băng: 180 frame / 3 giây, đúng 30 phát và 0 viên còn lại, không đổi amplitude ở viên cuối hoặc mất handoff giữa các phát. Tổng cộng **8 ca / 1.026 frame**, audit 9.006 điều kiện đạt. Build UE 5.8 thành công; 30/30 bài kiểm tra quy tắc, 539/539 kiểm tra gameplay đang có đạt, kèm 82 ảnh. Phần kiểm tra hết băng là kiểm tra runtime, không mở rộng tuyên bố so khớp video ngoài 61 frame đã đo.
