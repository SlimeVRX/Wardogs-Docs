# Bằng chứng cơ chế súng — 23/09/2026

Trong 33 vũ khí của video showcase, 10 khẩu đã có profile chơi được. Phần đã khôi phục chắc nhất là định danh asset, mesh/rig riêng và các khóa animation. Cảm giác bắn vẫn dùng nhiều quy tắc của bản study: recoil, spread, ADS blend, đường đạn và audio mix chưa được giải mã từ gameplay gốc. Đây là kiểm toán dữ liệu hiện có, trước các sửa runtime đang được thực hiện; không chạy UE, không sửa asset.

[JSON chi tiết, đường dẫn nguồn và SHA-256 (workspace)](../../references.html#local-d1f6b7326a21) chứa 10 bộ clip, mẫu ADS ở 5 thời điểm, ứng viên Fire montage và danh mục 33 khẩu. Receipt import/đọc lại chứng minh trạng thái tại lần ghi receipt; không phải lần đọc trực tiếp live asset mới.

## Những khác biệt ảnh hưởng trực tiếp đến cảm giác

1. **ADS đang bỏ qua chuyển động đưa súng lên ngắm.** Cả 10 `fp_aim` đều là `ADS_In`, có chuyển động thực. Kiểm tra UEANIM theo đúng key và cây xương cho thấy AK74 đi quá điểm cuối rồi ổn định; Deagle xoay mạnh ở đầu rồi trở về gần góc ban đầu. Lấy khung cuối và nội suy hip→aim bỏ mất đường đi này. Frame đầu ADS khớp own idle: sai số lớn nhất `weapon_r` chỉ 0.005080 cm và 0.003224°. Có cơ sở dùng đường đi gốc; chưa có cơ sở khẳng định thời gian input→ADS gốc bằng toàn bộ clip. Phát ngược ADS_In khi hạ súng phải ghi là suy luận.
2. **Recoil mới vẫn giống nhau theo nhóm.** M1911/GGX17/Deagle đều pitch0.75/yaw0.10; M4/MP5/KH2002 đều0.55/0.08. Đây là hằng số study, chưa phải pattern, recovery hoặc recoil khi ADS của từng khẩu. Khóa CameraBone trong animation bắn cũng không tự chứng minh toàn bộ recoil gameplay.
3. **Mô hình đường đạn không đồng nhất.** AK74/Vector/M249/SKS đang là projectile; 6 khẩu mới mặc định hitscan. Các tốc độ800/350/700/800 m/s và gravity1 của nhóm đầu là study; SKS kế thừa tốc độ AK74. Không có dữ liệu native velocity hoặc falloff để gọi là khớp Wardogs.
4. **Âm bắn hiện chỉ chọn một Core WAV của đúng khẩu.** Catalog còn các asset/lớp âm khác, nhưng graph MetaSound/WDAudioData, lựa chọn ngẫu nhiên, indoor/outdoor, tail/punch và phối âm chưa được phục hồi. Đúng WAV vẫn chưa đủ để ra đúng tiếng bắn.
5. **Fire montage blend chưa có bằng chứng.** Không tìm thấy Fire/AimFire AnimMontage được giải mã trong các bản strict export đã quét. Sequence duration và RateScale không cho biết blend-in/out hoặc segment start/end/playRate. Không dùng blend reload để thay cho blend fire.

## Chế độ, cadence, magazine và tuning đang dùng

RPM/chế độ ở bảng sau đến từ CSV cộng đồng beta đã chuẩn hóa trong [GunplayReference (workspace)](../../references.html#local-0108dc7f6100). Chúng không phải numeric property giải mã từ bản game nguồn, và không chứng minh khớp build video. `Magazine` là số đạn nạp của study; chưa khôi phục riêng cơ chế chamber + 1.

| Khẩu | Chế độ CSV / RPM | Magazine / bằng chứng | Delivery | Recoil pitch/yaw | Spread hip/ADS ° |
|---|---|---|---|---|---|
| AK74 | SEMI/FULL / 665 | 30 — study, chưa decode numeric | Projectile | 0.75/0.10 | 1.20/0.12 |
| Vector | SEMI/FULL / 1255 | 30 — study, chưa decode numeric | Projectile | 0.23/0.13 | 1.20/0.12 |
| M249 | SEMI/FULL / 884 | 200 — study, chưa decode numeric | Projectile | 0.54/0.17 | 1.20/0.12 |
| SKS | SEMI / 416 | 10 — study, chưa decode numeric | Projectile | 1.10/0.12 | 1.20/0.12 |
| M1911 | SEMI / 470 | 7 — nhãn magazine native | Hitscan | 0.75/0.10 | 1.00/0.10 |
| M4 | SEMI/FULL / 827 | 30 — study, chưa decode numeric | Hitscan | 0.55/0.08 | 1.00/0.10 |
| GGX17 | SEMI / 524 | 17 — nhãn magazine native | Hitscan | 0.75/0.10 | 1.00/0.10 |
| Deagle | SEMI / 277 | 7 — nhãn magazine native | Hitscan | 0.75/0.10 | 1.00/0.10 |
| MP5 | SEMI/FULL / 836 | 30 — nhãn magazine native | Hitscan | 0.55/0.08 | 1.00/0.10 |
| KH2002 | SEMI/BURST / BURST711; SEMI518 | 30 — nhãn magazine native | Hitscan | 0.55/0.08 | 1.00/0.10 |

Nhãn gốc xác nhận M1911 7, GGX17 17, Deagle 7, MP5 30, KH2002/STANAG 30 qua magazine được chọn → định danh/string key → StringTable. Cách này chứng minh nhãn sức chứa, không chứng minh chamber state. HUD video dùng thanh đồ họa; các số006/008/005 dưới biểu tượng băng dự trữ không phải capacity. M4 30, SKS10 và magazine đang dùng của nhóm đầu vẫn phải giữ nhãn study nếu chưa có chuỗi bằng chứng tương đương.

## Đồng hồ animation riêng của từng khẩu

Đơn vị giây. Cột FP/mech ghi thời lượng sequence được xuất, không phải cadence hoặc thời gian commit ammo. Tất cả các clip được chọn ở đây có RateScale1. Reload FP và mechanical khớp thời lượng khi có đủ cặp; không ép hai kênh về cùng một độ dài. Clip fire1 giây không có nghĩa một phát/giây.

| Khẩu | Fire FP/mech | ADS Fire FP | ADS_In | Tactical FP/mech | Empty FP/mech | Last mech / Empty idle mech |
|---|---|---|---|---|---|---|
| AK74 | 1.000/1.000 | 1.000 | 0.533 | 3.367/3.367 | 3.733/3.733 | — / — |
| Vector | 1.000/1.000 | 1.000 | 0.533 | 3.000/3.000 | 3.333/3.333 | — / — |
| M249 | 1.000/1.000 | 1.000 | 0.533 | 8.333/8.333 | 8.833/8.833 | — / — |
| SKS | 1.000/1.000 | 1.000 | 1.000 | 0.767/0.767 | 0.767/0.767 | — / 0.017 |
| M1911 | 1.000/1.000 | 1.000 | 0.500 | 2.083/2.083 | 2.250/2.250 | 1.000 / 0.067 |
| M4 | 1.000/1.000 | 1.000 | 0.533 | 3.167/3.167 | 3.667/3.667 | 1.000 / 0.333 |
| GGX17 | 0.833/0.833 | 0.833 | 0.500 | 2.333/2.333 | 2.267/2.267 | 0.833 / 0.333 |
| Deagle | 1.000/1.000 | 1.000 | 0.500 | 1.800/1.800 | 2.267/2.267 | 1.000 / 0.067 |
| MP5 | 0.500/— | 0.500 | 0.533 | 2.500/2.500 | 3.333/3.333 | — / — |
| KH2002 | 1.000/1.000 | 1.000 | 0.533 | 2.667/2.667 | 3.333/3.333 | — / — |

**Các trường hợp riêng phải giữ đúng nghĩa:**

- SKS nạp từng viên: mở0.766667s, mỗi vòng chèn0.716667s, đóng1.516667s. Empty clip mechanical0.016667s có trong nguồn nhưng chưa được importer gán vào `mechanical_empty_idle`. Inspect FP14.166667s, mechanical13.833333s; giữ frame cuối mechanical, không kéo dãn giả.
- MP5 chưa có own mechanical fire/last/empty/equip/inspect trong bundle. Runtime giữ own mechanical idle khi bắn; đây là fallback được công khai, không phải chuyển động bolt đã khôi phục.
- M1911, GGX17, Deagle chưa có own mechanical Inspect; FP Inspect5s vẫn là nguồn riêng. M4 Inspect10s, KH2002 Inspect5s có cặp mechanical riêng.
- FP last-round/empty-idle không được gán riêng cho 6 khẩu mới; mechanical last/empty có ở M1911/M4/GGX17/Deagle. Không nhầm bằng chứng clip được gán với bằng chứng slide/bolt hiển thị đúng ở mọi frame.
- M249 có mechanical Equip1.583333s nhưng bộ FP Equip đang chọn thiếu; profile study dùng equip0.45s. AK74/Vector/SKS và 6 khẩu mới giữ own mechanical idle ở Equip nếu không có hành động riêng được gán.

Với hip fire, chỉ M1911 giữ authored `ABPT_AnimFrame` có base được giải mã. Chín khẩu còn lại là additive `LocalAnimFrame` bị mất authored base và đã được compose lên own idle có gắn `studyOverride`. Việc giữ khóa chuyển động không đồng nghĩa khôi phục nguyên vẹn pose tuyệt đối hoặc AnimGraph. JSON ghi riêng source/additive/base/frame, file gốc và SHA cho từng role.

## Đo trực tiếp đường đi ADS_In

Đo `weapon_r` trong component space từ dữ liệu xương có sẵn. Mẫu là key gần nhất ở0/25/50/75/100%, không nội suy và không render. Rotation là độ chênh quaternion so với đầu clip, không phải camera kick. CameraBone không đổi trong cả10 clip ADS_In.

| Khẩu | Duration s | Khoảng dịch tại25% /50% /100% (cm) | Góc tại25% /50% /100% (°) | Sai số idle→frame0 (cm / °) |
|---|---|---|---|---|
| AK74 | 0.533 | 5.189/8.209/6.873 | 2.483/1.151/1.297 | 0.003332/0.001560 |
| Vector | 0.533 | 3.836/7.203/7.853 | 2.772/2.416/1.000 | 0.002843/0.000434 |
| M249 | 0.533 | 4.165/8.817/11.916 | 0.809/3.601/6.078 | 0.005079/0.001908 |
| SKS | 1.000 | 2.677/9.029/11.596 | 2.842/1.238/3.999 | 0.000195/0.000551 |
| M1911 | 0.500 | 2.206/5.842/8.308 | 1.763/3.340/7.999 | 0.001668/0.000714 |
| M4 | 0.533 | 3.607/5.904/9.102 | 2.225/0.731/3.438 | 0.002881/0.002602 |
| GGX17 | 0.500 | 3.749/7.531/13.038 | 3.705/1.775/3.408 | 0.001886/0.003224 |
| Deagle | 0.500 | 2.608/7.133/10.967 | 3.442/1.643/0.313 | 0.001208/0.001713 |
| MP5 | 0.533 | 3.944/6.953/9.271 | 2.142/0.806/3.735 | 0.001737/0.001586 |
| KH2002 | 0.533 | 2.885/5.643/13.292 | 2.304/0.738/2.838 | 0.003423/0.001723 |

## Montage, notify, audio và muzzle

28 montage reload/inspect đã giải mã có155 event. Trong41 sequence được kiểm tra, trường Notifies không xuất hiện; điều này không có nghĩa toàn bộ native notify đã bị strip. Chúng nằm trong montage. Những raw tag duy nhất được tìm trong payload của từng instance chỉ chứng minh liên kết instance→tag, chưa giải mã toàn bộ class notify hoặc MetaSound.

M1911/M4 empty reload khi bật showcase reference dùng các mốc source Stage1/2/3 và own WAV A_MagOut/B_MagIn/C_Chamber. Mốc event là native; cách nối WAV theo tên stage là suy luận được ghi rõ. Không gọi đây là mix gốc. Các hành động khác vẫn còn foley chia tỷ lệ study. [Notify audit (workspace)](../../references.html#local-d07a5afced61) và [cấu hình timing (workspace)](../../references.html#local-81accccd2544) chứa bằng chứng chi tiết.

Cả bộ dùng điểm muzzle `muzzleFlash_J` của rig. Điều đó chưa khôi phục graph hạt, màu/cường độ/kích thước/thời gian muzzle flash, âm cơ khí, hoặc quy tắc ballistic gốc. Các thư mục âm được ghi theo tên literal trong JSON; không tự suy diễn layer nào cần phát từ tên file.

## Native handling còn thiếu ở đâu

Catalog có exact asset WDWeaponStatsData/BHAnimationSet/BHInventoryItemDefinition/WDAudioData cho các namespace tương ứng; riêng SKS chưa thấy WDWeaponStatsData trong namespace đã kiểm kê. Nhưng các bản strict inspection hiện có báo thiếu property mappings ở BHInventoryItemDefinition, BHAnimationSet và WDAudioData. Không dùng raw string hoặc tên field đoán để điền recoil/ADS/spread. Chưa có numerical native gunhandling đã xác nhận cho cả10 khẩu.

Quét 38 file `*decoded.json` sẵn có trong research/gameplay, Demos/GunGameplay và output: 0 Fire/AimFire montage row. Mỗi khẩu có danh sách exact candidate trong JSON để inspect tiếp. Hiện tại BlendIn, BlendOut, segment playRate/start/end đều để null, thay vì sao chép thông số reload. Native animation length có bằng chứng; native runtime modifier vẫn thiếu.

## Danh mục 33 khẩu và mức bằng chứng

CSV ID dưới đây chỉ là correspondence đã ghi trong inventory; các khẩu chưa đưa vào runtime chưa được coi là alias đã xác nhận. Cả33 đều chưa có native numeric handling đầy đủ. “Catalog” chỉ có tên/path nguồn, không phải profile chơi được.

| Khẩu trong catalog/showcase | CSV ứng viên | Trạng thái |
|---|---|---|
| AK74M | ak74 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| M4 | m4 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| KH2002 | kh_2002 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| A91 | a_91 | Catalog; chưa tích hợp trong bộ10 |
| TAR21 | t_21 | Catalog; chưa tích hợp trong bộ10 |
| Vector / SUPER-45 | super_45 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| SKS | sks | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| SV98 | sv_98 | Catalog; chưa tích hợp trong bộ10 |
| M249 | m249_saw | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| Glock17 / GGX17 | ggx_17 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| M500 / M12G | m500 | Catalog; chưa tích hợp trong bộ10 |
| MGL40 / MMGL | — | Catalog; chưa tích hợp trong bộ10 |
| MAAWS / CGM4 | — | Catalog; chưa tích hợp trong bộ10 |
| MP9 / AMP-9 | amp_9 | Catalog; chưa tích hợp trong bộ10 |
| M1911 | m1911 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| Deagle | deagle | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| MP5 | mp5 | Đã chuẩn bị own actions + study runtime; cần hiệu chỉnh feel |
| Galil | galil | Catalog; chưa tích hợp trong bộ10 |
| FAL | fal | Catalog; chưa tích hợp trong bộ10 |
| Glock18 / GGX18 | ggx_18 | Catalog; chưa tích hợp trong bộ10 |
| M17S | bushmaster_m17s | Catalog; chưa tích hợp trong bộ10 |
| Scout | scout_rifle_td | Catalog; chưa tích hợp trong bộ10 |
| PKM | pkm | Catalog; chưa tích hợp trong bộ10 |
| MK22 | mk22 | Catalog; chưa tích hợp trong bộ10 |
| Mosin | mosin_nagant | Catalog; chưa tích hợp trong bộ10 |
| MP43 | mp43 | Catalog; chưa tích hợp trong bộ10 |
| RFB / BMR | bmr | Catalog; chưa tích hợp trong bộ10 |
| SVDM / SVD | svd | Catalog; chưa tích hợp trong bộ10 |
| PP19 Vityaz | pp_19_vityaz | Catalog; chưa tích hợp trong bộ10 |
| SR04 / AMR50 | amr_50 | Catalog; chưa tích hợp trong bộ10 |
| Judge | judge | Catalog; chưa tích hợp trong bộ10 |
| RPG7 | — | Catalog; chưa tích hợp trong bộ10 |
| Combat Bow | compound_bow | Catalog; chưa tích hợp trong bộ10 |

Ưu tiên có cơ sở: bảo toàn đường đi ADS_In; giải mã chính Fire/AimFire montage để biết blend/segment; phân tách generic recoil/spread khỏi các thông số từng khẩu; phục hồi routing/mix âm thanh; rồi mới hiệu chỉnh từ video cùng camera/FOV. Mở rộng số lượng súng không tự giải quyết các khoảng trống này.

## Nguồn và giới hạn kiểm toán

- [Asset coverage33 (workspace)](../../references.html#local-724267aa20dc) / [inventory JSON (workspace)](../../references.html#local-7a04718d58c2).
- [Receipt6 khẩu (workspace)](../../references.html#local-e07dd4f62d5f) / [receipt4 mở rộng (workspace)](../../references.html#local-0b50e73ffef3) / [reference4 đầu (workspace)](../../references.html#local-03223c992e97).
- [Builder profile6 mới (workspace)](../../references.html#local-b688c121414f) / [builder projectile ban đầu (workspace)](../../references.html#local-c585f58cf135) / [SKS per-shell (workspace)](../../references.html#local-13c1e4295394).
- [Default weapon properties (workspace)](../../references.html#local-c6fcf28bfce9).

Các báo cáo/hình ảnh PASS kiểm chứng import, rig và hành vi kiểm thử tại thời điểm capture; chúng không chứng minh video parity hoặc tham số gameplay native. EA archive, CSV beta và video không được gộp thành một build chính thức.

## Chuyển động ngay sau khi bắt đầu Fire

Đo bổ sung mỗi key được lưu trong200ms đầu của Fire/AimFire cho M1911, GGX17, Deagle, AK74 và Vector. Dùng `weapon_r` trong component space, so với frame0; góc là độ chênh quaternion, Z là dịch chuyển theo chiều cao component, không phải góc camera hay độ cao muzzle trên màn hình. RateScale tất cả bằng1. GGX17 có key30Hz; bốn khẩu còn lại60Hz. JSON ghi đầy đủ XYZ/quaternion tương đối, SHA và thời điểm đỉnh.

| Khẩu / action | Góc ở16.7ms | Góc ở33.3ms | Đỉnh góc trong200ms / thời điểm | Đỉnh Z trong200ms / thời điểm |
|---|---|---|---|---|
| AK74 / hip | 1.503° | 2.882° | 2.882° / 33.3ms | 0.128cm / 200.0ms |
| AK74 / ADS | 0.334° | 0.690° | 0.690° / 33.3ms | 0.133cm / 50.0ms |
| Vector / hip | 0.441° | 1.303° | 1.906° / 133.3ms | 0.253cm / 166.7ms |
| Vector / ADS | 0.143° | 0.441° | 0.928° / 66.7ms | 0.000cm / 0.0ms |
| M1911 / hip | 3.156° | 15.500° | 17.850° / 50.0ms | 0.982cm / 33.3ms |
| M1911 / ADS | 3.519° | 3.682° | 7.490° / 66.7ms | 1.339cm / 33.3ms |
| GGX17 / hip | không có key | 7.916° | 7.916° / 33.3ms | 0.991cm / 33.3ms |
| GGX17 / ADS | không có key | 2.453° | 2.453° / 33.3ms | 0.007cm / 166.7ms |
| Deagle / hip | 12.256° | 34.253° | 37.351° / 83.3ms | 3.640cm / 100.0ms |
| Deagle / ADS | 10.690° | 28.242° | 31.973° / 50.0ms | 5.239cm / 100.0ms |

Ở tốc độ1, M1911 hip đã đạt15.50° tại33.3ms, bằng86.8% đỉnh sớm; Deagle đã đạt34.25°, bằng91.7%; GGX17 đạt đỉnh7.92° tại key đầu33.3ms. Vì vậy quan sát “súng nhấc mạnh sau flash1–2frame” chưa đòi hỏi tăng playrate. Đỉnh toàn bộ chuyển động xuất hiện muộn hơn không có nghĩa cú giật bắt đầu muộn.

Chưa biết native flash/audio event được căn vào frame0 thế nào; chưa giải mã Fire montage start offset/playRate/blend; screen-space chuyển động còn phụ thuộc camera và phối animation. Nếu runtime GGX17 chỉ đạt chuyển động lớn ở33–67ms, cần kiểm tra đồng hồ action và entry blend trước khi suy ra tốc độ source phải nhanh hơn. Không ép những số đo này vào thời điểm video khi chưa xác định đúng frame flash, action và camera.
