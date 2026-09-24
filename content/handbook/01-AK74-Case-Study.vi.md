# AK74: từ “đúng asset nhưng bắn rất lạ” đến bản HIP/ADS đã được chơi thử chấp nhận

Ngày tổng hợp: 24/09/2026. Người dùng đã thử `L_AK74_HIPTest` trong Editor và xác nhận **HIP, ADS ổn**. Đó là nghiệm thu cảm giác của bản hiện tại. Những phép đo dưới đây vẫn chỉ ra sai khác với video; sự chấp nhận này không biến bản dựng thành bản sao 1:1.

Kết quả đến từ việc tách từng lớp, đo một lỗi cụ thể rồi kiểm lại. Không có một thông số recoil duy nhất giải quyết tất cả. Quan trọng hơn, chính cách kiểm tra ban đầu của tôi đã bỏ sót lỗi: xác nhận engine chạy đúng một clip không đồng nghĩa clip ấy được ghép đúng vào trạng thái người chơi.

## 1. Từ tài nguyên rời đến một khẩu súng có thể kiểm tra

Bộ mẫu đầu chỉ có geometry static của AK74, Vector và M249, animation tay và rig cơ khí chung. StaticMesh đi theo tay nhưng không tự làm bolt hoặc băng đạn chuyển động. Sau khi lần dữ liệu lắp ráp Mutable, dự án tạo các mesh có skin và skeleton riêng trong `GunStudy/RecoveredV3`, nối cặp animation **tay** và **cơ khí** của từng khẩu.

Đây là bước giải quyết khả năng nhìn và sử dụng tài nguyên. Nó chưa phục hồi toàn bộ AnimGraph, shader, âm thanh hoặc quy tắc gameplay gốc. [Audit tích hợp lịch sử](../reports/GunGameplay-Integration-Audit.vi.md) và [kiến trúc GunStudy đã có rig](../reports/VideoGunplay-CodeAudit.vi.md) mô tả hai giai đoạn khác nhau; không dùng nhận xét “chỉ có static mesh” của giai đoạn đầu để mô tả trạng thái hiện tại.

Từ đó, bản chơi thêm loadout, đạn, reload, ADS, sprint, HUD và các súng khác. Có đủ hành động chưa đảm bảo chúng diễn ra đúng thời điểm: một lỗi tick khiến đạn và recoil đã thay đổi nhưng tay/súng vẫn ở tuổi animation của phát trước. Thứ tự được sửa thành **input → weapon → trình diễn súng → mesh**, để cùng một phát đạn kích hoạt pose và ánh sáng đầu nòng trong cùng frame. [Lịch sử Showcase](../reports/Showcase-Implementation.vi.md) ghi capture 360 frame/81 phát kiểm chứng bước này.

## 2. Sửa cách chạy animation trước khi chỉnh “độ giật”

Đợt hiệu chỉnh rộng ngày 23/09 phát hiện nhiều lỗi chung:

- ADS chỉ giữ pose cuối rồi nội suy, bỏ quỹ đạo đưa súng lên ngắm. Bản sửa lấy mẫu các key thật của `ADS_In`.
- Action bị trộn với trọng số 0,4 → 0,8 → 1 ở ba frame đầu, làm mất lực của cú giật ban đầu. Clip bắn được nhận trọng số ngay khi bắt đầu.
- Hết action, runtime đổi sang hip idle khi weight còn lớn, gây cú hụt trong ADS. Bản sửa giữ sample cuối hoặc sample tại lúc ngắt cho đến hết fade.
- Proxy animation lấy dữ liệu trước `NativeUpdateAnimation`, trễ một frame. Bản sửa commit dữ liệu sau cập nhật và kiểm transform xương đã evaluate.

