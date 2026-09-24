# Kiểm tra tích hợp GunGameplay — 20/09/2026

Tài liệu này ghi kết quả đọc source, manifest và trạng thái tiến trình tại thời điểm bắt đầu mở rộng bộ GunGameplay. Nó không phải biên bản nghiệm thu cho các asset sẽ được xuất trong lượt mở rộng. Agent thực hiện kiểm tra không chạy Editor, không thao tác giao diện và không sửa asset có sẵn.

## Vì sao nhìn thấy súng static nhưng không thấy animation trên chính súng?

Bộ `GameplaySystems` trước đây tách **geometry súng** khỏi **nhân vật cầm súng**. Ba asset `SM_AK74_3aa0d31819`, `SM_Vector_0b1ed539ec` và `SM_M249_77e3b81dd8` là StaticMesh thật theo bản xuất. Chúng không có skeleton để chọn AnimSequence trực tiếp. Animation FPS của tay nằm trên rig nhân vật FP dùng chung; animation TP nằm trên rig nhân vật TP.

Đây là giới hạn của bộ mẫu trước, không phải bằng chứng rằng game WARDOGS không có cơ cấu súng chuyển động. Muốn tái tạo cơ cấu cần truy tiếp asset vũ khí, bộ phận, rig, clip, curve và assembly dữ liệu nguồn. Không được đổi nhãn một StaticMesh thành “skeletal weapon gốc” để che khoảng trống đó.

Từ `Saved/GameplaySystems/imported-assets.json`, hệ `03_firstperson_weapon_handling` đã có:

| Thành phần | AK74 | Vector | M249 |
|---|---|---|---|
| Geometry súng | StaticMesh | StaticMesh | StaticMesh |
| Rig tay FP | Chung `SKEL_FP_Character_Refactor` | Chung rig FP | Chung rig FP |
| Clip tay FP | Idle, Walk, Sprint, Aim, Fire, Reload, ReloadEmpty, Equip | Cùng tám vai trò | Bảy vai trò, chưa có Equip trong bộ mẫu |
| Clip người TP | Fire, ReloadEmpty | Fire, Reload | Fire, Reload |
| Cơ cấu riêng magazine/bolt/belt | Chưa được bộ mẫu cũ chứng minh | Chưa được bộ mẫu cũ chứng minh | Chưa được bộ mẫu cũ chứng minh |

Tổng cộng **23 clip tay FP và sáu clip TP** đã liên kết trong chỉ mục cũ. Asset tay để xem các clip FP là:

`/Game/WardogsLab/GameplaySystems/PreparedMeshes/SK_SK_FP_Arms_Male_NoDeform_dde4680ca9`

Đây là bản mesh đã gắn với skeleton nguồn của animation. Mesh nguyên liệu ở `Models/SK_FP_Arms_Male_NoDeform_dde4680ca9` giữ skeleton do importer mesh sinh ra; dùng bản `PreparedMeshes` giúp chọn đúng các clip nguồn. Các clip ở `Animations` có tiền tố `fp_ak74_`, `fp_vector_`, `fp_m249_`; các Idle giữ tên `A_FP_*_Idle`.

## Rig và attachment đã có bằng chứng

Mesh tay nguồn chứa 176 bone. Skeleton FP nguồn dùng cho clip chứa 180 bone. Bốn bone thêm được ghi trong bằng chứng bake là `calf_r_annotationLocator`, `calf_l_annotationLocator`, `zzzzz1`, `zzzzz`. Chúng không phải bone magazine hay bolt.

