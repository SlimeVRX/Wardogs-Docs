# Nền tảng Gun Gameplay: từ quyết định của người chơi đến cảm giác trên màn hình

Tài liệu này là khung kiến thức để bạn tự phân tích, làm và kiểm tra một hệ thống súng. Những phần ghi **đề xuất** là hướng thiết kế hoặc bài tập, không phải chức năng vừa được bổ sung vào WardogsAssetLab. Các cơ chế giải thích dưới đây cũng không mặc nhiên là cơ chế gốc của WARDOGS.

Bạn làm tốt logic là một lợi thế: cảm giác bắn có thể được chia thành những quan hệ, đồng hồ, trạng thái và tín hiệu kiểm chứng được. Phần art không chỉ là chọn mesh đẹp. Nó là cách làm cho người chơi nhìn, nghe và hiểu cùng một sự kiện gameplay vào đúng thời điểm.

## 1. Gunplay, gunfeel và lý do muốn bắn thêm một lần

**Gunplay** là toàn bộ hoạt động chiến đấu bằng súng: phát hiện mục tiêu, chọn vị trí, ngắm, bắn, di chuyển, thay đạn, chọn súng và sử dụng lợi thế của nó. **Gunfeel** là cảm giác khi điều khiển các hoạt động ấy: nhanh hay chậm, chắc hay lỏng, dễ đoán hay hỗn loạn, có sức nặng hay nhẹ bẫng. Một animation bắn đẹp chỉ đóng góp vào một phần của hệ thống.

Đề xuất bốn tiêu chí để đánh giá thiết kế của bạn:

| Tiêu chí | Người chơi cần cảm nhận được | Ví dụ kiểm tra |
|---|---|---|
| Chủ động | Tôi làm X thì game phản hồi X | Nhấn bắn có phát bắn ngay khi luật cho phép; không bị animation nuốt input vô cớ. |
| Hiểu được | Tôi biết vì sao trúng, trượt hoặc chưa bắn được | Hết đạn khác đang nạp, trúng giáp khác trúng thịt. |
| Học được | Tôi tiến bộ khi hiểu nhịp và luyện thao tác | Biết ngắt burst, ghìm tâm, chọn thời điểm reload có ích. |
| Có lựa chọn | Khẩu súng này có lý do để tồn tại | Súng nhanh, nhẹ đổi lấy gì; súng chậm, mạnh đem lại gì? |

Một khẩu súng không cần rung mạnh để có sức nặng. Âm thanh có lực, thời gian đưa lên ngắm hợp lý, cú trúng rõ và nhịp hồi nhất quán có thể tạo cảm giác nặng ngay cả với chuyển động nhỏ. Ngược lại, rung nhiều có thể làm người chơi mất khả năng đọc mục tiêu và thấy mình không kiểm soát được.

## 2. Chuỗi nguyên nhân của một phát bắn

```text
Input của người chơi
  → kiểm tra trạng thái: được bắn chưa, có đạn không, mode nào?
  → tạo sự kiện phát bắn: ID, thời gian, hướng ngắm, seed
  ├→ mô phỏng đạn → va chạm → damage/giáp → kết quả
  ├→ animation tay và cơ khí súng
  ├→ recoil ảnh hưởng điều khiển / chuyển động trình bày
  ├→ âm thanh, flash, khói, vỏ đạn
  └→ HUD và phản hồi có liên quan
Kết quả được xác nhận → hit feedback → người chơi quyết định tiếp
```

Đây là **kiến trúc đề xuất**, không phải một class sự kiện đã tồn tại đầy đủ trong lab. Điểm quan trọng là các nhánh phải nói về cùng một phát bắn. Không để animation tự sinh một viên, timer tự sinh thêm một viên, còn sound chạy theo một timer thứ ba.

Một sự kiện shot nên có ít nhất: súng nào, chỉ số phát, thời điểm theo simulation, mode HIP/ADS lúc bắn, origin/hướng ngắm gameplay và seed nếu có random. Nhánh hình ảnh có thể đánh giá pose theo tuổi của shot; nhánh damage không phải đợi muzzle flash render xong mới quyết định viên đạn có tồn tại.

Không nhất thiết mọi tín hiệu đều có độ trễ bằng 0. Một hoạt ảnh cò/búa có thể có bước chuẩn bị có chủ ý. Điều cần thiết là xác định rõ **mốc discharge** và đo các độ trễ so với mốc ấy, thay vì để chúng xuất hiện ngẫu nhiên do thứ tự tick.

## 3. Bốn hướng khác nhau thường bị gọi chung là “tâm súng”

| Đại lượng | Là gì? | Sai lầm thường gặp |
|---|---|---|
| Hướng người chơi muốn ngắm | Input chuột/controller đã qua mapping | Đọc thay đổi góc do recoil như input chuột rồi tạo thêm sway. |
| Hướng ngắm dùng cho gameplay | Hướng trước khi lấy mẫu spread; có thể chứa aim recoil | Dùng camera đã rung trang trí mà không chủ ý, khiến đạn rung theo. |
| Hướng nhìn đang render | Camera/FOV và các lớp trình bày cuối cùng | Cho rằng mọi rung hình ảnh đều phải đổi hướng đạn. |
| Trục mesh/muzzle đang render | Hướng nòng trong bộ tay–súng | Đồng nhất mesh với đường đạn dù viewmodel dùng projection riêng. |

