# 🔮 AuraMystic - Ứng Dụng Tarot, Chiêm Tinh Học, Tử Vi & Bản Đồ Sao

Ứng dụng tâm linh và chiêm tinh học toàn diện được xây dựng bằng **Expo (React Native)**, **TypeScript** và tích hợp **Google Gemini AI 3.6 Flash** thông qua thư viện chính thức `@google/genai`.

---

## ✨ Tính Năng Nổi Bật

### 🃏 1. Bói Bài Tarot Huyền Bí (Tarot Reading)
- **Kiểu trải bài đa dạng**:
  - *1 Lá*: Thông điệp ngày mới, câu trả lời nhanh Yes/No.
  - *Trải 3 lá dòng thời gian*: Quá Khứ - Hiện Tại - Tương Lai.
  - *Trải 3 lá Tình Cảm*: Bạn - Đối Phương - Xu Hướng Mối Quan Hệ.
  - *Trải 3 lá Sự Nghiệp*: Thực Trạng - Thử Thách/Cơ Hội - Lời Khuyên Bứt Phá.
- Bộ 22 lá Major Arcana kinh điển với hình ảnh, biểu tượng, ý nghĩa xuôi/ngược và từ khóa.
- Hiệu ứng xáo bài và lật bài mượt mà.
- **Gemini AI**: Đóng vai trò Tarot Reader bậc thầy, phân tích sự liên kết giữa các lá bài và đưa ra lời khuyên chữa lành.

### ♈ 2. Chiêm Tinh Học 12 Cung Hoàng Đạo (Astrology & Synastry)
- Tra cứu chi tiết 12 cung hoàng đạo: Nguyên tố (Lửa, Đất, Khí, Nước), Phẩm chất, Hành tinh bảo hộ, Màu sắc may mắn, Điểm mạnh/yếu.
- **Dự Báo Vũ Trụ (Horoscope)**: Gemini AI luận giải chi tiết theo ngày/tuần/tháng các chỉ số Tình cảm, Sự nghiệp, Tài chính, Năng lượng tinh thần.
- **Bói Tương Hợp Tình Yêu (Synastry)**: Chọn 2 cung bất kỳ để tính toán độ tương thích (%) và nhận bài phân tích tâm lý, lực hút ban đầu, thách thức cùng bí quyết giữ lửa từ Gemini AI.

### 🐉 3. Tử Vi Phương Đông & Bát Tự (Eastern Horoscope)
- Hệ thống 12 Con Giáp, 10 Thiên Can và 12 Địa Chi.
- Tự động tính toán Can Chi Năm (Ví dụ: Giáp Thìn, Bính Dần...), Mệnh Ngũ Hành Nạp Âm Lục Thập Hoa Giáp (Lư Trung Hỏa, Hải Trung Kim...), Can Chi Giờ sinh.
- Tra cứu Tam Hợp và Tứ Hành Xung của tuổi.
- **Gemini AI Bình Giải Mệnh Số**: Luận Cung Mệnh & Thân, Cung Quan Lộc, Cung Tài Bạch, Cung Phu Thê, Vận hạn năm hiện tại và phương cách tu dưỡng, phong thủy cải vận.

### 🌌 4. Bản Đồ Sao Cá Nhân (Natal Chart Calculator)
- Nhập ngày, giờ sinh chính xác và địa điểm sinh.
- Tự động tính toán **The Big Three** (Sun Sign, Moon Sign, Ascendant / Rising Sign) và các hành tinh cá nhân: Mercury, Venus, Mars, Jupiter, Saturn.
- **Vòng tròn hoàng đạo đồ họa SVG (Natal Chart Wheel)** trực quan, sắc nét.
- **Gemini AI Giải Mã Bản Đồ Sao**: Phân tích bản thiết kế linh hồn, thế giới nội tâm thầm kín, tài năng tiềm ẩn, điểm mù tâm lý (Shadow Self) và sứ mệnh cuộc đời.