Nhịp AK74 được chọn khoảng **650 RPM** theo âm thanh Showcase; ADS vào khoảng **0,267 giây**, world zoom khoảng **1,28 lần** theo hình nền. Đây là phép đo video có sai số, không phải giá trị vừa giải mã từ game. Tài liệu [thay đổi ngày 23/09](../reports/Gunplay-Changes-20260923.vi.md) giữ nguồn và phạm vi riêng của từng con số.

Các kiểm tra khi đó chứng minh clock và pose chạy nhất quán. Tuy nhiên, bạn vẫn thấy cảm giác khác. Điều đó cho thấy tiêu chí kiểm tra phải đi xa hơn việc “clip đã phát đúng”.

## 3. Thu hẹp về AK74: tìm ra lỗi nền ADS

Khi bạn yêu cầu chỉ tập trung AK74, chúng tôi ngừng lấy việc nhiều khẩu đã hoạt động làm thước đo tiến bộ. Bốn ca được tách riêng: HIP một viên, HIP giữ cò, ADS một viên và ADS giữ cò.

Nguồn `A_FP_AK74M_Standing_ADS_Fire` là animation additive; authored base đã bị lược trong cooked data. Exporter trước đó ghi rõ dùng `Idle(0)` thay thế để bake thành full pose. Runtime lấy full pose ấy đè lên ADS. Vì vậy tên clip có chữ ADS nhưng nền được mang vào lại là hip.

Từ cuối `ADS_In` sang đầu `AimFire`, xương `weapon_r` lệch **6,13355 cm và 1,4491°**; hình súng nhảy ngang khoảng 190 pixel quy về 1080p. Giảm camera pitch không thể sửa việc đặt sai nền này.

Cách sửa: với mỗi xương, tách delta của action khỏi đúng Idle đã dùng khi bake, rồi cộng delta lên **pose locomotion/ADS hiện tại**, bằng `MakeDynamicAdditive` và `ApplyAdditive`. Reload/equip vẫn có đường full pose riêng. Đây là phép sửa cách dùng dữ liệu đã nhập, không phải tuyên bố đã phục hồi graph native. [Audit base pose](../reports/AK74-MechanismAudit-20260924.vi.md) lưu phép tính và giới hạn.

**Sai lầm của quy trình trước:** oracle chỉ hỏi “xương có khớp clip không?”. Nó chưa hỏi “clip đang được đặt lên nền nào?”. Một phép kiểm đúng nhưng thiếu câu hỏi quan trọng vẫn cho PASS trong khi người chơi thấy sai rõ ràng.

## 4. Tách camera, súng và phản ứng với chuột

Sau sửa pose, ba lớp còn bị cộng lẫn:

1. Animation nguồn đã có tay/súng giật; procedural mesh kick lại đẩy cả cụm thêm một lần. AK74 bỏ kick thêm này.
2. Sway đọc toàn bộ thay đổi control rotation, nên recoil tự tạo sway như thể người chơi quay chuột. Bản sửa tách phần recoil khỏi input dùng cho sway.
3. Camera bị tăng pitch tức thời rồi tự kéo về sau 120 ms. Video cho thấy nền tăng dần khoảng 100 ms và phần lớn độ nâng được giữ lại.

Để đo camera, theo dõi các landmark **cảnh nền**, loại HUD và súng. Để đo viewmodel, theo dõi **thước ngắm/thân súng** riêng. Không đổi chuyển động xương thành góc camera hoặc góc bay của đạn.

Ở 500 ms sau một viên, nguồn còn khoảng 91,5% mức tăng đỉnh HIP và 97,1% ADS; bản cũ còn 5,77%. Runtime chuyển sang curve quan sát được và phần nâng giữ lại. Khi giữ cò, cộng đơn giản các curve một viên vẫn thiếu độ nâng; một gain tích lũy có giới hạn được fit chung từ hai chuỗi HIP/ADS. Điều kiện reset và giới hạn gain là lựa chọn của lab.

