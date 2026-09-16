import { ZODIAC_SIGNS, ZodiacSign } from '../data/zodiacSigns';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, EASTERN_ANIMALS, EasternAnimal } from '../data/easternZodiac';

export interface CelestialBodyPosition {
  id: string;
  nameVi: string;
  nameEn: string;
  symbol: string;
  emoji: string;
  color: string;
  longitude: number; // 0..360 độ trên hoàng đạo
  sign: ZodiacSign;
  degreeInSign: number; // 0..30 độ
  minuteInSign: number; // 0..60 phút
  formattedDegree: string; // ví dụ: "14° ♌ 23'"
  houseNumber: number; // Nhà số 1..12
  tuViPalaceEquivalent: string; // Tương ứng cung chức năng Tử Vi
  isRetrograde?: boolean;
  description: string;
}

export interface AspectInfo {
  p1: CelestialBodyPosition;
  p2: CelestialBodyPosition;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  angle: number;
  orb: number;
  nameVi: string;
  nature: 'harmonious' | 'challenging' | 'neutral';
  color: string;
  dash?: string;
  description: string;
}

export interface NatalChartData {
  sun: CelestialBodyPosition;
  moon: CelestialBodyPosition;
  ascendant: CelestialBodyPosition;
  midheaven: CelestialBodyPosition;
  mercury: CelestialBodyPosition;
  venus: CelestialBodyPosition;
  mars: CelestialBodyPosition;
  jupiter: CelestialBodyPosition;
  saturn: CelestialBodyPosition;
  uranus: CelestialBodyPosition;
  neptune: CelestialBodyPosition;
  pluto: CelestialBodyPosition;
  northNode: CelestialBodyPosition;
  allBodies: CelestialBodyPosition[];
  aspects: AspectInfo[];
  houseCusps: number[]; // 12 đỉnh nhà (0..360 độ)
}

const rad = Math.PI / 180;
const deg = 180 / Math.PI;

const normalizeDeg = (d: number) => ((d % 360) + 360) % 360;
const sinD = (d: number) => Math.sin(d * rad);
const cosD = (d: number) => Math.cos(d * rad);
const atan2D = (y: number, x: number) => Math.atan2(y, x) * deg;

// 12 Cung Nhà tương ứng với Cung chức năng của Tử Vi Phương Đông
const HOUSE_TUVI_EQUIVALENT = [
  'Cung MỆNH (Bản Thân, Tính Cách & Diện Mạo)',
  'Cung TÀI BẠCH (Tiền Tài, Thu Nhập & Giá Trị)',
  'Cung HUYNH ĐỆ (Giao Tiếp, Học Hỏi & Anh Chị Em)',
  'Cung ĐIỀN TRẠCH (Gia Đạo, Cội Nguồn & Bất Động Sản)',
  'Cung TỬ TỨC (Sáng Tạo, Tình Yêu & Con Cái)',
  'Cung TẬT ÁCH / NÔ BỘC (Công Việc Hàng Ngày & Sức Khỏe)',
  'Cung PHU THÊ (Hôn Nhân, Đối Tác & Duyên Nợ)',
  'Cung PHÚC ĐỨC (Biến Chuyển, Tái Sinh & Tài Sản Chung)',
  'Cung THIÊN DI (Xuất Hành, Triết Lý & Học Vấn Cao)',
  'Cung QUAN LỘC (Sự Nghiệp, Danh Vọng & Vị Thế Xã Hội)',
  'Cung NÔ BỘC (Bằng Hữu, Cộng Đồng & Ước Mơ)',
  'Cung PHÚC ĐỨC / TẬT ÁCH (Tiềm Thức, Tâm Linh & Nghiệp Quả)',
];

/**
 * Tính ngày Julian từ ngày/giờ chuẩn UTC
 */
