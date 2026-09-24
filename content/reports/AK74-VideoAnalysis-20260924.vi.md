# AK74: lỗi cảm giác bắn và phép đo từng frame

Phạm vi tài liệu này chỉ là AK74: hip một viên, ADS một viên, hip giữ cò và ADS giữ cò. Nguồn là [WARDOGS All Weapons Showcase](https://www.youtube.com/watch?v=bxMd6SvtJi8), file local `source-1080.webm`, 1920×1080, 60 FPS, SHA256 `011eaf4148ce2c9c717c2bb83c4b6407bbcfec67fe392219617ba27d046725c9`. Không biết input chuột, FOV tuyệt đối hoặc build game của người quay. Mốc nhìn thấy trong video không phải mốc nhấn chuột.

## 1. Lỗi rõ nhất: đang ADS nhưng phát Fire trên tư thế hip

Capture trước sửa `Saved/RuntimeBurst/328C1D7042CC8F615A44FFB6EB869EFF/manifest.json` cho thấy ngay frame 0 của `ak74-ads-single`, súng chạy sang phải thành tư thế hip. Đến khoảng 1,08–1,2 giây mới trở lại đường ngắm. Đây là sai khác rất lớn, có thể thấy trực tiếp bằng ảnh; số bone khớp clip không phát hiện được vì clip được đặt lên sai tư thế nền.

Ở video, thước ngắm sau vẫn gần giữa màn hình suốt viên bắn ADS. Trong 200ms đầu, điểm đo ở thước ngắm chỉ dao động khoảng −3 đến +3,4 pixel tại1080p. Bản trước sửa lệch ngang xấp xỉ190 pixel1080p giữa tư thế hip khi bắn và tư thế ADS sau đó. Đây là hai phép quan sát tại cùng vị trí bộ phận, không phải phép đăng ký pixel giữa hai môi trường.

Nguyên nhân được điều tra trong source: AimFire được xuất thành FullPose từ một base hip idle thay thế; lấy FullPose đó đè lên ADS bằng alpha1 làm mất ADS. Cách sửa cần khôi phục delta của animation rồi cộng lên base ADS hiện tại. Chỉ tăng tốc clip hoặc đổi recoil không giải quyết được lỗi này.

[Trang đối chiếu từng frame (workspace)](../../references.html#local-e3d92080dd81) có bản trước sửa, bản chỉ sửa pose và bản có recoil mới khi capture cuối đã được thêm. Khi chưa có capture cuối, trang ghi rõ trạng thái chờ.

## 2. Camera nguồn không tự kéo về vị trí cũ như bản lab

Phép đo độc lập với chuyển động súng:

- Chọn feature của cảnh ở hai vùng trái/phải, bỏ HUD, title và vũ khí.
- Theo dõi bằng Lucas–Kanade pyramidal, kiểm tra forward/backward dưới1pixel.
- Fit homography bằng RANSAC từ feature ban đầu tới từng frame; đo dịch chuyển tại tâm ảnh.
- Đo riêng feature trên thước ngắm sau. Không dùng chuyển động súng làm chuyển động camera.
- Các viên đơn giữ264–351 feature cảnh, sai số fit trung vị khoảng0,09–0,15pixel. Sai số này không bao gồm bất định FOV, input, motion blur hay build khác nhau.

Y dương trong bảng nghĩa là cảnh trượt xuống trong ảnh, tương ứng hướng nhìn tăng lên. Đơn vị là pixel của video1080p.

| Sau mốc nhìn thấy | Cảnh HIP | Cảnh ADS | Thước ngắm ADS |
|---:|---:|---:|---:|
| 0ms | −3,08 | +2,43 | +3,39 |
| 17ms | −3,36 | +0,26 | −2,94 |
| 33ms | +1,35 | +2,42 | −2,97 |
| 50ms | +5,65 | +7,37 | −1,67 |
| 67ms | +8,20 | +12,28 | +0,12 |
| 100ms | +13,81 | +16,92 | +1,66 |
| 150ms | +11,37 | +16,55 | −0,66 |
| 200ms | +10,17 | +15,13 | −1,83 |
| 300ms | +13,35 | +17,50 | +1,14 |
| 400ms | +12,90 | +17,15 | +0,94 |
| 500ms | +12,64 | +16,99 | +0,81 |
| 600ms | +12,90 | +17,18 | +0,91 |

Ở500ms, video còn giữ khoảng91,5% độ tăng đỉnh ở HIP và97,1% ở ADS. Capture trước sửa chỉ giữ5,77% vì cộng pitch tức thời rồi chạy hồi tâm sau120ms với tốc độ7. HIP từ0,75° rơi còn0,04324°; ADS từ0,525° còn0,03027°.

Nguồn có phần tăng dần khoảng100ms, gợn nhỏ rồi giữ vị trí mới. Bốn viên ADS cách nhau trong425,5–427,8 giây tạo thành bốn bậc tăng của cảnh, trong khi thước ngắm trở về gần tâm sau mỗi viên. Điều này ủng hộ việc bỏ spring kéo toàn bộ aim về điểm trước bắn. Tuy vậy, video công khai không chứng minh người chơi không di chuột; đây là bằng chứng quan sát lặp lại, không phải code recoil gốc.

## 3. Thông số fit theo điều kiện FOV của lab

[AK74RecoilFit.json (workspace)](../../references.html#local-c7f49feebdca) được sinh từ từng frame đo, không lấy độ quay của `weapon_r` làm recoil camera:

`pitch = atan(worldY / (960 / tan(47°) × ironRatio))`

Giả định HIP FOV ngang94° của lab và tỉ lệ zoom ADS1,28. Do FOV nguồn không biết, các góc này là phép fit có điều kiện. Phần giữ lại đo được:

| Chế độ | Pixel nguồn giữ lại | Góc có điều kiện | Cửa sổ lấy trung bình |
|---|---:|---:|---|
| HIP | 12,8554px | 0,822716° | 500–800ms,19frame |
| ADS | 17,1238px | 0,856155° | 500–600ms,7frame |

Không dùng ADS đến800ms vì nguồn đã bắn viên thứ hai. Độ dao động trong đoạn ổn định tương ứng0,0060°/0,0030°; đó không phải khoảng sai số tổng. Sai số hệ thống vì FOV hoặc mouse input lớn hơn và chưa xác định.

Các sample0–500ms giữ gợn/dip nhìn thấy; sau600ms giữ plateau. Vì quỹ đạo đo là tổng chuyển động camera nhìn thấy, không cộng thêm toàn bộ `CameraBone` một lần nữa. Không tự suy diễn hệ số giảm recoil ADS0,7: tỉ lệ pixel ADS/HIP gần với mức zoom thế giới1,28, phù hợp với góc giữ lại gần bằng nhau trong hai chế độ.

## 4. Giữ cò: phần đã đo và phần chưa suy ra được

Mốc HIP auto nhìn thấy flash đầu là416,200s; ADS auto thấy bolt chuyển động ở428,467s, đều có bất định ít nhất±1frame. Bằng chứng âm thanh đã đo trước đó cho khoảng92ms, gần650RPM.

Trong đoạn HIP416,25s trở đi, cảnh tăng14,82 /35,24 /58,00 /105,62 /237,37pixel tại100/200/300/500/1000ms. Phép fit còn175 inlier ở1giây, sai số trung vị0,8pixel. Tốc độ tăng này lớn hơn việc cộng đơn giản plateau13pixel cho từng viên650RPM. Có thể liên quan tới recoil khi giữ cò, tích lũy vận tốc, camera curve hoặc input người quay. Chưa có căn cứ để chép một hệ số như thể đã đọc được từ game.

Sau khoảng1,7giây của HIP auto, nhiều landmark đi ra khỏi màn hình. Dữ liệu `motion-curves.json` gắn `fitReliable=false` khi còn dưới25 inlier cảnh; không dùng đoạn đó để suy ra góc. Đường vàng trên biểu đồ dừng tại đoạn không đủ inlier. Ngay cả đoạn còn đủ inlier cũng không tách được mouse input.

Runtime đối chiếu giữ cò1giây; video giữ lâu hơn. Từ thời điểm lab thả cò, hai chuỗi không còn cùng input, nên không dùng vị trí camera cuối chuỗi để kết luận chính xác1:1.

Đã đo lại đoạn đầu bằng mốc viên đầu, thay vì mốc ở giữa chuỗi. Hai lượt HIP và ADS cho góc có điều kiện gần trùng nhau, trong khi yaw tương ứng chỉ dao động khoảng0,37° hoặc ít hơn:

| Sau viên đầu | HIP quan sát | ADS quan sát | HIP cộng đơn giản | ADS cộng đơn giản |
|---:|---:|---:|---:|---:|
|100ms|0,866°|1,059°|0,679°|0,917°|
|300ms|3,700°|3,666°|2,289°|2,564°|
|500ms|6,632°|6,780°|4,183°|4,431°|
|900ms|12,658°|12,903°|7,820°|8,257°|
|1000ms|14,040°|14,288°|8,768°|9,155°|

Tại1giây vẫn còn201/212 inlier HIP/ADS, sai số fit hình0,91/0,68pixel. Sự nhất quán giữa hai lượt độc lập là lý do có thể thử một gain tích lũy chung cho AK74; đây vẫn là phép fit quan sát. File `auto-onset-curves.json` giữ cả X và Y để không gộp yaw vào pitch.

Fit chung122 sample của hai lượt, với curve một viên đã đo và cadence650RPM:

`gain(n) = 1 + 0,7115928384 × (1 − exp(−n / 0,7248995427))`

`n=0` là viên đầu nên gain luôn1. Chỉ số được chặn ở10 vì cửa sổ bằng chứng dừng ở11 viên. Gain bão hòa xấp xỉ1,71159; không tiếp tục tăng vô hạn. Bản lab reset chuỗi sau khoảng nghỉ lớn hơn hai fire interval. Quy tắc reset này là lựa chọn của bản lab, không được suy ra trực tiếp từ video.

RMSE góc có điều kiện trên122 sample giảm từ2,98415° khi cộng đơn giản xuống0,27550° sau fit. Không tối ưu lệch thời gian để che sai khác. Các sai số vẫn còn: tại300ms HIP thiếu0,547°; tại1giây ADS thừa0,567°. Khác biệt khoảng một frame của onset và cách camera dao động qua các viên có thể đóng góp, nhưng chưa chứng minh nguyên nhân duy nhất. Không được gọi kết quả này là trùng từng frame hay recoil graph nguyên bản.

Generator `fit_auto_gain.py` quét1.600 giá trị tau, giải hệ số biên độ có giới hạn bằng least squares; kết quả và toàn bộ residual nằm trong `auto-gain-fit.json`. Không thay đổi yaw dựa trên phép fit pitch này.

## 4a. Kiểm tra trên ảnh thực, không chỉ đọc telemetry

Ở lượt cuối `44D84FE24D42FD94FB579C8A5E1DF80F` (pose ADS, curve một viên và gain auto), đã theo dõi lại cảnh trong PNG Unreal độc lập với controller pitch log. Tính tương đối từ frame bắn đầu tiên và quy đổi kích thước ảnh runtime960×540 về1080p:

- HIP một viên: RMSE dọc0,1133pixel, sai số lớn nhất0,2572pixel trong37frame0–600ms. Bản trước sửa có RMSE22,2007pixel.
- ADS một viên: RMSE dọc0,0984pixel, sai số lớn nhất0,2050pixel trong37frame0–600ms. Bản trước sửa có RMSE20,4636pixel.
- HIP giữ cò: RMSE dọc5,1483pixel trong61frame0–1giây; trước gain auto là48,9565pixel. Sai số lớn nhất12,1430pixel.
- ADS giữ cò: RMSE dọc5,1972pixel trong61frame0–1giây; trước gain auto là59,5277pixel. Sai số lớn nhất12,8268pixel.

Đây là bằng chứng đường chuyển động dọc đo được đã được đưa vào ảnh thực đúng thời điểm, không chỉ là config đọc ra đúng. Vì thiếu PNG runtime trước bóp cò, phép đo không kiểm chứng độ dịch chuyển tức thời từ trước bắn tới frame0. Phép đo cũng không chứng minh yaw, roll, kích thước thước ngắm, âm thanh hoặc VFX đã khớp. Số đo cuối trong `final-pixel-motion.json` và `gainfit-auto-pixel-motion.json`; các script `measure_runtime_pixels.py`/`measure_runtime_autos.py` chạy lại được với manifest khác.

## 4b. Sai khác còn lại ở thước ngắm ADS

Đã theo dõi riêng feature trên thước ngắm, lấy vị trí ổn định500ms làm mốc. Không đánh đồng kích thước lớn lên với x/y lệch đi:

| Thời điểm | Nguồn: x/y so với500ms | Runtime: x/y so với500ms | Nguồn: tỉ lệ kích thước | Runtime: tỉ lệ kích thước |
|---:|---:|---:|---:|---:|
|0ms|+1,67 /+2,25px|−8,32 /−9,94px|1,069|1,062|
|33ms|−0,34 /−4,16px|−10,83 /−13,92px|1,084|1,096|
|100ms|+2,13 /+0,79px|−2,51 /−6,23px|1,015|1,031|
|200ms|−0,38 /−2,64px|+0,40 /−0,56px|0,998|0,997|

Sai số fit feature runtime khoảng0,12–0,26pixel ở540p; nguồn khoảng0,13–0,40pixel ở1080p. Lệch pha±1frame không giải thích hết chênh lệch vị trí10–15pixel. Tuy nhiên, phần thay đổi kích thước khi súng lùi về camera đã khá gần; giảm toàn bộ trọng số AimFire sẽ làm hỏng phần này. Vì thế không sửa mù bằng cách nhân animation với0,25 hoặc bỏ key đầu.

Lỗi nhảy hẳn về hip khi ADS đã được loại bỏ, nhưng nguồn và runtime còn khác ở căn chỉnh sight/camera hoặc cách dùng clip. Dữ liệu `source-ads-sight-similarity.json` và `final-sight-motion.json` ghi rõ phần còn lệch. Đây là lý do kết quả cuối không được gọi là1:1 toàn bộ cảm giác bắn.

## 5. Mốc, dữ liệu và cách tái lập

| Ca | Mốc nguồn | Loại mốc |
|---|---:|---|
| HIP một viên |415,200s|Flash nhìn thấy đầu tiên|
| ADS một viên |425,517s|Bolt và thước ngắm bắt đầu chuyển động|
| HIP auto |416,200s|Flash đầu chuỗi|
| ADS auto |428,467s|Bolt đầu chuỗi|

Toàn bộ PNG nguồn có PTS và SHA trong `WardogsPorting/research/gameplay/bxMd6SvtJi8/ak74-focus-20260924/*/frames.json`. File nguồn không bị đổi, PNG không được resample để đo. JPG/contact sheet chỉ là ảnh xem nhanh.

- `extract_focus.py`: trích frame nguồn.
- `measure_motion.py`: đo cảnh và thước ngắm độc lập; `motion-curves.json` giữ số đo đầy đủ.
- `export_single_curves.py`: tạo `observed-single-recoil-curves.json`, gồm curve chuẩn hóa0–600ms.
- `export_recoil_config.py`: tạo config góc theo FOV giả định của lab.
- `Scripts/publish_ak74_focus_comparison.py --final <manifest>`: tạo trang đối chiếu cuối, kiểm tra PNG/SHA, đúngAK74/đúngaction/60Hz.
- `Scripts/validate_ak74_focus_comparison.js`: chạy JavaScript thật với DOM giả tối thiểu, kiểm tra chọnca/bướcframe/khungtrống/đườngdẫn. Không thay thế kiểm tra layout bằng browser.

Những khác biệt chưa được phép gọi là1:1: camera auto và input nguồn, audio nhiều lớp, muzzle flash/smoke, vỏ đạn, chất liệu tay/áo/súng, ánh sáng môi trường, motion blur, FOV viewmodel tuyệt đối và cơ chế recoil ngẫu nhiên. Việc sửa lỗi ADS base và đường recoil quan sát được giúp giải quyết sai khác cụ thể, không biến những phần chưa biết thành dữ liệu gốc.