Trên PNG thật, sai lệch chuyển động **dọc của cảnh** trong giây đầu auto giảm từ khoảng 49–59 pixel xuống **5,15 pixel HIP / 5,20 pixel ADS RMS**. Đây là một chỉ số hẹp: FOV nguồn và input ghìm chuột chưa biết; yaw, flash, vật liệu và toàn ảnh chưa trùng. [Phân tích video](../reports/AK74-VideoAnalysis-20260924.vi.md) ghi các giả định đó.

## 5. Âm thanh cũng cần điều tra riêng

Bản cũ lặp `Core_01` cho mỗi viên và phát từ muzzle di chuyển. Đối chiếu waveform cho thấy video có nhiều biến thể core. Đã xuất 35 SoundWave của AK74: 10 Core, 5 Punch, 10 Mech, 9 Rattle và 1 FinalBullet.

Runtime hiện preload 10 core, chọn biến thể không lặp liền nhau, dùng random stream riêng và phát stereo local. Punch có bằng chứng bổ sung lực trầm, nhưng mixer MetaSound chưa đọc đầy đủ nên **chưa ghép Punch/Mech/Rattle vào runtime**. Các bản nghe fit offline không phải âm thanh gameplay đã triển khai.

Capture hình chạy `-nosound`. Số request bằng số viên chỉ kiểm luồng gọi, không chứng minh đồng bộ âm thanh đến từng sample. [Audit âm thanh](../reports/AK74-AudioAudit-20260924.vi.md) phân biệt rõ xuất asset, fit offline và phần đang phát thật.

## 6. Bạn chấp nhận ADS nhưng HIP giữ cò vẫn rung: đổi câu hỏi đo

Phản hồi của bạn là đầu súng văng nhiều, khó mô tả. Điều cần làm không phải yêu cầu bạn nói bằng thuật ngữ kỹ thuật, mà biến cảm giác ấy thành phép đo: đầu ruồi đi đâu, thân súng đi đâu, và bước nhảy nào xuất hiện khi phát mới bắt đầu?

AK74 650 RPM bắn mỗi **92,3077 ms**. Trong source HIP, súng vẫn lùi khoảng 3,79 cm khi viên tiếp theo đến; khoảng 150–200 ms mới gần idle. Runtime reset clip về đầu mỗi viên, cắt phần hồi đang dang dở. Capture ghi bước nhảy xương 1,99–3,74 cm và khoảng 2,10° tại retrigger.

Trên ảnh, bước nhảy đầu ruồi lớn nhất là **21,62 pixel**, nguồn **7,90**; thân súng **38,72**, nguồn **15,35**. Camera đã khá gần nhưng chính cây súng còn sai. Đây là lý do tiếp tục giảm camera recoil sẽ sửa nhầm lớp.

Bốn ứng viên so trọng số 0,45/0,55 và handoff 0/40/60 ms. Bản chọn dùng **45% delta HIP và nối pose trong 60 ms**. Phát đầu chạy ngay; phát kế tiếp lấy pose cũ tại đúng deadline rồi chuyển sang pose mới bằng smoothstep. Nhịp đạn, cơ khí và camera không bị làm chậm để che rung.

Hiệu chỉnh theo clip của phát đã bắn: một phát bắt đầu HIP giữ calibration ấy khi người chơi đưa lên ADS; phát tiếp theo chọn clip theo tư thế mới. Điều này tránh đổi weight đột ngột giữa một action. Thông số cuối nằm trong [AK74HipFire.json](../evidence/AK74HipFire.json).

## 7. Những giả thuyết đã thử và loại bỏ

Giảm riêng rotation quanh `weapon_r` cải thiện đầu ruồi tốt nhất chỉ khoảng 0,42 pixel nhưng làm thân súng sai hơn khoảng 2 pixel. Cải thiện nhỏ hơn độ bất định quan sát; bản cuối giữ **rotationScale = 1**, tức không áp sửa rotation.

Giả thuyết inverse CameraBone cũng không giải thích được lỗi: ở 33,3 ms, góc tương đối của súng tăng từ 2,839° lên 3,602° và hướng bù đẩy thước ngắm sai phía. Không thêm phép bù ấy.