| Tên | Bằng chứng nguồn | Ý nghĩa tích hợp |
|---|---|---|
| `CameraBone` | Bone trực tiếp dưới `root` | Mốc camera của pose FP |
| `CameraSocket` | Gắn `CameraBone`, transform identity | Mốc căn viewmodel/camera |
| `weapon_r` | Bone dưới `hand_r` | Chuyển động vị trí cầm súng phải |
| `weapon_l` | Bone dưới `hand_l` | Mốc phía tay trái; không tự chứng minh là bone magazine |
| `WeaponPoint` | Socket trên `weapon_r`, yaw 90°, translation 0 | Chỗ gắn geometry súng mà runtime EA đang dùng |
| `attach_Socket` | Socket trên `hand_r`, transform riêng | Không được thay thế tùy tiện cho WeaponPoint |

Một StaticMesh gắn vào `WeaponPoint` sẽ đi theo toàn bộ tay và pose, nên súng vẫn có thể nâng lên khi ngắm hoặc đổi vị trí khi reload. Nhưng các đỉnh trong StaticMesh không tách chuyển động: băng đạn, bolt và belt vẫn đứng yên tương đối với thân súng.

Có hai hướng tái tạo cơ cấu cần phân biệt:

1. **Rig súng nguồn và clip nguồn:** nhập SkeletalMesh với skeleton đúng, dùng đúng animation cơ khí; đây là hướng có bằng chứng mạnh nhất khi asset nguồn đọc được.
2. **Lắp bộ phận từ mesh nguồn:** thân, magazine, bolt, dây đạn là các component riêng; di chuyển theo transform/curve/notify đã đọc được. Nếu timing hoặc transform phải tự đặt thì phải ghi rõ đó là bản dựng nghiên cứu.

Chỉ thấy tên bone hoặc tên clip không chứng minh graph assembly và timing gốc. Cũng không được gắn animation tay FP vào một skeleton súng không tương thích.

## Bổ sung sau khi lần được rig và montage nguồn

Kết quả xuất nguồn GunGameplay ngày 20/09/2026 đã làm rõ thêm điều bộ mẫu cũ thiếu:

- **`SK_BaseWeapon` có 37 bone trong mesh. `SKEL_BaseWeapon` đầy đủ nguồn có 42 bone trong skeleton.** Hai con số mô tả hai đối tượng khác nhau; không gọi đây là “skeleton nguồn 37 bone”. Số 42 được đọc trực tiếp từ `ReferenceSkeleton.FinalRefBoneInfo` trong metadata skeleton.
- Đây là rig cơ khí chung với clip cơ khí riêng từng súng. Nó không phải hình dáng AK74/Vector/M249 đã skin hoàn chỉnh. Audit toàn bộ SkeletalMesh có trong catalog chưa tìm thấy SkeletalMesh cầm tay riêng cho ba khẩu này.
- Bộ chọn có **tám StaticMesh: ba hình học toàn khẩu và năm băng đạn rời**. Chưa chứng minh binding từng static part vào bone, skin weight gốc, hay có mesh bolt rời. Không thể chỉ gắn cả khẩu vào một bone rồi tuyên bố đã phục hồi magazine/bolt/belt.
- `SK_M249_Mounted` là mesh có rig của súng gắn giá; nó được nghiên cứu riêng, không dùng làm vật thay thế chưa ghi nhãn cho M249 cầm tay.
- Các montage cơ khí M249 đã decode có hai slot **`DefaultSlot` + `Magazine`**, clip khác nhau cho súng và băng, notify **`WDLockMutableUpdated`**, cùng curve **`FullWeapon`**. Các dấu vết này củng cố việc hệ nguồn phối hợp animation và lắp ráp Mutable. Chúng chưa phục hồi implementation cập nhật Mutable, skin/binding hay toàn bộ AnimGraph.
- Với clip băng M249 chỉ có skeleton mà chưa có SkeletalMesh tương ứng trong bộ chọn, có thể kiểm track/hierarchy/time nhưng chưa thể đánh giá pose trên geometry băng. Không tính lượt kiểm skeleton thành đã xem cơ cấu magazine hoàn chỉnh.

Bằng chứng cụ thể:

