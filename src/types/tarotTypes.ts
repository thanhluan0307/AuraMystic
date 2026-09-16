import { TarotCard } from '../data/tarotCards';

export type SpreadType = 'three_choose' | 'single' | 'three_timeline' | 'three_love' | 'three_career';
export type DeckMode = 'major' | 'full';
export type SectionType = 'reading' | 'library';

export interface DrawnCardItem {
  card: TarotCard;
  isReversed: boolean;
  positionName: string;
  isFaceUp: boolean;
}

export interface SpreadConfig {
  count: number;
  title: string;
  positions: string[];
}

export const getSpreadConfig = (type: SpreadType): SpreadConfig => {
  switch (type) {
    case 'single':
      return { count: 1, title: '1 Lá Hàng Ngày', positions: ['Thông Điệp Hôm Nay'] };
    case 'three_choose':
      return {
        count: 3,
        title: 'Chọn Bài 3 Lá',
        positions: ['Lá 1: Căn Nguyên / Thực Trạng', 'Lá 2: Trở Ngại & Thử Thách', 'Lá 3: Lời Khuyên & Hướng Đi'],
      };
    case 'three_timeline':
      return { count: 3, title: '3 Lá Thời Gian', positions: ['Quá Khứ', 'Hiện Tại', 'Tương Lai'] };
    case 'three_love':
      return { count: 3, title: '3 Lá Tình Duyên', positions: ['Năng Lượng Bạn', 'Đối Phương', 'Xu Hướng Tình Cảm'] };
    case 'three_career':
      return { count: 3, title: '3 Lá Sự Nghiệp', positions: ['Thực Trạng Công Việc', 'Trở Ngại / Cơ Hội', 'Lời Khuyên Bứt Phá'] };
  }
};

export const SAMPLE_TAROT_QUESTIONS = [
  'Chuyện tình cảm sắp tới của tôi sẽ tiến triển ra sao?',
  'Tôi có nên chuyển hướng công việc vào thời điểm này?',
  'Bài học lớn nhất mà linh hồn tôi cần học lúc này là gì?',
  'Năng lượng tài chính và vận may trong tháng này thế nào?',
];