Bạn phải viết một “hợp đồng”: lớp nào được phép đổi hướng đạn, lớp nào chỉ biểu diễn cảm giác. Không có quy tắc mọi game phải giống nhau. Chẳng hạn, có game cho sway làm lệch hướng ngắm thật; game khác chỉ cho tay lắc trong một giới hạn. HUD, animation và hit phải nhất quán với lựa chọn đó.

Lab đã có đường `GetUnshakenWeaponAimView` để phân biệt aim và presentation. Điều đó **không** tự chứng minh mọi camera effect trong toàn dự án đã độc lập khỏi aim. Khi thêm effect, kiểm tra đường lấy hướng thực ở [WardogsWeaponComponent.cpp (workspace)](../../references.html#local-3e41113eb56a).

## 4. Nhịp bắn, độ trễ input và thứ tự cập nhật

Nhịp theo RPM được đổi sang giây bằng `T = 60 / RPM`. AK74 đang dùng 650 RPM, nên `T ≈ 0,09231 s`. Ở 60 FPS, một frame dài khoảng 16,67 ms; một chu kỳ AK74 dài 5,538 frame. Do đó không thể ép mọi phát cách nhau đúng 5 hay đúng 6 frame mà vẫn giữ nhịp trung bình.

Đề xuất scheduler giữ deadline theo thời gian, không lấy số frame làm đơn vị:

```text
Nếu được bắn:
    dispatch shot đến hạn trong tick hiện tại
    lưu deadline và actual dispatch time riêng
    deadline kế tiếp += khoảng cách giữa hai phát
Khi render hiện tại:
    tuổi shot = thời gian hiện tại - deadline của shot
    sample animation/effect tại tuổi đó
```

Đây là sơ đồ khái niệm, cần bổ sung luật semi/burst, hết đạn và giới hạn xử lý khi hitch. Lấy tuổi animation từ deadline không tự rewind projectile/collision về thời điểm quá khứ; projectile vẫn cần chính sách mô phỏng riêng. Không dùng vòng catch-up vô hạn để phát hàng trăm shot trong một tick bị treo. Với multiplayer, deadline và bù trễ còn phải tuân theo quyền quyết định của server.

**Độ trễ có nhiều đoạn:** thiết bị → input game → simulation → render → màn hình; audio còn có buffer và output riêng. Video quay màn hình không cho biết chính xác lúc người quay nhấn nút. Vì vậy so frame flash chỉ đo được phản hồi nhìn thấy, không đo đầy đủ input latency.

Trong lab trước đây, weapon cập nhật sau phần trình bày, khiến đạn đã bắn nhưng pose vẫn thuộc phát trước. Một frame trễ ở 60 FPS đủ nhìn thấy khi chu kỳ chỉ có vài frame. Chốt thứ tự input → luật bắn → đánh giá pose/effect → render trước khi tinh chỉnh đường cong thẩm mỹ.

## 5. Camera recoil, camera shake và viewmodel recoil

**Aim recoil** làm thay đổi hướng ngắm gameplay; người chơi có thể phải ghìm. **Camera shake** thêm chuyển động cảm giác: rung nhỏ, va chạm, dao động hoặc xung. **Viewmodel recoil** là tay và súng giật trong màn hình. Chúng có thể được liên kết, nhưng không nên vô tình cộng ba lần cùng một ý đồ.

Ví dụ về một shot: input giữ yên; hướng ngắm nâng một chút; thân súng lùi rồi hồi; một rung camera ngắn kết thúc. Bạn cần biết sau 0,5 giây, hướng ngắm còn nâng bao nhiêu và mesh còn lệch bao nhiêu. Nếu cứ kéo camera về điểm cũ, bạn đã thiết kế một hành vi khác với trường hợp nó giữ góc nâng cuối. Nếu kéo về tuyệt đối, còn có thể xóa cả thao tác ghìm của người chơi.

Trong UE, CameraShake có thể tác động translation, rotation, FOV và có chế độ một instance hoặc chồng nhiều instance. Việc restart thay vì chồng shake cũng làm cảm giác liên thanh thay đổi. Đọc thiết lập thay vì mặc định “Play Shake mỗi viên là xong”. [Epic: Camera Shakes](https://dev.epicgames.com/documentation/unreal-engine/camera-shakes-in-unreal-engine).

Một mô hình spring là công cụ tạo chuyển động, không phải đáp án mặc định. Hệ `x'' + 2ζωx' + ω²x = impulse` cho phép điều khiển tốc độ và độ dao động hồi: `ζ` nhỏ dễ rung nhiều vòng, gần 1 thường hồi ít vượt đích hơn. Đây là mô hình thiết kế toán học; nó chỉ phù hợp nếu quỹ đạo cần tái tạo có kiểu hồi đó. AK74 trong video giữ phần nâng camera đáng kể, nên một spring kéo hết về 0 đã sai về mục tiêu, không chỉ sai thông số.

## 6. Projection, FOV và vì sao cùng một animation vẫn nhìn khác

World FOV quyết định cách cảnh vật được chiếu; viewmodel FOV quyết định cách tay/súng được chiếu nếu dùng hệ first-person riêng. Cùng một chuyển động xương 1 cm có thể tạo số pixel khác nhau khi FOV, khoảng cách camera, aspect ratio hoặc vị trí mesh thay đổi.

Gần tâm ảnh và với thay đổi nhỏ, có thể hình dung `dịch pixel ≈ tiêu cự theo pixel × thay đổi góc`. Với horizontal FOV và ảnh rộng W: `f ≈ W / (2 tan(FOV/2))`. Đây là xấp xỉ để suy luận; không dùng nó đổi trực tiếp mọi pixel của nòng súng thành recoil degrees, vì vật có cả translation, rotation, depth và projection riêng.

UE hỗ trợ FOV và scale riêng cho first-person primitives; editor viewport thông thường không tự có cùng cấu hình như camera người chơi. Bởi vậy xem mesh trong Editor không thay thế cho xem qua camera lúc Play. Scale để tránh clipping cũng không tự giải quyết logic bắn sát tường. [Epic: First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering).

Thứ tự căn nên là: aspect/FOV → pose nghỉ → tay cầm/mesh/socket → thước ngắm tại ADS → mới đo recoil. Nếu bạn đổi FOV sau khi fit pixel recoil, phải kiểm lại các phép đo bị ảnh hưởng.

## 7. Pose, additive, layer và hệ tọa độ

**Pose** là trạng thái transform của các xương ở một thời điểm. **Full pose** mô tả tư thế đầy đủ. **Additive pose** mô tả phần chênh so với một reference pose xác định. Không được bỏ qua reference hoặc nhầm local space, mesh/component space và world space.

Sơ đồ tư duy cho AK74 đã sửa:

```text
Nền hiện tại = idle / locomotion / đường chuyển ADS
Recoil delta = pose Fire đã bake, lấy tương đối với đúng idle dùng lúc bake
Pose bắn = áp dụng recoil delta lên nền hiện tại với weight phù hợp
```

“Lấy tương đối” ở đây không phải trừ mọi Euler angle hoặc trừ hai ma trận tùy ý. Translation, quaternion rotation và scale có phép ghép riêng; thứ tự nhân phụ thuộc quy ước engine. Trong UE nên kiểm bằng node/math của engine và transform xương đã evaluate, trước khi tự viết lại công thức.

Apply Additive và Apply Mesh Space Additive đều cần base cùng additive input, nhưng không thể tráo không gian của dữ liệu cho nhau chỉ vì hình nhìn gần đúng ở một tư thế. Aim Offset là một trường hợp UE có yêu cầu mesh-space riêng; điều đó không có nghĩa mọi Fire clip cũng phải đổi sang mesh space. [Epic: Blend Nodes](https://dev.epicgames.com/documentation/en-us/unreal-engine/blend-nodes?application_version=4.27), [Epic: Aim Offset](https://dev.epicgames.com/documentation/unreal-engine/aim-offset-in-unreal-engine). Tài liệu Blend Nodes dùng bản 4.27 để giải thích khái niệm; implementation của lab được kiểm trên source UE 5.8 local.

**Layer order có ý nghĩa.** Nếu full-pose Fire đè sau ADS, tay có thể bật về hip. Nếu reload bị aim layer đè sau, bàn tay có thể không còn đi tới magazine. Nếu IK giữ tay trái quá chặt trong lúc reload, tay không thể tháo băng. Vì thế hãy ghi cho mỗi action: lớp nào active, weight nào, phần cơ thể nào, IK nào được giữ/tắt.

Recoil của AK74 được ghép additive, nhưng reload/equip vẫn có lý do dùng full pose. Đây là lựa chọn cho dữ liệu hiện có, không phải quy tắc áp một loại blend cho mọi action và mọi khẩu.

## 8. Rig tay, rig súng, socket, IK và cơ khí

Một khẩu có thể dùng nhiều static mesh gắn lên các xương/part có animation, một skeletal mesh đã skin, hoặc một hệ modular được tạo lúc runtime. Skeleton trống trong preview không đủ để kết luận game không có mesh hay cố tình giấu mọi chuyển động.

Bạn cần kiểm tra bốn quan hệ độc lập:

| Quan hệ | Điều phải giữ đúng |
|---|---|
| Tay phải ↔ grip | Súng không trượt trong bàn tay khi bắn/ADS. |
| Tay trái ↔ điểm cầm | Giữ được khi di chuyển, nhả đúng khi reload/bolt/pump. |
| Parts ↔ xương cơ khí | Bolt, slide, magazine, belt, charging handle đi theo đúng part. |
| Muzzle/ejection/optic ↔ rig | Flash, vỏ đạn và điểm ngắm không đặt ở socket giả khác vị trí mesh. |

IK là công cụ giữ hoặc điều chỉnh điểm tiếp xúc; nó không tự biến một bộ animation không tương thích thành bộ hoàn chỉnh. Nếu bind pose sai, thêm IK có thể che lỗi ở idle nhưng làm reload tệ hơn. Kiểm skeleton hierarchy, rest transform, scale, skin weights và animation compatibility trước.

Tay và cơ khí phải cùng hiểu action đang ở pha nào. Không nhất thiết hai clip có cùng tổng thời lượng: một clip cơ khí có thể kết thúc rồi giữ pose trong khi tay còn tiếp tục. Đừng kéo giãn tất cả clip về cùng độ dài để tiện code nếu source cho thấy nhịp khác nhau.

## 9. Liên thanh: overlap, reset, hồi và viên cuối

Một phát bắn có phần attack, phần chuyển động chính và phần hồi. Khi interval ngắn hơn phần hồi, phát kế tiếp đến lúc phát trước chưa xong. Có nhiều cách thiết kế: restart, crossfade, cộng impulse, duy trì loop, hoặc chuyển state theo pha. Cách nào đúng phụ thuộc reference và graph, không phụ thuộc sở thích của người viết code.

AK74 đã phải thêm handoff 60 ms vì bản dựng reset pose gây nhảy lớn. Không suy rằng Vector 1.200 RPM cũng nên có handoff 60 ms: interval của nó khoảng 50 ms, nên cách ghép có thể chưa kết thúc đã bị shot khác chen vào. Cần đo lại và kiểm tra tính liên tục của chuỗi, không chỉ frame đẹp nhất của một phát.

Kiểm tra riêng phát đầu, chuỗi ổn định, nhả cò, bắn lại sau quãng nghỉ ngắn/dài và viên cuối. Pistol có thể giữ slide mở khi hết đạn; súng khác có hành vi khác. Không được lấy “empty idle” của một kiểu cơ khí làm mặc định cho tất cả.

## 10. ADS và handling là một quá trình

ADS gồm đường tay đưa súng lên, căn sight, world zoom, viewmodel projection, tốc độ đi, khả năng bắn và có thể thay đổi độ tản. Chúng có thể có timing khác nhau. Chỉ Lerp giữa hip pose và ADS endpoint sẽ bỏ mất đường đi, độ vượt đích và settle đã được author trong clip.

Đề xuất ghi các mốc riêng: nhấn aim → bắt đầu nâng → sight vào vùng sử dụng được → đạt tư thế ổn định. “ADS time” phải nói rõ đo tới mốc nào. Một con số không mô tả hết đường cong và không chắc bằng độ dài asset.

Những trường hợp cần thử: nhấn rồi nhả trước khi ADS xong, nhấn lại khi đang hạ, bắn giữa đường, reload khi giữ aim, đổi súng khi giữ aim, đổi optic và trở lại. Quyết định clip của shot theo mode lúc bắn hay trộn liên tục theo current aim phải được viết rõ. Lab AK74 dùng chính sách theo clip của shot; nền ADS vẫn tiếp tục chuyển.

Sức nặng còn đến từ equip, holster và sprint-to-fire. Nếu súng đã hạ khi chạy mà bullet vẫn ra ngay trong lúc tay chưa lên theo thiết kế, hình và luật sẽ mâu thuẫn. Ngược lại, thêm khóa input dài không có phản hồi cũng dễ làm người chơi cảm giác bị chậm vô lý.

## 11. Locomotion, sway, bob, inertia và trạng thái cơ thể

| Lớp | Tín hiệu đầu vào nên cân nhắc | Cần phân biệt với |
|---|---|---|
| Sway | Tốc độ/độ đổi hướng input hoặc aim có chủ ý | Aim recoil tự sinh, tránh feedback loop. |
| Inertia/lag của súng | Gia tốc quay/di chuyển, giới hạn lệch | Input lag thật; mesh chậm không nhất thiết aim cũng chậm. |
| Bob | Nhịp bước và vận tốc mặt đất | Dao động chạy theo FPS; không phải lúc đứng yên cũng bob. |
| Breathing | State đứng/ngắm, chu kỳ/biên độ thiết kế | Random mất kiểm soát, hoặc âm thanh thở không khớp thể trạng. |
| Sprint | Luật stamina/tốc độ, clip hạ súng, blend vào/ra | Tăng speed mà tay vẫn ở firing pose. |
| Crouch/prone/jump/land | Capsule, camera height, posture và landing | Chỉ đổi chiều cao camera nhưng bỏ collision, aim và transition. |

Các quan hệ này là lựa chọn thiết kế. Không mặc định cúi người luôn chính xác hơn, nhảy luôn tăng spread hay mệt luôn làm sway nhiều nếu chưa có bằng chứng reference.

Mỗi effect nên có giới hạn, thời gian vào/ra, và chính sách khi đổi state. Test đứng–đi–dừng, strafe hai hướng, quay chuột nhanh, sprint rồi bắn, crouch rồi ADS. Một hệ thống chỉ đẹp khi camera bất động chưa chứng minh được cảm giác chơi.

## 12. Spread, bloom và accuracy khác recoil

Recoil dịch hướng ngắm; spread làm viên đạn lệch quanh một hướng ngắm. Vì vậy súng có thể rất ít rung nhưng vẫn bắn không chính xác, hoặc rung khá mạnh nhưng mỗi viên vẫn đi theo hướng tâm có thể ghìm được.

Spread cần biết đơn vị, cone half-angle hay full-angle, phân bố xác suất, điều kiện thay đổi và hồi. “Random X/Y bằng nhau” không tự cho phân bố đều trong hình tròn/cone. Chỉ so một cụm vài lỗ đạn không đủ đo phân bố; cần nhiều lượt có seed được ghi và cùng khoảng cách, stance, mode.

**Bloom** là độ tản tăng theo chuỗi bắn; **recovery** là cách nó giảm khi ngừng hoặc đổi state. Đây là hai động lực khác với hồi animation súng. Crosshair có thể phản ánh một phần của chúng, nhưng cần nói rõ nó là vùng xác suất, cone lý thuyết hay chỉ feedback thị giác.

Trong source lab hiện có `HipSpreadDegrees`/`AimSpreadDegrees` và lấy hướng bằng `VRandCone`. Không vì thế mà coi movement bloom, breathing accuracy hay native WARDOGS distribution đã được phục hồi. Đo đạn bằng vị trí va chạm/hướng launch và số lượt; đo mesh bằng ảnh/xương. Không dùng độ lắc nòng để suy ra spread.

## 13. Hitscan, projectile, sight–muzzle và bắn sát vật cản

**Hitscan** truy vấn va chạm theo ray ở thời điểm bắn; **projectile** có trạng thái và di chuyển theo thời gian. Tracer vẽ bay trên màn hình không chứng minh simulation bên dưới là projectile. Một ray cũng có thể được vẽ bằng tracer đẹp sau khi damage đã được quyết định.

Trong thiết kế projectile cần kiểm tốc độ, gravity, lifetime, collision/sweep, vật mỏng và timestep. Đối tượng rất nhanh có thể xuyên qua vật cản nếu chỉ kiểm vị trí rời rạc không phù hợp. Trong hitscan cần kiểm channel, hitboxes, khoảng cách, vật che và quy tắc xuyên/ricochet nếu có.

Camera và muzzle nằm ở hai điểm khác nhau. Gần tường, camera có thể thấy mục tiêu nhưng nòng bị chặn. Một cách thiết kế thường dùng là xác định aim point từ camera, rồi kiểm đường phóng/đường chắn từ muzzle. Cần kiểm thêm trường hợp mesh first-person được scale/projection để chống clipping: vị trí nhìn thấy không luôn là vị trí world phù hợp cho đạn.

Lab dùng eye trace để chọn aim point, rồi muzzle trace để xác định hit trong nhánh hitscan; nhánh projectile còn kiểm riêng camera→muzzle trước khi spawn. Hai nhánh chưa hoàn toàn cùng quy tắc obstruction. Đây là phạm vi implementation hiện tại, không được quảng cáo thành một hệ thống thống nhất hoàn chỉnh cho mọi khẩu. Tốc độ projectile và delivery của các khẩu phải có nguồn riêng nếu mục tiêu là tái tạo WARDOGS.

## 14. Damage, giáp, TTK và cảm giác “đạn có lực”

Một khẩu có animation mạnh nhưng mục tiêu không phản ứng hoặc kết quả khó hiểu vẫn dễ có cảm giác yếu. Những lớp cần xem: vùng trúng, damage theo khoảng cách, loại đạn, giáp, xuyên, stagger/flinch, phản ứng chết và độ rõ của thông tin.

Nếu damage mỗi hit là D không đổi, máu H, không giáp và mọi viên đều trúng: `STK = ceil(H/D)`; với interval T, **TTK từ phát đầu đến phát kết liễu** là `(STK−1)×T`. Nếu đo từ nhấn cò hoặc projectile có thời gian bay, phải thêm các thành phần tương ứng. Công thức đơn giản này không đủ cho giáp vỡ giữa chuỗi, vùng trúng khác nhau, shotgun nhiều pellet hoặc reload giữa chừng.

TTK lý tưởng không phải thời gian hạ mục tiêu trong trận thật. Thời gian phát hiện, đưa súng lên, căn, tỷ lệ trúng, đối phương di chuyển và vật che đều góp phần. Khi một loại đạn giảm STK qua một ngưỡng, cảm giác hiệu quả có thể đổi rõ dù damage chỉ tăng ít.

Các bảng community/beta trong lab là snapshot có nguồn, không là chân lý của mọi build EA. Giữ build/ngày/source cạnh dữ liệu. Thiết kế cân bằng cho game riêng là một công việc khác với sao chép số liệu reference.

## 15. Reload, chamber, physical magazines và ngắt action

Reload là một giao dịch gameplay đồng thời là một màn trình diễn. Phải biết viên đạn ở đâu trước, trong và sau action. Những mốc nhìn thấy như rút băng, cắm băng và kéo bolt không tự động bằng mốc cho phép bắn trở lại.

| Câu hỏi cần thiết kế/đo | Hậu quả nếu không rõ |
|---|---|
| Tactical khác empty ở đâu? | Dùng sai clip, slide/bolt hoặc âm thanh. |
| Khi nào ammo được chuyển? | HUD hiện đầy quá sớm, hoặc hủy reload nhân đôi/mất đạn. |
| Có chamber độc lập/+1 không? | Capacity và logic viên cuối mâu thuẫn. |
| Băng cũ được giữ, cất hay vứt? | Tổng đạn không được bảo toàn đúng chính sách. |
| Hủy trước/sau commit ra sao? | Tay cầm băng nhưng state đã nói súng sẵn sàng. |
| Per-shell cho ngắt lúc nào? | Thao tác bắn chen vào shell chưa được nạp, hoặc animation loop mắc kẹt. |

Lab đã có băng vật lý, repack và nhánh per-shell, nhưng chưa mô hình chamber+1 hay từng loại đạn trộn trong một băng. Những điều đó phải nằm trong danh sách chưa có, không suy từ số lượng asset hoặc enum.

Animation Notify hữu ích để gắn âm thanh/VFX vào pha của animation. UE còn có lọc theo weight/LOD và khác biệt giữa notify queued với branching point, nên không nên giả định mọi notify luôn phát đúng một lần ở mọi đường chuyển. Nếu dùng notify cho giao dịch quan trọng, cần kiểm tính duy nhất, hủy, seek, skip, fade và bối cảnh network. [Epic: Animation Notifies](https://dev.epicgames.com/documentation/unreal-engine/animation-notifies-in-unreal-engine).

Đề xuất giữ action ID và trạng thái commit; một callback lặp không được chuyển ammo lần hai. Hủy action phải hủy cả các sound/effect chưa đến giờ, cùng state liên quan. Đây là bài học rộng hơn “chạy montage reload”.

## 16. Âm thanh: lực, vật liệu, nhịp và không gian

Một tiếng súng hoàn chỉnh có thể gồm nhiều vai trò. Đây là bảng phân tích âm thanh, không phải khẳng định WARDOGS luôn phát từng lớp riêng:

| Vai trò | Người nghe nhận được gì? | Cần đo/kiểm gì? |
|---|---|---|
| Attack/core | Mốc phát nổ, nhận diện súng | Onset, khoảng giữa các shot, variant. |
| Body/punch | Cảm giác năng lượng/thân âm | Mức tương đối và phổ; đừng chỉ tăng volume tổng. |
| Mechanical | Bolt, slide, magazine, belt | Đồng bộ pha cơ khí; không tự nhân đôi tiếng đã có trong core. |
| Tail/reflection | Cảm giác môi trường và khoảng cách | Trong nhà/ngoài trời, occlusion, reverb, tắt cò. |
| Near-miss/impact | Đạn đi qua/trúng vật gì | Theo sự kiện projectile/hit, không phải mọi muzzle event. |
| Empty/dry fire | Súng không còn sẵn sàng | Chỉ phát khi input/state phù hợp, tránh spam mỗi tick. |
| Handling | Chuyển súng, cầm, aim, reload | Thời gian, mức ưu tiên và cancellation. |

Vì nhiều shot chồng đuôi nhau, súng nhanh cần kiểm concurrency và voice limit. Cắt mọi voice cũ có thể làm tiếng cụt; cho vô hạn voice có thể làm tổng âm thay đổi ngoài ý muốn. Variation giúp tránh lặp máy móc, nhưng random pitch quá rộng có thể làm khẩu súng mất nhận diện. Nên tách seed audio khỏi seed đạn để thêm sound variant không làm đổi pattern gameplay.

Súng local và súng của người khác có nhu cầu mix khác nhau. Local core có thể dùng 2D để giữ chi tiết; nguồn ở xa cần vị trí, khoảng cách và môi trường. Đây là lựa chọn mix. Epic cung cấp attenuation/spatialization và MetaSounds để xây nguồn âm; asset WAV một mình không chứa toàn bộ routing/mixer runtime. [Epic: Sound Attenuation](https://dev.epicgames.com/documentation/unreal-engine/sound-attenuation-in-unreal-engine), [Epic: MetaSounds](https://dev.epicgames.com/documentation/unreal-engine/metasounds-quick-start).

**Đúng số request không có nghĩa đúng tiếng nghe.** Muốn kiểm audio phải thu output audio thực cùng video/telemetry, so onset, đuôi âm, mức tương đối và nghe A/B cùng mức âm lượng. Capture `-nosound` chỉ kiểm wiring. Không cộng Punch/Mech/Rattle chỉ vì exporter tìm thấy file; có thể file là biến thể, dependency hoặc một lớp được bật theo điều kiện chưa biết.

Game thread và audio render thread có đồng hồ khác nhau. UE có Quartz để lập lịch audio chính xác tới sample khi cần, nhưng nó không tự sửa toàn bộ input latency hoặc đồng bộ graphics. Đó là hướng nghiên cứu tiếp nếu phép thu âm chỉ ra timing trên game tick đang giới hạn chất lượng; lab chưa triển khai scheduler audio kiểu đó. [Epic: Quartz Quick Start](https://dev.epicgames.com/documentation/unreal-engine/quartz-quick-start).

## 17. Muzzle flash, smoke, vỏ đạn, tracer và ánh sáng

Flash giúp xác định discharge; smoke có thể tích lũy và che sight; vỏ đạn giúp đọc cơ khí; tracer giúp đọc hướng; impact giúp đọc va chạm. Mỗi hiệu ứng cần origin, hướng, thời gian, lifetime và điều kiện tồn tại riêng.

Không được mặc định chúng đều xuất hiện cùng frame. Đo relative timing: vỏ thoát sau discharge bao lâu, flash kéo dài mấy frame, khói còn bao lâu sau nhả cò, tracer xuất hiện ở mọi viên hay một số viên. Nếu muzzle flash quá sáng hoặc smoke quá đặc, người chơi có thể thấy súng “khó kiểm soát” dù transform recoil không đổi.

VFX và vật liệu chịu ảnh hưởng exposure, bloom, motion blur, temporal reconstruction và ánh sáng môi trường. Cần giữ các thiết lập này ổn định trong A/B. Khi tracking sight, mask flash/smoke hoặc báo frame bị che; không để tracker bám vào một đốm sáng rồi diễn giải thành xương súng đã giật.

Trong lab, muzzle point light và dấu impact đang là phần dựng nghiên cứu; chưa chứng minh native particle graph, vỏ đạn hoặc shading khớp. Sửa thông số camera để bù cho sight bị flash che là sửa nhầm lớp.

## 18. Hit feedback, đối tượng nhận đạn và UI

Gunfeel không dừng ở đầu nòng. Khi bắn trúng, người chơi cần hiểu kết quả bằng một tổ hợp có kiểm soát: hit sound, hit marker, tác động lên vật liệu, flinch, vết đạn, giáp vỡ, damage information hoặc phản ứng chết.

Đề xuất tách ít nhất: bắn ra → trúng vật cản → trúng mục tiêu → phá giáp → kết liễu. Không phát tín hiệu trúng người chỉ vì ray tới gần mục tiêu. Không để một hit cho nhiều xác nhận trùng do projectile và trace cùng gọi damage. Với nhiều pellet, phải thiết kế rõ feedback theo pellet hay tổng một shot.

UI là phần giải thích luật: số đạn, reload progress, mode semi/auto/burst, loại đạn, tương tác và trạng thái không bắn được. Crosshair nên có ý nghĩa nhất quán với spread/aim. Thêm hiệu ứng co giãn đẹp nhưng không liên quan đến accuracy có thể khiến người chơi học sai.

Target dummy giúp đo lặp lại, nhưng không kiểm được toàn bộ combat. Cần các bài có mục tiêu chạy ngang, bị che, ở nhiều khoảng cách, phản ứng trúng và khả năng gây áp lực. Một khẩu mạnh ở phòng bắn chưa chắc tạo trải nghiệm chiến đấu tốt nếu enemy AI, level sightline và cover không hỗ trợ nó.

## 19. Hiệu năng, frame pacing, thiết bị và khả năng tùy chỉnh

FPS trung bình cao không bảo đảm input/animation mượt nếu thỉnh thoảng có frame rất dài. Cần xem thời gian từng frame và tình huống shot đầu, reload đầu, chuyển súng đầu. Asset chưa preload, shader chưa sẵn sàng hoặc tạo nhiều object/effect lúc discharge có thể làm chính frame quan trọng nhất bị hitch.

Kiểm tra ở 30/60/120 hoặc 144 FPS nếu đó là phạm vi bạn muốn hỗ trợ. Giữ simulation theo giây không tự loại mọi lỗi: ordering, notify, camera interpolation, audio callback và fixed timestep đều có thể khác. Video 60 FPS cũng không cung cấp bằng chứng cho mọi chuyển động giữa hai frame.

Chuột và gamepad không có cùng mapping. Deadzone, sensitivity, acceleration/smoothing, aim assist và response curve phải có chính sách riêng. Không thêm aim assist chỉ để che lỗi spread hoặc animation. Đây là nhánh thiết kế tương lai của lab, chưa phải tính năng được kiểm đủ trong lượt AK74.

Đề xuất tùy chỉnh FOV, sensitivity HIP/ADS, độ rung trang trí và mức bob. Giảm rung trang trí nên giữ luật bắn nếu đó là hợp đồng thiết kế. Hãy thử âm thanh nhỏ, camera shake tắt và môi trường ít tương phản: những chế độ này giúp phát hiện game đang dựa vào hiệu ứng nào để truyền thông tin.

## 20. Multiplayer là một tầng riêng

Hiện bài tập là **single-player**. Không coi việc bắn ổn trong PIE là bằng chứng rằng multiplayer đã sẵn sàng.

Trong mô hình client–server của UE, server giữ trạng thái có thẩm quyền; client nhận dữ liệu và dựng trải nghiệm cục bộ. Mô phỏng đạn/damage, cosmetic effect và HUD có nhu cầu truyền khác nhau. [Epic: Networking Overview](https://dev.epicgames.com/documentation/unreal-engine/networking-overview-for-unreal-engine).

Đề xuất khi nâng lên multiplayer: dự đoán phản hồi local để thao tác không phải đợi vòng mạng; dùng shot ID để không phát sound/flash hai lần khi server xác nhận; server kiểm state, ammo và cadence; định nghĩa correction khi prediction sai. Hit confirmation, lag compensation, interpolation và projectile prediction cần thiết kế, triển khai và kiểm tra riêng dưới latency/jitter/loss.

Giữ dữ liệu mô tả súng tách khỏi instance runtime và tách gameplay khỏi presentation từ bây giờ giúp việc này dễ hơn. Nó không biến project single-player thành hệ multiplayer chỉ bằng bật Replicates.

## 21. Đo đúng thứ cần đo

| Câu hỏi | Bằng chứng phù hợp | Bằng chứng không đủ |
|---|---|---|
| Đúng luật bắn? | Shot count, deadline, ammo, state, cancel/commit | Một video trông mượt. |
| Đúng animation composition? | Transform xương sau evaluate với đúng base/weight/clock | Chỉ asset preview hoặc clip name. |
| Camera gần reference? | Track nền, biết FOV/giả định và input window | Độ lắc mesh hoặc similarity toàn ảnh khác bối cảnh. |
| Tay/súng gần reference? | Track đầu ruồi và thân riêng, ảnh native, timestamp | Xương chạy đúng một clip được chọn tùy ý. |
| Audio đúng? | Thu output và nghe, đo onset/layer/tail | Counter request trong run `-nosound`. |
| Chơi có dễ hiểu/dễ điều khiển? | Người chơi thử tác vụ cụ thể và mô tả thời điểm khó chịu | Một con số RMSE chung. |

Không có một điểm số duy nhất đại diện toàn bộ cảm giác bắn. RMSE quỹ đạo tương đối không đo đẹp/xấu, không chứng minh pose tuyệt đối và không đo input latency. Dao động nhỏ hơn không mặc nhiên giống reference hơn. Hãy lưu cả phép đo không cải thiện và các phương án bị loại.

Tách ba cổng nghiệm thu: **đúng chức năng**, **gần reference theo các đại lượng đã đo**, và **người chơi chấp nhận trong bài thử**. AK74 hiện đã qua bài thử HIP/ADS của bạn; vẫn còn sai lệch thị giác và các hệ ngoài scope cần nghiên cứu.

## 22. Lộ trình học bằng cách làm và những điều nên nhớ

Các buổi dưới đây là khối thực hành, không phải cam kết mỗi buổi xong trong một ngày. Giữ AK74 hiện tại làm mốc để nghe/nhìn lại sau mỗi thí nghiệm; dùng bản sao cấu hình, không sửa bản đã chấp nhận mà không lưu đối chứng.

| Buổi | Bài tập | Sản phẩm phải có |
|---|---|---|
| 1 — Đọc shot | Bắn đơn, burst ngắn, giữ cò và nhả; đánh dấu discharge/peak/settle | Timeline có thời gian và nhãn chưa biết. |
| 2 — Tách lớp | So HUD/đạn, pose, camera, sound và VFX riêng | Bảng giả thuyết: thay lớp nào sẽ đổi điều gì? |
| 3 — Pose và projection | So idle, ADS endpoint, đường ADS, đúng base/rig | Ảnh kiểm grip, sight và transform reference. |
| 4 — Chuỗi bắn | Đo first shot, steady burst, release/retrigger, empty | Curve theo thời gian; không chỉ một ảnh đẹp. |
| 5 — Audio/VFX/impact | Thu âm và hình thật, đo các onset và va chạm | Một shot đồng bộ từ input đến hit, với giới hạn ghi rõ. |
| 6 — Handling và giao dịch | Bắn khi đổi aim/sprint, ngắt reload, đổi súng | Ma trận transition không mất/nhân đôi đạn. |
| 7 — Khẩu tiếp theo | Làm theo SOP và worksheet, chưa tune cả kho | Một khẩu có bản nguồn/trước/sau và biên bản nghiệm thu. |

Bạn không cần đoán ngay rằng “súng thiếu sức nặng”. Hãy hỏi cụ thể hơn: **thời gian phản hồi, hướng ngắm, chuyển động mesh, âm thanh hay kết quả hit đang tạo cảm giác ấy?** Sau đó thiết kế một A/B để phân biệt. Đó là cách biến game sense thành kinh nghiệm có bằng chứng, rồi dần dần trực giác của bạn sẽ tốt hơn.

Từ vựng tra nhanh: **pose** = tư thế xương; **base** = nền để ghép; **additive** = phần chênh so với reference; **viewmodel** = tay/súng nhìn từ người chơi; **cadence** = nhịp phát; **onset** = lúc tín hiệu bắt đầu; **retrigger** = phát lại khi đang còn chuyển động cũ; **settle** = ổn định/hồi sau xung; **spread** = độ tản hướng đạn; **bloom** = độ tản tăng theo hành động; **commit** = mốc giao dịch state có hiệu lực; **provenance** = nguồn gốc dữ liệu; **oracle** = cách tính độc lập dùng để kiểm kết quả; **PIE** = Play In Editor.

Đọc tiếp [quy trình cho từng khẩu](03-Weapon-Reconstruction-Workflow.vi.md) và sao chép [worksheet](04-Weapon-Worksheet.template.vi.md). Khi cần nhớ vì sao quy trình này có những bước ấy, quay lại [case study AK74](01-AK74-Case-Study.vi.md).
