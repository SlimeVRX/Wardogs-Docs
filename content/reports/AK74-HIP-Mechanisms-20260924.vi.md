# AK74 HIP: dữ liệu gốc và phần hiệu chỉnh nghiên cứu

Phạm vi: chuyển động tay/súng khi bắn HIP, đặc biệt giữ cò ở 650 RPM. Tài liệu này phân biệt dữ liệu đã đọc được với cách dựng lại để đối chiếu video; không chứng nhận đã khôi phục graph gốc hay giống từng frame.

## Nguồn đã xác nhận

Montage `/WEPN_001/Animation/Character/Montages/FP/AM_FP_AK74M_Fire.AM_FP_AK74M_Fire` tham chiếu:

| Slot | Sequence |
|---|---|
| BasicAction, Crouch, Prone | `A_FP_AK74M_Fire` |
| ADS, CrouchADS, ProneADS | `A_FP_AK74M_Standing_ADS_Fire` |

Mỗi segment dài 1 giây, rate 1; montage ghi blend-in 0 giây và blend-out 0,4 giây. Metadata còn có `IdleOffsetBlend`, `AdditiveOff`, notify bắt đầu bắn tại 0,0001 giây và kết thúc tại 0,134 giây. Chưa giải mã được nơi graph/code game sử dụng các curve và notify này. Không được mặc định `AdditiveOff` là weight recoil hoặc blend-out 0,4 giây nghĩa là mọi phát bắn chồng pose trong 0,4 giây.

Chứng cứ: `WardogsPorting/Demos/GunGameplay/Files/metadata_5da6b19a468a_7a8d34fd2429.json`, SHA-256 `7a8d34fd24297f70e7e946e63ebff4cd49f61aa6dbc0a6f270344a2d67ffc7c4`. Clip HIP full pose dùng trong lab có SHA-256 `acee85a674682234caf884932c03b8bcaf9958a62e677ef0419338348272cf46`; exporter đã bake additive lên own Idle(0) bằng reference thay thế được khai báo rõ. Authored base bị loại trong cooked data vẫn chưa khôi phục.

## Vì sao giữ cò tạo chuyển động giật cục

Đường cũ reset một evaluator Fire về tuổi của phát mới mỗi 92,3077 ms. Nó không cộng nhiều đuôi animation. `weapon_r` của một phát HIP lùi khoảng 4,26 cm tại 66,7 ms, còn lùi 3,79 cm khi đến phát tiếp theo, và chỉ trở lại gần idle khoảng 150–200 ms. Cắt về frame đầu xóa ngay phần pose đang giữ.

Capture baseline `44D84FE24D42FD94FB579C8A5E1DF80F` cho thấy 10 lần retrigger trong chuỗi HIP nhảy 1,99–3,74 cm và khoảng 2,10° giữa hai frame. Đây là đo transform xương thật; không phải khoảng cách pixel hay toàn bộ chuyển động camera.

## Hiệu chỉnh được chọn trong lab

Ba điều khiển dưới đây là **calibration nghiên cứu**, không phải thông số vừa giải mã từ WARDOGS:

1. `sourceAmplitude`: giảm delta local của clip nguồn, giữ reference Idle và locomotion/ADS base hiện tại.
2. `retriggerBlendSeconds`: khi bắn tiếp, lấy pose cũ tại deadline phát mới rồi chuyển ngắn sang clock clip mới bằng smoothstep. Phát đầu không dùng lịch sử; đây là handoff do lab thêm, không phải blend-in gốc.
3. `rotationScale`: phép thử giảm phần xoay component của `weapon_r` so với pose nền bằng hiệu chỉnh rigid quanh chính pivot của nó. **Phép thử này không được chọn làm mặc định**; giá trị chạy cuối bằng 1, giữ nguyên pose đầu vào.