### 🔮 5. Tiên Tri Vũ Trụ Trực Tiếp (Mystic Oracle AI Chat)
- Trò chuyện tự do trong thời gian thực với AI Oracle.
- Tích hợp sẵn các câu hỏi gợi ý nhanh: Giải mã giấc mơ, Ý nghĩa số thiên thần 1111, Phong thủy phòng ngủ & bàn làm việc, Xem chỉ tay, Nâng cao trực giác.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- Node.js >= 18 (Khuyến nghị Node.js 20 hoặc mới hơn).
- Đã cài đặt npm / npx.

### 2. Khởi chạy ứng dụng

```bash
# Chạy ứng dụng trên nền tảng Web (Khuyến nghị để kiểm tra nhanh nhất)
npm run web
# hoặc
npx expo start --web

# Chạy trên thiết bị di động iOS qua Expo Go
npm run ios

# Chạy trên thiết bị di động Android qua Expo Go
npm run android

# Khởi động máy chủ Expo chung (Quét mã QR bằng ứng dụng Expo Go trên điện thoại)
npx expo start
```

---

## 🔑 Cấu Hình Gemini AI & API Key

Dự án sử dụng Google Gemini AI thông qua biến môi trường bảo mật:

- **Thư viện**: `@google/genai`
- **Mô hình chính**: `gemini-3.6-flash` (tối ưu tốc độ phản hồi cực nhanh, tư duy logic và thấu cảm tâm lý sâu sắc).
- **Cơ chế Resilience**: Tự động dùng `@google/genai` và kèm theo fallback trực tiếp đến Gemini REST API endpoint nếu môi trường di động thiếu một số module Node.js, đảm bảo ứng dụng **100% không bao giờ bị gián đoạn hay crash** trên cả Web, iOS và Android.

### Hướng dẫn cài đặt API Key:
1. Sao chép file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Điền API key của bạn vào file `.env`:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Lưu ý: File `.env` đã được thêm vào `.gitignore` để đảm bảo an toàn tuyệt đối, không bị lộ khi push lên Git).*

---

## 📁 Cấu Trúc Thư Mục

```
TL/
├── App.tsx                      # Component gốc, Bottom Tab Navigation 5 phân hệ
├── app.json                     # Cấu hình Expo và Dark Cosmic Theme
├── package.json                 # Khai báo thư viện (@google/genai, expo-linear-gradient, react-native-svg...)
├── tsconfig.json                # Cấu hình TypeScript
├── src/
│   ├── config/
│   │   └── gemini.ts            # Khởi tạo @google/genai SDK & API Key của bạn
│   ├── data/
│   │   ├── tarotCards.ts        # Cơ sở dữ liệu 22 lá bài Major Arcana, biểu tượng, ý nghĩa
│   │   ├── zodiacSigns.ts       # 12 cung hoàng đạo, thuộc tính, tính tương hợp
│   │   └── easternZodiac.ts     # 12 con giáp, thiên can, địa chi, lục thập hoa giáp
│   ├── services/
│   │   ├── geminiService.ts     # Các dịch vụ AI: Giải Tarot, Chiêm Tinh, Tử Vi, Bản Đồ Sao, Chat
│   │   └── astrologyCalc.ts     # Thuật toán tính Sun, Moon, Rising, Can Chi & Nạp Âm
│   ├── components/
│   │   ├── Header.tsx           # Thanh tiêu đề phong cách tinh tú
│   │   ├── StarryBackground.tsx # Nền trời sao lấp lánh và gradient vũ trụ
│   │   ├── TarotCardView.tsx    # Thẻ bài Tarot lật 3D, mặt trước & sau
│   │   ├── NatalChartWheel.tsx  # Vòng tròn bản đồ sao SVG sắc nét
│   │   └── AIResponseCard.tsx   # Khung hiển thị câu trả lời AI với tính năng sao chép
│   └── screens/
│       ├── TarotScreen.tsx      # Màn hình Bói Bài Tarot
│       ├── AstrologyScreen.tsx  # Màn hình Chiêm Tinh 12 Cung & Bói Tương Hợp
│       ├── TuViScreen.tsx       # Màn hình Tử Vi Phương Đông & Bát Tự
│       ├── NatalChartScreen.tsx # Màn hình Bản Đồ Sao Cá Nhân
│       └── MysticChatScreen.tsx # Màn hình Trò Chuyện với Oracle AI
```

