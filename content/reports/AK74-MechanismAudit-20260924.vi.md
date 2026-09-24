# AK74: vì sao đúng clip vẫn cho cảm giác bắn sai

Phạm vi: điều tra source, dữ liệu animation và nguyên nhân kỹ thuật ngày 24/09/2026. Đây là audit trước/sau công thức ghép pose; không phải chứng nhận hình ảnh giống video 1:1. Kiểm tra runtime và so sánh video phải được ghi riêng.

## Lỗi có bằng chứng trực tiếp: bắn khi ngắm đổi về tư thế nền của hip

AK74 có hai clip riêng: `A_FP_AK74M_Fire` và `A_FP_AK74M_Standing_ADS_Fire`. Chọn đúng tên clip chưa đủ. Cả hai là additive `AAT_LocalSpaceBase`; authored base `LocalAnimFrame` đã bị loại trong cooked asset. Exporter trước đây ghi rõ `studyOverride`: dùng `A_FP_AK74M_Idle` frame 0 để compose thành full pose.

Runtime cũ đưa full pose ấy vào nhánh cuối với weight 1. Tư thế ADS bên dưới bị thay thế hoàn toàn. Clip có chữ ADS trong tên vẫn mang **nền hip do quá trình export chọn**, nên hệ thống dựng lại tự làm súng nhảy ngang khi bóp cò, giữ ở vị trí sai, rồi quay về ADS sau khi action kết thúc.

Đo độc lập từ chuỗi xương local tới component `weapon_r`:

| Chuyển đổi | Khoảng cách | Góc lệch |
|---|---:|---:|
| Idle → Hip Fire frame 0 | 0,00645 cm | 0,0523° |
| Idle → AimFire frame 0 | 1,75828 cm | 0,1715° |
| ADS_In cuối → AimFire frame 0 | **6,13355 cm** | **1,4491°** |
| ADS_In cuối → AimFire cuối | **6,87311 cm** | **1,2986°** |

AimFire cuối gần như chính là hip idle. Toàn bộ 180 xương của Idle giống nhau ở cả ba frame lưu, nên dùng Idle frame 0 làm reference là ổn định. Góc trong bảng là góc xương, không phải recoil camera.

## Cách ghép đúng trong bản nghiên cứu

Đối với từng xương local, lấy `Action(t)` trừ đúng reference được dùng khi bake, rồi áp delta lên tư thế locomotion/ADS hiện tại:

```
deltaQ = actionQ * inverse(referenceIdleQ)
deltaP = actionP - referenceIdleP
deltaS = actionS / referenceIdleS - 1
resultQ = deltaQ * currentBaseQ
resultP = currentBaseP + deltaP
resultS = currentBaseS * (1 + deltaS)
```

UE 5.8 có `MakeDynamicAdditive` và `ApplyAdditive` thực hiện đúng quy ước này. Cần dùng local additive; trừ component-space `weapon_r` trực tiếp sẽ không giữ quan hệ tay, cổ tay và súng. Khi recoil kết thúc, delta trở về identity, do đó ngắm toàn phần, ngắm giữa chừng, vào/ra ADS đều giữ nguyên stance hiện tại. Reload/equip vẫn cần full-pose override riêng.

Đây là cách gỡ reference thay thế đã biết để giữ chuyển động còn lại. Nó không khôi phục authored base bị mất hay chứng minh native WARDOGS dùng đúng graph này. Nhánh nghiên cứu chỉ áp dụng AK74, có đường đối chứng legacy.

## Những lớp còn chồng lên chuyển động AK74

