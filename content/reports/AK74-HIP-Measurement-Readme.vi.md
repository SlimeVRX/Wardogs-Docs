# AK74 HIP: đầu nòng và thân súng khi giữ chuột bắn

Phạm vi: chỉ HIP AK74, source YouTube `bxMd6SvtJi8`, 60 fps. Không thay đổi ADS trong nghiên cứu này. Mốc nguồn là phát bắn nhìn thấy đầu tiên tại **416.200 giây**, sai số một frame. Đây không phải thời điểm người chơi nhấn chuột.

## Phát hiện chính

Bản `44D84FE24D42FD94FB579C8A5E1DF80F` đã gần đường đi của hình nền/camera nhưng **chuyển động của chính cây súng vẫn sai**. Hai đại lượng này phải đo riêng.

Trong chu kỳ đầu, đầu ruồi của bản nguồn đi sang phải khoảng 13 px và lên khoảng 6 px. Bản dựng lại đi sang trái khoảng 12 px ở 33 ms, rồi lên khoảng 20 px ở cuối chu kỳ. Đồng thời, thân súng đi sang phải ở cả hai bản. Đây là dấu hiệu phần xoay/điểm đặt chuyển động hoặc hệ tọa độ của viewmodel sai, không chỉ là độ giật camera thiếu hoặc thừa.

Khi bắt đầu viên tiếp theo, bản cũ đặt thời gian animation về đầu clip gần như trực tiếp. Bước nhảy một frame đo trên thân súng lên tới **38.72 px**; đầu ruồi tới **21.62 px**. Nguồn tương ứng có bước lớn nhất khoảng **15.35 px** và **7.90 px**. Những bước nhảy này giải thích cảm giác nòng súng lắc và bị kéo giật lại.

Đơn vị ở đây là pixel quy về 1920×1080; ảnh runtime thực tế là 960×540, số đo được nhân hai. Không dùng ảnh nội suy để giả tăng độ chính xác.

## Phương pháp đo và chất lượng dữ liệu

- `validate_hip_viewmodel.py`: các điểm ảnh thuộc thân súng, optical flow hai chiều, partial affine RANSAC. Lưu chuyển động, tỷ lệ biểu kiến, số điểm hợp lệ và residual từng frame. Camera/hình nền không tham gia phép đo này.
- `track_front_template.py`: đăng ký lại hình chữ U của đầu ruồi vào từng frame độc lập, dùng normalized cross-correlation và tinh chỉnh đỉnh dưới một pixel. Không tích lũy sai số tracking qua nhiều frame. **Dùng file `*-front-template.json` làm số liệu chính cho đầu ruồi**.
- Kết quả optical flow đầu ruồi trong `*-hip-viewmodel.json` chỉ là thử nghiệm phụ: đầu ruồi chỉ rộng khoảng 12 pixel ở runtime; một số chuỗi mất điểm hoặc tỷ lệ ước lượng tăng vô lý sau khoảng 30–50 frame. Không dùng các tỷ lệ đầu ruồi này để kết luận độ sâu vật lý.
- Template nguồn có điểm tương đồng tối thiểu 0.806; runtime khoảng 0.58–0.64 ở các frame nền gạch đi qua vùng đầu ruồi. Đã kiểm tra crop có đánh dấu điểm ở chu kỳ đầu. Vì vậy sai khác 10–20 px có ý nghĩa rõ; chênh lệch dưới khoảng 1 px giữa hai ứng viên chưa đủ để kết luận một bản tốt hơn chắc chắn.
- `scaleRelativeFirst` là tỷ lệ ảnh 2D biểu kiến, gồm cả phối cảnh/foreshortening. Nó không phải số đo cây súng di chuyển bao nhiêu cm theo chiều sâu.

## Thử nghiệm giảm trọng số và nối hai lần bắn

Manifest thử nghiệm: `866A8F96454299EA1007FC98B32F51C9`, 4 trường hợp, mỗi trường hợp 96 frame: giữ bắn 1 giây rồi thả 0.6 giây. Phần so sánh cùng hành vi chỉ dùng 61 frame từ 0 tới 1 giây. Nguồn tiếp tục bắn sau 1 giây; không so tail sau thả của runtime với nguồn còn giữ bắn.

`a` là trọng số animation HIP; `b` là thời gian nối từ tư thế clip cũ sang clip của viên mới. ADS, camera và âm thanh không thuộc phép thử này.

| Bản | RMSE đầu ruồi XY | RMSE thân súng XY | Bước đầu ruồi lớn nhất | Bước thân súng lớn nhất |
|---|---:|---:|---:|---:|
| Cũ, a=1, không nối | 14.93 | 15.95 | 21.62 | 38.72 |
| a=.45, b=0 | 10.61 | 10.10 | 9.15 | 13.50 |
| a=.45, b=.04 s | 9.47 | 7.29 | 5.56 | 6.16 |
| a=.45, b=.06 s | 8.98 | 7.06 | 4.10 | 6.10 |
| a=.55, b=.04 s | 9.87 | 6.62 | 6.71 | 7.91 |

