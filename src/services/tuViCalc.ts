import { solarToLunar, julianDay, mod, LunarDate } from './lunarCalendar';
import { NAP_AM_TABLE } from './astrologyCalc';
import { majorStarStatus } from '../data/tuViRules';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../data/easternZodiac';

export interface StarInfo {
  name: string;
  element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  type: 'chinh_tinh' | 'cat_tinh' | 'sat_tinh' | 'vong_sao';
  status?: 'Miếu' | 'Vượng' | 'Đắc' | 'Hãm' | 'Bình';
  description: string;
}

export interface TuViPalace {
  index: number; // 0..11 theo thứ tự từ Mệnh
  id: string;
  name: string;
  branchId: number; // 0..11 theo Địa Chi
  branchName: string;
  canName: string; // Can của cung (ví dụ: Giáp, Ất...)
  canChiName: string; // Ví dụ: Bính Dần, Đinh Mão...
  isMenh: boolean;
  isThan: boolean;
  hasTuan: boolean; // Bị Tuần án ngữ
  hasTriet: boolean; // Bị Triệt án ngữ
  trangSinhStar?: string; // Tên sao vòng Tràng Sinh tại cung
  thaiTueStar?: string; // Tên sao vòng Thái Tuế tại cung
  bacSiStar?: string; // Tên sao vòng Bác Sĩ tại cung
  majorStars: StarInfo[];
  goodStars: StarInfo[];
  badStars: StarInfo[];
  daiHan: string;
  tieuHanChi: string; // Tên Chi năm Tiểu Hạn chiếu vào
  description: string;
}

export interface TuViChartData {
  name: string;
  gender: 'Nam' | 'Nữ';
  yinYangGender: string; // 'Dương Nam', 'Âm Nam', 'Dương Nữ', 'Âm Nữ'
  solarDate: string;
  lunarYear: string;
  lunarDate: LunarDate;
  lunarDateText: string;
  canChiYear: string;
  canChiMonth: string;
  canChiDay: string;
  canChiHour: string;
  hourName: string;
  napAm: string;
  cucName: string;
  cucNumber: number;
  menhChu: string;
  thanChu: string;
  menhLocation: string;
  thanLocation: string;
  tuanLocation: string;
  trietLocation: string;
  palaces: TuViPalace[];
  palaceByBranch: Record<number, TuViPalace>;
}

// Danh sách 12 Cung Chức Năng theo thứ tự chuẩn Tử Vi (Mệnh, Phụ, Phúc, Điền...)
const PALACE_INFOS = [
  {
    id: 'menh',
    name: 'MỆNH',
    desc: 'Bản ngã cốt lõi, tư chất bẩm sinh, tính cách, tướng mạo và xu hướng vận mệnh suốt cuộc đời.',
  },
  {
    id: 'phu_mau',
    name: 'PHỤ MẪU',
    desc: 'Mối quan hệ với cha mẹ, phúc ấm gia đình, sự nâng đỡ và điều kiện nuôi dưỡng thuở thiếu thời.',
  },
  {
    id: 'phuc_duc',
    name: 'PHÚC ĐỨC',
    desc: 'Phúc đức tổ tiên, đời sống tinh thần, tuổi thọ, sự an lạc tâm hồn và may mắn che chở.',
  },
  {
    id: 'dien_trach',
    name: 'ĐIỀN TRẠCH',
    desc: 'Nhà cửa, đất đai, bất động sản, cơ ngơi thừa kế và khả năng tạo dựng tổ ấm an cư.',
  },
  {
    id: 'quan_loc',
    name: 'QUAN LỘC',
    desc: 'Sự nghiệp, công danh, con đường thăng tiến, môi trường làm việc và uy quyền xã hội.',
  },
  {
    id: 'no_boc',
    name: 'NÔ BỘC',
    desc: 'Bạn bè, đồng nghiệp, cộng sự, cấp dưới và các mối quan hệ trợ lực trong cuộc sống.',
  },
  {
    id: 'thien_di',
    name: 'THIÊN DI',
    desc: 'Giao thiệp bên ngoài, xuất hành, đi xa, môi trường xã hội và năng lực thích ứng thế giới bên ngoài.',
  },
  {
    id: 'tat_ach',
    name: 'TẬT ÁCH',
    desc: 'Sức khỏe, thể trạng, cơ quan dễ suy yếu, tai ương bệnh tật và khả năng hóa giải nguy nan.',
  },
  {
    id: 'tai_bach',
    name: 'TÀI BẠCH',
    desc: 'Tài chính, dòng tiền, năng lực kiếm tiền, quản lý của cải và nguồn gốc sự giàu có.',
  },
  {
    id: 'tu_tuc',
    name: 'TỬ TỨC',
    desc: 'Con cái, số lượng, tính cách, sự hiếu thuận và mối duyên giữa cha mẹ với thế hệ tương lai.',
  },
  {
    id: 'phu_the',
    name: 'PHU THÊ',
    desc: 'Hôn nhân, hình mẫu người phối ngẫu, hạnh phúc lứa đôi và mức độ hòa hợp trong tình duyên.',
  },
  {
    id: 'huynh_de',
    name: 'HUYNH ĐỆ',
    desc: 'Anh chị em ruột thịt, sự đùm bọc, giúp đỡ hoặc khoảng cách trong gia đạo.',
  },
];