export function getJulianDay(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

/**
 * Thuật toán Thiên Văn Paul Schlyter & Jean Meeus
 * Tính toán tọa độ Hoàng Đạo địa tâm (Geocentric Ecliptic Longitude)
 */
export function calculateAstrologyChart(
  birthDate: Date,
  lat = 10.8231, // Mặc định TP. Hồ Chí Minh (10.82° N)
  lon = 106.6297 // 106.63° E
): NatalChartData {
  const jd = getJulianDay(birthDate);
  const d = jd - 2451543.5; // Số ngày từ epoch J2000.0

  // 1. TỌA ĐỘ MẶT TRỜI
  const wSun = 282.9404 + 4.70935e-5 * d;
  const eSun = 0.016709 - 1.151e-9 * d;
  const mSun = normalizeDeg(356.047 + 0.9856002585 * d);
  const eAnomSun = mSun + (180 / Math.PI) * eSun * sinD(mSun) * (1 + eSun * cosD(mSun));
  const xvSun = cosD(eAnomSun) - eSun;
  const yvSun = Math.sqrt(1 - eSun * eSun) * sinD(eAnomSun);
  const vSun = atan2D(yvSun, xvSun);
  const sunLon = normalizeDeg(vSun + wSun);
  const rSun = Math.sqrt(xvSun * xvSun + yvSun * yvSun);

  // Tọa độ trực nhật của Mặt Trời
  const xs = rSun * cosD(sunLon);
  const ys = rSun * sinD(sunLon);

  // 2. TỌA ĐỘ MẶT TRĂNG (Kèm các nhiễu loạn chính Evection, Variation)
  const nMoon = normalizeDeg(125.1228 - 0.0529538083 * d);
  const wMoon = normalizeDeg(318.0634 + 0.1643573223 * d);
  const mMoon = normalizeDeg(115.3654 + 13.0649929509 * d);
  let moonLon = normalizeDeg(nMoon + wMoon + mMoon);
  // Nhiễu loạn Mặt Trăng
  const dSunMoon = moonLon - sunLon;
  moonLon += -1.274 * sinD(mMoon - 2 * dSunMoon); // Evection
  moonLon += 0.658 * sinD(2 * dSunMoon);          // Variation
  moonLon += -0.186 * sinD(mSun);                 // Yearly inequality
  moonLon = normalizeDeg(moonLon);

  // 3. TÍNH CUNG MỌC (ASCENDANT) & THIÊN ĐỈNH (MIDHEAVEN)
  const utHours = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60 + birthDate.getUTCSeconds() / 3600;
  // Giờ thiên văn Greenwich (GMST)
  const gmst0 = normalizeDeg(280.46061837 + 360.98564736629 * d);
  const lst = normalizeDeg(gmst0 + lon + utHours * 15); // Local Sidereal Time in degrees
  const eps = 23.4392911 - 3.56e-7 * d; // Độ nghiêng hoàng đạo

  // Thiên Đỉnh (MC - Medium Coeli)
  const mcLon = normalizeDeg(atan2D(sinD(lst), cosD(lst) * cosD(eps)));

  // Cung Mọc (Ascendant - AC)
  const ascLon = normalizeDeg(atan2D(cosD(lst), -sinD(lst) * cosD(eps) - Math.tan(lat * rad) * sinD(eps)));

  // 4. CÁC HÀNH TINH (Paul Schlyter Heliocentric -> Geocentric)
  function calcPlanetLon(
    N0: number, N1: number,
    i0: number, i1: number,
    w0: number, w1: number,
    a0: number, a1: number,
    e0: number, e1: number,
    M0: number, M1: number
  ): number {
    const N = normalizeDeg(N0 + N1 * d);
    const i = i0 + i1 * d;
    const w = normalizeDeg(w0 + w1 * d);
    const a = a0 + a1 * d;
    const e = e0 + e1 * d;
    const M = normalizeDeg(M0 + M1 * d);

    // Giải phương trình Kepler
    let E = M + (180 / Math.PI) * e * sinD(M) * (1 + e * cosD(M));
    E = E - (E - (180 / Math.PI) * e * sinD(E) - M) / (1 - e * cosD(E));

    const xv = a * (cosD(E) - e);
    const yv = a * (Math.sqrt(1 - e * e) * sinD(E));
    const v = atan2D(yv, xv);
    const r = Math.sqrt(xv * xv + yv * yv);

    // Heliocentric coordinates
    const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
    const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));

    // Geocentric coordinates (cộng tọa độ Mặt Trời từ Trái Đất)
    const xg = xh + xs;
    const yg = yh + ys;
    return normalizeDeg(atan2D(yg, xg));
  }

  // Sao Thủy (Mercury)
  const mercuryLon = calcPlanetLon(48.3313, 3.24587e-5, 7.0047, 5e-8, 29.1241, 1.01444e-5, 0.387098, 0, 0.205635, 5.59e-10, 168.6562, 4.0923344368);
  // Sao Kim (Venus)
  const venusLon = calcPlanetLon(76.6799, 2.4659e-5, 3.3946, 2.75e-8, 54.891, 1.38374e-5, 0.72333, 0, 0.006773, -1.302e-9, 48.0052, 1.6021302244);
  // Sao Hỏa (Mars)
  const marsLon = calcPlanetLon(49.5574, 2.11081e-5, 1.8497, -1.78e-8, 286.5016, 2.92961e-5, 1.523688, 0, 0.093405, 2.516e-9, 18.6021, 0.5240207766);
  // Sao Mộc (Jupiter)
  const jupiterLon = calcPlanetLon(100.4542, 2.76854e-5, 1.303, -1.557e-7, 273.8777, 1.64505e-5, 5.20256, 0, 0.048498, 4.469e-9, 19.895, 0.0830853001);
  // Sao Thổ (Saturn)
  const saturnLon = calcPlanetLon(113.6634, 2.3898e-5, 2.4886, -1.081e-7, 339.3939, 2.97661e-5, 9.55475, 0, 0.055546, -9.499e-9, 316.967, 0.0334442282);
  // Sao Thiên Vương (Uranus)
  const uranusLon = calcPlanetLon(74.0005, 1.3978e-5, 0.7733, 1.9e-8, 96.6612, 3.0565e-5, 19.18171, -1.55e-8, 0.047318, 7.45e-9, 142.5905, 0.011725806);
  // Sao Hải Vương (Neptune)
  const neptuneLon = calcPlanetLon(131.7806, 3.0173e-5, 1.77, -2.55e-7, 272.8461, -6.027e-6, 30.05826, 3.313e-8, 0.008606, 2.15e-9, 260.2471, 0.005995147);
  // Sao Diêm Vương (Pluto - Chu kỳ ~248 năm)
  const plutoLon = normalizeDeg(238.95 + 0.00396 * d);
  // La Hầu / Điểm Bắc Node (North Node)
  const northNodeLon = normalizeDeg(125.04455 - 0.0529538083 * d);

  // 5. HỆ THỐNG 12 NHÀ (EQUAL HOUSE KHỞI TỪ ASCENDANT)
  // Trong Chiêm tinh học hiện đại, Equal House xuất phát từ Cung Mọc là chuẩn mực hài hòa nhất
  const houseCusps: number[] = [];
  for (let h = 0; h < 12; h++) {
    houseCusps.push(normalizeDeg(ascLon + h * 30));
  }

  function getHouseNumber(lon: number): number {
    const diff = normalizeDeg(lon - ascLon);
    return Math.floor(diff / 30) + 1;
  }

  // Chuyển đổi kinh độ hoàng đạo (0..360) thành thông tin Cung Hoàng Đạo
  function makeCelestialBody(
    id: string,
    nameVi: string,
    nameEn: string,
    symbol: string,
    emoji: string,
    color: string,
    longitude: number,
    description: string
  ): CelestialBodyPosition {
    const signIndex = Math.floor(longitude / 30) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const totalDegInSign = longitude - signIndex * 30;
    const degreeInSign = Math.floor(totalDegInSign);
    const minuteInSign = Math.floor((totalDegInSign - degreeInSign) * 60);
    const formattedDegree = `${degreeInSign}° ${sign.symbol} ${minuteInSign < 10 ? '0' : ''}${minuteInSign}'`;
    const houseNumber = getHouseNumber(longitude);
    const tuViPalaceEquivalent = HOUSE_TUVI_EQUIVALENT[houseNumber - 1];

    return {
      id,
      nameVi,
      nameEn,
      symbol,
      emoji,
      color,
      longitude,
      sign,
      degreeInSign,
      minuteInSign,
      formattedDegree,
      houseNumber,
      tuViPalaceEquivalent,
      description,
    };
  }

  const sun = makeCelestialBody('sun', 'Mặt Trời (Sun)', 'Sun', '☉', '☀️', '#F59E0B', sunLon, 'Bản ngã cốt lõi, ý chí sống, nhận thức chủ động và nguồn sinh lực chi phối.');
  const moon = makeCelestialBody('moon', 'Mặt Trăng (Moon)', 'Moon', '☽', '🌙', '#E2E8F0', moonLon, 'Cảm xúc thầm kín, trực giác tiềm thức, nhu cầu an toàn nội tâm và người mẹ.');
  const ascendant = makeCelestialBody('ascendant', 'Cung Mọc (Ascendant)', 'Ascendant', 'AC', '🌅', '#10B981', ascLon, 'Mặt nạ xã hội, phong thái bên ngoài, diện mạo và lăng kính bạn nhìn nhận thế giới.');
  const midheaven = makeCelestialBody('midheaven', 'Thiên Đỉnh (Midheaven)', 'Midheaven', 'MC', '👑', '#F43F5E', mcLon, 'Đỉnh cao sự nghiệp, danh vọng xã hội, lý tưởng cuộc đời và di sản để lại.');
  const mercury = makeCelestialBody('mercury', 'Sao Thủy (Mercury)', 'Mercury', '☿', '⚡', '#38BDF8', mercuryLon, 'Tư duy logic, phương thức giao tiếp, phản xạ ngôn từ và khả năng học hỏi.');
  const venus = makeCelestialBody('venus', 'Sao Kim (Venus)', 'Venus', '♀', '💖', '#F472B6', venusLon, 'Tình yêu, sự quyến rũ, gu thẩm mỹ, nghệ thuật và cách thu hút của cải tài lộc.');
  const mars = makeCelestialBody('mars', 'Sao Hỏa (Mars)', 'Mars', '♂', '🔥', '#EF4444', marsLon, 'Động lực hành động, ngọn lửa đam mê, sự quả cảm, dũng khí và tính quyết đoán.');
  const jupiter = makeCelestialBody('jupiter', 'Sao Mộc (Jupiter)', 'Jupiter', '♃', '🍀', '#FBBF24', jupiterLon, 'May mắn, sự mở rộng tri thức, đức tin tâm linh, sự hào phóng và phúc khí lớn.');
  const saturn = makeCelestialBody('saturn', 'Sao Thổ (Saturn)', 'Saturn', '♄', '⏳', '#A78BFA', saturnLon, 'Kỷ luật, bài học nghiệp quả, thử thách trưởng thành và sự kiên trì bền bỉ.');
  const uranus = makeCelestialBody('uranus', 'Sao Thiên Vương (Uranus)', 'Uranus', '♅', '💡', '#06B6D4', uranusLon, 'Đột phá, sáng tạo tự do, cách mạng tư tưởng và năng lực đổi mới.');
  const neptune = makeCelestialBody('neptune', 'Sao Hải Vương (Neptune)', 'Neptune', '♆', '🌊', '#6366F1', neptuneLon, 'Trực giác tâm linh, giấc mơ, lòng trắc ẩn, nghệ thuật thăng hoa và sự giác ngộ.');
  const pluto = makeCelestialBody('pluto', 'Sao Diêm Vương (Pluto)', 'Pluto', '♇', '🌋', '#9333EA', plutoLon, 'Chuyển hóa tái sinh, sức mạnh tiềm tàng, vượt qua nghịch cảnh để lột xác.');
  const northNode = makeCelestialBody('northNode', 'Điểm Tiến Hóa (North Node)', 'North Node', '☊', '✨', '#EC4899', northNodeLon, 'Bài học tiến hóa linh hồn, vùng phát triển mới vượt khỏi vùng an toàn quá khứ.');

  const allBodies = [sun, moon, ascendant, midheaven, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, northNode];

  // 6. TÍNH TOÁN CÁC GÓC HỢP (ASPECTS) CHÍNH XÁC
  const aspects: AspectInfo[] = [];
  const aspectRules = [
    { type: 'conjunction' as const, angle: 0, orb: 8, nameVi: 'Trùng Tụ (0°)', nature: 'harmonious' as const, color: 'rgba(234, 179, 8, 0.75)', desc: 'Hội tụ sức mạnh, đồng nhất năng lượng mãnh liệt.' },
    { type: 'sextile' as const, angle: 60, orb: 5, nameVi: 'Lục Hợp (60°)', nature: 'harmonious' as const, color: 'rgba(52, 211, 153, 0.65)', dash: '3,3', desc: 'Cơ hội thuận lợi, giao tiếp thông suốt, tương trợ nhẹ nhàng.' },
    { type: 'square' as const, angle: 90, orb: 7, nameVi: 'Vuông Góc (90°)', nature: 'challenging' as const, color: 'rgba(248, 113, 113, 0.7)', dash: '4,2', desc: 'Xung đột, căng thẳng thúc đẩy hành động đột phá, vượt ngưỡng.' },
    { type: 'trine' as const, angle: 120, orb: 8, nameVi: 'Tam Hợp (120°)', nature: 'harmonious' as const, color: 'rgba(56, 189, 248, 0.75)', desc: 'Dòng chảy năng lượng may mắn, tài năng bẩm sinh tự nhiên tỏa sáng.' },
    { type: 'opposition' as const, angle: 180, orb: 8, nameVi: 'Đối Đỉnh (180°)', nature: 'challenging' as const, color: 'rgba(251, 146, 60, 0.7)', desc: 'Đối kháng trực diện, đòi hỏi sự cân bằng và nhận thức đa chiều.' },
  ];

  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const p1 = allBodies[i];
      const p2 = allBodies[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const shortestAngle = Math.min(diff, 360 - diff);

      for (const rule of aspectRules) {
        const currentOrb = Math.abs(shortestAngle - rule.angle);
        if (currentOrb <= rule.orb) {
          aspects.push({
            p1,
            p2,
            type: rule.type,
            angle: rule.angle,
            orb: parseFloat(currentOrb.toFixed(1)),
            nameVi: rule.nameVi,
            nature: rule.nature,
            color: rule.color,
            dash: rule.dash,
            description: `${p1.nameVi} tạo góc ${rule.nameVi} với ${p2.nameVi} (độ lệch ${currentOrb.toFixed(1)}°): ${rule.desc}`,
          });
          break;
        }
      }
    }
  }

  return {
    sun,
    moon,
    ascendant,
    midheaven,
    mercury,
    venus,
    mars,
    jupiter,
    saturn,
    uranus,
    neptune,
    pluto,
    northNode,
    allBodies,
    aspects,
    houseCusps,
  };
}