- `SourceData/GunGameplay/Files/metadata_a658dbca2f0a_d76199539cc8.json`: `SKEL_BaseWeapon`, 42 phần tử `ReferenceSkeleton.FinalRefBoneInfo`.
- `SourceData/GunGameplay/Files/metadata_10942116fbb3_3a37a54c3493.json`: montage M249 Empty Drop 200to200, hai slot và các marker nêu trên.
- `SourceData/GunGameplay/Files/metadata_274ba43eb12d_00109eba994b.json`: montage M249 Tactical Drop 200to200.
- `Saved/GunGameplay/import-plan.json`: nguồn của mesh nền, model súng/băng, các clip và metadata đã chọn.
- `WardogsPorting/research/gun-gameplay/catalog-audit.json`: kiểm kê tất cả SkeletalMesh và quan hệ namespace; catalog visibility chưa phải thành công import.

Các mục này là bằng chứng nguồn đã đọc, không phải biên bản nghiệm thu import đang chạy. Kết quả import cuối phải đọc từ `Saved/GunGameplay/validate-report.json` và `publish-report.json`.

## Runtime hiện tại làm được gì?

Các file liên quan:

- `Source/WardogsGameplayLab/Private/WardogsEACharacter.cpp`: `RefreshViewmodel()` lấy mesh/clip từ `WardogsEAViewmodel`, gắn cả `Rifle` và `StaticRifle` lên `FirstPersonMesh` tại socket đã chọn.
- `Source/WardogsGameplayLab/Private/WardogsEAAnimInstance.cpp`: trộn Idle/Move, action và Aim; phát Equip/Fire/Reload theo trạng thái gameplay.
- `Source/WardogsGameplayLab/Public/WardogsEAViewmodel.h`: liên kết mesh và tám vai trò clip; có alignment riêng cho camera/súng.
- `Source/WardogsGameplayLab/Public/WardogsWeaponProfile.h`: profile có lựa chọn StaticMesh hoặc SkeletalMesh, riêng `WeaponFireAnimation`, `WeaponReloadAnimation`, socket, muzzle, audio và thông số gameplay.
- `Scripts/prepare_ea_gameplay.py`: bộ EA hiện đặt `static_mesh=mesh`, `skeletal_mesh=None`; profile là giá trị nghiên cứu, không phải bảng cân bằng gốc đã phục hồi.

Vì profile có trường skeletal/animation không có nghĩa các trường ấy đã chứa tài nguyên. Bản EA đang dùng geometry static và không có component/timeline cơ khí cho magazine, bolt hoặc belt.

Âm thanh WARDOGS trong dữ liệu khảo sát gồm `SoundWave`, `MetaSoundSource` và `WDAudioData`. Xuất được các lớp WAV chưa phục hồi graph mix, chọn biến thể, góc nghe và timing gốc. Không gán cho WARDOGS một audio middleware khác chỉ vì pipeline project khác đã dùng nó.

Nhiều clip nguồn là `AAT_LocalSpaceBase`. Bộ cũ đã tạo FullPose bằng Idle riêng từng súng khi base bị lược lúc cook. Ví dụ AK74 ReloadEmpty có `authoredBaseUnknown=true`, `studyOverride=true`, `baseSequence=A_FP_AK74M_Idle`, xuất cuối `AAT_None`. Đây là pose dựng để nghiên cứu, không phải đã khôi phục authored base. Bằng chứng cũng ghi `curveCompositionImplemented=false`.

Nhánh Aim hiện giữ pose ngắm cuối của ADS transition và dùng recoil camera/viewmodel khi bắn ADS. Nó chưa chứng minh ADS-fire base hoặc AnimGraph nguồn. Bộ mở rộng cần giữ cả raw source metadata, base/bake provenance và clip cuối để người dùng biết phần nào đã được phục hồi, phần nào là phép dựng lại.

## Cấu trúc thư viện mở rộng đề nghị

