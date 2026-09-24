# AK74: âm thanh đang làm cảm giác bắn khác video ở đâu?

Phạm vi: video `bxMd6SvtJi8`, nguồn local 1080p60 có SHA256 `011eaf4148ce2c9c717c2bb83c4b6407bbcfec67fe392219617ba27d046725c9`; chỉ AK74. Đây là đối chiếu waveform cùng loại asset, không phải suy đoán bằng tên súng.

## Kết luận có bằng chứng

Trước sửa, `WardogsWeaponComponent::FireOnce` gọi `PlayLabSound` đúng một lần mỗi viên. Tuy nhiên `PlayLabSound` chỉ phát `SFX_Weapon_AR_01_Fire_1p_Core_01`, hệ số âm lượng thử nghiệm `0.5`, đặt tại muzzle đang di chuyển, qua attenuation có `bSpatialize=true`. Không tìm thấy một lần gọi fire sound thứ hai trong luồng này. Nó **lặp cùng một mẫu âm**, không phải một vòng audio loop.

Video có nhiều biến thể core khác nhau. Đã xuất thành công 35 SoundWave riêng của AK74, chỉ đọc archive và không chạy game gốc: **10 Core, 5 Punch, 10 Mech, 9 Rattle, 1 FinalBullet**. Dùng tương quan chéo waveform để so từng core với âm thanh video:

| Cửa sổ âm thanh video | Mẫu khớp mạnh nhất | Thời điểm trong audio nguồn | Tương quan của 80 ms đầu |
|---|---|---:|---:|
| Hip single, bắt đầu 415 s | Core_02 | 415.326021 s | 0.7212 |
| ADS single, bắt đầu 427 s | Core_07 | 427.655354 s | 0.5150 |
| Hip auto, bắt đầu 416.2 s | Core_09 | 417.710396 s | 0.7157 |
| Hip auto | Core_02 | 416.510604 s | 0.7045 |
| Hip auto | Core_03 | 416.972063 s | 0.6931 |
| ADS auto, bắt đầu 429 s | Core_08 | 429.702854 s | 0.6032 |

Phương pháp: PCM stereo 48 kHz, lấy mono để đo; đạo hàm bậc một để giảm nền và các lớp trầm; tương quan chuẩn hóa với 80 ms đầu của từng source core. Có Opus, các lớp âm khác, nền và mix nên không chờ tương quan bằng 1. Các mốc trên là **mốc âm thanh**, không tự đồng nhất với frame muzzle flash hoặc input.

Kết luận đủ mạnh: dùng Core_01 cho mọi viên không thể cho cùng biến thiên âm sắc như video. Đổi bank 10 mẫu sẽ bỏ sự lặp máy móc này. Thuật toán chọn ngẫu nhiên gốc và seed gốc chưa được phục hồi; lựa chọn không lặp liền nhau trong lab là quy tắc tái tạo, không phải quy tắc được giải mã từ game.

## Punch thiếu trong bản cũ, nhưng chưa biết đúng mixer gốc

Tất cả bốn mẫu đầu đã xuất trước đây đều là stereo 48 kHz. Đo các mẫu:

| Lớp | Độ dài file | Đặc tính định lượng |
|---|---:|---|
| Core_01 | 2.600 s | 95% năng lượng trước 92.83 ms, 99% trước 166.50 ms; phần lớn file là đuôi nhỏ |
| Punch_01 | 0.300 s | 80.32% năng lượng nằm 20–150 Hz; bổ sung lực trầm |
| Mech_01 | 0.400 s | Đã có khoảng im lặng 40.08 ms ở đầu file trước transient; không nên tự thêm tiếp 40 ms delay |
| FinalBullet_01 | 0.430 s | Lớp cơ khí cao tần, không phải core thông thường |

Thử fit tuyến tính waveform 200 ms của hai viên đơn, chọn đúng variant và chỉ cho offset -4..4 sample:

| Viên đo | Chỉ core: phần phương sai giải thích được | Core + Punch | Hệ số fit Core / Punch |
|---|---:|---:|---:|
| Hip | 72.47% | 86.23% | Core_02 = 0.7290 / Punch_04 = 0.5587 |
| ADS | 55.66% | 78.73% | Core_07 = 0.6813 / Punch_02 = 0.8716 |

