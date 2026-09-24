# Phiếu tái tạo một khẩu súng

Sao chép file này cho mỗi khẩu. Các ô trống là việc phải điều tra, không phải cấu hình runtime đã tồn tại. Dùng cùng [quy trình](03-Weapon-Reconstruction-Workflow.vi.md); không điền mặc định hệ số của AK74.

## Hồ sơ

| Trường | Điền |
|---|---|
| Tên / variant / profile ID | … |
| Người thực hiện / ngày | … |
| Mục tiêu lượt này | … |
| Build/archive nguồn | … |
| Video / timestamp / hash / FPS / resolution | … |
| CSV hoặc tài liệu bổ sung / phiên bản | … |
| Optic / muzzle / magazine / ammo | … |
| Map / camera / tư thế | … |
| Baseline được chấp nhận | … |
| File/commit/build hash đang sửa | … |

## Bằng chứng

Chỉ dùng nhãn: **asset nguồn đã đọc**, **đo video/audio**, **nguồn cộng đồng**, **lựa chọn tái tạo**, **chưa biết**. Thêm hàng khi cần.

| Đại lượng/asset | Giá trị/path | Nhãn | Nguồn cụ thể | Sai số/giới hạn |
|---|---|---|---|---|
| Fire mode và cadence | … | … | … | … |
| Băng đạn/chamber | … | … | … | … |
| HIP/ADS FOV hoặc tỷ lệ zoom | … | … | … | … |
| Viewmodel FOV/transform | … | … | … | … |
| Aim-in/out timeline | … | … | … | … |
| Fire additive base | … | … | … | … |
| Recoil camera | … | … | … | … |
| Spread/velocity/gravity | … | … | … | … |
| Damage/armor/zone | … | … | … | … |
| Audio/VFX routing | … | … | … | … |

## Asset và lắp ráp

| Thành phần | Asset/path | Đã kiểm | Thiếu/fallback |
|---|---|---|---|
| Arms mesh / skeleton | … | ☐ | … |
| Weapon mesh / skeleton / skin weights | … | ☐ | … |
| Part / magazine / optic / material | … | ☐ | … |
| Weapon socket / muzzle / eject | … | ☐ | … |
| Idle / walk / sprint | … | ☐ | … |
| ADS-in / ADS-out | … | ☐ | … |
| HIP Fire / ADS Fire | … | ☐ | … |
| Mechanical Fire / AimFire | … | ☐ | … |
| Last-round / empty idle | … | ☐ | … |
| Tactical reload / empty reload | … | ☐ | … |
| Open / insert / close nếu cần | … | ☐ | … |
| Equip / inspect | … | ☐ | … |
| Sound variants / foley / tails | … | ☐ | … |
| Muzzle / smoke / casing / impact | … | ☐ | … |

Ghi riêng độ dài arms và mechanical, montage segment, play rate, blend và notify. Có clip không đồng nghĩa đã phục hồi graph sử dụng clip đó.

## Ca tham khảo và input tái hiện

| Case ID | Đoạn nguồn | Input lab | Trạng thái ban đầu | Cửa sổ được phép kết luận |
|---|---|---|---|---|
| hip-single | … | … | … | … |
| hip-auto hoặc rapid-semi | … | … | … | … |
| ads-single | … | … | … | … |
| ads-auto hoặc rapid-semi | … | … | … | … |
| ads-in/out | … | … | … | … |
| tactical-reload | … | … | … | … |
| empty-reload | … | … | … | … |
| locomotion | … | … | … | … |

- Trigger timestamp biết/không biết: …
- Mốc phản ứng nhìn thấy và sai số frame: …
- Seed, fixed delta, world/viewmodel FOV: …
- Đường dẫn config và lệnh chạy thực tế: …
- Manifest + telemetry + hash bản build: …
- Audio capture có/không, thiết bị/mức volume: …

## Giả thuyết → thử nghiệm → kết luận

| ID | Triệu chứng nhìn thấy | Nguyên nhân nghi ngờ | Thay đổi duy nhất/nhóm biến | Kết quả | Chọn/loại và lý do |
|---|---|---|---|---|---|
| H1 | … | … | … | … | … |
| H2 | … | … | … | … | … |
| H3 | … | … | … | … | … |

Trước khi chỉnh số, thử loại lỗi base pose, additive, attachment, clock, tick order và double recoil. Không đoán “recoil quá mạnh” chỉ từ đầu súng rung.

## Bảng đo trước/sau

| Phép đo | Vùng/đơn vị | Nguồn | Baseline | Ứng viên | Sai số/độ tin cậy |
|---|---|---|---|---|---|
| Khoảng cách các shot | ms | … | … | … | … |
| Chuyển động nền | px/độ, ghi FOV | … | … | … | … |
| Quỹ đạo đầu ruồi | px, relative anchor | … | … | … | … |
| Quỹ đạo thân súng | px / scale | … | … | … | … |
| Bước nhảy frame lớn nhất | px | … | … | … | … |
| ADS entry / exit | ms | … | … | … | … |
| Reload commit / ready | ms | … | … | … | … |
| Shot→flash / shot→audio | ms | … | … | … | … |
| Accuracy/STK/TTK theo ca | ghi điều kiện | … | … | … | … |

Không gộp pixel toàn cảnh khác map thành một điểm fidelity. Không hạ điểm sai lệch bằng cách tự dịch timeline từng ứng viên. Ghi các frame mất dấu vì flash/khói thay vì lặng lẽ giữ số đo lỗi.

## Hồi quy và bàn giao

| Kiểm tra | Kết quả/receipt | Ghi chú |
|---|---|---|
| HIP/ADS single và liên tục | … | … |
| HIP↔ADS giữa shot/burst | … | … |
| Full magazine / last round / empty trigger | … | … |
| Tactical/empty/per-shell reload | … | … |
| Hủy reload trước/sau commit | … | … |
| Switch weapon / menu / reset | … | … |
| Walk/crouch/sprint/landing | … | … |
| Vật cản gần / aim ray / muzzle | … | … |
| Damage zone / armor / ammo | … | … |
| Nhiều FPS và hitch theo công cụ hiện có | … | … |
| Nghe audio thật, kiểm overlap/cutoff | … | … |
| VFX và hit feedback | … | … |
| Baseline khác không bị đổi | … | … |
| Người dùng chơi thử | … | … |

- **Đã giống hơn ở đâu, bằng chứng nào:** …
- **Chưa biết hoặc chưa đạt:** …
- **Phạm vi đã đo; không suy rộng:** …
- **Thông số cuối + lý do:** …
- **Level/launcher:** …
- **Trang đối chiếu:** …
- **Build/test receipt:** …
- **Bước tiếp theo và điều kiện cần:** …

Chỉ đánh dấu hoàn thành phạm vi thực sự đã kiểm. Một hệ profile/config tổng quát cho mọi đường recoil, một audio comparator hoặc kiểm mạng mới là đề xuất phát triển nếu chưa có code và receipt tương ứng; phiếu này không làm chúng tự tồn tại.