Dùng namespace mới `/Game/WardogsLab/GunGameplay`. Mỗi súng có một DataAsset chỉ mục riêng, thay vì một danh sách phẳng chứa cả ba súng. `WardogsSourceDocument` đã có đầy đủ trường để làm việc này mà không cần compile lớp mới.

| Nhóm trong chỉ mục từng súng | Liên kết cần có |
|---|---|
| Nhận diện | Source path/build, weapon definition và trạng thái đọc metadata |
| Nhân vật FP | Mesh chuẩn bị, skeleton FP, bộ clip của đúng súng |
| Cơ cấu súng | Mesh/skeleton súng nếu đọc được; clips/curve của súng; không trộn với clip tay |
| Bộ phận | Thân, magazine, bolt, sight, suppressor và bộ phận thực sự tìm được |
| Hành động | Idle, ADS vào/ra, Fire, dry fire, tactical/empty reload, equip/unequip, sprint… theo đúng catalog và khả năng xuất |
| Phản hồi | Các lớp tiếng bắn, cơ khí, reload, VFX và metadata nguồn tương ứng |
| Gameplay | Dữ liệu ammo/cadence/recoil/spread/reload/attachment nếu decode được, hoặc giới hạn cụ thể nếu không |
| Kiểm chứng | Loại asset, skeleton tương thích, clip duration/track, source hash, base pose và giới hạn geometry |

`source_json` nên có bản đồ vai trò → đường dẫn Unreal và nguồn. `related_assets` chứa những asset tương ứng có thể mở. `limitations` nêu rõ phần chưa phục hồi. Không gọi DataAsset chỉ mục này là weapon blueprint thực thi.

Chỉ mục tổng mới liên kết từng súng và bộ tài nguyên chung. Việc đưa dữ liệu này vào gameplay chạy được là một bước riêng cần kiểm trạng thái đạn, quyền hủy reload, thời điểm đổi magazine, camera, socket và muzzle.

## Import bằng lệnh trong khi Editor người dùng đang mở

Tại thời điểm audit, có `UnrealEditor.exe` PID **20184**, mở đúng `WardogsAssetLab.uproject`. Tiến trình chỉ có TCP listener 1985 và UDP 54881/6666. Không có listener MCP 18058; không có endpoint Python remote execution 6766 hoặc cấu hình bật remote execution tìm thấy trong config của project. Log đăng ký toolset là bằng chứng plugin đã nạp, không chứng minh server MCP đã khởi động.

`Start-WardogsMCP.ps1` được thiết kế từ chối nếu project đã có Editor. Không chạy launcher để tạo Editor thứ hai và không dừng Editor của người dùng. Không thể dùng MCP để sửa chỉ mục cũ qua instance đang mở khi chưa có endpoint hoạt động.

Có thể import trong project tạm cùng tên, giữ nguyên module và plugin, rồi chuyển **chỉ asset mới** vào namespace mới của project chính:

1. Giữ tên file `WardogsAssetLab.uproject`; sao chép descriptor, module binaries và plugin UEFormat tương thích. Manifest module project và UEFormat hiện cùng BuildId `55116800`.
2. Dùng thư mục Content/Saved/Intermediate riêng; không sao chép hoặc ghi đè Content cũ. Các module đã kiểm không dùng đường dẫn filesystem tuyệt đối để khóa vào project gốc.
3. Giữ tên package `/Game/WardogsLab/GunGameplay/...` giống tên sẽ dùng trong project đích. Các class giữ tên `/Script/WardogsAssetLab` và `/Script/WardogsGameplayLab`.
4. Tạo package và kiểm tải lại trong commandlet của project tạm. Kiểm dependencies không tham chiếu vào namespace tạm hay asset thiếu.
5. Chỉ sao chép package mới chưa tồn tại vào Content đích, đối chiếu hash sau copy. Giữ staged source thật trong project đích để source metadata không trỏ vào thư mục tạm sẽ bị mất.
6. Kiểm đọc lại các package mới bằng tiến trình commandlet riêng, không chạy thao tác save rộng trên project chính. Editor đang mở có thể cần chờ AssetRegistry phát hiện file mới hoặc mở lại project sau công việc của người dùng.

