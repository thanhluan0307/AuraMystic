# Quy tắc lập lá số

- Nhận ngày dương lịch Gregorian 1800–2199, chuyển âm lịch Việt Nam UTC+7.
- Năm Can Chi lấy năm âm, không lấy năm dương hoặc mốc Lập Xuân.
- Tháng nhuận giữ nguyên số tháng âm cho Mệnh, Thân, Tả Phù, Hữu Bật.
- Giờ Tý dùng ngày dân sự được nhập. Form chỉ nhận chi giờ, không tách Tý sớm/muộn; không hiệu chỉnh giờ mặt trời theo nơi sinh.
- An Mệnh nghịch giờ, Thân thuận giờ từ tháng âm, khởi tháng giêng tại Dần.
- Mệnh → Phụ Mẫu → Phúc Đức… đi thuận địa chi.
- Ngũ Hổ Độn cho Can cung Mệnh; nạp âm Can Chi cung Mệnh xác định Cục.
- An Tử Vi theo ngày âm và Cục: bù ngày tới bội Cục, thương đếm từ Dần là 1, bù lẻ lùi/chẵn tiến. Các chính tinh còn lại an theo Tử Vi và Thiên Phủ.
- Đại hạn bắt đầu bằng số Cục, 10 tuổi/cung; Dương Nam/Âm Nữ thuận, Âm Nam/Dương Nữ nghịch.
- Tứ Hóa đi cùng sao gốc. Giữ bảng hiện có: Mậu có Hữu Bật hóa Khoa, Canh có Thái Âm hóa Khoa, Nhâm có Thiên Phủ hóa Khoa. Các phái có thể dùng bảng khác.
- Miếu/vượng/đắc/bình/hãm là bảng tra 12 địa chi trong `src/data/tuViRules.ts`, có nguồn bên dưới; không tính từ hành sao. Dị bản có thể cho kết quả khác.

## Phạm vi

Đã tính 14 chính tinh, Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Lộc Tồn, Kình Dương, Đà La và Tứ Hóa. Chưa có Tuần/Triệt và các vòng phụ tinh. Giao diện và prompt AI ghi rõ phạm vi này.

## Nguồn đối chiếu

- Lịch Hồ Ngọc Đức / mô hình thiên văn: https://www.informatik.uni-leipzig.de/~duc/amlich/calrules_en.html
- Bản triển khai công khai để đối chiếu lịch: https://github.com/vanng822/amlich/blob/master/lib/amlich-aa98.js
- Cung, Cục, chính tinh, đại hạn: https://hocvienlyso.org/chuong-3-an-sao-la-so-tu-vi-phan-1.html
- Can giờ từ Can ngày: https://lichngaytot.com/12-con-giap/cach-tinh-can-gio-qua-can-ngay-276-152853.html
- Bảng đặc tính sao: https://github.com/doanguyen/lasotuvi/blob/master/lasotuvi/DiaBan.py
- Bảng Thiên Phủ: https://hocvienlyso.org/y-nghia-thien-phu-o-cac-cung.html
- Ngày mẫu: https://xskt.com.vn/lich-am-van-nien/ngay/18-8-1998

## Kiểm chứng

Chạy `node --test tests/tuViCalc.test.cjs` và `npx tsc --noEmit`.
Các test bao gồm ngày mẫu, ranh giới Tết, tháng nhuận, khác biệt lịch Việt/Trung năm 2007, ngày không hợp lệ, và 720 tổ hợp năm/giờ để kiểm tra cung, sao, Tứ Hóa.