| Lớp | Hiện trạng trước hiệu chỉnh riêng AK74 | Ý nghĩa |
|---|---|---|
| Animation tay | Hip/AimFire riêng, 1 giây, 60 Hz, RateScale 1 | Có nguồn; additive base cần xử lý như trên |
| Animation cơ khí | `A_Weap_AK74M_Fire`, 1 giây | Cùng clock với tay; không phải nguồn controller recoil |
| Controller recoil | 0,75° hip; ADS nhân 0,7; yaw ngẫu nhiên ±0,10° trước hệ số ADS | Thông số study, chưa lấy từ graph gốc |
| Mesh kick | Mỗi phát +0,8 cm, cap 3 cm; thêm pitch = kick ×0,8 | Thêm lên animation gốc; không phải tham số đã đo từ video |
| Sway | Đọc delta của toàn bộ control rotation | Cả recoil và tự hồi tâm cũng gây sway dù chuột đứng yên |
| Hồi controller | Đợi 0,12 giây, nội suy về 0 tốc độ 7/s | Có thể kéo tâm xuống sau khi người chơi đã tự bù chuột; chưa biết native policy |
| Source CameraBone | Có track AK hip, đỉnh khoảng 0,788° ở frame 2; mặc định diagnostic tắt | Track animation camera không thay thế toàn bộ recoil/gameplay camera |
| Nhịp bắn | Showcase 650 RPM theo audio, khoảng 92,3 ms/phát | 60 Hz cho số frame xen kẽ; không nên ép mọi khoảng thành sáu frame |
| Muzzle | Point light tạm 35 ms | Không có hình dạng flash gốc nên cảm giác và mốc hình ảnh khác |
| Âm thanh | Fire core; routing/tail/mix chưa đủ | Đúng một WAV không tạo được âm thanh hoàn chỉnh của native gun |

Không có lỗi “controller recoil bị cộng hai lần” trong `AWardogsVideoCharacter::ApplyWeaponRecoil`: hàm giữ trạng thái trước `Super`, rồi ghi lại controller từ trạng thái đó. Tuy nhiên camera recoil, animation xương, procedural mesh kick và sway là các lớp khác nhau, vẫn cộng vào trải nghiệm nhìn thấy.

Sway hiện dùng góc thay đổi **mỗi frame**, không chuẩn hóa theo delta time; vì vậy cùng tốc độ quay chuột cho biên độ khác nhau giữa 60 và 120 Hz. Đây là điểm cần kiểm tra riêng, không nên đánh đồng với sai animation.

## Tại sao phải kiểm tra single, auto, hip và ADS riêng

Một phát hip có thể gần đúng vì Fire và Idle cùng base. ADS bộc lộ lỗi nền ngay. Bắn tự động restart clip dài một giây mỗi khoảng 92 ms; vì thế chỉ phần đầu clip xuất hiện trong chuỗi và pose nhảy lúc restart. Cách native chồng/fade/cắt montage chưa được giải mã. Đo clip peak một giây rồi chỉnh toàn bộ recoil theo peak ấy sẽ sai đối với auto.

Cần đối chứng tối thiểu: old full-pose / corrected local additive; corrected có và không mesh kick; sway từ chuột riêng so với sway ăn cả recoil; hip single / hip auto / ADS single / ADS auto; bóp/nhả ADS trong action. So sánh đồng thời vị trí sight tương đối camera và chuyển động cảnh nền. Chuyển động tay không được dùng để suy ra controller recoil khi chưa tách hai lớp này.

## Kiểm tra vật liệu AK74

File Mutable hiện chọn `MI_AK74_Handguard` (slot 6, logical mesh 348) và `MI_AK74_Stock` (slot 1, logical mesh 184). Receipt import gắn đúng BCA. PNG handguard có vân gỗ nâu rõ ràng; không thiếu texture gỗ. UV0 của hai phần phủ 0..1 và có nhiều mẫu nâu; UV1 bằng (0,0). Nếu render nhìn xám/đen, cần kiểm tra graph thực trong UE, slot và chiếu sáng trước khi thay mesh. Script read-only `inspect_ak74_materials.py` ghi graph/UV sampler vào `Saved/AK74Study/material-readback.json`; chưa có kết quả script thì không kết luận lỗi UV hay variant.

