# Quy trình tái tạo cảm giác bắn cho một khẩu súng

Quy trình này dùng lại cách điều tra đã sửa AK74: xác định điều người chơi nhìn thấy, tách các nguyên nhân, đo, thay một nhóm biến, rồi chơi kiểm chứng. **Không sao chép hệ số HIP 0,45 và blend 60 ms của AK74 sang súng khác.** Những số đó hiệu chỉnh một tổ hợp asset, camera và animation cụ thể. Khẩu mới có thể cần phép ghép khác, hoặc không cần giảm biên độ.

Mục tiêu đầu tiên là hoàn thành một khẩu với HIP, ADS, bắn đơn, giữ cò, hết đạn và reload. Sau đó mới mở rộng sang khẩu tiếp theo. Dùng [phiếu công việc](04-Weapon-Worksheet.template.vi.md) để không quên nguồn tham khảo và giới hạn kết luận.

## 1. Chốt đối tượng sẽ sao chép

Ghi tên súng, phiên bản video, phụ kiện, băng đạn, chế độ bắn và trạng thái người chơi. Một khẩu cùng tên nhưng dùng optic hoặc animation khác đã là một ca khác.

Chọn một đoạn ngắn có thể quan sát rõ. Đừng bắt đầu bằng yêu cầu “mọi khẩu giống toàn bộ game”. Với khẩu tự động, bộ tham khảo tối thiểu gồm đứng yên HIP một viên, HIP liên thanh, ADS một viên, ADS liên thanh, vào/ra ADS, tactical reload và empty reload. Thêm đi/chạy sau khi các ca đứng yên ổn định.

**Đầu ra:** danh sách đoạn video với timestamp, FPS/PTS, kích thước ảnh và hash file. Ghi riêng phần không nhìn thấy. Không có input overlay thì chưa biết thời điểm bấm chuột; chỉ biết thời điểm phản ứng xuất hiện.

## 2. Lập bảng bằng chứng trước khi viết code

Mỗi dữ liệu phải có một nhãn:

| Nhãn | Ví dụ | Cách sử dụng |
|---|---|---|
| Asset nguồn đã đọc | Key animation, mesh, skin weight, notify giải mã được | Giữ nguyên và kiểm tra khi import |
| Đo từ video/audio | Chu kỳ tiếng bắn, đường di chuyển thước ngắm | Ghi cửa sổ đo và sai số |
| Nguồn cộng đồng | Damage, RPM từ CSV beta | Giữ định danh phiên bản; không gộp với build video |
| Lựa chọn tái tạo | Blend HIP, fallback khi thiếu clip | Nêu rõ mục đích và phép kiểm chứng |
| Chưa biết | Native recoil graph, input chuột nguồn | Để trống; không điền bằng phỏng đoán rồi gọi là native |

**Cổng kiểm tra:** người khác đọc bảng phải phân biệt được “game gốc có dữ liệu này” với “lab chọn giá trị này”. Xem mẫu [kiểm toán từng súng](../reports/Gunplay-WeaponEvidence-20260923.vi.md); báo cáo đó là snapshot lịch sử, cần đối chiếu các bản sửa AK74 mới hơn.

## 3. Dựng đúng tài nguyên và hệ tọa độ

Tập hợp arms mesh, weapon mesh, skeleton, material, các bộ phận, socket và cặp animation tay/cơ khí. Kiểm tra idle, fire, aim fire, reload, empty reload, equip, inspect và last-round nếu có. Không kết luận súng thiếu animation chỉ vì model ban đầu là static mesh: phải lần tới dữ liệu lắp ráp, rig và skin weight đã phục hồi.

Mở từng clip tại đầu, giữa và cuối. Kiểm tra tay nắm đúng, magazine/bolt chuyển động đúng, phụ tùng dự phòng có bị hiện nhầm không. Ghi rõ base pose của additive. Một clip đã bake trên hip idle không được dùng như pose tuyệt đối để đè lên ADS.

**Cổng kiểm tra:** transform xương đã evaluate phải khớp phép ghép dự kiến; hình súng nhìn được và không rời tay. Clip thiếu phải có fallback được ghi tên. Trong bộ hiện tại, MP5 thiếu mechanical fire đã gán: own mechanical idle là fallback, không phải bolt gốc đã được tái tạo.

## 4. Khóa máy quay trước khi chỉnh recoil

Chốt độ phân giải, tỷ lệ màn hình, world FOV, viewmodel FOV, vị trí tay, optic và pose idle. Camera nhìn thế giới và phép chiếu tay/súng là hai phần cần kiểm riêng.

So nền khi HIP→ADS để ước lượng tỷ lệ zoom; so silhouette súng để căn viewmodel. Không phóng cả ảnh đến khi súng vừa mắt rồi gọi là đúng camera. Giữ bảng hiệu chỉnh này cố định trong một lượt so sánh; đổi FOV sẽ thay đổi số pixel của cùng một chuyển động.

**Đầu ra:** ảnh idle HIP/ADS và thông số camera của lab. Nếu không biết FOV gốc, ghi “tỷ lệ zoom đo được, FOV tuyệt đối chưa xác nhận”.