Hai mẫu Punch tốt nhất đều không cần dịch sample tương đối với core. Đây là bằng chứng lớp trầm riêng đang thiếu. Nhưng tỷ lệ Punch/Core là **0.766 và 1.279**, chênh 67%; chỉ hai viên không đủ khẳng định nguyên nhân là ADS, random gain, codec, hay mixer. Không biến các hệ số fit này thành “giá trị native”. Thêm Mech/Rattle vào phép fit hiện tại chỉ cải thiện dưới 0.02 điểm phần trăm; kết quả này không chứng minh chúng vắng mặt, vì có thể khác variant, pitch hoặc trigger.

`MSS_Weapon_AR_AK74_Fire_1p_Preset` có trong catalog. Đã thử inspect strict: thất bại ở `MetasoundFrontendClassName` vì dữ liệu có property thứ tư ngoài mapping đang có. `AT_AR_AK74_1p` cũng chưa có mapping `SweejAmbienceAreaTypePreset`. Vì vậy chưa đọc được gain, randomization, layers/tails, trigger hay environment routing của mixer gốc. Không sử dụng dữ liệu deserialize dở làm kết luận.

## Phần sửa có thể kiểm tra

- `UWardogsAK74AudioComponent`: giữ 10 core của chính AK74; `FRandomStream` riêng seed 17474, không tác động random của spread/recoil; không chọn trùng viên ngay trước.
- Bank được preload trong `BeginPlay`, trước khi người chơi bóp cò, để viên đầu không phải tải đồng bộ cả 10 file.
- Phát core của người chơi local bằng stereo 2D, không pan theo muzzle; đây là quyết định tái tạo cho nguồn first-person, chưa phải phục hồi routing MetaSound gốc. Âm thanh được đánh dấu gameplay, không phải UI, để tôn trọng pause.
- Giữ hệ số 0.5 đang dùng; không tăng loudness để che khác biệt. Không tự ghép Punch/Mech/Rattle khi hệ số và điều kiện còn chưa đủ chắc.
- Mỗi lần gọi thành công vẫn là **một request âm thanh cho một viên**. Caller tăng bộ đếm logical shot; component giữ bộ đếm voice và index variant riêng.
- Importscript kiểm tra SHA256 của từng WAV, nguồn đúng namespace AK74 unsuppressed, đủ 10 core, stereo 48 kHz; chỉ ghi config bank sau khi cả 10 được import và lưu thành công.

Thời gian giữa các request âm thanh hiện vẫn bị giới hạn bởi game-thread tick: 650 RPM có chu kỳ 92.31 ms nhưng ở 60 Hz thời điểm gọi có thể xen kẽ 83.33/100 ms. Audio-clock/Quartz/MetaSound scheduling chưa được triển khai. Đừng gọi việc khớp logic RPM là đã khớp từng sample âm thanh.

## Biên nhận và cách chạy lại

- [Manifest 35 mẫu xuất mới (workspace)](../../references.html#local-5beb9ed54782).
- [Đo waveform/source PCM và SHA256 (workspace)](../../references.html#local-e089920a6502).
- [Tương quan từng variant (workspace)](../../references.html#local-5f16864498d9).
- [Fit các lớp (workspace)](../../references.html#local-3452e06a36df).
- Nghe phép fit offline: [audio video (workspace)](../../references.html#local-11d8e761c290), [chỉ Core (workspace)](../../references.html#local-ac8fcb7074bd), [Core + Punch (workspace)](../../references.html#local-b19a6401c3d6). Cả ba cùng một hệ số headroom, không normalize riêng. Đây là phép fit của một viên đã biết, **không phải audio gameplay đang chạy**; Punch vẫn chưa được bật trong runtime.
- [Biên nhận strict inspect thất bại, ghi đúng giới hạn mapping (workspace)](../../references.html#local-05ffeebc9e25).
- [Script import vào Unreal (workspace)](../../references.html#local-c2f87e19a796), tạo `Saved/AK74Focus/audio-import.json` khi root chạy trong UE.

Các scripts phân tích độc lập nằm trong `WardogsPorting/research/gameplay/bxMd6SvtJi8/ak74-focus-20260924`: `audit_audio.py`, `match_audio.py`, `fit_audio_layers.py`. Chúng không sửa gameplay hay tự chạy Unreal. Báo cáo này không thay thế nghe A/B runtime có đầy đủ audio; captures PNG im lặng không xác minh được chất lượng âm thanh.