Readback UE đã được root chạy thành công: cả 12 slot khớp với nguồn đã chọn. Slot 1/6 lấy đúng stock/handguard BCA, `sRGB=true`, sampler `const_coordinate=0`, UV input không nối, RGB nối BaseColor. Như vậy không có bằng chứng gán nhầm material hay đọc nhầm UV1. Normal chưa nối, roughness 0,62 và metallic 0 là shader study; màu sắc trong cảnh còn phụ thuộc ánh sáng/phơi sáng, không thể suy từ việc nhìn tối thành “không có gỗ”.

## Giới hạn của bản đối chứng chỉ sửa pose

Capture root `7885D54E46E227E5DDCAB887EE044150` đã cho ADS giữ nền và audit xương qua. Tuy nhiên tên “pose-only” nghĩa là **chỉ thay cách ghép pose so với baseline**, không phải chỉ còn animation: frame 0 ADS vẫn có `viewmodelKick=0.6`, tương đương pitch cả mesh 0,48° và lùi 0,6 cm. Vì vậy không nên giảm weight animation nguồn chỉ dựa vào hình capture này trước khi tách kick ra.

Sau compose local đúng, chuyển động `weapon_r` riêng của AimFire so với ADS là `(0,2332; -1,7182; 0,2915)` cm / 0,1715° tại frame 0 và `(0,4982; -2,5016; 0,4000)` cm / 0,5707° tại frame 2. Offset đầu clip đến từ upperarm/lowerarm/hand; `CameraBone` frame 0 trùng Idle hoàn toàn. Do đó áp CameraBone relative Idle thay vì relative Fire(0) không thể triệt tiêu bước nhảy đầu. Chưa có phép đo pixel độc lập để biến các con số xương này thành sai số video.

## Tái kiểm tra