## 5. Sửa lịch bắn và trạng thái trước khi sửa hình

Xác định trigger press/release, semi/auto/burst, cooldown, ammo, sprint và reload. Một phát phải có một định danh và một mốc thời gian logic. Animation, âm thanh và hiệu ứng dùng sự kiện đó; không để mỗi thành phần tự đoán khi nào súng bắn.

Với RPM, khoảng cách dự kiến là `60 / RPM` giây. Ví dụ AK74 hiện dùng khoảng 92,31 ms. Ở 60 FPS khoảng đó không phải số frame nguyên: phải giữ lịch thời gian và tuổi shot, không ép cứ sáu frame mới bắn một phát.

**Cổng kiểm tra:** đếm đủ phát, trừ đúng đạn, đổi fire mode giữ cooldown hợp lệ; nhả cò, đổi súng và mở menu dừng hành vi đúng. Không dùng độ dài Fire sequence làm chu kỳ bắn. Giữ cả scheduled time và actual dispatch time để thấy giới hạn tick.

## 6. Ghi baseline gameplay thật

Dùng cùng input, seed, vị trí, vũ khí, phụ kiện và bước thời gian cho bản trước/sau. Ghi PNG cùng telemetry: shot index, ammo, clip/time/weight thực, transform xương thực, ADS progress, camera, aim ray và muzzle. Biến `ActionTime` đúng chưa chứng minh pose đang render đúng; AK74 đã từng lệch một frame vì thứ tự cập nhật proxy.

Đường chạy hiện có:

```powershell
# Chạy từ WardogsAssetLab
.\Run-VideoGameplay.ps1 -Stage Build
.\Run-VideoGameplay.ps1 -Stage Test
.\Run-RuntimeBurst.ps1 -Config .\Config\AK74Focus.json -ShowcaseReference
```

Lệnh cuối là **bộ AK74 đang có**, không tự tạo bài test cho khẩu bất kỳ. Với súng mới, tạo config ca đo từ schema mà probe hiện đọc và kiểm tra asset/profile được chọn. Khi cần thêm telemetry hoặc ca chưa được probe hỗ trợ, phải phát triển công cụ trước; không ghi rằng hệ thống đã đo chúng.

## 7. Tách và đo các chuyển động

Lấy frame phản ứng bắn đầu tiên làm mốc quan sát và ghi bất định. Không dịch timeline riêng từng đoạn để che lỗi. Giữ frame trước trigger nếu capture lab hỗ trợ; video nguồn có thể không cho biết bước dịch trước flash.

| Vùng đo | Điều muốn biết |
|---|---|
| Nền đứng yên | Chuyển động camera tổng hợp |
| Thân súng/thước ngắm sau | Dịch chuyển, xoay, thay đổi kích thước viewmodel |
| Đầu ruồi | Quỹ đạo đầu nòng mà người chơi cảm thấy rung |
| Magazine, bolt, slide | Cơ khí và thứ tự hành động |
| Flash, HUD và âm bắn | Thời điểm phản hồi quanh mỗi shot |

Theo dõi vị trí, độ lệch từng frame và sai lệch quỹ đạo trong cùng cửa sổ. Kiểm tra độ tin cậy của tracker bằng ảnh. Feature bị khói/flash che hoặc trôi khỏi đầu ruồi thì loại mẫu hoặc đổi phương pháp, không giữ điểm số vì nó trông đẹp.

**Cổng kiểm tra:** báo cáo phải chỉ được vùng ảnh và frame gây sai. Điểm toàn ảnh giữa hai map khác nhau không phải thước đo gunfeel.

## 8. Hiệu chỉnh từng lớp có đối chứng

Thứ tự thực hành: base pose → ADS trajectory → clock → viewmodel fire → camera recoil → sway/bob → audio/VFX → hit feedback. Chỉ chuyển bước khi không còn lỗi cấu trúc rõ ràng ở bước trước.

Tạo vài ứng viên nhỏ, mỗi ứng viên đổi một nhóm biến. AK74 HIP đã so biên độ và thời gian nối pose; thử giảm rotation riêng nhưng không chọn vì không cải thiện chắc chắn tổng thể. Giữ bản thất bại cùng lý do loại bỏ để không lặp lại thử nghiệm.

**Cổng kiểm tra:** ứng viên vừa gần nguồn theo phép đo, vừa không hỏng ca đã chấp nhận. “Rung ít hơn” không tự động là “giống hơn”: nguồn vẫn có chuyển động có nhịp.

## 9. Hoàn thiện những phần ngoài recoil