`FAnimNode_WardogsHipBaseCache` lấy nền trong lượt evaluate thực của locomotion/aim. Node hiệu chỉnh đọc cache sau đó, không evaluate hay tick SequencePlayer thêm lần nữa. Cache được vô hiệu hóa trước mỗi lần đọc để tránh lấy pose nền của frame trước. Curves và attributes đi qua nguyên trạng. Ghi chú review: node rotation chỉ có một `InputPose`; không còn nhánh `BasePose` thứ hai trỏ vào cùng Aiming/Movement, nên không tạo thêm một lượt cập nhật locomotion.

Lựa chọn cuối trong `Config/AK74HipFire.json` là **sourceAmplitude = 0,45; retriggerBlendSeconds = 0,06; rotationScale = 1**. Capture A/B amplitude/handoff `866A8F96454299EA1007FC98B32F51C9` hỗ trợ việc giảm bước nhảy của chuỗi bắn. Capture rotation `B65AA8704498B59EF90F2399D328708F` có 384 frame cho bốn ứng viên: các thử nghiệm giảm rotation làm sai số phần thân/rear tăng; mức cải thiện tốt nhất của front chỉ khoảng 0,42 pixel, nhỏ hơn độ bất định định vị kiểm tra thủ công: khoảng ±2 pixel native runtime mỗi trục, tức ±4 pixel quy về 1080p. Vì vậy không dùng rotation correction để đổi một sai lệch rõ thành một cải thiện chưa đủ chắc chắn.

Node rotation vẫn giữ lại cho đối chứng có chủ ý qua override trong `AK74HipRotationCandidates.json`; ở cấu hình mặc định, scale 1 là pass-through chính xác. Kết quả so với video còn sai hướng chuyển động đầu ruồi ở một số thời điểm, nên lựa chọn này là giảm lỗi đã đo được, không phải kết luận đã tái tạo 1:1.

## Giới hạn và điểm phải kiểm tra

Không đổi controller recoil, đường đạn hoặc clock animation cơ khí trong hiệu chỉnh này. Chính sách được chọn là **theo clip của từng phát bắn**: shot bắt đầu ở ADS dùng clip ADS riêng và các hệ số HIP ở trạng thái pass-through; shot bắt đầu HIP rồi mới nhấn RMB tiếp tục giữ hiệu chỉnh HIP đến phát tiếp theo hoặc khi clip kết thúc. Nền aim vẫn chuyển theo input. Như vậy chuyển động recoil của một shot không bị nhân thêm một hệ số biến đổi chỉ vì người chơi đang vào/ra ADS. “Giữ nguyên ADS” ở đây nghĩa là giữ nguyên shot đã bắt đầu ở ADS, không có nghĩa mọi frame có AimBlend > 0 đều tắt hiệu chỉnh HIP.

`Config/AK74HipTransitions.json` dành riêng cho các tình huống nhấn aim trễ 0,05 giây sau một shot và chuyển mode sau 0,25 giây khi giữ cò theo cả hai chiều. Cần dùng receipt chạy của các case này để xác minh; case `aimOnTrigger` đơn lẻ không bao phủ chúng.

Giả thuyết bù bằng inverse CameraBone đã được tính độc lập: tại 33,3 ms CameraBone không tịnh tiến, xoay 0,788°; góc `weapon_r` tăng từ 2,839° lên 3,602° khi đưa về basis camera đang animate. Với basis mesh hiện tại, hướng bù còn đẩy sight sang trái/lên, không giải thích được sai lệch quan sát. Vì vậy không thêm camera shake hoặc inverse-camera compensation như một cách sửa mặc định.

Nghiệm thu cần cả telemetry và hình ảnh: pose thật khớp phép dựng lại, pivot/quan hệ grip giữ đúng, không tăng tốc locomotion, không giữ history sau đổi action/profile, delayed HIP→ADS hoạt động, và muzzle/rear sight/front sight gần track video hơn. Việc C++ build hoặc oracle xương qua chỉ chứng minh triển khai nhất quán; chúng không tự chứng minh cảm giác bắn hay pixel giống game gốc.