// Bảng Nạp Âm Lục Thập Hoa Giáp
export const NAP_AM_TABLE: Record<string, string> = {
  'Giáp Tý': 'Hải Trung Kim (Vàng trong biển)',
  'Ất Sửu': 'Hải Trung Kim (Vàng trong biển)',
  'Bính Dần': 'Lư Trung Hỏa (Lửa trong lò)',
  'Đinh Mão': 'Lư Trung Hỏa (Lửa trong lò)',
  'Mậu Thìn': 'Đại Lâm Mộc (Gỗ rừng già)',
  'Kỷ Tỵ': 'Đại Lâm Mộc (Gỗ rừng già)',
  'Canh Ngọ': 'Lộ Bàng Thổ (Đất ven đường)',
  'Tân Mùi': 'Lộ Bàng Thổ (Đất ven đường)',
  'Nhâm Thân': 'Kiếm Phong Kim (Vàng mũi kiếm)',
  'Quý Dậu': 'Kiếm Phong Kim (Vàng mũi kiếm)',
  'Giáp Tuất': 'Sơn Đầu Hỏa (Lửa trên núi)',
  'Ất Hợi': 'Sơn Đầu Hỏa (Lửa trên núi)',
  'Bính Tý': 'Giản Hạ Thủy (Nước khe suối)',
  'Đinh Sửu': 'Giản Hạ Thủy (Nước khe suối)',
  'Mậu Dần': 'Thành Đầu Thổ (Đất trên thành)',
  'Kỷ Mão': 'Thành Đầu Thổ (Đất trên thành)',
  'Canh Thìn': 'Bạch Lạp Kim (Vàng trong sáp)',
  'Tân Tỵ': 'Bạch Lạp Kim (Vàng trong sáp)',
  'Nhâm Ngọ': 'Dương Liễu Mộc (Gỗ cây liễu)',
  'Quý Mùi': 'Dương Liễu Mộc (Gỗ cây liễu)',
  'Giáp Thân': 'Tuyền Trung Thủy (Nước dưới giếng)',
  'Ất Dậu': 'Tuyền Trung Thủy (Nước dưới giếng)',
  'Bính Tuất': 'Ốc Thượng Thổ (Đất trên mái)',
  'Đinh Hợi': 'Ốc Thượng Thổ (Đất trên mái)',
  'Mậu Tý': 'Tích Lịch Hỏa (Lửa sấm sét)',
  'Kỷ Sửu': 'Tích Lịch Hỏa (Lửa sấm sét)',
  'Canh Dần': 'Tùng Bách Mộc (Gỗ tùng bách)',
  'Tân Mão': 'Tùng Bách Mộc (Gỗ tùng bách)',
  'Nhâm Thìn': 'Trường Lưu Thủy (Nước sông dài)',
  'Quý Tỵ': 'Trường Lưu Thủy (Nước sông dài)',
  'Giáp Ngọ': 'Sa Trung Kim (Vàng trong cát)',
  'Ất Mùi': 'Sa Trung Kim (Vàng trong cát)',
  'Bính Thân': 'Sơn Hạ Hỏa (Lửa dưới chân núi)',
  'Đinh Dậu': 'Sơn Hạ Hỏa (Lửa dưới chân núi)',
  'Mậu Tuất': 'Bình Địa Mộc (Gỗ đồng bằng)',
  'Kỷ Hợi': 'Bình Địa Mộc (Gỗ đồng bằng)',
  'Canh Tý': 'Bích Thượng Thổ (Đất trên vách)',
  'Tân Sửu': 'Bích Thượng Thổ (Đất trên vách)',
  'Nhâm Dần': 'Kim Bạch Kim (Vàng mạ vàng)',
  'Quý Mão': 'Kim Bạch Kim (Vàng mạ vàng)',
  'Giáp Thìn': 'Phúc Đăng Hỏa (Lửa ngọn đèn)',
  'Ất Tỵ': 'Phúc Đăng Hỏa (Lửa ngọn đèn)',
  'Bính Ngọ': 'Thiên Hà Thủy (Nước trên trời)',
  'Đinh Mùi': 'Thiên Hà Thủy (Nước trên trời)',
  'Mậu Thân': 'Đại Trạch Thổ (Đất cồn lớn)',
  'Kỷ Dậu': 'Đại Trạch Thổ (Đất cồn lớn)',
  'Canh Tuất': 'Thoa Xuyến Kim (Vàng trang sức)',
  'Tân Hợi': 'Thoa Xuyến Kim (Vàng trang sức)',
  'Nhâm Tý': 'Tang Đố Mộc (Gỗ cây dâu)',
  'Quý Sửu': 'Tang Đố Mộc (Gỗ cây dâu)',
  'Giáp Dần': 'Đại Khê Thủy (Nước khe lớn)',
  'Ất Mão': 'Đại Khê Thủy (Nước khe lớn)',
  'Bính Thìn': 'Sa Trung Thổ (Đất pha cát)',
  'Đinh Tỵ': 'Sa Trung Thổ (Đất pha cát)',
  'Mậu Ngọ': 'Thiên Thượng Hỏa (Lửa trên trời)',
  'Kỷ Mùi': 'Thiên Thượng Hỏa (Lửa trên trời)',
  'Canh Thân': 'Thạch Lựu Mộc (Gỗ cây thạch lựu)',
  'Tân Dậu': 'Thạch Lựu Mộc (Gỗ cây thạch lựu)',
  'Nhâm Tuất': 'Đại Hải Thủy (Nước biển lớn)',
  'Quý Hợi': 'Đại Hải Thủy (Nước biển lớn)',
};

/**
 * Tính Can Chi năm sinh và Bản Mệnh Nạp Âm
 */
export function calculateEasternHoroscope(year: number, hour: number) {
  const stemIndex = (year - 4 + 1000) % 10;
  const branchIndex = (year - 4 + 1200) % 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  const animal = EASTERN_ANIMALS[branchIndex];

  const canChiYear = `${stem.name} ${branch.name}`;
  const napAm = NAP_AM_TABLE[canChiYear] || 'Ngũ Hành Hòa Hợp';

  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const hourBranch = EARTHLY_BRANCHES[hourBranchIndex];
  const hourStemIndex = ((stemIndex % 5) * 2 + hourBranchIndex) % 10;
  const hourStem = HEAVENLY_STEMS[hourStemIndex];
  const canChiHour = `${hourStem.name} ${hourBranch.name}`;

  return {
    canChiYear,
    stem,
    branch,
    animal,
    napAm,
    canChiHour,
    hourBranch,
  };
}