// Bảng Nạp Âm Lục Thập Hoa Giáp để tính Cục
const CAN_CHI_NGU_HANH: Record<string, 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'> = {
  'Hải Trung Kim': 'Kim',
  'Kiếm Phong Kim': 'Kim',
  'Bạch Lạp Kim': 'Kim',
  'Sa Trung Kim': 'Kim',
  'Kim Bạch Kim': 'Kim',
  'Thoa Xuyến Kim': 'Kim',
  'Đại Lâm Mộc': 'Mộc',
  'Dương Liễu Mộc': 'Mộc',
  'Tùng Bách Mộc': 'Mộc',
  'Bình Địa Mộc': 'Mộc',
  'Tang Đố Mộc': 'Mộc',
  'Thạch Lựu Mộc': 'Mộc',
  'Giản Hạ Thủy': 'Thủy',
  'Tuyền Trung Thủy': 'Thủy',
  'Trường Lưu Thủy': 'Thủy',
  'Thiên Hà Thủy': 'Thủy',
  'Đại Khê Thủy': 'Thủy',
  'Đại Hải Thủy': 'Thủy',
  'Lư Trung Hỏa': 'Hỏa',
  'Sơn Đầu Hỏa': 'Hỏa',
  'Tích Lịch Hỏa': 'Hỏa',
  'Sơn Hạ Hỏa': 'Hỏa',
  'Phúc Đăng Hỏa': 'Hỏa',
  'Thiên Thượng Hỏa': 'Hỏa',
  'Lộ Bàng Thổ': 'Thổ',
  'Thành Đầu Thổ': 'Thổ',
  'Ốc Thượng Thổ': 'Thổ',
  'Bích Thượng Thổ': 'Thổ',
  'Đại Trạch Thổ': 'Thổ',
  'Sa Trung Thổ': 'Thổ',
};

// 14 Chính Tinh thông tin chi tiết
const MAJOR_STARS_META: Record<string, { element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'; desc: string }> = {
  'Tử Vi': { element: 'Thổ', desc: 'Đế vương chi tinh, chủ quyền quý, phúc đức, lãnh đạo và hóa giải tai ương.' },
  'Liêm Trinh': { element: 'Hỏa', desc: 'Thứ đào hoa, quyền biến, thẳng thắn, quyết đoán, ưa tự chủ.' },
  'Thiên Đồng': { element: 'Thủy', desc: 'Phúc tinh, hiền hòa, nhân hậu, ưa an nhàn, có khiếu nghệ thuật.' },
  'Vũ Khúc': { element: 'Kim', desc: 'Tài tinh, quyết đoán, quả cảm, thực tế, tài năng quản lý kinh tế.' },
  'Thái Dương': { element: 'Hỏa', desc: 'Quang minh chính đại, nhiệt huyết, danh tiếng, chủ quý và hào sảng.' },
  'Thiên Cơ': { element: 'Mộc', desc: 'Thiện tinh, mưu lược, trí tuệ sắc sảo, linh hoạt và giàu lòng nhân ái.' },
  'Thiên Phủ': { element: 'Thổ', desc: 'Kho tàng trời ban, bảo thủ cẩn trọng, tài lộc dồi dào, phúc hậu uy nghi.' },
  'Thái Âm': { element: 'Thủy', desc: 'Phú tinh, dịu dàng, lãng mạn, thẩm mỹ tinh tế, chủ tài lộc điền sản ngầm.' },
  'Tham Lang': { element: 'Mộc', desc: 'Đào hoa tinh, đa tài, giao thiệp rộng, tham vọng lớn, ham học hỏi.' },
  'Cự Môn': { element: 'Thủy', desc: 'Ám tinh, biện tài vô song, khả năng hùng biện phản biện, nghiên cứu sâu.' },
  'Thiên Tướng': { element: 'Thủy', desc: 'Ấn tinh, trung trinh, chu đáo, giàu tinh thần trượng nghĩa cứu nhân.' },
  'Thiên Lương': { element: 'Mộc', desc: 'Ấm tinh, trường thọ, thanh cao, đức độ, có tài sư phạm và y đức.' },
  'Thất Sát': { element: 'Kim', desc: 'Quyền tinh dũng tướng, can trường, dám nghĩ dám làm, tính tình cương liệt.' },
  'Phá Quân': { element: 'Thủy', desc: 'Hao tinh tiên phong, sáng tạo đổi mới, dũng cảm khai phá trật tự mới.' },
};

// Mệnh chủ & Thân chủ theo Địa Chi năm sinh
const MENH_CHU_MAP = [
  'Tham Lang', // 0: Tý
  'Cự Môn',    // 1: Sửu
  'Lộc Tồn',   // 2: Dần
  'Văn Khúc',  // 3: Mão
  'Liêm Trinh',// 4: Thìn
  'Vũ Khúc',   // 5: Tỵ
  'Phá Quân',  // 6: Ngọ
  'Vũ Khúc',   // 7: Mùi
  'Liêm Trinh',// 8: Thân
  'Văn Khúc',  // 9: Dậu
  'Lộc Tồn',   // 10: Tuất
  'Cự Môn',    // 11: Hợi
];

const THAN_CHU_MAP = [
  'Linh Tinh',   // 0: Tý
  'Thiên Tướng', // 1: Sửu
  'Thiên Lương', // 2: Dần
  'Thiên Đồng',  // 3: Mão
  'Văn Xương',   // 4: Thìn
  'Thiên Cơ',    // 5: Tỵ
  'Hỏa Tinh',    // 6: Ngọ
  'Thiên Tướng', // 7: Mùi
  'Thiên Lương', // 8: Thân
  'Thiên Đồng',  // 9: Dậu
  'Văn Xương',   // 10: Tuất
  'Thiên Cơ',    // 11: Hợi
];

// Vòng Thái Tuế (12 sao an theo Chi Năm, luôn đi THUẬN)
const VONG_THAI_TUE = [
  { name: 'Thái Tuế', element: 'Hỏa', type: 'cat_tinh', desc: 'Chính danh, ngay thẳng, tự tôn cao, danh vọng.' },
  { name: 'Thiếu Dương', element: 'Hỏa', type: 'cat_tinh', desc: 'Thông minh, hoạt bát, nhân hậu, ưa thiện lành.' },
  { name: 'Tang Môn', element: 'Mộc', type: 'sat_tinh', desc: 'Trầm tư, lo toan, vất vả, giàu trắc ẩn nội tâm.' },
  { name: 'Thiếu Âm', element: 'Thủy', type: 'cat_tinh', desc: 'Dịu dàng, từ tốn, tĩnh lặng, biết lắng nghe.' },
  { name: 'Quan Phù', element: 'Hỏa', type: 'sat_tinh', desc: 'Nghiêm cẩn, nguyên tắc, chú ý giấy tờ kiện tụng.' },
  { name: 'Tử Phù', element: 'Hỏa', type: 'sat_tinh', desc: 'Thiệt thòi nhỏ, buông bỏ, cần kiên trì bền bỉ.' },
  { name: 'Tuế Phá', element: 'Hỏa', type: 'sat_tinh', desc: 'Bất khuất, ưa đổi mới, chống đối bất công, nghịch cảnh.' },
  { name: 'Long Đức', element: 'Thủy', type: 'cat_tinh', desc: 'Đức độ, phúc hậu, giải trừ tai ương, được che chở.' },
  { name: 'Bạch Hổ', element: 'Kim', type: 'sat_tinh', desc: 'Quả cảm, uy quyền, nghị lực phi thường, khắc khẩu.' },
  { name: 'Phúc Đức', element: 'Thổ', type: 'cat_tinh', desc: 'Phúc khí, may mắn, tinh thần thanh thản an nhiên.' },
  { name: 'Điếu Khách', element: 'Hỏa', type: 'sat_tinh', desc: 'Nói năng hoạt bát, phóng khoáng, tiêu xài rộng rãi.' },
  { name: 'Trực Phù', element: 'Hỏa', type: 'sat_tinh', desc: 'Thật thà, trung tín, chịu khó chịu thương, thiệt thòi trước.' },
] as const;

