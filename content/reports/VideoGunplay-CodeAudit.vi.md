# Kiểm toán nền GunStudy trước khi tái tạo gameplay trong video VrtwXz94dQg

Ngày: 21-09-2026. Phạm vi: đọc source, dữ liệu đã nhập và bằng chứng video; không chạy lại Unreal trong cuộc kiểm toán này. Phần physical magazine phía dưới là mã mới viết cho bản dựng tiếp theo, chưa được coi là đã kiểm thử chỉ vì đã ghi file.

**Có thể dùng GunStudy làm nền first person:** ba khẩu AK74, Vector, M249 đã có skeletal mesh riêng được lắp từ dữ liệu Mutable phục hồi, skeleton riêng, animation tay và animation cơ khí chạy cùng tiến độ. Điều còn thiếu so với video không phải chỉ thêm mesh: phải nối Vendor → loadout → inventory đạn/băng đạn → thao tác ngoài trận → HUD và phản hồi chiến đấu thành một vòng hoạt động. HUD chẩn đoán của GunStudy không phải HUD trong video.

## 1. Bằng chứng và giới hạn của video

Video [Best Loadouts In WARDOGS Beginners Guide](https://www.youtube.com/watch?v=VrtwXz94dQg), dài khoảng 693 giây, chủ yếu hướng dẫn chọn trang bị. Dữ liệu tham chiếu nằm trong `WardogsPorting/research/gameplay/VrtwXz94dQg/`:

| Bằng chứng | Điều có thể kết luận | Điều không được suy ra |
|---|---|---|
| `transcript.txt`, đoạn 254–318 giây; `frames/source-0258s.png`, `source-0315s.png` | Có loadout AK74, backpack, băng đạn rời và đạn lẻ; tác giả nói đến ba băng dự phòng, giáp cấp 2, mặt nạ cứu tỉnh, 10 bandage, 2 frag, 2 smoke | Đây là đề xuất của người làm video, không phải loadout bắt buộc hoặc công thức cân bằng của game |
| Transcript khoảng 323 giây | Có thao tác `C` repack để đưa đạn lẻ vào băng đạn | Chưa chứng minh chính xác tốc độ từng viên, thứ tự chọn băng, toàn bộ điều kiện hủy |
| `frames/source-0352s.png`, đoạn 351–435 giây | Có Four Reticle Reflex sight và so sánh vertical foregrip | Không thể suy recoil multiplier hay socket transform chỉ từ lời nhận xét |
| `frames/source-0365s.png`, `source-0367s.png`, `source-0370s.png`, `source-0380s.png` | Có các trạng thái hip, ADS, bắn/recoil và reload để đối chiếu góc nhìn, tay/súng, HUD | Không đủ để tuyên bố đã phục hồi native animation graph hoặc toàn bộ hệ thống súng |
| Cảnh shop trong bản training | Giá hiển thị $0, balance $10,000 | Không lấy các giá local study $1,200/$1,700/$2,500 làm giá của video hoặc của bản live |

Khẩu đầu video là BUSHMASTER M17S; đoạn AK74 là phần phù hợp nhất với rig đã phục hồi. Vector/M249 là khả năng thêm của lab, không tự động là nội dung đã xuất hiện trong chính đoạn tham chiếu AK74.

## 2. Kiến trúc đang thực sự hoạt động

```text
AWardogsLabCharacter
  └─ AWardogsEACharacter: FPS camera, stamina, treatment, damage
      └─ AWardogsGunStudyCharacter: paired arms/mechanical actions + inspector
           ├─ UWardogsWeaponComponent: ammo, fire, reload, equip, projectiles
           ├─ UWardogsGunStudyAnimInstance: idle/move/ADS/action pose
           └─ UWardogsGunStudyProfile: source meshes/clips and assembly provenance

AWardogsLabGameMode
  └─ AWardogsEAGameMode: staged 3-wave offline drill, scoring, relay, resupply
      └─ AWardogsGunStudyGameMode: GunStudy pawn/HUD and capture probe
```

Các file nguồn tương ứng ở `Source/WardogsGameplayLab/Public/` và `Private/`. Trách nhiệm của lớp mới nên tách rõ: dùng lại rig/action system đã chứng minh; chế độ video tự quản Vendor, transaction/loadout, HUD và encounter. Không cần thay thế GunStudy bằng một màn hình chẩn đoán khác.

### Tài nguyên tối thiểu có thật

| Khẩu | Skeletal mesh đang dùng | Skeleton đang dùng |
|---|---|---|
| AK74 | `/Game/WardogsLab/GunStudy/RecoveredV3/AK74/Models/SK_AK74_Recovered` | `/Game/WardogsLab/GunStudy/RecoveredV3/AK74/Skeletons/SKEL_AK74_Recovered` |
| Vector | `/Game/WardogsLab/GunStudy/RecoveredV3/Vector/Models/SK_Vector_Recovered` | `/Game/WardogsLab/GunStudy/RecoveredV3/Vector/Skeletons/SKEL_Vector_Recovered` |
| M249 | `/Game/WardogsLab/GunStudy/RecoveredV3/M249/Models/SK_M249_Recovered` | `/Game/WardogsLab/GunStudy/RecoveredV3/M249/Skeletons/SKEL_M249_Recovered` |

Arsenal: `/Game/WardogsLab/GunStudy/DA_GunStudyArsenal`.

Viewmodel profiles: `/Game/WardogsLab/GunStudy/DA_GunStudy_AK74`, `DA_GunStudy_Vector`, `DA_GunStudy_M249`.

Weapon profiles: `/Game/WardogsLab/GunStudy/Runtime/DA_Weapon_AK74`, `DA_Weapon_Vector`, `DA_Weapon_M249`.

Map cũ: `/Game/WardogsLab/GunStudy/Maps/L_GunStudy`.

Ví dụ cặp AK74 được ghi trong `Saved/GunStudy/assets-report.json`:

| Hành động | Tay | Cơ khí súng |
|---|---|---|
| Fire | `/Game/WardogsLab/GunGameplay/Animations/fp_ak74_fire_FullPose_f7dbceecf570335c_bb5084f2a2` | `/Game/WardogsLab/GunStudy/RecoveredV3/AK74/Animations/A_Weap_AK74M_Fire_MutableRecovered_e00be17b` |
| Tactical reload | `/Game/WardogsLab/GunGameplay/Animations/fp_ak74_reload_FullPose_7af7e33687112049_536e21c5f2` | `/Game/WardogsLab/GunStudy/RecoveredV3/AK74/Animations/A_Weap_AK74M_Reload_Tactical_MutableRecovered_17e792f3` |
| Empty reload | `/Game/WardogsLab/GunGameplay/Animations/fp_ak74_reload_empty_FullPose_0fb6427f3ba7ffcd_4b78b7922c` | `/Game/WardogsLab/GunStudy/RecoveredV3/AK74/Animations/A_Weap_FP_AK74M_Empty_Reload_MutableRecovered_a32ff87c` |

`Scripts/build_gun_study_assets.py` kiểm tra độ dài hai clip, skeleton tương thích và hình học skinned qua các thời điểm. Cấu hình hiện tại dùng standard magazine: AK74 30, Vector 30, M249 200 viên. Có clip tên `30to75`, drum, drop/retain trong thư viện không có nghĩa mỗi biến thể đã có một bộ mesh + tay + cơ khí hoàn chỉnh và gameplay chọn đúng biến thể đó.

`Saved/GunStudy/visual-review.json` ghi lần review cũ `1B2D0AE94A127FE28D09B291A5A13228`: tay/súng thấy được; receiver AK đã căn lại; magazine, bolt, feed cover M249 biến dạng theo animation. Chính receipt này cũng ghi material còn là study PBR, chưa chứng minh shader và tiếp xúc tay/súng đúng nguyên bản. Đây là bằng chứng bản GunStudy trước, không phải kết quả kiểm thử bản video mới.

**Tài liệu lịch sử:** `Docs/GunGameplay-Integration-Audit.vi.md` mô tả giai đoạn trước khi V3 lắp được skinned mesh. Không dùng nhận xét “chỉ có static mesh” của giai đoạn đó để kết luận trạng thái hiện nay.

## 3. Những gì dùng lại được và khoảng trống về cảm giác chơi

| Hệ thống | Nền đã có trong code | Khoảng trống cần đối chiếu video |
|---|---|---|
| FPS camera | Camera theo control rotation, near clip .5, world FOV 94→65, viewmodel FOV 85, bob/sway, landing dip | Các giá trị là tuning của lab; chưa đo từ video. `EACharacter::UpdateView` dùng `Character.AimFOV`, không tự lấy FOV từ optic/profile |
| ADS/recoil | ADS pose, ADS fire nếu có; recoil đẩy control rotation rồi trả lại sau .12 giây | Chưa có native recoil pattern, sight zero, optic shader/parallax, shoulder/wall contact của game |
| Tay/súng | Hai animation đồng bộ bằng normalized fraction; chỉ hiện rig hợp lệ; mechanical mesh luôn refresh bones | Action blend gần như bật/tắt; fire nhanh reset action về đầu; chưa có state machine đầy đủ crouch/prone/jump/lean/attachment |
| Locomotion | Body walk/run/sprint/crouch/jump/fall/land; FPS blend idle/walk/sprint | FPS chưa có directional/crouch/jump action graph chi tiết. Không gọi bộ animation body là đủ mọi trạng thái FPS |
| Fire | Ammo/cooldown, automatic/burst/charge, hitscan/projectile, muzzle socket, camera-to-muzzle obstruction cho projectile | Automatic mỗi tick tối đa một shot; cadence giảm khi FPS thấp hơn cadence yêu cầu. Không chứng minh netcode/bullet simulation nguyên bản |
| Reload | Tactical/empty duration theo clip tay; gun pose cùng tiến độ; segmented audio | Phases âm thanh 0/.5/.85 là study scheduling; không phải native notify đã phục hồi. Phiên bản cũ chỉ pooled reserve, chưa phải từng băng đạn vật lý |
| Audio | Source fire, reload segments, concrete impact/footstep assets có thể nạp | Layering, indoor/outdoor response, tail/distance, native MetaSound và surface routing chưa phục hồi đầy đủ |
| VFX | Study tracer/projectile primitive, hit feedback | Không có bằng chứng muzzle flash, smoke, casings, decal chính xác như clip trong vòng hiện tại |
| Targets | Target nhận damage, strafe, return fire, health, scoring | `AWardogsLabTarget` là sphere kéo dãn; `AWardogsEATarget` thêm label/strafe. Chúng không phải human combatant gốc hoặc native AI |
| HUD | Canvas overlay, ammo/health/wave/status, crosshair/hit marker | Overlay GunStudy là công cụ học, không phải UI trong video. Cần HUD mới và screenshot đối chiếu riêng |
| Vendor/loadout | Một ví dụ transaction cũ ở ControlGameMode | Không có item grid/vendor video trong GunStudy; transaction cũ và giá cũ không được coi là recovered balance |

Các giá trị dưới đây từ `prepare_ea_gameplay.py`, được copy sang GunStudy rồi đổi sức chứa/reserve. Chúng là **tuning local study**, không phải dữ liệu cân bằng Wardogs:

| Profile | Fire interval | Damage | Projectile speed cm/s | Recoil pitch/yaw | Magazine/reserve GunStudy |
|---|---:|---:|---:|---:|---:|
| AK74 | .100 s | 26 | 80,000 | .46/.11 | 30/120 |
| Vector | .055 s | 19 | 35,000 | .23/.13 | 30/120 |
| M249 | .085 s | 22 | 70,000 | .54/.17 | 200/800 |

Chung: spread hip 1.2°, ADS .12°, projectile gravity 1. Bảng này giúp biết đang sửa gì; không được dùng làm bằng chứng “match video”.

## 4. Những chỗ dễ phá loadout khi tích hợp

1. `AWardogsEACharacter` bind Enter tới `AWardogsEAGameMode::StartSession()` không virtual. Hàm này gọi reset; chỉ viết một hàm cùng tên ở subclass không thay dispatch cũ.
2. `StartSession`, `ResetExerciseState`, `ResetArsenal`, G/Resupply có thể hồi đầy ammo. Không để một route cũ cấp miễn phí vật phẩm sau khi Vendor đã tính transaction.
3. `bAllowWeaponCycling=false` chỉ chặn CycleWeapon. Các phím trực tiếp 1/2/3 của EACharacter vẫn gọi SelectWeapon; phải thay hoặc bỏ binding khi loadout chỉ cho phép súng đã chọn.
4. `EAGameMode::SpawnWave` và ClearPracticeTargets là private; SpawnWave gọi cứng `AWardogsEATarget::StaticClass()`. Subclass target mới không tự xuất hiện nếu chỉ đổi một mesh trong cấu hình khác.
5. GameMode EA còn tự xử lý ba wave/relay, debug circles và reset. Chế độ range/vendor mới phải xác định phần nào của Super::Tick thực sự được giữ.
6. Profile là UDataAsset chia sẻ. Nếu attachment làm đổi damage, recoil hoặc capacity, cần profile runtime riêng hoặc một lớp modifier; không mutate asset dùng chung và coi là inventory của riêng người chơi.
7. Capacity 75 không tự biến magazine 30 thành drum 75. Cần variant mesh phù hợp, attachment/socket transform, cặp animation và lifecycle magazine cùng đúng.
8. `RefreshViewmodel`/`UpdateView` của EACharacter và RefreshStudyPresentation của GunStudy là private. Hook khả thi hiện tại: `CalcCamera`, `ApplyWeaponRecoil`, subclass Tick sau Super, hoặc chủ động mở một API có mục đích. Không giả định override một hàm private không virtual sẽ thay thế logic gốc.

## 5. Phần mới: opt-in physical magazines và repack

Đã viết vào WeaponComponent và `Public/WardogsMagazineRules.h`, mặc định tắt để giữ hành vi pooled ammo của các demo cũ. Đây là **quy tắc tái tạo của bản học tập**, có tham chiếu cơ chế nhìn thấy trong video; không phải native Wardogs inventory code.

API cho lớp chế độ mới:

```cpp
bool ConfigurePhysicalMagazines(const TArray<int32>& SpareRounds, int32 LooseRounds);
bool UsesPhysicalMagazines() const;
TArray<int32> GetSpareMagazines() const;
int32 GetSpareMagazineCount() const;
int32 GetLooseRounds() const;
int64 TotalCarriedRounds() const;
bool StartRepack();
void CancelRepack();
bool IsRepacking() const;
float GetRepackProgress() const;
```

- Cấu hình theo khẩu đang equip; giữ số viên hiện có trong khẩu. Chỉ nhận magazine weapon dùng đạn, không áp vào grenade/reserve-only/per-shell. Config sai bị từ chối, không sửa inventory cũ. Mỗi spare từ 0 đến capacity; tối đa 64 spare; loose 0–100,000.
- Reload chọn spare không rỗng có nhiều viên nhất, hoán đổi cả băng; băng cũ rỗng hoặc còn đạn được giữ ở slot đã lấy. Không cộng gộp nhiều spare để tự lấp đầy khẩu.
- `PhysicalReloadCommitFraction` mặc định 1.0. Nếu cấu hình commit sớm theo clip tham chiếu, số đạn đổi một lần tại mốc đó nhưng `Weapon.bReloading` vẫn giữ đến hết animation. Hủy trước mốc không đổi đạn; hủy sau mốc giữ kết quả transaction đã hoàn thành.
- Repack nạp vào spare gần đầy nhất trước; một viên mỗi `RepackSecondsPerRound`, mặc định .16 giây là tuning study. Nó không trực tiếp nạp khẩu đang cầm. Loose giảm đúng lượng spare tăng. Hủy giữ những viên đã chuyển xong, không chuyển viên đang làm dở. Không tự tạo magazine mới.
- `IsBusy()` chặn FireOnce trong lúc repack; reload cũng bị chặn. Equip và reset hủy repack. Mất quyền gameplay hoặc không được thao tác súng sẽ hủy thao tác khi tick. Root UI nên gọi rõ `CancelRepack`, `CancelReload`, `CancelFiring` ngay khi mở Vendor/death, không chờ tick tiếp theo.
- `Weapon.Reserve` trong mode này phản ánh tổng viên **đã nằm trong spare**, chưa gồm loose. HUD phải dùng GetLooseRounds riêng. `GetSpareMagazineCount` là số spare **còn đạn dùng được**; `GetSpareMagazines` vẫn giữ cả băng rỗng để backpack/repack. Giữ băng rỗng là lựa chọn bảo toàn inventory của study, không phải kết luận mọi native reload/drop đều giữ băng.
- `ResetArsenal` phục hồi đúng cấu hình ban đầu của mode này. Đây là explicit exercise reset, không phải một giao dịch mua thêm; không cho người chơi truy cập miễn phí qua route resupply cũ.
- `LastImpactPoint` mới lưu tại NotifyImpact để lớp hiệu ứng mới lấy vị trí hit. Nó không cung cấp surface/normal gốc; nếu cần decal orientation phải trace/đọc hit result bổ sung.

`Private/Tests/WardogsMagazineRulesTests.cpp` có bốn test nhóm `WardogsLab.Rules.PhysicalMagazine*`: swap partial/empty, packing/space bounds, config sai/reset, và 100 vòng fire/swap/cancel/repack cho capacity 30 và 200. Các test kiểm conservation `loaded + sum(spares) + loose + fired = initial`; mặc định pooled state cũng được kiểm để tránh đổi ngầm hành vi. **Tại thời điểm ghi tài liệu: đã kiểm diff, chưa chạy build/automation trong agent này. Kết quả chạy của bản mới phải lấy từ receipt do root tạo.**

## 6. Cách nghiệm thu bản video có ý nghĩa

| Gate | Bằng chứng cần có |
|---|---|
| Vendor thấy đúng cấu trúc | Render thật cùng độ phân giải với source: header, nhóm hàng, item list, loadout/body preview, backpack/magazine, footer; so cả hover/selection/item tooltip |
| Mua/áp loadout thực sự | Nhấn một item đổi đúng inventory/profile/mesh; transaction thất bại không mất tiền; close/reopen không nhân đôi đồ; giá $0 training được ghi rõ |
| Gun presentation | Hip/ADS/fire/tactical reload/empty reload có tay và cơ khí đúng cặp; không thay một ảnh HUD lên trên skeleton không mesh |
| Magazine model | Bắn vài viên → reload → băng cũ còn đúng viên trong backpack → C repack trừ loose → reload lại; hủy trước/sau mốc commit đều bảo toàn đạn |
| Feel | Clip thực tế bao gồm vào/ra ADS, burst tự động, recovery, chạy rồi dừng, reload rồi ready; so timeline và framing, không chỉ screenshot tĩnh |
| Attachments | Nếu UI cho lắp sight/grip thì hình học và camera/animation phải phản ánh lựa chọn; phần chỉ giả lập modifier phải ghi riêng |
| Targets | Human target phải thật sự là skeletal/humanoid presentation, nhận hit và phản hồi; không gọi primitive màu là hệ thống human combat đã hoàn chỉnh |
| Runtime regressions | Demo GunStudy cũ vẫn load/equip/fire/reload được; mode mới không cho bypass loadout bằng số/G/Enter cũ; mở UI/death dừng fire/repack/reload an toàn |

Phân biệt ba mức kết quả: **asset phục hồi được**, **gameplay tái tạo chạy được**, **cảm giác và UI đối chiếu đạt yêu cầu**. Mức thứ nhất không tự chứng minh hai mức còn lại. Video build chỉ được kết luận theo ảnh/clip/runtime receipt của chính build đó.

## 7. Điều tra bổ sung: găng tay first person

Đã inspect trực tiếp hai mesh từ archive EA bằng CLI hiện có, output riêng tại `WardogsPorting/research/gameplay/VrtwXz94dQg/gloves-probe/output/`; không mở game hoặc Editor. `inspect.json` ghi cả hai `Decoded`, không có parser warning. `compatibility-audit.json` lưu phép so từng bone theo **tên**, không lấy array index của mesh này áp vào mesh kia.

Candidate: `/Game/Characters/Default_PlayerMesh/FP/SK_Temp_Glove_arms.SK_Temp_Glove_arms`.

| Thuộc tính | Kết quả đọc trực tiếp |
|---|---|
| Skeleton source | Cùng `/Game/Characters/Default_PlayerMesh/FP/SKEL_FP_Character_Refactor` với mesh hiện hành |
| Bones | 176 bone, cùng tập tên và cùng parent theo tên; thứ tự mảng khác nhau |
| Bind của weapon_r, CameraBone | Giống nhau; hand_r cũng không có khác biệt rotation đáng kể |
| Bind khác biệt | Translation lớn nhất khoảng .453 cm tại clavicle_l; rotation lớn nhất 16.53° tại knucklepad_r; hand_l khoảng .835° |
| Hình học | Hai phần arms mỗi phần 3,670 triangle; phần gloves riêng 17,452 triangle |
| Material gloves | `/Game/Characters/Player/Gloves/000/MAT/MI_Gloves_000` |
| Phụ thuộc hậu xử lý | `ABP_FPCharacter_PostProcess`, `DG_DualQuat`; chưa phục hồi graph/deformer tương ứng trong demo |

Mesh này là candidate thực tế cho import dùng cùng skeleton; không cần đoán một mesh bàn tay từ third person. Tuy nhiên, phải kiểm pose/skin sau khi import trước khi thay default: bind không hoàn toàn đồng nhất, và native postprocess chưa có. Không được copy skin-weight bone indices giữa hai mesh vì thứ tự local bones khác nhau.

Đã xem trực tiếp texture nguồn `T_Gloves_000_BC.png` và frame `source-0365s.png`: nguồn có texture găng tay thật; frame có găng olive và tay áo xanh. Dữ liệu mới chỉ chứng minh geometry/material candidate, chưa chứng minh đúng preset màu/tay áo trong video. Texture base color không tự phục hồi custom tint/material graph hoặc sleeve mesh.

## 8. Review vòng code VideoGameplay đầu tiên

Review chỉ đọc khi file đang được root phát triển; các mục sau là phát hiện cần kiểm lại trên revision cuối, không phải khẳng định chúng còn tồn tại trong bản phát hành:

- `BeginTraining` gán loaded magazine 30 trước ConfigurePhysicalMagazines: cần rollback khi cấu hình thất bại, tránh một transaction thất bại vẫn cấp đạn.
- EA death gọi DisableMovement. Khi BeginTraining phục hồi Health phải phục hồi `MOVE_Walking` và trạng thái visibility/action thích hợp; chỉ bỏ suspend input không làm CharacterMovement chạy lại.
- Sight component cần transform/socket/material và `FirstPersonPrimitive` nhất quán với súng. Một static sight mới attached identity không chứng minh đã thẳng reticle; projection world và projection first person khác nhau có thể làm chúng tách nhau khi FOV đổi.
- Recoil override hiện chỉ sửa camera; nó không cập nhật WeaponKick private của EACharacter. Có thể là chủ ý, nhưng phải so chuyển động súng trong clip, không coi mặc nhiên đã giữ hiệu ứng kick cũ.
- Kiểm `IsA<UWardogsGunStudyAnimInstance>()` của parent chấp nhận subclass VideoAnimInstance; không có lỗi parent bắt buộc tái tạo AnimInstance về lớp base mỗi frame ở đoạn đó.
