# Gunplay theo video bxMd6SvtJi8

**Cập nhật gunfeel:** xem [phân tích/sửa lỗi](Gunplay-Changes-20260923.vi.md) và [đối chiếu live bắn/ADS (workspace)](../../references.html#local-e6dfa4fb33ab). Các receipt 479-check và pose-only phía dưới là lịch sử; phép kiểm mới bổ sung transform xương được evaluate ở đúng sample, thay vì chỉ kiểm clock metadata.

Bản mới nhất đạt **539/539 kiểm tra gameplay và 26/26 kiểm thử quy tắc**, với 82 ảnh gameplay và 2.946 frame gunfeel ở 60 Hz. [Receipt gameplay mới (workspace)](../../references.html#local-810cc062aa87) · [Audit gunfeel (workspace)](../../references.html#local-cedc45660cc0). Chỉ xác nhận các hành vi đã kiểm tra, chưa chứng nhận 1:1 với video.

Mục tiêu là đối chiếu hành động có thể chơi với hình và âm thanh nguồn. **Bản hiện tại chưa khớp từng frame cho toàn bộ 33 vũ khí.** Có 10 bộ súng đã tích hợp: AK74, SUPER-45/Vector, M249, SKS, M1911, M4, GGX-17, Deagle, MP5 và KH2002. [Bốn khẩu mở rộng (workspace)](../../references.html#local-30b9352badd4) có quy trình và giới hạn riêng. [Kiểm kê 33 vũ khí (workspace)](../../references.html#local-724267aa20dc) phân biệt những bộ đã chuẩn bị với 23 bộ mới có đường dẫn tài nguyên.

## Chạy bản chơi

Mở `WardogsAssetLab/Play-Showcase.cmd`. Launcher dùng level `L_VideoGameplay`, iron mặc định và preset nhịp bắn, thời gian ADS, tỷ lệ world zoom đo gần đúng từ video mới. `Play-VideoGameplay.cmd` giữ nhịp bắn từ bộ CSV beta và thời gian source ADS trước khi fit. Hai launcher dùng cùng gameplay và các asset đã import; preset chỉ chỉnh runtime, không ghi đè asset hay CSV.

| Điều khiển | Chức năng |
|---|---|
| 1 / 2 / 3 / 4 / 5 / 6 | AK74 / Vector / M249 / SKS / M1911 / M4 |
| Con lăn hoặc [ / ] | Chuyển qua toàn bộ 10 khẩu; vendor E có nút trang trước/sau |
| WASD, Shift, Space | Di chuyển, chạy nhanh, nhảy |
| Chuột trái / phải | Bắn / ngắm |
| R | Nạp đạn; SKS nạp từng viên |
| I | Inspect bằng clip tay và clip cơ khí của súng |
| B | Đổi chế độ của chính khẩu: semi/auto hoặc semi/burst; súng chỉ có semi giữ nguyên |
| E / Tab | Chọn trang bị / ba lô |
| C | Dồn đạn vào băng; không áp dụng cho băng trong SKS |

Đạn, loại đạn và optic được lưu theo từng ô súng. UI lấy danh sách từ arsenal; M1911/M4 đã có icon súng nguồn và M1911 có icon băng đạn riêng. Tài nguyên chưa có icon đã xác minh dùng nhãn chữ.

## Những thay đổi có căn cứ

- **Inspect khác reload.** Phần đầu nhiều đoạn showcase là xem băng đạn, bolt và thân súng. Runtime có hành động Inspect riêng, không tiêu đạn, có thể bị bắn/ngắm/chạy/nạp/đổi súng ngắt. M1911 không có mechanical Inspect riêng trong bộ nguồn tìm được: tay phát Inspect, cơ khí giữ own-idle; đây là fallback được ghi rõ.
- **Khẩu mới có rig và âm thanh riêng.** M1911 và M4 được ghép từ nhánh Mutable của chính chúng. M1911 dùng magazine có identity nguồn `Items.Magazine.M1911.Standard`, không suy đoán rằng số MAGZ phải trùng số WEPN. Reload lấy Foley của khẩu tương ứng, không rơi về bộ AK74.
- **M4 dùng biến thể nhìn thấy trong video.** Thay bộ rail ban đầu bằng ốp tay tròn `HNGD_050` và bộ tay xách/đầu ngắm `IRNS_006`. Giữ nguyên 42 xương, clip, carry, socket và audio; bộ mới được kiểm 54 điều kiện khi nhập. [Geometry và provenance M4 (workspace)](../../references.html#local-32c26b228b33). Icon M1911/M4 và băng M1911 cũng dùng texture nguồn, có 18 kiểm tra nhập riêng.
- **Hết đạn là một trạng thái trình diễn.** Phát cuối chọn mechanical last-shot; sau đó idle dùng clip empty của cùng khẩu khi nguồn có. Geometry nguồn và bản nhập M1911 xác nhận nhóm slide `stockRelease_J` (2.719 đỉnh) lùi khoảng 6,10 cm. Tên chung `bolt_J` không đại diện cho slide của khẩu này; ảnh từ một góc hip chưa đủ chứng minh toàn bộ trạng thái nhìn thấy đã khớp video.
- **Không kéo giãn Inspect của SKS.** Tay dài 14.166667 s, cơ khí dài 13.833333 s. Cả hai lấy mẫu theo giây đã trôi qua; clip ngắn giữ frame cuối, không bị ép về cùng phần trăm tiến độ.
- **Đi/chạy dùng lớp chuyển động theo họ súng.** M1911 dùng family Pistol, M4 dùng family AssaultRifle, ghép lên idle của chính khẩu. Carry stance lấy từ điểm cuối Sprint_In và kiểm tra với đầu Sprint_Out; giữ bone camera/root. Đây là phép ghép phục vụ bản học tập, chưa khôi phục toàn graph runtime gốc. [Chứng cứ locomotion (workspace)](../../references.html#local-e149619010c2).
- **Preset theo âm thanh video.** AK74 khoảng 650 RPM, Vector khoảng 1.200 RPM, M249 khoảng 850 RPM; các nhịp này khác CSV beta. Phân tích dùng chuỗi onset và autocorrelation của các burst. Đây là số làm tròn đo từ video, không phải hằng số gameplay đã giải mã. SKS/M1911/M4 chưa được đổi nhịp theo phép đo này.
- **Vector cần hai đầu ngắm thật.** Tắt reflex để lộ rail trống chưa phải bộ iron sight. Nhánh Mutable có `Id.Item.MBUSIronSights`; hai phần native dùng `frontSight_Attach` và `sight_Attach`. Cách đặt được suy từ bind pose. So hình nguồn tại 254,133 s và 263,550 s cho thấy cấu trúc trụ trước, khe ngắm sau và chân gá phù hợp; đây là đối chiếu hình dạng, không phải dữ liệu loadout của người quay.

## Cách kiểm tra độ giống

[Mở đối chiếu frame (workspace)](../../references.html#local-fe8cc5d22e16). Trang có ảnh nguồn PNG, ảnh render Unreal, bước từng frame, chạy đồng bộ, alpha overlay và offset có thể điều chỉnh. File nguồn là 1920×1080/60 FPS; baseline engine 960×540 lấy mẫu ở 60 Hz. PTS của WebM được giữ lại, không tạo frame nội suy để có vẻ khớp.

Baseline gồm 6 đoạn: AK74 tactical/empty, Vector tactical/empty, M249 empty và pha mở đầu SKS empty. Tổng 1.416 frame engine. Mốc quan sát có sai số ±2–3 frame; chúng là thời điểm nhìn thấy chuyển động, không phải thời điểm người quay nhấn R. [Mốc và giới hạn phép đo (workspace)](../../references.html#local-4fa76850798f).

Đợt `DF484E1044625FF06AE6CDBC55E8A86C` bổ sung **1.152 frame**, gồm reload rỗng M1911, M4, GGX-17, Deagle, MP5 và KH2002. [Receipt sáu đoạn mới (workspace)](../../references.html#local-2e29063967e3) giữ thời gian riêng của tay/cơ khí và yêu cầu gốc của từng case. Điểm bắt đầu lần lượt là 20,033 / 341,834 / 50,100 / 110,267 / 221,017 / 548,217 giây trong video, sai số ±2–3 frame. Toàn bộ chạy ở tốc độ clip 1,0; camera 94° và viewmodel 85° là cấu hình chẩn đoán chưa hiệu chỉnh theo video.

M4 minh họa vì sao phải phân biệt **thời gian chuyển động nhìn thấy** với **độ dài clip**: video nhìn như đã về tư thế sẵn sàng khoảng 344,934 s (khoảng 3,1 s sau onset), nhưng clip nguồn dài 3,666667 s. Render clip cũng đã gần tư thế hip ở tuổi 3,1 s và còn phần đuôi ổn định. Chênh hai con số này tự nó không chứng minh sai tốc độ; chưa được dùng để kéo nhanh animation hoặc thay reload timer.

Capture này lấy mẫu trực tiếp animation, giữ camera để kiểm tra pose. Nó không chạy recoil, âm thanh, input hay blend gameplay. Vì vậy, PASS ở receipt chỉ chứng minh capture thực hiện được; không chứng nhận cảm giác bắn hoặc độ khớp hình ảnh 1:1. Kiểm thử gameplay chạy riêng với input, đạn, các hành động và UI.

Lần kiểm thử gameplay mười khẩu trước đợt sửa gunfeel `113C4B814DC8B1B5BD3ED7970E58409A` đạt **479/479 kiểm tra**, tạo **82 ảnh**, sau khi áp dụng material M1911/Deagle và bổ sung code camera tùy chọn. Lượt này dùng camera mặc định. Kiểm tra gồm chế độ bắn riêng, chuyển khẩu giữ đạn, trạng thái empty, sprint, ADS, reload và vendor hai trang. Receipt bất biến: [runtime-ten-pbr (workspace)](../../references.html#local-24db29627f85). **21/21 kiểm thử quy tắc** đạt trong [automation21 (workspace)](../../references.html#local-7f02cfd765ab). Những PASS này xác nhận hành vi được kiểm tra, chưa xác nhận độ giống video.

Lượt trước PBR `DFD352F648ED2CE1570B4A8FD0D868E8` cũng đạt 479/479 và được giữ riêng. Hai case reload M1911/Deagle hiện dùng ảnh mới từ `611CF533430DD72D9806EE99F1BC3751`; [A/B material (workspace)](../../references.html#local-3e49edf8c1d1) giữ cả 327 ảnh trước và 327 ảnh sau để kiểm tra thay đổi mà không thay camera hay timing.

Receipt sáu khẩu trước đó `4D67D6C54D2801A15E8D8CAB357128A5` (288/288, 56 ảnh) được giữ làm lịch sử sau sửa tick, M4 và reload audio. Bản đối chiếu dùng thêm 423 frame Vector từ lần `BEF08F2B42C16E45CC3267B751EFD5DB` sau khi lắp iron sights; bốn đoạn không thay đổi giữ nguyên receipt baseline. Smoke hai frame xác nhận probe pose giữ đúng thời gian animation sau thay đổi tick. Các lượt này không xác nhận các vũ khí chưa tích hợp.

**Lịch sự kiện gốc không nằm đầy đủ trong clip UEANIM.** [Điều tra montage (workspace)](../../references.html#local-d07a5afced61) tìm được 155 notify trong 28 montage nguồn, trong khi các sequence đã kiểm tra không mang lịch đó. Với reload rỗng M1911/M4, mỗi export notify có một tag Stage1/2/3 duy nhất; preset Showcase dùng các mốc dưới đây khi thời lượng clip khớp. WAV A/B/C của chính khẩu được ghép theo tên MagOut/MagIn/Chamber: đây là suy luận có chứng cứ, chưa khôi phục routing, random, gain hay mix MetaSound gốc. Những hành động khác giữ lịch Foley nghiên cứu hiện có.

| Reload rỗng | Stage 1 | Stage 2 | Stage 3 | Thời lượng clip nguồn |
|---|---:|---:|---:|---:|
| M1911 | 0,000000 s | 0,758828 s | 1,388722 s | 2,250000 s |
| M4 | 0,000000 s | 0,988347 s | 1,913533 s | 3,666667 s |

Các mốc dùng thời gian tuyệt đối của action, không ép về 0 / 0,5 / 0,85. Hủy reload dừng sự kiện đang chờ và âm đang phát. Clip khác độ dài, reload tactical và súng khác không tự mượn lịch này. Cấu hình cùng hash/tag/nguồn WAV nằm trong `Config/ShowcaseReloadAudio.json`, tái tạo bằng `Scripts/prepare_showcase_reload_audio_config.py`.

Không lấy thời gian thấy súng về hip để thay reload timer ngay: frame đầu có thể đã ở trong blend, còn SKS trong video được bắn ngắt trước khi clip kết thúc. Cũng không lấy camera trong video làm recoil gốc khi chưa tách được thao tác chuột của người quay.

## Kiểm tra phát bắn trong runtime

Lượt live đầu tiên phát hiện `WeaponComponent` cập nhật phát bắn sau tick trình diễn: đạn và recoil đổi nhưng animation tay/cơ khí còn dùng tuổi phát trước. Bản sửa đặt thứ tự **owner/input → weapon → trình diễn súng → mesh**, đồng thời cập nhật ánh sáng đầu nòng sau phát bắn. Không thay thứ tự tính sprint bằng cách đưa toàn bộ actor ra sau weapon.

Lượt sau sửa `C643CBEB4FB9E2BA016592B601ED9791` có 360 frame liên tiếp tại timestep 1/60 s, không thiếu frame: AK74 22 phát, Vector 30 phát rồi hết băng, M249 29 phát trong cửa sổ giữ cò 2 s mỗi khẩu. Cả 81 phát đều có tuổi animation đúng trong cùng frame và ánh sáng đầu nòng hoạt động. Đây là kiểm tra tính đồng bộ của Lab, không phải số đo sai số giữa Lab và video WARDOGS.

`Run-RuntimeBurst.ps1` ghi input giữ cò thật, recoil, control rotation, clip/action time, số đạn và timestamp engine. [Ba video xem nhanh (workspace)](../../references.html#local-adc1448c4dc2) được mã hóa từ chính các frame liên tục; không nội suy và **không có âm thanh**. PNG gốc và telemetry vẫn là chứng cứ chính. Trang đối chiếu giữ riêng ba case bắn runtime và sáu case lấy mẫu pose; mốc nguồn là flash nhìn thấy đầu tiên, có sai số ±1 frame, không phải thời điểm nhấn chuột.

## Quy trình có thể chạy lại

1. Nguồn và hash nằm trong `WardogsPorting/research/gameplay/bxMd6SvtJi8/`. `prepare_showcase_weapon_sources.py` kiểm tra archive/mapping, xuất primitive và giải quyết base pose; các role thiếu hoặc mơ hồ phải báo lỗi.
2. Build native project bằng `Run-VideoGameplay.ps1 -Stage Build` khi Editor đã đóng.
3. Trong commandlet Python của project, chạy theo thứ tự `prepare_showcase_weapons.py`, `prepare_showcase_inspect.py`, `prepare_showcase_locomotion.py`, `prepare_showcase_vector_irons.py`, `prepare_showcase_m4_variant.py`, `prepare_showcase_icons.py`. Các importer kiểm tra SHA, skeleton, số key, thời lượng và mesh trước khi gán profile. Chạy lại importer weapons sẽ gán sprint loop cơ bản; cần chạy lại locomotion sau nó để giữ carry stance. `prepare_showcase_reload_audio_config.py` chạy bằng Python thường để tái tạo cấu hình mốc âm thanh từ notify đã xuất.
4. `Run-VideoGameplay.ps1 -Stage Test` chạy kiểm thử quy tắc. `-Stage Capture -ShowcaseReference` chạy kiểm thử gameplay và chụp ảnh offscreen.
5. `Run-ShowcaseCapture.ps1 -Config Config/ShowcaseCapture.measured.json` lấy mẫu pose cho các mốc đã quan sát. `Scripts/publish_showcase_comparison.py` đóng gói ảnh và các receipt cho trang đối chiếu.

## Khoảng cách còn lại

Hai cải tiến đã được kiểm riêng sau lượt mở rộng: [PBR cho M1911/Deagle (workspace)](../../references.html#local-3e49edf8c1d1) dùng texture nguồn để sửa bề mặt trắng phẳng, với 327 frame trước/sau giữ nguyên camera và thời gian; [CameraBone tùy chọn (workspace)](../../references.html#local-9ddadbab9d4b) đạt 21 kiểm thử quy tắc và sáu case native tắt/bật không đổi ray bắn hoặc transform tay. `Play-ShowcaseCameraStudy.cmd` cho phép chơi thử camera này. Cả ánh xạ kênh PBR lẫn cách phối CameraBone còn là cách tái tạo được ghi rõ, không phải shader/camera graph gốc đã phục hồi.

23 bộ súng chưa có vòng gameplay đã kiểm chứng. Toàn bộ recoil/độ tản, chuyển động camera, ADS, sự kiện âm thanh và notify chưa khớp từng frame với video. Áo tay, vật liệu kim loại, ánh sáng và một số biến thể phụ kiện còn khác. Capture baseline đã chỉ ra các lỗi cụ thể này; không dùng số lượng asset hoặc số test PASS để thay cho việc kiểm tra trực quan.

Với mỗi khẩu còn lại, phải hoàn thành cả chuỗi: xác định cấu hình trong video → rig/mesh đúng → cặp tay/cơ khí đúng → base pose/timing đúng → trạng thái gameplay → âm thanh/feedback → đối chiếu frame. Chỉ xuất thêm mesh hoặc gán chung animation sẽ không đạt mục tiêu này.