// Vòng Bác Sĩ (12 sao an theo Lộc Tồn)
const VONG_BAC_SI = [
  { name: 'Bác Sĩ', element: 'Thủy', type: 'cat_tinh', desc: 'Trí tuệ, thông thái, học cao hiểu rộng, có tài y lý.' },
  { name: 'Lực Sĩ', element: 'Hỏa', type: 'cat_tinh', desc: 'Sức mạnh, dũng khí, năng lực hành động dồi dào.' },
  { name: 'Thanh Long', element: 'Thủy', type: 'cat_tinh', desc: 'May mắn, hỷ sự, thi cử đỗ đạt, công danh rạng rỡ.' },
  { name: 'Tiểu Hao', element: 'Hỏa', type: 'sat_tinh', desc: 'Hao tài nhỏ, linh hoạt dòng tiền, thích mua sắm.' },
  { name: 'Tướng Quân', element: 'Mộc', type: 'cat_tinh', desc: 'Uy phong, tinh thần tiên phong, can đảm dẫn dắt.' },
  { name: 'Tấu Thư', element: 'Kim', type: 'cat_tinh', desc: 'Khéo ăn khéo nói, văn chương bằng cấp, khiếu diễn đạt.' },
  { name: 'Phi Liêm', element: 'Hỏa', type: 'sat_tinh', desc: 'Nhanh nhẹn, tháo vát nhưng đề phòng khẩu thiệt thị phi.' },
  { name: 'Hỷ Thần', element: 'Hỏa', type: 'cat_tinh', desc: 'Tin vui, duyên lành, hôn nhân hỷ sự, nụ cười an vui.' },
  { name: 'Bệnh Phù', element: 'Thổ', type: 'sat_tinh', desc: 'Sức khỏe cần lưu tâm, tinh thần dễ mỏi mệt.' },
  { name: 'Đại Hao', element: 'Hỏa', type: 'sat_tinh', desc: 'Biến động tài chính lớn, đầu tư mạo hiểm, tiêu xài lớn.' },
  { name: 'Phục Binh', element: 'Hỏa', type: 'sat_tinh', desc: 'Cẩn trọng tiểu nhân, mưu sự kín đáo, phòng lừa gạt.' },
  { name: 'Quan Phủ', element: 'Hỏa', type: 'sat_tinh', desc: 'Kỷ cương pháp luật, phòng tránh tranh chấp pháp lý.' },
] as const;

// Vòng Tràng Sinh (12 sao an theo Cục)
const VONG_TRANG_SINH = [
  { name: 'Tràng Sinh', element: 'Thủy', desc: 'Sinh sôi, trường thọ, nguồn năng lượng dồi dào vô tận.' },
  { name: 'Mộc Dục', element: 'Thủy', desc: 'Đắm mình, ưa làm đẹp, phong lưu lãng tử, tính khí thất thường.' },
  { name: 'Quan Đới', element: 'Kim', desc: 'Trưởng thành, tiến bộ, gặt hái danh vọng bước đầu.' },
  { name: 'Lâm Quan', element: 'Kim', desc: 'Thời kỳ hưng thịnh, tự lập vững vàng, sự nghiệp đơm hoa.' },
  { name: 'Đế Vượng', element: 'Kim', desc: 'Đỉnh cao danh vọng, quyền lực, thịnh vượng tột cùng.' },
  { name: 'Suy', element: 'Thủy', desc: 'Thoái trào nhẹ, thận trọng giữ gìn thành quả, tĩnh tâm.' },
  { name: 'Bệnh', element: 'Hỏa', desc: 'Dễ suy nhược, tinh thần nhạy cảm, cần chú ý tĩnh dưỡng.' },
  { name: 'Tử', element: 'Thủy', desc: 'Kín đáo, thâm trầm, nghiên cứu sâu sắc, ít bộc lộ.' },
  { name: 'Mộ', element: 'Thổ', desc: 'Tích lũy của cải, cất giữ kín kẽ, tính cách trầm ổn.' },
  { name: 'Tuyệt', element: 'Thổ', desc: 'Chấm dứt cái cũ, khởi nguồn biến chuyển mới, độc lập.' },
  { name: 'Thai', element: 'Thổ', desc: 'Ý niệm mới mẻ nhen nhóm, hy vọng tương lai, chở che.' },
  { name: 'Dưỡng', element: 'Mộc', desc: 'Nuôi dưỡng, bồi đắp công đức, kiên nhẫn tích lũy thành quả.' },
] as const;

/**
 * Lập 12 cung, 14 chính tinh, Tuần/Triệt và toàn bộ các vòng phụ tinh chuẩn Tử Vi Đẩu Số.
 */