| Phần | Công việc và tiêu chí |
|---|---|
| Input | Kiểm press, hold, release, click nhanh, focus/menu; đo click→shot chỉ khi có timestamp input. |
| ADS | Quỹ đạo đưa lên/hạ xuống, zoom, độ nhạy, ngắt và đảo chiều giữa chừng; tách pose khỏi thời điểm được bắn chính xác. |
| Reload | Tách tactical/empty, thời điểm thay ammo, thời điểm sẵn sàng bắn, foley và khả năng hủy; SKS cần open/insert/close. |
| Cơ khí | Last-round, empty idle, bolt/slide, magazine visibility; không chỉ xem arms đẹp. |
| Locomotion | Đi, strafe, crouch, sprint, dừng chạy rồi bắn, nhảy/tiếp đất; đo bob, sway và hạn chế hành động riêng. |
| Đường đạn | Phân biệt aim ray, muzzle, spread, projectile; test vật cản gần và mục tiêu xa. Chưa có native velocity thì giữ nhãn study. |
| Damage | Zone, loại đạn, armor, STK/TTK; video showcase bắn vào không khí không đủ kiểm phần này. |
| Audio | Ghi âm thật; kiểm onset, biến thể, overlap, tail, tiếng cơ khí và môi trường. Request count không chứng minh đã nghe đúng. |
| VFX | Flash, smoke, shell ejection, tracer, impact; kiểm số lần phát, độ trễ, vị trí và che khuất ADS. |
| HUD | Ammo, magazine, fire mode, hit marker, reload feedback phải lấy trạng thái gameplay thật. |

Multiplayer là một giai đoạn khác: cần authority, prediction, reconciliation, timestamp shot, lag compensation và kiểm độ trễ. Lab hiện là single-player; không được coi FPS capture offline là bằng chứng mạng đã đúng. Haptics, aim assist, xuyên vật liệu và acoustic routing cũng cần task/bằng chứng riêng nếu muốn bổ sung.

## 10. Mở rộng theo đặc tính từng khẩu

Cả mười khẩu dưới đây đã có profile chơi được. **Chỉ AK74 HIP/ADS có vòng hiệu chỉnh sâu và đã được người dùng chấp nhận ở hiện tại.** Bảng là ưu tiên điều tra tiếp, không cấp nhãn fidelity cho chín khẩu còn lại.

| Khẩu | Điều cần giữ riêng khi áp dụng quy trình |
|---|---|
| AK74 | Giữ baseline đã chấp nhận; mở rộng locomotion/audio/VFX mà không đổi HIP/ADS tùy tiện. |
| Vector | Cadence nhanh; tuổi shot, handoff và âm liên thanh phải kiểm ở nhiều FPS. |
| M249 | ADS nặng/chậm, reload dây đạn dài; kiểm tay, cover, belt và các pha reload. |
| SKS | Semi và nạp từng viên; không dùng transaction thay băng cho open/insert/close. |
| M1911 | Cú nâng pistol, last-round/slide-lock; xác minh đúng xương cơ khí thay vì đoán theo tên. |
| M4 | Tách curve riêng khỏi AK74; own ADS/fire/reload và nhịp video cần đo riêng. |
| GGX17 | Fire nguồn có key 30 Hz; nội suy không tạo thêm bằng chứng về chuyển động gốc. |
| Deagle | Biên độ pistol lớn; đỉnh muzzle, recovery và thời điểm được bắn lại là các đại lượng khác nhau. |
| MP5 | Bổ sung/ghi rõ mechanical fire thiếu; không chỉnh tay để che bộ phận đứng yên. |
| KH2002 | Semi/Burst có cadence khác; kiểm số viên, pause và hành vi khi nhả cò giữa burst. |

Catalog showcase còn **23 khẩu chưa tích hợp vào bộ mười**. Súng shotgun cần pellet/pump/per-shell; bolt-action cần chu kỳ bolt, chamber và scope; launcher cần projectile/fuse/explosion; bow cần charge/release. Đây là danh sách câu hỏi triển khai, không khẳng định mọi cơ chế ấy đã giải mã trong Wardogs. Xác nhận từng tên, variant và asset trước khi tạo profile.

## 11. Nghiệm thu và đóng gói

Kiểm tối thiểu bắn đơn, giữ cò, hết băng, dry trigger, reload hai loại, ngắt reload, HIP↔ADS khi bắn, đổi súng/menu, sprint→fire và mục tiêu gần/xa. Lặp logic timing ở 30/60/120 hoặc 144 FPS theo khả năng công cụ; so video dùng đúng FPS nguồn. Kiểm hiệu năng/loading vì một lần hitch lúc chọn súng cũng phá cảm giác đáp ứng.

Giữ ba loại kết luận tách biệt: test logic đạt; hình/âm gần reference trong cửa sổ đã đo; người dùng chơi thấy ổn. Cả ba bổ sung cho nhau. AK74 hiện đáp ứng phần người dùng đã thử, nhưng báo cáo vẫn giữ sai lệch còn lại thay vì đổi nhãn thành bản sao 1:1.

**Gói bàn giao:** level test, launcher, profile/config, bảng nguồn, manifest capture, trang trước/sau, receipt test, hướng dẫn điều khiển và danh sách chưa biết. Khi sửa tiếp, lấy gói này làm baseline. Dùng chung quy trình và hạ tầng; giữ đặc tính mỗi khẩu trong dữ liệu riêng có nguồn gốc rõ ràng.