`Scripts/audit_ak74_pose_bases.py` tạo [JSON đo xương (workspace)](../../references.html#local-74ed97c7845f), kiểm SHA source trước khi đọc. Native probe sau sửa đo `weapon_r` thật, so với kết quả compose từng xương local; ghi reference clip, thời gian reference, current ADS clip/time/weight và recoil weight. Tolerance vẫn 0,05 cm / 0,05°. Bài kiểm tra này chứng minh công thức runtime hoạt động đúng; hình ảnh, camera, âm thanh và cảm giác so với video cần bằng chứng riêng.

## Xác nhận clip ADS bằng montage gốc, không chỉ bằng tên

Đã đọc metadata của `/WEPN_001/Animation/Character/Montages/FP/AM_FP_AK74M_Fire.AM_FP_AK74M_Fire`. File chứng cứ là `WardogsPorting/Demos/GunGameplay/Files/metadata_5da6b19a468a_7a8d34fd2429.json`, SHA-256 `7a8d34fd24297f70e7e946e63ebff4cd49f61aa6dbc0a6f270344a2d67ffc7c4`.

| Slot được lưu trong montage | AnimSequence được tham chiếu |
|---|---|
| BasicAction, Crouch, Prone | `/WEPN_001/Animation/Character/Sequences/FP/A_FP_AK74M_Fire.A_FP_AK74M_Fire` |
| ADS, CrouchADS, ProneADS | `/WEPN_001/Animation/Character/Sequences/FP/A_FP_AK74M_Standing_ADS_Fire.A_FP_AK74M_Standing_ADS_Fire` |
| ScopeADS, CrouchScopeADS | `A_FP_AK74M_Stand_ADS_Scope_Fire` |
| ProneScopeADS | `A_FP_AK74M_Prone_ADS_Scope_Fire` |

Montage lưu blend-in **0,0 giây**, blend-out **0,4 giây**, kiểu Linear. Mỗi segment bắt đầu ở 0, kết thúc ở 1 giây, rate 1, loop 1. Đây là bằng chứng trực tiếp rằng Standing_ADS_Fire là clip được thiết kế cho slot ADS. Đổi sang Hip Fire hoặc thêm một blend-in tùy ý không phải sửa lỗi chọn clip theo bằng chứng nguồn. Dữ liệu này vẫn chưa cho biết AnimGraph gốc lấy slot nào ở mỗi thời điểm, mask từng xương, chạy IK, hiệu chỉnh sight/camera hay dùng trọng số nào; không thể lấy tên slot để khẳng định graph nghiên cứu đã giống graph gốc.

Đo thêm hai clip đều được compose local lên ADS_In cuối, so với chính nền ADS đó:

| Clip / thời điểm | Delta vị trí component `weapon_r` (X; Y; Z), cm | Góc xương |
|---|---|---:|
| Hip Fire / 0 ms | (0,0058; 0,0017; 0,0023) | 0,0523° |
| Hip Fire / 16,7 ms | (-0,2095; -1,9862; -0,1448) | 1,4582° |
| Hip Fire / 33,3 ms | (-0,3772; -3,9747; -0,1558) | 2,8388° |
| Hip Fire / 100 ms | (-0,0576; -3,6484; -0,0676) | 1,5796° |
| ADS Fire / 0 ms | (0,2332; -1,7182; 0,2915) | 0,1715° |
| ADS Fire / 16,7 ms | (0,3888; -2,2734; 0,3735) | 0,2375° |
| ADS Fire / 33,3 ms | (0,4982; -2,5016; 0,4000) | 0,5707° |
| ADS Fire / 100 ms | (0,0353; -0,9416; 0,1780) | 0,2241° |

Hip Fire gần identity ở frame đầu nhưng những frame sau có độ lùi và góc lớn hơn rõ rệt; thay clip không chỉ loại offset đầu mà thay cả chuyển động. X/Y/Z ở đây là trục component của skeleton, chưa phải trục màn hình. Không được diễn giải dấu của bảng thành hướng pixel khi chưa tính transform mesh, camera và phép chiếu. Toàn bộ frame 0–6, SHA đầu vào và slot gốc được lưu trong `Saved/AK74Focus/source-fire-binding-audit.json`.

## Kết quả xác minh runtime cuối của vòng này

Các mô tả kick, sway và tự hồi tâm phía trên là trạng thái **trước bản sửa riêng AK74**. Bản sau dùng curve đo từ video, tổng phản hồi theo deadline từng phát, giữ phần offset sau khi curve ổn định; không cộng generic mesh kick, generic recoil return hay sway do chính recoil gây ra. Burst gain là fit nghiên cứu có giới hạn theo chuỗi đã đo, không phải thông số giải mã từ game gốc.

`Scripts/validate_ak74_focus_runtime.py` đã kiểm tra hai manifest cuối `44D84FE24D42FD94FB579C8A5E1DF80F` và `FBEB036041B581ED8B252F8EB776FE89`: **648 frame, 6 tình huống, 18.852 phép kiểm tra, không lỗi**. Bốn tình huống bắn có lần lượt 1/1/11/11 phát; hai tình huống còn lại bóp/nhả ADS trong action. Script tự tính tổng curve từ deadline, kiểm phần delta deferred do ngưỡng SetControlRotation của UE, không có generic kick/return, pose xương thực và các frame ADS trung gian. Các sai số curve sau tính deferred nhỏ hơn 0,0002°.

Receipt `Saved/AK74Focus/runtime-validation.json` có hash manifest và từng PNG. Telemetry xác nhận tải 10 biến thể fire core, số yêu cầu phát khớp số phát súng và không lặp biến thể ở hai phát liền nhau; đây không phải bản ghi âm để chứng nhận đã nghe đúng mix. Các kiểm tra runtime này cũng không chứng nhận video giống 1:1: chuyển động sight theo pixel, cấu trúc slot/IK gốc, ánh sáng, muzzle và mix âm thanh vẫn cần đối chiếu riêng.
