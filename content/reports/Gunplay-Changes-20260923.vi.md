# Vì sao cảm giác bắn chưa giống và những gì đã sửa

Bản cũ có model, clip, reload và logic bắn của từng khẩu, nhưng cách ghép chúng làm mất đặc tính của nguồn. Lượt này kiểm toán cơ chế trước, đo các đoạn video sau, rồi mới sửa runtime. Kết quả là bản cải tiến của **10 khẩu đang chơi được**, chưa phải khôi phục hoàn chỉnh cả 33 khẩu hoặc chứng nhận giống từng frame.

Mở [Gunfeel-Comparison.html (workspace)](../../references.html#local-e6dfa4fb33ab) để xem frame nguồn, thời gian lấy mẫu và capture Unreal. Chạy `Play-Showcase.cmd` để chơi bản đã sửa; cấu hình Showcase dùng nhịp và thời gian chuyển ADS ước lượng riêng cho video `bxMd6SvtJi8`.

## Sai lệch đã xác định

1. **Bỏ mất chuyển động ADS gốc.** Cả 10 `ADS_In` đều là animation chuyển tư thế, nhưng trước đây runtime giữ frame cuối rồi nội suy pose. Ví dụ AK74 có đoạn vượt nhẹ trước khi ổn định; Deagle có quỹ đạo xoay giữa clip khác hẳn hướng ở frame cuối. Nay runtime đi qua các key của own `ADS_In`, không nhân thêm một lớp alpha làm yếu chuyển động đó. Frame đầu khớp own idle trong 0,0051 cm ở xương kiểm tra. Chuyển súng xóa progress cũ; nhả/nhấn ADS giữa chừng giữ progress liên tục.
2. **Làm yếu cú giật đầu của source Fire.** Lớp action cũ có alpha 0,4 → 0,8 → 1 ở ba frame đầu tại 60 Hz. Trong video, pistol đã nâng mạnh trong 1–2 frame sau flash. Nay own Fire/AimFire nhận đúng trọng số ngay khi bắt đầu; clip gốc vẫn quyết định diễn biến chuyển động. Không tăng play rate để ép khớp một điểm ảnh.
3. **Hết ADS Fire lại trộn hip idle.** Clip action bị đổi sang hip idle khi alpha vẫn còn khoảng 0,77, gây một cú hụt rồi quay lại ngắm. Nay lớp fade giữ sample cuối của source action trước khi trả về lớp ADS. Khi bị ngắt, nó giữ đúng sample tại điểm ngắt; đổi súng xóa cache.
4. **Hai lớp chuyển động lệch một frame.** Fire phát từ tick weapon có source pose ngay nhưng procedural kick còn đợi actor tick tiếp theo. Nay kick được cập nhật trong cùng presentation tick, không chạy lại decay, bob hoặc ADS lần thứ hai và không xóa offset optic.
5. **KH2002 đổi mode nhưng không đổi tốc độ.** Nay SEMI dùng 518 RPM và BURST dùng 711 RPM theo bảng beta đã cung cấp. Đây là sửa áp dụng đúng bảng, không phải kết luận video showcase dùng đúng hai con số này.
6. **Recoil return sai ở giới hạn nhìn lên.** Nếu camera chỉ còn dịch được 0,1° trước trần pitch, hệ thống nay chỉ ghi 0,1° để hồi lại; không ghi toàn bộ impulse rồi kéo camera thấp hơn điểm xuất phát.
7. **Proxy nhận dữ liệu animation của frame trước.** UE gọi `Proxy::PreUpdate` trước `NativeUpdateAnimation`; việc chép ActionTime/AimTime trong PreUpdate khiến pose evaluate trễ dù telemetry clock đã mới. Nay graph nhận dữ liệu sau NativeUpdate, dùng explicit sequence evaluation cho các track được seek. Kiểm tra mới so transform `weapon_r` đã evaluate với transform của đúng source sample, không chỉ so biến thời gian.
8. **World zoom khi dùng iron chưa đúng tỷ lệ.** So hai vùng background độc lập cho thấy tỷ lệ phóng đại khoảng 1,27 ở pistol, 1,29 ở Vector, khoảng 1,30 ở phần lớn rifle; cấu hình cũ 94°→83,6° chỉ khoảng 1,20. Preset Showcase nay áp dụng tỷ lệ theo từng khẩu vào HipFOV của lab; không coi đó là FOV tuyệt đối gốc. Nhánh optic SKS 2× giữ riêng. Showcase mặc định chọn iron phù hợp các đoạn video này.

## Đặc tính từng khẩu và dữ liệu dùng trong bản này

Các thời gian ADS bên dưới là fit theo **chuyển động nhìn thấy**, có sai số quan sát khoảng ±5 frame tổng hợp. Chúng không cho biết độ trễ từ lúc người chơi bấm chuột. Mỗi khẩu vẫn dùng chính quỹ đạo animation của mình.

| Khẩu | Vai trò/chế độ đang có | RPM Showcase | ADS vào, giây | Điểm cần phân biệt |
|---|---|---:|---:|---|
| AK74 | Assault, Semi/Auto, 30 viên | ~650, đo audio | 0,267 | Quỹ đạo ADS có đoạn vượt nhẹ; own hip/ADS Fire và cơ khí riêng. |
| Vector / SUPER45 | SMG, Semi/Auto, 30 viên | ~1200, đo audio | 0,316 | Chu kỳ 50 ms, chỉ khoảng ba frame ở 60 Hz; giữ nhịp và sample theo tuổi shot. |
| M249 | LMG, Semi/Auto, 200 viên | ~850, đo audio | 0,683 | Đưa súng lên ngắm chậm rõ rệt hơn pistol/Vector; own belt-fed rig và reload. |
| SKS | Marksman, Semi, 10 viên | 416, bảng beta | 0,500 | Bắn từng phát, reload riêng; Inspect arms/mechanics có độ dài khác nhau và giữ clock riêng. |
| M1911 | Pistol, Semi, 7 viên | 470, bảng beta | 0,200 | Hip Fire xoay mạnh hơn GGX17; slide dùng `stockRelease_J`, không phải chỉ tìm `bolt_J`. |
| M4 | Assault, Semi/Auto, 30 viên | 827, bảng beta | 0,417 | Own FP/mechanical Fire. 800 RPM từ audio còn là ứng viên nên chưa thay bằng số đó. |
| GGX17 | Pistol, Semi, 17 viên | 524, bảng beta | 0,233 | Clip Fire 30 Hz, ngắn 0,833 s; không lấy số frame của Deagle để chỉnh nó. |
| Deagle | Pistol, Semi, 7 viên | 277, bảng beta | 0,233 | Own hip Fire mạnh nhất trong ba pistol đã đo; không còn lớp alpha đầu làm yếu nó. |
| MP5 | SMG, Semi/Auto, 30 viên | ~800, hai đoạn audio hip/ADS | 0,466 | Own FP Fire đã có; **chưa có mechanical Fire**, vẫn là own idle fallback. |
| KH2002 | Assault, Semi/Burst, 30 viên | 518 / 711, bảng beta | 0,384 | Rate riêng theo mode; số viên/burst và pause vẫn là chính sách study. |

Ví dụ từ xương `weapon_r` của source hip Fire ở khoảng 33 ms: GGX17 xoay 7,92°, M1911 15,50°, Deagle 34,25° so với đầu clip. Đây là chuyển động animation, **không phải** góc recoil camera, độ tản hoặc góc bay của đạn. Source hip và ADS có đường đi khác nhau; không căn chúng thay cho nhau.

## Những gì chưa được khôi phục chính xác

- Controller recoil, yaw randomness, hồi tâm, sway và kick procedural vẫn là tuning study; video không có input/mouse telemetry để phân biệt hoàn toàn recoil gốc với thao tác ghìm chuột. Không lấy projected pixels đổi trực tiếp thành recoil degrees.
- ADS ra đang đi ngược own ADS_In với cùng tốc độ đã chọn khi vào; đây là suy luận đối xứng, chưa phải native ADS_Out graph. Tỷ lệ world zoom có phép đo background và khoảng sai số; FOV tuyệt đối, FOV viewmodel và đồ thị zoom gốc vẫn chưa xác minh được.
- Sáu khẩu thêm vẫn có delivery hitscan từ importer, trong khi bốn khẩu đầu dùng projectile; tốc độ đạn, movement spread, sway khi thở và pattern chính xác chưa khôi phục. Không tự gán các giá trị đó rồi ghi là dữ liệu gốc.
- FireSound hiện dùng own Core; chưa tái tạo đầy đủ các layer, tail, mixer/MetaSound và âm học môi trường. Capture trong bộ đối chiếu này không ghi audio; số sound requests đúng không chứng minh âm thanh đúng.
- Muzzle vẫn là hiệu ứng study; chưa phải native particle graph. Skeleton, skinning, animation và mesh đúng không tự động làm shader, camera, VFX, sound hoặc gameplay graph đúng.
- Source archive local và build của video chưa được đối chiếu định danh chính xác. 23 khẩu còn lại chưa được tích hợp thành gameplay trong lượt này.

## Bằng chứng và cách kiểm tra lại

Build UE 5.8 thành công. Lượt gameplay cuối `19264A404A283AB56AED2895B3E1F0B5` đạt **539/539 kiểm tra**, tạo **82 ảnh**, xem [receipt (workspace)](../../references.html#local-810cc062aa87). Bao gồm bắn, đạn, reload, mode, vendor, sprint, ADS bị ngắt/đảo chiều và đổi súng. Lượt đầu đạt 538/539 vì kiểm tra cũ giả định Vector luôn gắn reflex; kiểm tra được sửa theo optic thực đã chọn, giữ các kiểm tra mesh/socket và iron/reflex loại trừ nhau, rồi chạy lại toàn bộ. [Receipt thất bại cũ (workspace)](../../references.html#local-e77d0f6377eb) được giữ nguyên để tra cứu.

Đợt capture cuối có **6 run, 34 tình huống, 2.946 PNG ở 60 Hz**, gồm hip single và chuyển ADS cho đủ 10 khẩu. [Audit runtime (workspace)](../../references.html#local-cedc45660cc0) đạt toàn bộ kiểm tra clock, cadence, pose và tính toàn vẹn PNG. **2.048 sample** full-weight so trực tiếp transform `weapon_r` đã evaluate với source tại cùng thời điểm: sai số lớn nhất 0,0000061 cm / 0,0000082°. Phép so này chỉ chứng minh pose xương đã nhập chạy đúng, không chứng minh camera hay pixel giống video.

[26/26 kiểm thử quy tắc (workspace)](../../references.html#local-c8ff9e2129eb) đạt. Trang [đối chiếu cuối (workspace)](../../references.html#local-e6dfa4fb33ab) có 8 cặp hip theo mốc flame, 10 cặp chuyển ADS và 3 đối chứng dùng endpoint trong cùng build. MP5/KH2002 chưa có mốc hip flame đủ rõ nên xem nguồn và runtime riêng. [Kiểm tra trang đối chiếu (workspace)](../../references.html#local-1994fbfbc10c) đã chạy JavaScript, kiểm bước frame và toàn bộ 5.004 đường dẫn PNG; chưa kiểm layout bằng browser. 5.004 PNG gồm ảnh nguồn và 2.946 ảnh runtime, không phải 5.004 frame gameplay mới.

Quan sát trực tiếp capture cuối: ở 0,2 s, M249 dùng đường ADS nguồn vẫn đang đưa súng lên, khác rõ endpoint control đã gần tư thế ngắm. Deagle ở khoảng 33 ms đã có cú nâng mạnh; ảnh nguồn vẫn khác ở flash, vỏ đạn, ánh sáng, camera và bối cảnh. Không dùng similarity toàn ảnh của hai bối cảnh khác nhau làm điểm số gunfeel.

- [Kiểm toán từng cơ chế trước sửa (workspace)](../../references.html#local-f3ecada382c8): input, cadence, layers, recoil, spread, audio và các lỗi có bằng chứng.
- [Nguồn riêng từng khẩu](Gunplay-WeaponEvidence-20260923.vi.md) và [JSON (workspace)](../../references.html#local-d1f6b7326a21): path, SHA, clip clocks, additive bases, quỹ đạo ADS và key Fire đầu.
- [Đo video (workspace)](../../references.html#local-de7cff47f5d7): native PTS, boundary frames, audio periodicity, sai số và vùng chưa xác định.
- `Config/ShowcaseHandling.json`: thời gian ADS vào được chọn, bounds và nguồn frame. `Config/ShowcaseCalibration.json`: chỉ nhịp đo đủ chắc được thay trong preset video.
- `Run-GunfeelValidation.ps1`: chạy các capture live bằng lệnh; kết quả có timestamp, shot count, clip thực được evaluate, alpha, progress ADS và kick thực/presented. `Scripts/audit_gunfeel_runtime.py` kiểm các invariant và coverage.

Kiểm tra chức năng và kiểm tra giống hình ảnh là hai việc riêng. Build/test PASS xác nhận sửa lỗi và đường chạy; trang đối chiếu cho thấy bằng chứng thị giác để đánh giá độ gần nguồn, không tự cấp nhãn “1:1”.