Montage nguồn có blend-in 0 và blend-out 0,4 giây, nhưng điều đó không chứng minh native chồng mọi phát trong 0,4 giây. Handoff 60 ms là **calibration của lab**, không gắn nhãn “thông số gốc”. [Ghi chú cơ chế HIP](../reports/AK74-HIP-Mechanisms-20260924.vi.md) giữ các phương án bị loại để tránh thử lại cùng giả thuyết mà không có dữ liệu mới.

## 8. Kết quả, giới hạn và lần đưa vào Editor

So 61 frame từ phát đầu nhìn thấy tại 416,200 giây, không tối ưu lệch pha để làm số đẹp:

| Đại lượng, pixel quy về 1080p | Trước | Sau | Nguồn |
|---|---:|---:|---:|
| RMS quỹ đạo đầu ruồi so nguồn | 14,93 | 8,98 | — |
| RMS quỹ đạo thân súng so nguồn | 15,95 | 6,99 | — |
| Bước đầu ruồi lớn nhất giữa hai frame | 21,62 | 4,09 | 7,90 |

**Ít rung hơn không tự có nghĩa giống hơn.** Bản mới vẫn thiếu chuyển động ngang: trung bình đầu ruồi nguồn khoảng +9,02 pixel, lab khoảng +0,4 trong đoạn đã đo. Đầu ruồi runtime nhỏ, chỉ khoảng 12 pixel native; track cuối dùng template độc lập từng frame để tránh drift optical flow. [Hồ sơ phép đo](../reports/AK74-HIP-Measurement-Readme.vi.md) ghi uncertainty và bảng ứng viên.

Các biên nhận phải được hiểu theo đúng build:

| Giai đoạn | Bằng chứng đã lưu |
|---|---|
| Sửa ADS/camera/audio | [AK74Focus](../evidence/AK74Focus-validation-summary.json): 29 rule tests, 539 kiểm tra gameplay, 648 frame/sáu ca. |
| Sửa HIP cuối | [AK74HipFocus](../evidence/AK74HipFocus-validation-summary.json): 30 rule tests, 539 kiểm tra gameplay, 1.026 frame/tám ca, gồm hết 30 viên. Hai ca bắt đầu ADS trùng telemetry pose/controller/clock của bản ADS trước. |
| Level Editor | [AK74EditorLevel](../evidence/AK74EditorLevel-validation.json): 26 kiểm tra đạt trên PIE thật, không cần cờ Showcase; deploy, chín phát HIP, bảo toàn đạn, reload và một phát ADS. |

Receipt HIP gắn với DLL hash bắt đầu `7BD43D25`; DLL hiện tại sau công việc hỗ trợ level bắt đầu `4CCC587D`. Không suy rằng toàn bộ 1.026 frame đã chạy lại dưới DLL mới. Level có kiểm tra PIE riêng và sau đó có xác nhận chơi thử của bạn. Hai loại bằng chứng bổ sung cho nhau nhưng không thay thế nhau.

Level `/Game/WardogsLab/VideoGameplay/Maps/L_AK74_HIPTest` đã lưu cấu hình Showcase, iron sight và 650 RPM. Bạn có thể mở bằng [Open-AK74HIP-Editor.cmd (workspace)](../../references.html#local-d4583e0315c6). [Đối chiếu HIP (workspace)](../../references.html#local-cd2c97b9a0e6) giữ nguồn/trước/sau để xem lại.

Điều học được từ toàn bộ quá trình là: **asset đúng → ghép đúng → sự kiện đúng thời điểm → hình/âm đúng → người chơi chấp nhận** là các bước riêng. Các súng tiếp theo phải đi qua cùng chuỗi bằng chứng, với thông số và đặc tính riêng; không sao chép 45%/60 ms của AK74 sang mọi khẩu.
