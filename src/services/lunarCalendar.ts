/** Vietnamese lunar calendar, UTC+7. Astronomical new moons (Meeus),
 * month 11 contains the winter solstice; first month without a major solar
 * term in a 13-month year is intercalary. Reference: Hồ Ngọc Đức's calendar,
 * https://www.informatik.uni-leipzig.de/~duc/amlich/calrules_en.html
 * Supported civil dates: Gregorian 1800–2199. No device-timezone dependency.
 */
export const mod = (n: number, base: number) => ((n % base) + base) % base;
const radians = Math.PI / 180;
const sin = (degrees: number) => Math.sin(degrees * radians);
const epoch = 2415021.076998695;
const lunation = 29.530588853;
const timezone = 7;

export function validateSolarDate(day: number, month: number, year: number): void {
  if (![day, month, year].every(Number.isInteger) || year < 1800 || year > 2199 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) {
    throw new Error('Nhập ngày dương lịch hợp lệ, năm từ 1800 đến 2199.');
  }
}

export function julianDay(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function newMoonDay(k: number): number {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const sunAnomaly = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
  const moonAnomaly = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
  const latitude = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
  const correction = (0.1734 - 0.000393 * t) * sin(sunAnomaly) + 0.0021 * sin(2 * sunAnomaly)
    - 0.4068 * sin(moonAnomaly) + 0.0161 * sin(2 * moonAnomaly) - 0.0004 * sin(3 * moonAnomaly)
    + 0.0104 * sin(2 * latitude) - 0.0051 * sin(sunAnomaly + moonAnomaly)
    - 0.0074 * sin(sunAnomaly - moonAnomaly) + 0.0004 * sin(2 * latitude + sunAnomaly)
    - 0.0004 * sin(2 * latitude - sunAnomaly) - 0.0006 * sin(2 * latitude + moonAnomaly)
    + 0.001 * sin(2 * latitude - moonAnomaly) + 0.0005 * sin(sunAnomaly + 2 * moonAnomaly);
  const deltaT = t < -11
    ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t2 * t2
    : -0.000278 + 0.000265 * t + 0.000262 * t2;
  const jde = 2415020.75933 + lunation * k + 0.0001178 * t2 - 0.000000155 * t3
    + 0.00033 * sin(166.56 + 132.87 * t - 0.009173 * t2) + correction - deltaT;
  return Math.floor(jde + 0.5 + timezone / 24);
}

function solarSector(day: number): number {
  const t = (day - 0.5 - timezone / 24 - 2451545) / 36525;
  const anomaly = 357.5291 + 35999.0503 * t - 0.0001559 * t * t - 0.00000048 * t * t * t;
  const longitude = 280.46645 + 36000.76983 * t + 0.0003032 * t * t
    + (1.9146 - 0.004817 * t - 0.000014 * t * t) * sin(anomaly)
    + (0.019993 - 0.000101 * t) * sin(2 * anomaly) + 0.00029 * sin(3 * anomaly);
  return Math.floor(mod(longitude, 360) / 30);
}

function monthEleven(year: number): number {
  const k = Math.floor((julianDay(31, 12, year) - 2415021) / lunation);
  const start = newMoonDay(k);
  return solarSector(start) >= 9 ? newMoonDay(k - 1) : start;
}

export interface LunarDate { day: number; month: number; year: number; isLeap: boolean }
export function solarToLunar(day: number, month: number, year: number): LunarDate {
  validateSolarDate(day, month, year);
  const jd = julianDay(day, month, year);
  const k = Math.floor((jd - epoch) / lunation);
  let start = newMoonDay(k + 1);
  if (start > jd) start = newMoonDay(k);
  let a = monthEleven(year);
  let b = a;
  let lunarYear = year;
  if (a >= start) a = monthEleven(year - 1);
  else { lunarYear++; b = monthEleven(year + 1); }
  const distance = Math.floor((start - a) / 29);
  let lunarMonth = distance + 11;
  let isLeap = false;
  if (b - a > 365) {
    const first = Math.floor((a - epoch) / lunation + 0.5);
    let offset = 1;
    let previous = solarSector(newMoonDay(first + offset));
    while (++offset < 14) {
      const next = solarSector(newMoonDay(first + offset));
      if (next === previous) break;
      previous = next;
    }
    const leapOffset = offset - 1;
    if (distance >= leapOffset) {
      lunarMonth--;
      isLeap = distance === leapOffset;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && distance < 4) lunarYear--;
  return { day: jd - start + 1, month: lunarMonth, year: lunarYear, isLeap };
}