Đây là đánh giá tính khả thi, không thay thế kết quả chạy import. Không sửa file `.uasset` của `DA_03_firstperson_weapon_handling` trên đĩa khi người dùng có thể đang mở và chỉnh chính asset đó.

### API importer và các chỗ cần tham số hóa

- `WardogsImportLibrary.manual_import_mesh` và các API animation được bảo vệ trong `/Game/WardogsLab/`; `GunGameplay` đã nằm trong vùng cho phép, không cần nới guard native.
- `manual_import_animation` từ chối ghi đè package có sẵn. Script phải kiểm tồn tại trước khi gọi.
- `manual_import_source_skeleton` nhập skeleton nguồn độc lập. `prepare_character_mesh` đối chiếu tên/parent; không remap theo thứ tự track.
- `restore_source_timing` và `inspect_animation` kiểm timeline/track. `sample_asset_pose` đánh giá pose trên component tạm; chỉ có clip/mesh cùng rig mới cho kết quả có nghĩa.
- `Scripts/import_gameplay_systems.py` đang hardcode `Saved/GameplaySystems`, `SourceData/GameplaySystems`, tên chỉ mục tổng và guard `ROOT == '/Game/WardogsLab/GameplaySystems'`. Bộ mới phải dùng state/plan/report khác, không tái sử dụng state của bộ 14 hệ thống.
- `save_imported_assets()` gọi SaveDirtyPackages; chỉ dùng trong project tạm để tránh lưu nhầm thay đổi người dùng ở project chính.

### Khi có MCP đang chạy thật trong tương lai

API local của Epic đã có `AssetTools.load_asset`, `ObjectTools.get_properties`, `ObjectTools.set_properties`, `AssetTools.save_assets`. Client của project là `Scripts/MCP/unreal_mcp.py`; cần discover/describe schema trước khi gọi vì schema được server đăng ký.

Nếu muốn thêm đường dẫn đến GunGameplay vào DA03 cũ, thao tác trên instance Editor người dùng đang dùng: đọc `relatedAssets`, `sourceJson`, `limitations`; nối một liên kết mới nếu chưa có; giữ mọi giá trị cũ; save đúng một asset rồi đọc lại. Ghi receipt trước/sau. Không ghi lại toàn bộ chỉ mục từ manifest cũ vì người dùng có thể đã sửa nó.

`ProgrammaticToolset.execute_tool_script` chỉ điều phối tool đã đăng ký; nó không cho chạy tùy ý script `import unreal` của commandlet. Không coi sự hiện diện của ProgrammaticToolset là cầu nối chạy importer Python tùy ý.

## Nguồn kiểm chứng cục bộ

- `Saved/GameplaySystems/imported-assets.json`, `import-plan.json`, `validate-report.json`.
- `WardogsPorting/Demos/GameplaySystems/bindings.json` và bake evidence trong manifest nhập.
- Các source runtime/importer liệt kê ở trên.
- `Docs/EA-FIRSTPERSON.md`, `Docs/EA-VALIDATION.md`, `Docs/INTEGRATION.md`, `Docs/UE58-MCP.md`.
- `UE_5.8/Engine/Plugins/Experimental/Toolsets/EditorToolset/Content/Python/editor_toolset/toolsets/asset.py` và `object.py`.
- `UE_5.8/Engine/Plugins/Experimental/PythonScriptPlugin/Source/PythonScriptPlugin/Private/PythonScriptPluginSettings.cpp`.

Không tìm thấy `AGENTS.md` tại workspace root hoặc trong WardogsAssetLab ở lần kiểm tra này.