Không dịch thời gian để chọn sai số đẹp nhất. JSON có thêm độ nhạy với lệch nguồn -1/0/+1 frame.

Kết luận tạm thời: giảm trọng số và nối clip đã giảm giật cục rõ rệt. Nhưng **không ứng viên nào khôi phục hướng đi của đầu ruồi**: nguồn X khoảng [-3.99,+14.27], còn a=.45 vẫn khoảng [-5.68,+2.34]. Chỉ chỉnh trọng số không thể sửa phép biến đổi sai hướng. Cần kiểm tra cách áp dụng CameraBone, hệ tọa độ viewmodel và thứ tự phối hợp pose; không tiếp tục giảm độ giật camera để che lỗi này.

## Tái chạy

```powershell
python validate_hip_viewmodel.py PATH_TO_MANIFEST --case CASE_ID --label UNIQUE_LABEL
python track_front_template.py PATH_TO_MANIFEST --case CASE_ID --label UNIQUE_LABEL
```

Hai script chỉ đọc ảnh, ghi số liệu và contact sheet; không mở Unreal và không sửa gameplay. Các contact sheet `*-front-template-review.jpg` đặt dấu đỏ tại điểm đo đầu ruồi. `*-front-rear-0.jpg` và `*-front-rear-24.jpg` cho phép kiểm tra trực tiếp hình dáng, kích thước và mối quan hệ giữa nòng/thân súng.

Đây là nghiên cứu đối chiếu một clip cụ thể. Chưa biết input chuột gốc, FOV chính xác, phiên bản game trong video và đầy đủ AnimGraph gốc. Không gọi các con số này là bằng chứng đã khôi phục nguyên bản toàn hệ thống.

## Kết quả bản production được chụp riêng

Manifest **05C648EC48FE6B757AA51DBA378ACAD1**, cấu hình HIP `amplitude=.45`, `retriggerBlend=.06 s`, `rotationScale=1`. Chỉ đo chuỗi `ak74-hip-auto`, 61 frame 0–1 s. Các số dưới đây được tính lại trên PNG của bản production, không dùng số của bản thử nghiệm thay thế.

| Đại lượng, đơn vị px quy về1080p | Bản cũ | Production | Video nguồn |
|---|---:|---:|---:|
| RMSE đường đi đầu ruồi XY | 14.93 | 8.98 | — |
| RMSE đường đi thân súng XY | 15.95 | 6.99 | — |
| Bước đầu ruồi lớn nhất giữa2 frame | 21.62 | 4.09 | 7.90 |
| Bước thân súng lớn nhất giữa2 frame | 38.72 | 6.16 | 15.35 |

**Bước nhỏ hơn nguồn không có nghĩa là giống nguồn hơn.** Bản mới đã giảm giật cục rõ, nhưng chuyển động ngang của đầu ruồi còn thiếu. Nguồn có trung bình X khoảng+9.02 px trong đoạn0.2–1 s; bản lab mới vẫn chỉ khoảng+0.4 px. Đó là sai khác còn lại có thể nhìn thấy, không được che bằng kết luận đã rep1:1.

Thử nghiệm độc lập giảm góc xoay quanh `weapon_r` với các tỷ lệ0/.25/.5 không cải thiện đồng thời hai mốc. Tỷ lệ.5 chỉ cải thiện RMSE đầu ruồi khoảng0.42 px nhưng làm RMSE thân súng tăng khoảng2 px; mức cải thiện đầu ruồi nhỏ hơn độ bất định quan sát. Vì vậy production giữ **rotationScale=1**, tức nhánh hiệu chỉnh xoay không tác động. Receipt thử nghiệm ở `B65AA8704498B59EF90F2399D328708F` vẫn được giữ để chứng minh giả thuyết đã được thử và loại bỏ.

Kiểm tra độc lập các frame0 và29–45, gồm các frame điểm tương đồng template thấp nhất, xác nhận marker vẫn nằm trên đầu ruồi vật lý. Sai số quan sát thủ công khoảng1 pixel gốc theoX và1–2 pixel theoY; dùng biên thận trọng ±2 pixel gốc mỗi trục (±4 px quy đổi), rộng hơn ở frame mờ. Đây là đánh giá QA thị giác, không phải confidence interval thống kê.

Trang [AK74 HIP Frame Comparison (workspace)](../../references.html#local-cd2c97b9a0e6) mặc định cho xem0–60 frame, có ảnh toàn cảnh và crop đầu ruồi/thân súng lấy từ PNG gốc. Có thể bật thêm0.5 s sau thả cò; nguồn được để trống ở đoạn này vì không có input tương đương. [Giải thích lỗi và cách sửa](AK74-HIP-Changes-20260924.vi.md) mô tả cơ chế gameplay; `final-summary.json` và hai file `final-*-*.json` lưu phép đo chi tiết.