export function calculateTuViChart(
  name: string,
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hourBranchId: number, // 0..11 (0 = Tý, 1 = Sửu, 2 = Dần...)
  gender: 'Nam' | 'Nữ'
): TuViChartData {
  const lunarDate = solarToLunar(solarDay, solarMonth, solarYear);
  if (!Number.isInteger(hourBranchId) || hourBranchId < 0 || hourBranchId > 11) {
    throw new Error('Giờ sinh phải thuộc một trong 12 địa chi.');
  }
  if (gender !== 'Nam' && gender !== 'Nữ') throw new Error('Giới tính không hợp lệ.');

  // 1. Can Chi Năm sinh
  const stemIdx = mod(lunarDate.year - 4, 10);
  const branchIdx = mod(lunarDate.year - 4, 12);
  const stem = HEAVENLY_STEMS[stemIdx];
  const branch = EARTHLY_BRANCHES[branchIdx];
  const canChiYear = `${stem.name} ${branch.name}`;

  // Can Chi Tháng sinh (Dần là tháng 1)
  const monthStemIdx = ((stemIdx % 5) * 2 + 2 + (lunarDate.month - 1)) % 10;
  const monthBranchIdx = (2 + (lunarDate.month - 1)) % 12;
  const canChiMonth = `${HEAVENLY_STEMS[monthStemIdx].name} ${EARTHLY_BRANCHES[monthBranchIdx].name}`;

  // Can Chi Ngày sinh
  const jd = julianDay(solarDay, solarMonth, solarYear);
  const dayStemIdx = mod(jd + 9, 10);
  const dayBranchIdx = mod(jd + 1, 12);
  const canChiDay = `${HEAVENLY_STEMS[dayStemIdx].name} ${EARTHLY_BRANCHES[dayBranchIdx].name}`;

  // 2. Can Chi Giờ sinh
  const hourBranch = EARTHLY_BRANCHES[hourBranchId];
  const hourStemIdx = (dayStemIdx * 2 + hourBranchId) % 10;
  const hourStem = HEAVENLY_STEMS[hourStemIdx];
  const canChiHour = `${hourStem.name} ${hourBranch.name}`;

  // 3. Âm Dương Năm & Giới Tính
  const isYangYear = stem.yinYang === 'Dương';
  const yinYangGender = `${stem.yinYang} ${gender}`;
  // Chiều đại hạn & an sao: Dương Nam / Âm Nữ đi THUẬN (+1), Âm Nam / Dương Nữ đi NGHỊCH (-1)
  const isThuan = (isYangYear && gender === 'Nam') || (!isYangYear && gender === 'Nữ');

  // 4. An Cung MỆNH & Cung THÂN
  // Khởi từ Dần (index 2), đếm thuận tới tháng sinh âm lịch:
  const monthBranch = (2 + (lunarDate.month - 1)) % 12;
  // Cung Mệnh: Từ tháng sinh coi là giờ Tý, đếm nghịch tới giờ sinh:
  const menhBranchId = (monthBranch - hourBranchId + 12) % 12;
  // Cung Thân: Từ tháng sinh coi là giờ Tý, đếm thuận tới giờ sinh:
  const thanBranchId = (monthBranch + hourBranchId) % 12;

  // 5. Tính Cục (Ngũ Hổ Độn tính Can cung Dần, suy ra Can Cung Mệnh)
  // Giáp Kỷ -> Bính(2); Ất Canh -> Mậu(4); Bính Tân -> Canh(6); Đinh Nhâm -> Nhâm(8); Mậu Quý -> Giáp(0)
  const danStemIdx = ((stemIdx % 5) * 2 + 2) % 10;
  // Can của cung Mệnh: từ Dần (index 2) đếm thuận tới menhBranchId
  const stepsFromDan = (menhBranchId - 2 + 12) % 12;
  const menhStemIdx = (danStemIdx + stepsFromDan) % 10;
  const menhStem = HEAVENLY_STEMS[menhStemIdx];
  const menhBranch = EARTHLY_BRANCHES[menhBranchId];
  const menhCanChi = `${menhStem.name} ${menhBranch.name}`;

  const menhNapAm = NAP_AM_TABLE[menhCanChi]?.split(' (')[0];
  const cucElement = CAN_CHI_NGU_HANH[menhNapAm];
  const cucRules: Record<string, { name: string; num: number }> = {
    Thủy: { name: 'Thủy Nhị Cục', num: 2 },
    Mộc: { name: 'Mộc Tam Cục', num: 3 },
    Kim: { name: 'Kim Tứ Cục', num: 4 },
    Thổ: { name: 'Thổ Ngũ Cục', num: 5 },
    Hỏa: { name: 'Hỏa Lục Cục', num: 6 },
  };
  const cuc = cucRules[cucElement];
  if (!cuc) throw new Error('Không xác định được Cục từ Can Chi cung Mệnh.');

  // 6. An Sao TỬ VI
  // Bù ngày đến bội số Cục; khởi thương số ở Dần (đếm Dần là 1).
  // Số bù lẻ lùi, số bù chẵn tiến.
  const quotient = Math.ceil(lunarDate.day / cuc.num);
  const padding = quotient * cuc.num - lunarDate.day;
  const tuViBranch = mod(2 + quotient - 1 + (padding % 2 ? -padding : padding), 12);

  // 6 sao chòm Tử Vi (an nghịch)
  const saoTuViMap: Record<number, string[]> = {};
  const addStar = (bId: number, starName: string) => {
    if (!saoTuViMap[bId]) saoTuViMap[bId] = [];
    saoTuViMap[bId].push(starName);
  };

  addStar(tuViBranch, 'Tử Vi');
  addStar((tuViBranch - 1 + 12) % 12, 'Thiên Cơ');
  addStar((tuViBranch - 3 + 12) % 12, 'Thái Dương');
  addStar((tuViBranch - 4 + 12) % 12, 'Vũ Khúc');
  addStar((tuViBranch - 5 + 12) % 12, 'Thiên Đồng');
  addStar((tuViBranch - 8 + 12) % 12, 'Liêm Trinh');

  // 8 sao chòm Thiên Phủ (đối xứng qua trục Dần - Thân: 4 - tuViBranch)
  const thienPhuBranch = (4 - tuViBranch + 12) % 12;
  addStar(thienPhuBranch, 'Thiên Phủ');
  addStar((thienPhuBranch + 1) % 12, 'Thái Âm');
  addStar((thienPhuBranch + 2) % 12, 'Tham Lang');
  addStar((thienPhuBranch + 3) % 12, 'Cự Môn');
  addStar((thienPhuBranch + 4) % 12, 'Thiên Tướng');
  addStar((thienPhuBranch + 5) % 12, 'Thiên Lương');
  addStar((thienPhuBranch + 6) % 12, 'Thất Sát');
  addStar((thienPhuBranch + 10) % 12, 'Phá Quân');

  // 7. TUẦN TRUNG KHÔNG VONG & TRIỆT LỘ KHÔNG VONG
  // Triệt Lộ theo Can năm
  const trietPairs: Record<number, [number, number]> = {
    0: [8, 9], // Giáp: Thân - Dậu
    1: [6, 7], // Ất: Ngọ - Mùi
    2: [4, 5], // Bính: Thìn - Tỵ
    3: [2, 3], // Đinh: Dần - Mão
    4: [0, 1], // Mậu: Tý - Sửu
    5: [8, 9], // Kỷ: Thân - Dậu
    6: [6, 7], // Canh: Ngọ - Mùi
    7: [4, 5], // Tân: Thìn - Tỵ
    8: [2, 3], // Nhâm: Dần - Mão
    9: [0, 1], // Quý: Tý - Sửu
  };
  const trietBranches = trietPairs[stemIdx] || [0, 1];

  // Tuần Trung theo Tuần Giáp của năm sinh (hiệu Chi - Can)
  const tuanStartBranch = (branchIdx - stemIdx - 2 + 24) % 12;
  const tuanBranches = [tuanStartBranch, (tuanStartBranch + 1) % 12];

  // 8. CÁC VÒNG SAO KINH ĐIỂN
  // A. Vòng Thái Tuế (12 sao an theo Chi Năm, đi THUẬN)
  const thaiTueMap: Record<number, typeof VONG_THAI_TUE[number]> = {};
  VONG_THAI_TUE.forEach((star, idx) => {
    const bId = (branchIdx + idx) % 12;
    thaiTueMap[bId] = star;
  });

  // B. Vòng Lộc Tồn & Bác Sĩ (theo Can Năm)
  const locTonMap: Record<number, number> = {
    0: 2,  // Giáp tại Dần
    1: 3,  // Ất tại Mão
    2: 5,  // Bính tại Tỵ
    3: 6,  // Đinh tại Ngọ
    4: 5,  // Mậu tại Tỵ
    5: 6,  // Kỷ tại Ngọ
    6: 8,  // Canh tại Thân
    7: 9,  // Tân tại Dậu
    8: 11, // Nhâm tại Hợi
    9: 0,  // Quý tại Tý
  };
  const locTonBranch = locTonMap[stemIdx] ?? 2;
  const bacSiMap: Record<number, typeof VONG_BAC_SI[number]> = {};
  VONG_BAC_SI.forEach((star, idx) => {
    const bId = isThuan ? (locTonBranch + idx) % 12 : (locTonBranch - idx + 12) % 12;
    bacSiMap[bId] = star;
  });

  // C. Vòng Tràng Sinh (theo Cục & Âm Dương Nam Nữ)
  const trangSinhStartMap: Record<string, number> = {
    Thủy: 8,  // Thân
    Mộc: 11,  // Hợi
    Kim: 5,   // Tỵ
    Thổ: 8,   // Thân
    Hỏa: 2,   // Dần
  };
  const trangSinhStart = trangSinhStartMap[cucElement] ?? 8;
  const trangSinhMap: Record<number, typeof VONG_TRANG_SINH[number]> = {};
  VONG_TRANG_SINH.forEach((star, idx) => {
    const bId = isThuan ? (trangSinhStart + idx) % 12 : (trangSinhStart - idx + 12) % 12;
    trangSinhMap[bId] = star;
  });

  // 9. LỤC SÁT TINH & LỤC CÁT TINH CHI TIẾT
  // Kình Dương & Đà La
  const kinhDuongBranch = (locTonBranch + 1) % 12;
  const daLaBranch = (locTonBranch - 1 + 12) % 12;

  // Địa Không & Địa Kiếp (khởi Hợi là giờ Tý: Kiếp thuận, Không nghịch)
  const diaKhongBranch = (11 - hourBranchId + 12) % 12;
  const diaKiepBranch = (11 + hourBranchId) % 12;

  // Hỏa Tinh & Linh Tinh (theo Tam hợp Chi năm và Giờ sinh)
  // Dần Ngọ Tuất: Hỏa khởi Sửu, Linh khởi Mão
  // Thân Tý Thìn: Hỏa khởi Dần, Linh khởi Tuất
  // Tỵ Dậu Sửu: Hỏa khởi Mão, Linh khởi Tuất
  // Hợi Mão Mùi: Hỏa khởi Dậu, Linh khởi Tuất
  let hoaTinhStart = 1;
  let linhTinhStart = 3;
  const triadIdx = branchIdx % 4;
  if (triadIdx === 2) { // Dần, Ngọ, Tuất (2, 6, 10)
    hoaTinhStart = 1; // Sửu
    linhTinhStart = 3; // Mão
  } else if (triadIdx === 0) { // Thân, Tý, Thìn (8, 0, 4)
    hoaTinhStart = 2; // Dần
    linhTinhStart = 10; // Tuất
  } else if (triadIdx === 1) { // Tỵ, Dậu, Sửu (5, 9, 1)
    hoaTinhStart = 3; // Mão
    linhTinhStart = 10; // Tuất
  } else { // Hợi, Mão, Mùi (11, 3, 7)
    hoaTinhStart = 9; // Dậu
    linhTinhStart = 10; // Tuất
  }
  // Chiều an Hỏa Linh: Dương Nam/Âm Nữ Hỏa thuận Linh nghịch; Âm Nam/Dương Nữ Hỏa nghịch Linh thuận
  const hoaTinhBranch = isThuan ? (hoaTinhStart + hourBranchId) % 12 : (hoaTinhStart - hourBranchId + 12) % 12;
  const linhTinhBranch = isThuan ? (linhTinhStart - hourBranchId + 12) % 12 : (linhTinhStart + hourBranchId) % 12;

  // Tả Phù & Hữu Bật (theo Tháng sinh: Tả Thìn thuận, Hữu Tuất nghịch)
  const taPhuBranch = (4 + (lunarDate.month - 1)) % 12;
  const huuBatBranch = (10 - (lunarDate.month - 1) + 12) % 12;

  // Văn Xương & Văn Khúc (theo Giờ sinh: Xương Tuất nghịch, Khúc Thìn thuận)
  const vanXuongBranch = (10 - hourBranchId + 12) % 12;
  const vanKhucBranch = (4 + hourBranchId) % 12;

  // Thiên Khôi & Thiên Việt (Quý nhân theo Can Năm)
  const khoiVietMap: Record<number, [number, number]> = {
    0: [1, 7],   // Giáp: Sửu - Mùi
    1: [0, 8],   // Ất: Tý - Thân
    2: [11, 9],  // Bính: Hợi - Dậu
    3: [11, 9],  // Đinh: Hợi - Dậu
    4: [1, 7],   // Mậu: Sửu - Mùi
    5: [0, 8],   // Kỷ: Tý - Thân
    6: [1, 7],   // Canh: Sửu - Mùi
    7: [6, 2],   // Tân: Ngọ - Dần
    8: [3, 5],   // Nhâm: Mão - Tỵ
    9: [3, 5],   // Quý: Mão - Tỵ
  };
  const [thienKhoiBranch, thienVietBranch] = khoiVietMap[stemIdx] || [1, 7];

  // Thiên Mã (theo Tam hợp Chi năm)
  // Dần Ngọ Tuất: Thân (8); Thân Tý Thìn: Dần (2); Tỵ Dậu Sửu: Hợi (11); Hợi Mão Mùi: Tỵ (5)
  const thienMaMap: Record<number, number> = {
    2: 8, 6: 8, 10: 8, // Dần, Ngọ, Tuất -> Thân
    8: 2, 0: 2, 4: 2,  // Thân, Tý, Thìn -> Dần
    5: 11, 9: 11, 1: 11, // Tỵ, Dậu, Sửu -> Hợi
    11: 5, 3: 5, 7: 5, // Hợi, Mão, Mùi -> Tỵ
  };
  const thienMaBranch = thienMaMap[branchIdx] ?? 8;

  // Đào Hoa (theo Tam hợp Chi năm)
  const daoHoaMap: Record<number, number> = {
    2: 3, 6: 3, 10: 3, // Dần Ngọ Tuất -> Mão
    8: 9, 0: 9, 4: 9,  // Thân Tý Thìn -> Dậu
    5: 6, 9: 6, 1: 6,  // Tỵ Dậu Sửu -> Ngọ
    11: 0, 3: 0, 7: 0, // Hợi Mão Mùi -> Tý
  };
  const daoHoaBranch = daoHoaMap[branchIdx] ?? 3;

  // Hồng Loan & Thiên Hỷ (theo Chi năm)
  const hongLoanBranch = (3 - branchIdx + 12) % 12; // Khởi Mão nghịch tới Chi năm
  const thienHyBranch = (hongLoanBranch + 6) % 12;  // Đối diện Hồng Loan

  // Thiên Khốc & Thiên Hư (theo Chi năm)
  const thienKhocBranch = (6 - branchIdx + 12) % 12; // Khởi Ngọ nghịch
  const thienHuBranch = (6 + branchIdx) % 12;        // Khởi Ngọ thuận

  // Thiên Hình & Thiên Riêu (theo Tháng sinh)
  const thienHinhBranch = (9 + (lunarDate.month - 1)) % 12; // Khởi Dậu thuận
  const thienRieuBranch = (1 + (lunarDate.month - 1)) % 12; // Khởi Sửu thuận

  // Cô Thần & Quả Tú (theo Chi năm)
  let coThanBranch = 2;
  let quaTuBranch = 10;
  if ([11, 0, 1].includes(branchIdx)) { // Hợi Tý Sửu
    coThanBranch = 2; // Dần
    quaTuBranch = 10; // Tuất
  } else if ([2, 3, 4].includes(branchIdx)) { // Dần Mão Thìn
    coThanBranch = 5; // Tỵ
    quaTuBranch = 1;  // Sửu
  } else if ([5, 6, 7].includes(branchIdx)) { // Tỵ Ngọ Mùi
    coThanBranch = 8; // Thân
    quaTuBranch = 4;  // Thìn
  } else { // Thân Dậu Tuất
    coThanBranch = 11; // Hợi
    quaTuBranch = 7;   // Mùi
  }

  // Tứ Hóa: Lộc, Quyền, Khoa, Kỵ
  const tuHoaMap = [
    ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],   // Giáp
    ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],       // Ất
    ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], // Bính
    ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],       // Đinh
    ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],       // Mậu
    ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],   // Kỷ
    ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],    // Canh
    ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],     // Tân
    ['Thiên Lương', 'Tử Vi', 'Thiên Phủ', 'Vũ Khúc'],      // Nhâm
    ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],        // Quý
  ];
  const starBranches: Record<string, number> = {
    'Tả Phù': taPhuBranch, 'Hữu Bật': huuBatBranch,
    'Văn Xương': vanXuongBranch, 'Văn Khúc': vanKhucBranch,
  };
  Object.entries(saoTuViMap).forEach(([branch, stars]) => {
    stars.forEach(star => { starBranches[star] = Number(branch); });
  });

  // Khởi điểm Tiểu Hạn (Nam thuận, Nữ nghịch)
  // Dần Ngọ Tuất: khởi Thìn; Thân Tý Thìn: khởi Tuất; Tỵ Dậu Sửu: khởi Mùi; Hợi Mão Mùi: khởi Sửu
  const tieuHanStartMap: Record<number, number> = {
    2: 4, 6: 4, 10: 4,  // Thìn
    8: 10, 0: 10, 4: 10, // Tuất
    5: 7, 9: 7, 1: 7,   // Mùi
    11: 1, 3: 1, 7: 1,  // Sửu
  };
  const tieuHanStart = tieuHanStartMap[branchIdx] ?? 4;

  // 10. LẬP DỮ LIỆU 12 CUNG
  const palaces: TuViPalace[] = [];
  const palaceByBranch: Record<number, TuViPalace> = {};

  PALACE_INFOS.forEach((pInfo, index) => {
    // 12 cung chức năng an thuận chiều địa chi từ Cung Mệnh
    const bId = (menhBranchId + index) % 12;
    const bName = EARTHLY_BRANCHES[bId].name;

    // Can của cung (Ngũ Hổ Độn)
    const palaceStepsFromDan = (bId - 2 + 12) % 12;
    const palaceStemIdx = (danStemIdx + palaceStepsFromDan) % 10;
    const palaceStem = HEAVENLY_STEMS[palaceStemIdx];
    const canChiPalace = `${palaceStem.name} ${bName}`;

    // Đại Hạn (10 năm mỗi cung)
    const stepDaiHan = isThuan ? (bId - menhBranchId + 12) % 12 : (menhBranchId - bId + 12) % 12;
    const startAge = cuc.num + stepDaiHan * 10;
    const endAge = startAge + 9;
    const daiHanStr = `${startAge} - ${endAge}`;

    // Tiểu Hạn chiếu vào cung này
    const isMale = gender === 'Nam';
    const stepTieuHan = isMale ? (bId - tieuHanStart + 12) % 12 : (tieuHanStart - bId + 12) % 12;
    const tieuHanChi = EARTHLY_BRANCHES[stepTieuHan].name;

    // Tuần & Triệt tại cung này
    const hasTuan = tuanBranches.includes(bId);
    const hasTriet = trietBranches.includes(bId);

    // Chính tinh tại cung
    const majorNames = saoTuViMap[bId] || [];
    const majorStars: StarInfo[] = majorNames.map((name) => ({
      name,
      element: MAJOR_STARS_META[name]?.element || 'Thổ',
      type: 'chinh_tinh',
      status: majorStarStatus(name, bId),
      description: MAJOR_STARS_META[name]?.desc || 'Chính tinh chiếu mệnh.',
    }));

    // Cát tinh tại cung
    const goodStars: StarInfo[] = [];
    if (bId === taPhuBranch) goodStars.push({ name: 'Tả Phù', element: 'Thổ', type: 'cat_tinh', description: 'Trợ tinh đắc lực, quý nhân phò tá.' });
    if (bId === huuBatBranch) goodStars.push({ name: 'Hữu Bật', element: 'Thổ', type: 'cat_tinh', description: 'Trợ tinh đắc lực, bạn hiền trợ lực.' });
    if (bId === vanXuongBranch) goodStars.push({ name: 'Văn Xương', element: 'Kim', type: 'cat_tinh', description: 'Khoa bảng văn chương, tư duy thông tuệ.' });
    if (bId === vanKhucBranch) goodStars.push({ name: 'Văn Khúc', element: 'Thủy', type: 'cat_tinh', description: 'Học vấn nghệ thuật, hoạt ngôn sắc bén.' });
    if (bId === thienKhoiBranch) goodStars.push({ name: 'Thiên Khôi', element: 'Hỏa', type: 'cat_tinh', description: 'Đệ nhất quý nhân, lãnh tụ tinh anh.' });
    if (bId === thienVietBranch) goodStars.push({ name: 'Thiên Việt', element: 'Hỏa', type: 'cat_tinh', description: 'Đệ nhị quý nhân, cơ hội bất ngờ nâng đỡ.' });
    if (bId === locTonBranch) goodStars.push({ name: 'Lộc Tồn', element: 'Thổ', type: 'cat_tinh', description: 'Tài lộc thiên lộc, giải trừ hung hiểm.' });
    if (bId === thienMaBranch) goodStars.push({ name: 'Thiên Mã', element: 'Hỏa', type: 'cat_tinh', description: 'Bôn ba năng động, ý chí kiên định, tài lộc di chuyển.' });
    if (bId === daoHoaBranch) goodStars.push({ name: 'Đào Hoa', element: 'Mộc', type: 'cat_tinh', description: 'Sức hút quyến rũ, duyên thầm, tài nghệ nghệ thuật.' });
    if (bId === hongLoanBranch) goodStars.push({ name: 'Hồng Loan', element: 'Thủy', type: 'cat_tinh', description: 'Tình duyên tốt đẹp, thanh lịch, tin vui hỷ khánh.' });
    if (bId === thienHyBranch) goodStars.push({ name: 'Thiên Hỷ', element: 'Thủy', type: 'cat_tinh', description: 'Niềm vui rạng rỡ, hòa khí, nhân duyên sum vầy.' });

    // Sao tốt từ Vòng Thái Tuế
    const thaiTueStarObj = thaiTueMap[bId];
    if (thaiTueStarObj && thaiTueStarObj.type === 'cat_tinh') {
      goodStars.push({
        name: thaiTueStarObj.name,
        element: thaiTueStarObj.element as any,
        type: 'cat_tinh',
        description: thaiTueStarObj.desc,
      });
    }

    // Sao tốt từ Vòng Bác Sĩ
    const bacSiStarObj = bacSiMap[bId];
    if (bacSiStarObj && bacSiStarObj.type === 'cat_tinh') {
      goodStars.push({
        name: bacSiStarObj.name,
        element: bacSiStarObj.element as any,
        type: 'cat_tinh',
        description: bacSiStarObj.desc,
      });
    }

    // Sát tinh & Hung tinh tại cung
    const badStars: StarInfo[] = [];
    if (bId === kinhDuongBranch) badStars.push({ name: 'Kình Dương', element: 'Kim', type: 'sat_tinh', status: [2, 5, 8, 11].includes(bId) ? 'Đắc' : 'Hãm', description: 'Cương liệt, quả cảm, dũng mãnh nhưng xốc nổi, dễ va chạm.' });
    if (bId === daLaBranch) badStars.push({ name: 'Đà La', element: 'Kim', type: 'sat_tinh', status: [2, 5, 8, 11].includes(bId) ? 'Đắc' : 'Hãm', description: 'Trầm trệ, thâm trầm, thử thách kiên nhẫn, mưu sự thâm sâu.' });
    if (bId === diaKhongBranch) badStars.push({ name: 'Địa Không', element: 'Hỏa', type: 'sat_tinh', status: [2, 5, 8, 11].includes(bId) ? 'Đắc' : 'Hãm', description: 'Sát tinh biến hóa khôn lường, tư duy đột phá, đề phòng hao tán.' });
    if (bId === diaKiepBranch) badStars.push({ name: 'Địa Kiếp', element: 'Hỏa', type: 'sat_tinh', status: [2, 5, 8, 11].includes(bId) ? 'Đắc' : 'Hãm', description: 'Sát tinh hành động quyết liệt, táo bạo, thăng trầm sóng gió.' });
    if (bId === hoaTinhBranch) badStars.push({ name: 'Hỏa Tinh', element: 'Hỏa', type: 'sat_tinh', status: [2, 6, 10].includes(bId) ? 'Đắc' : 'Hãm', description: 'Nhiệt huyết bốc lửa, phản ứng mau lẹ, dễ nóng nảy.' });
    if (bId === linhTinhBranch) badStars.push({ name: 'Linh Tinh', element: 'Hỏa', type: 'sat_tinh', status: [2, 6, 10].includes(bId) ? 'Đắc' : 'Hãm', description: 'Âm thầm sắc bén, bền bỉ, dễ lo âu trắc trở.' });
    if (bId === thienKhocBranch) badStars.push({ name: 'Thiên Khốc', element: 'Thủy', type: 'sat_tinh', description: 'Tâm sự u uất, dễ xúc động trắc ẩn, giàu nghị lực khi vượt khó.' });
    if (bId === thienHuBranch) badStars.push({ name: 'Thiên Hư', element: 'Thủy', type: 'sat_tinh', description: 'Hư ảo, tinh thần dễ hoang mang, cần lòng tin kiên định.' });
    if (bId === thienHinhBranch) badStars.push({ name: 'Thiên Hình', element: 'Hỏa', type: 'sat_tinh', status: [2, 3, 9, 10].includes(bId) ? 'Đắc' : 'Hãm', description: 'Kỷ luật thép, tài phán đoán, nguyên tắc phân minh, phòng hình thương.' });
    if (bId === thienRieuBranch) badStars.push({ name: 'Thiên Riêu', element: 'Thủy', type: 'sat_tinh', description: 'Say mê lãng mạn, giác quan thứ sáu, đề phòng đam mê quá độ.' });
    if (bId === coThanBranch) badStars.push({ name: 'Cô Thần', element: 'Hỏa', type: 'sat_tinh', description: 'Cô độc nội tâm, tính cách độc lập, tự chủ, ít người sẻ chia.' });
    if (bId === quaTuBranch) badStars.push({ name: 'Quả Tú', element: 'Thổ', type: 'sat_tinh', description: 'Kín tiếng, giữ mình, cẩn trọng trong tình cảm giao tế.' });

    // Sao xấu từ Vòng Thái Tuế
    if (thaiTueStarObj && thaiTueStarObj.type === 'sat_tinh') {
      badStars.push({
        name: thaiTueStarObj.name,
        element: thaiTueStarObj.element as any,
        type: 'sat_tinh',
        description: thaiTueStarObj.desc,
      });
    }

    // Sao xấu từ Vòng Bác Sĩ
    if (bacSiStarObj && bacSiStarObj.type === 'sat_tinh') {
      badStars.push({
        name: bacSiStarObj.name,
        element: bacSiStarObj.element as any,
        type: 'sat_tinh',
        description: bacSiStarObj.desc,
      });
    }

    // Tứ Hóa an tại sao
    tuHoaMap[stemIdx].forEach((sourceStar, hoaIndex) => {
      if (starBranches[sourceStar] !== bId) return;
      const isKy = hoaIndex === 3;
      (isKy ? badStars : goodStars).push({
        name: `${['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'][hoaIndex]} (${sourceStar})`,
        element: hoaIndex === 0 ? 'Mộc' : hoaIndex === 1 ? 'Hỏa' : hoaIndex === 2 ? 'Thủy' : 'Thủy',
        type: isKy ? 'sat_tinh' : 'cat_tinh',
        description: `${sourceStar} hóa ${['Lộc (Tài phú dồi dào)', 'Quyền (Quyền biến lãnh đạo)', 'Khoa (Văn chương đỗ đạt)', 'Kỵ (Thử thách trở ngại)'][hoaIndex]} theo Can năm ${stem.name}.`,
      });
    });

    const palaceObj: TuViPalace = {
      index,
      id: pInfo.id,
      name: pInfo.name,
      branchId: bId,
      branchName: bName,
      canName: palaceStem.name,
      canChiName: canChiPalace,
      isMenh: bId === menhBranchId,
      isThan: bId === thanBranchId,
      hasTuan,
      hasTriet,
      trangSinhStar: trangSinhMap[bId]?.name,
      thaiTueStar: thaiTueStarObj?.name,
      bacSiStar: bacSiStarObj?.name,
      majorStars,
      goodStars,
      badStars,
      daiHan: daiHanStr,
      tieuHanChi,
      description: pInfo.desc,
    };

    palaces.push(palaceObj);
    palaceByBranch[bId] = palaceObj;
  });

  const tuanNames = tuanBranches.map(b => EARTHLY_BRANCHES[b].name).join(' - ');
  const trietNames = trietBranches.map(b => EARTHLY_BRANCHES[b].name).join(' - ');

  return {
    name: name.trim() || 'Đương Số',
    gender,
    yinYangGender,
    solarDate: `${solarDay < 10 ? '0' : ''}${solarDay}/${solarMonth < 10 ? '0' : ''}${solarMonth}/${solarYear}`,
    lunarYear: canChiYear,
    lunarDate,
    lunarDateText: `${lunarDate.day}/${lunarDate.month}${lunarDate.isLeap ? ' nhuận' : ''}/${lunarDate.year}`,
    canChiYear,
    canChiMonth,
    canChiDay,
    canChiHour,
    hourName: hourBranch.name,
    napAm: NAP_AM_TABLE[canChiYear],
    cucName: cuc.name,
    cucNumber: cuc.num,
    menhChu: MENH_CHU_MAP[branchIdx] || 'Tham Lang',
    thanChu: THAN_CHU_MAP[branchIdx] || 'Linh Tinh',
    menhLocation: `Cung ${EARTHLY_BRANCHES[menhBranchId].name}`,
    thanLocation: `Cung ${EARTHLY_BRANCHES[thanBranchId].name} (${palaces.find((p) => p.branchId === thanBranchId)?.name || 'Mệnh'})`,
    tuanLocation: `${tuanNames}`,
    trietLocation: `${trietNames}`,
    palaces,
    palaceByBranch,
  };
}
