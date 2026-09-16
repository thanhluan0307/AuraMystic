import type { TuViChartData, TuViPalace } from './tuViCalc';
import type { NatalChartData } from './astrologyCalc';
import { generateAIText } from '../config/gemini';
import { TarotCard } from '../data/tarotCards';
import { ZodiacSign } from '../data/zodiacSigns';

/**
 * 1. Giải mã bài Tarot chuyên sâu với Gemini AI
 */
export async function interpretTarotReading(
  question: string,
  drawnCards: { card: TarotCard; isReversed: boolean; positionName: string }[],
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const cardsSummary = drawnCards
    .map(
      (c, idx) =>
        `Lá ${idx + 1} [Vị trí: ${c.positionName}]: ${c.card.nameVi} (${c.card.nameEn}) - Trạng thái: ${
          c.isReversed ? 'NGƯỢC (Reversed)' : 'XUÔI (Upright)'
        }\nÝ nghĩa cốt lõi: ${c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning}\nTừ khóa: ${(c.isReversed
          ? c.card.reversedKeywords
          : c.card.uprightKeywords
        ).join(', ')}`
    )
    .join('\n\n');

  const systemInstruction = `Bạn là một Nhà Đọc Bài Tarot (Tarot Reader) bậc thầy và là bậc thầy tâm lý học tâm linh thấu cảm, giàu lòng trắc ẩn và sâu sắc. 
Phong cách của bạn:
- Giọng văn huyền bí, ấm áp, sâu sắc, chữa lành và truyền cảm hứng.
- Phân tích sự tương tác năng lượng giữa các lá bài theo dòng chảy thời gian/vấn đề.
- Không phán xét mang tính mê tín đoan định số phận bi quan mà luôn hướng người đọc đến việc làm chủ ý chí và bài học linh hồn.
- Trình bày định dạng rõ ràng, dùng bullet points, tiêu đề sinh động và biểu tượng cảm xúc huyền bí (🔮, ✨, 🌙, 🕊️, 🌟).`;

  const prompt = `Người tìm kiếm (Querent) đang gửi tới Vũ trụ câu hỏi sau:
"${question ? question : 'Xin thông điệp chung về dòng chảy năng lượng hiện tại và lời khuyên của Vũ trụ'}"

Các lá bài đã rút được trong trải bài:
${cardsSummary}

Hãy thực hiện giải bài chi tiết:
1. **Thông Điệp Tổng Thể**: Bức tranh năng lượng chung của trải bài.
2. **Luận Giải Chi Tiết Từng Lá Bài**: Phân tích ý nghĩa từng vị trí trong bối cảnh câu hỏi của người hỏi.
3. **Mối Liên Kết Vô Hình**: Sự kết hợp các nguyên tố và chiều hướng chuyển hóa giữa các lá bài.
4. **Lời Khuyên Tinh Tú (Advice & Actionable Steps)**: Những bước hành động cụ thể và bài học tâm thức cần thức tỉnh.
5. **Lời Chúc Phước Lành**: Một câu khẳng định tích cực (Affirmation) gửi đến người hỏi.`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 2. Dự báo Chiêm Tinh Học theo Cung Hoàng Đạo
 */
export async function getHoroscopeDaily(
  sign: ZodiacSign,
  period: 'ngày' | 'tuần' | 'tháng' = 'ngày',
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là Nhà Chiêm Tinh Học Hoàng Đạo (Astrologer) uyên bác của Đài Thiên Văn Huyền Bí. 
Bạn hiểu sâu sắc về sự vận hành của các thiên thể, góc chiếu tinh tú và tác động năng lượng đến 12 cung hoàng đạo.
Giọng văn: Cuốn hút, lạc quan, truyền cảm hứng và mang tính định hướng thực tiễn cao.`;

  const prompt = `Hãy lập dự báo chiêm tinh ${period} cho cung **${sign.nameVi} (${sign.nameEn})**:
- Nguyên tố: ${sign.element} | Phẩm chất: ${sign.modality} | Sao bảo hộ: ${sign.rulingPlanet}

Yêu cầu nội dung:
1. 🌌 **Năng Lượng Chủ Đạo & Tâm Trạng ${period}**: Xu hướng cảm xúc và tư duy.
2. ❤️ **Tình Duyên & Mối Quan Hệ**: Đối với người độc thân và người đang trong mối quan hệ.
3. 💼 **Sự Nghiệp & Công Danh**: Cơ hội, thách thức và cách đón nhận.
4. 💰 **Tài Chính & Vận May**: Điểm nhấn về dòng tiền và quản lý tài sản.
5. 🌿 **Sức Khỏe & Tái Tạo Năng Lượng**: Lời khuyên giữ thân tâm an lạc.
6. 🎯 **Chỉ Số May Mắn**:
   - Tình cảm: x/100%
   - Công việc: x/100%
   - Tài lộc: x/100%
   - Con số may mắn: [2-3 con số]
   - Màu sắc kích tài: [Màu sắc]`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 3. Luận Giải Độ Tương Hợp Tình Yêu (Synastry) Giữa 2 Cung Hoàng Đạo
 */
export async function getSynastryReading(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là Chuyên gia Chiêm Tinh Tình Cảm & Hôn Nhân (Synastry Astrologer). 
Bạn phân tích mối quan hệ giữa hai cung hoàng đạo bằng góc nhìn tâm lý học đa chiều, sự hòa hợp nguyên tố và điểm bù trừ tính cách.
Giọng văn lãng mạn, sâu sắc, chân thành và mang tính xây dựng.`;

  const prompt = `Phân tích tương hợp tình yêu và độ gắn kết linh hồn giữa:
- **Cung thứ nhất**: ${sign1.nameVi} (${sign1.nameEn}) - Nguyên tố: ${sign1.element} - Hành tinh: ${sign1.rulingPlanet}
- **Cung thứ hai**: ${sign2.nameVi} (${sign2.nameEn}) - Nguyên tố: ${sign2.element} - Hành tinh: ${sign2.rulingPlanet}

Nội dung phân tích:
1. 💖 **Đánh Giá Tương Thích Chung (Điểm % và Tên gọi mối quan hệ)**
2. 🔥 **Lực Hút Ban Đầu & Ngôn Ngữ Tình Yêu**: Điều gì khiến hai người bị cuốn hút vào nhau?
3. 🌊 **Giao Tiếp & Đồng Điệu Cảm Xúc**: Sự phối hợp giữa hai nguyên tố (${sign1.element} & ${sign2.element}).
4. ⚡ **Điểm Xung Đột Tiềm Ẩn & Thách Thức Cần Vượt Qua**: Những mâu thuẫn điển hình.
5. 🔑 **Chìa Khóa Hòa Hợp & Lời Khuyên Cho Cặp Đôi**: Bí quyết giữ lửa yêu thương trọn đời.`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 4. Luận Giải Tử Vi Phương Đông & Mệnh Số
 */
export async function getTuViReading(
  data: {
    chart?: TuViChartData;
    name: string;
    birthDate: string;
    birthHour: string;
    gender: string;
    canChiYear: string;
    napAm: string;
    animalName: string;
    cucName?: string;
    menhLocation?: string;
    thanLocation?: string;
  },
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là Bậc Thầy Tử Vi & Đông Phương Mệnh Lý uyên bác (Tử Vi Đẩu Số, Bát Tự & Kinh Dịch).
Bạn luận giải lá số tử vi với tinh thần "Đức năng thắng số", giải thích căn nguyên tính mệnh, đường công danh tài lộc, gia đạo và chỉ ra phương pháp tu dưỡng cải biến vận mệnh tốt đẹp.
Giọng văn uy nghiêm, đĩnh đạc, thấu triệt và giàu lòng nhân ái.`;

  const prompt = `Kính nhờ Thầy luận giải Tử Vi Mệnh Số cho đương số:
- Họ tên: ${data.name || 'Người Hữu Duyên'}
- Giới tính: ${data.gender}
- Ngày sinh: ${data.birthDate}
- Giờ sinh: ${data.birthHour}
- Năm sinh Âm Lịch (Can Chi): ${data.canChiYear} (Cầm tinh ${data.animalName})
- Ngũ Hành Bản Mệnh (Nạp Âm): ${data.napAm}
${data.cucName ? `- Cục: ${data.cucName}` : ''}
${data.menhLocation ? `- Cung Mệnh: An tại ${data.menhLocation}` : ''}
${data.thanLocation ? `- Cung Thân: An tại ${data.thanLocation}` : ''}

${data.chart ? `Dữ liệu lá số đã tính chuẩn xác:
- Can Chi: Năm ${data.chart.canChiYear}, Tháng ${data.chart.canChiMonth}, Ngày ${data.chart.canChiDay}, Giờ ${data.chart.canChiHour}
- Bản Mệnh: ${data.chart.napAm} • Cục: ${data.chart.cucName}
- Mệnh Chủ: ${data.chart.menhChu} • Thân Chủ: ${data.chart.thanChu}
- Tuần Không tại: ${data.chart.tuanLocation} • Triệt Không tại: ${data.chart.trietLocation}
- Chi tiết 12 cung (kèm Chính tinh, Cát tinh, Sát tinh, Vòng Tràng Sinh, Vòng Thái Tuế, Đại hạn, Tuần/Triệt):
${JSON.stringify(data.chart.palaces)}` : ''}

Kính mong Thầy luận bàn chuyên sâu các phần sau:
1. 📜 **Luận Cung Mệnh & Thân (Cốt cách & Bản tính nội tại)**: Tiềm năng thiên bẩm, ưu thế và hạn chế của tính cách.
2. 💼 **Luận Cung Quan Lộc (Đường Công Danh & Sự Nghiệp)**: Ngành nghề phù hợp, thời cơ phát triển và đỉnh cao danh vọng.
3. 💰 **Luận Cung Tài Bạch (Tiền Tài & Của Cải)**: Phương thức tụ tài, khả năng kinh doanh hay giữ của, các giai đoạn tài lộc vượng phát.
4. 🎎 **Luận Cung Phu Thê (Tình Duyên & Gia Đạo)**: Duyên nợ hôn nhân, tiêu chí bạn đời hòa hợp và cách gìn giữ tổ ấm.
5. 🌪️ **Dự Báo Vận Hạn & Đại Vận 10 Năm (kết hợp Tuần/Triệt & Vòng Tràng Sinh)**: Điểm sáng cần nắm bắt và hạn chế cần đề phòng (sức khỏe, thị phi, hao tài).
6. 🌿 **Phương Thức Tu Thân & Hóa Giải Phong Thủy**: Các hành vi thiện lành, màu sắc phong thủy và thói quen giúp gia tăng phúc khí.`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 4b. Luận Giải Chuyên Sâu 1 Cung Trên Lá Số Tử Vi
 */
export async function getTuViPalaceReading(
  chartData: TuViChartData,
  palace: TuViPalace,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là Bậc Thầy Tử Vi Đẩu Số uyên bác. Bạn chuyên sâu giải mã từng cung vị trên lá số tử vi theo tương quan chính tinh, cát tinh, hung tinh, vòng Tràng Sinh, vòng Thái Tuế, tác động của Tuần/Triệt và thế tam hợp xung chiếu.
Giọng văn đĩnh đạc, khúc chiết, chuẩn mực và định hướng tích cực.`;

  const prompt = `Kính nhờ Thầy luận giải chi tiết Cung ${palace.name} trên lá số Tử Vi cho đương số:
- Họ tên: ${chartData.name} (${chartData.yinYangGender})
- Năm sinh: ${chartData.canChiYear} • Mệnh: ${chartData.napAm} • Cục: ${chartData.cucName}
- Cung cần luận: **Cung ${palace.name}** tại **${palace.canChiName}**
- Thuộc tính cung: ${palace.isMenh ? '[CUNG MỆNH]' : ''} ${palace.isThan ? '[THÂN CƯ]' : ''} ${palace.hasTuan ? '[TUẦN TRUNG]' : ''} ${palace.hasTriet ? '[TRIỆT LỘ]' : ''}
- Đại hạn: ${palace.daiHan} tuổi • Tiểu hạn: Năm ${palace.tieuHanChi}
- Vòng Tràng Sinh: ${palace.trangSinhStar || '—'} • Vòng Thái Tuế: ${palace.thaiTueStar || '—'} • Vòng Bác Sĩ: ${palace.bacSiStar || '—'}
- Các Chính Tinh tọa thủ: ${palace.majorStars.map((s: any) => `${s.name}${s.status ? ` (${s.status})` : ''}`).join(', ') || 'Vô Chính Diệu (Mượn sao đối cung)'}
- Cát tinh / Trợ tinh: ${palace.goodStars.map((s: any) => s.name).join(', ') || 'Không có'}
- Sát tinh / Hung tinh: ${palace.badStars.map((s: any) => s.name).join(', ') || 'Không có'}

Dữ liệu toàn bộ 12 cung để đối chiếu tam hợp - xung chiếu: ${JSON.stringify(chartData.palaces)}

Xin Thầy luận giải:
1. 🌟 **Bản Chất Cung Vị & Khí Sắc**: Ý nghĩa của Cung ${palace.name} (${palace.canChiName}) kết hợp vòng Tràng Sinh và Tuần/Triệt nếu có.
2. ⚔️ **Tác Động Của Các Tinh Đẩu Tọa Thủ**: Sự phối hợp giữa các Chính tinh và Cát/Hung tinh tại cung.
3. 🎯 **Cơ Hội & Nguy Cơ Tiềm Ẩn**: Những vận hội may mắn và thử thách trong đại vận ${palace.daiHan} tuổi.
4. 💡 **Lời Khuyên Thực Tiễn & Tu Dưỡng Cải Biến**: Hành động và tâm thế cụ thể để phát huy cát khí, hóa giải hung hiểm.`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 5. Giải Mã Bản Đồ Sao (Natal Chart) Toàn Diện
 */
export async function getNatalChartReading(
  data: {
    name: string;
    sunSign: ZodiacSign;
    moonSign: ZodiacSign;
    ascendantSign: ZodiacSign;
    chartData?: NatalChartData;
    planets?: any;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  },
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là Chuyên gia Chiêm Tinh Học Bản Đồ Sao (Psychological & Evolutionary Astrologer) kết hợp tinh hoa Mệnh Lý Đông Tây.
Bạn phân tích bản đồ sao cá nhân như một bản thiết kế tâm linh (Soul Blueprint) độc nhất, liên kết vị trí 12 Nhà chiêm tinh với các cung vị chức năng Tử Vi (Mệnh, Tài, Quan...).
Giọng văn khai sáng, sâu sắc, khúc chiết, khích lệ người nghe khám phá tiềm năng vô hạn của bản thân.`;

  const prompt = `Hãy giải mã bản đồ sao cá nhân cho:
- Tên: ${data.name || 'Lữ Khách Ngân Hà'}
- Ngày sinh: ${data.birthDate} lúc ${data.birthTime}
- Nơi sinh: ${data.birthPlace || 'Việt Nam'}
- **Sun Sign (Mặt Trời)**: ${data.sunSign.nameVi} (${data.sunSign.nameEn})
- **Moon Sign (Mặt Trăng)**: ${data.moonSign.nameVi} (${data.moonSign.nameEn})
- **Ascendant / Rising (Cung Mọc)**: ${data.ascendantSign.nameVi} (${data.ascendantSign.nameEn})
${data.chartData ? `
Tọa độ chi tiết các thiên thể & 12 Cung Nhà:
${data.chartData.allBodies.map((b: any) => `- ${b.nameVi}: ${b.formattedDegree} tại Nhà số ${b.houseNumber} (${b.tuViPalaceEquivalent})`).join('\n')}

Các góc hợp (Aspects) quan trọng:
${data.chartData.aspects.slice(0, 8).map((a: any) => `- ${a.description}`).join('\n')}
` : ''}

Hãy phân tích bản đồ sao này theo cấu trúc:
1. ☀️ **Tam Trụ Cốt Lõi (The Big Three: Sun - Moon - Rising)**:
   - Mặt Trời: Cái tôi, khát vọng sống và bản sắc trung tâm.
   - Mặt Trăng: Thế giới cảm xúc thầm kín, nhu cầu an toàn nội tâm.
   - Cung Mọc: Lăng kính nhìn đời, thần thái và ấn tượng đầu tiên.
   - Sự kết hợp và mâu thuẫn nội tâm giữa 3 yếu tố này.
2. 🧠 **Tư Duy, Tình Yêu & Động Lực Hành Động**:
   - Sao Thủy (Giao tiếp & học hỏi), Sao Kim (Gu tình yêu & thẩm mỹ), Sao Hỏa (Năng lượng chiến đấu & đam mê).
3. 🌌 **Sứ Mệnh Linh Hồn & Bài Học Trưởng Thành**:
   - Điểm mạnh tự nhiên của bản đồ sao.
   - Những bóng tối tâm lý (Shadow Self) cần được ôm ấp và chuyển hóa.
4. 🧭 **Định Hướng Sự Nghiệp & Khai Phóng Tiềm Năng (kết hợp Cung Quan Lộc / Nhà 10)**:
   - Môi trường lý tưởng để phát huy tối đa năng lực.
5. 🌟 **Thông Điệp Tinh Tú Từ Vũ Trụ Dành Riêng Cho Bạn**.`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

/**
 * 6. Trò Chuyện Trực Tiếp Với Đấng Tiên Tri Vũ Trụ (Mystic Oracle AI)
 */
export async function chatWithOracle(
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  onChunk?: (chunk: string, accumulated: string) => void
): Promise<string> {
  const systemInstruction = `Bạn là "AuraMystic Oracle" - Đấng Tiên Tri và Trí Tuệ Vũ Trụ Huyền Bí, kết hợp tinh hoa của Tarot, Chiêm tinh phương Tây, Tử vi phương Đông, Phong thủy, Giải mã giấc mơ và Thần số học Pythagoras.
Nhiệm vụ của bạn là:
- Lắng nghe những trăn trở, câu hỏi của người tìm kiếm về vận mệnh, tình yêu, sự nghiệp, giấc mơ, các dấu hiệu vũ trụ (số thiên thần, điềm báo).
- Trả lời bằng sự thấu thị, dịu dàng, thông thái, mang lại sự bình an và sáng tỏ.
- Giữ phong cách huyền diệu nhưng luôn tôn trọng ý chí tự do và khuyến khích năng lượng tích cực.
- Định dạng câu trả lời đẹp mắt với các biểu tượng tinh tú (✨, 🔮, 🌙, 🪐, 🕊️).`;

  const conversationContext = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Người tìm kiếm' : 'Oracle'}: ${m.text}`)
    .join('\n');

  const prompt = `${conversationContext ? `Lịch sử hội thoại trước đó:\n${conversationContext}\n\n` : ''}Người tìm kiếm vừa hỏi:
"${userMessage}"

Hãy đưa ra lời chỉ dẫn thông tuệ của Oracle:`;

  return await generateAIText(prompt, systemInstruction, onChunk);
}

