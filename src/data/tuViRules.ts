import type { StarInfo } from '../services/tuViCalc';

// Địa chi Tý..Hợi. Bảng đối chiếu: doanguyen/lasotuvi, DiaBan.py,
// https://github.com/doanguyen/lasotuvi/blob/master/lasotuvi/DiaBan.py
// Thiên Phủ: https://hocvienlyso.org/y-nghia-thien-phu-o-cac-cung.html
// Bảng miếu/vượng có dị bản; đây là hệ quy chiếu của ứng dụng.
const STATUS_BY_BRANCH: Record<string, string> = {
  'Tử Vi': 'BĐMBVMMĐMBVB',
  'Liêm Trinh': 'VĐVHMHVĐVHMH',
  'Thiên Đồng': 'VHMĐHĐHHMHHĐ',
  'Vũ Khúc': 'VMVĐMHVMVĐMH',
  'Thái Dương': 'HĐVVVMMĐHHHH',
  'Thiên Cơ': 'ĐĐHMMVĐĐVMMH',
  'Thiên Phủ': 'MBMBVĐMĐMBVĐ',
  'Thái Âm': 'VĐHHHHHĐVMMM',
  'Tham Lang': 'HMĐHVHHMĐHVH',
  'Cự Môn': 'VHVMHHVHĐMHĐ',
  'Thiên Tướng': 'VĐMHVĐVĐMHVĐ',
  'Thiên Lương': 'VĐVVMHMĐVHMH',
  'Thất Sát': 'MĐMHHVMĐMHHV',
  'Phá Quân': 'MVHHĐHMVHHĐH',
};
const STATUS_NAMES: Record<string, NonNullable<StarInfo['status']>> = {
  M: 'Miếu', V: 'Vượng', Đ: 'Đắc', B: 'Bình', H: 'Hãm',
};
export function majorStarStatus(star: string, branch: number): StarInfo['status'] {
  return STATUS_NAMES[STATUS_BY_BRANCH[star]?.[branch]];
}
