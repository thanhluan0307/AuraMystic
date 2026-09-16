export type NoteCategory = 'tarot' | 'astrology' | 'tuvi' | 'natal' | 'general';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_MAP: Record<NoteCategory, { name: string; emoji: string; color: string }> = {
  tarot: { name: 'Tarot', emoji: '🃏', color: '#A855F7' },
  astrology: { name: 'Chiêm Tinh', emoji: '⭐', color: '#F59E0B' },
  tuvi: { name: 'Tử Vi', emoji: '☯', color: '#EF4444' },
  natal: { name: 'Bản Đồ Sao', emoji: '🌌', color: '#38BDF8' },
  general: { name: 'Chung', emoji: '📝', color: '#10B981' },
};

const STORAGE_KEY = '@tl_mystic_notes_v2';

// Danh sách ghi chú khởi tạo hoàn toàn trống
const DEFAULT_NOTES: NoteItem[] = [];

let inMemoryNotes: NoteItem[] = [];

function getFormattedDateTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

export async function getStoredNotes(): Promise<NoteItem[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Dọn dẹp key cũ nếu có mẫu ghi chú cũ
      window.localStorage.removeItem('@tl_mystic_notes_v1');

      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((n: any) => n.id !== 'sample-1' && n.id !== 'sample-2');
          inMemoryNotes = cleaned;
          return cleaned;
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc ghi chú từ storage:', e);
  }
  return inMemoryNotes;
}

export async function saveStoredNotes(notes: NoteItem[]): Promise<void> {
  inMemoryNotes = notes;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  } catch (e) {
    console.warn('Lỗi lưu ghi chú vào storage:', e);
  }
}

export async function addNote(
  title: string,
  content: string,
  category: NoteCategory
): Promise<NoteItem[]> {
  const newNote: NoteItem = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
    title: title.trim() || 'Ghi chú không tiêu đề',
    content: content.trim(),
    category,
    createdAt: getFormattedDateTime(),
    updatedAt: getFormattedDateTime(),
  };

  const currentNotes = await getStoredNotes();
  const updated = [newNote, ...currentNotes];
  await saveStoredNotes(updated);
  return updated;
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
  category: NoteCategory
): Promise<NoteItem[]> {
  const currentNotes = await getStoredNotes();
  const updated = currentNotes.map((n) => {
    if (n.id === id) {
      return {
        ...n,
        title: title.trim() || 'Ghi chú không tiêu đề',
        content: content.trim(),
        category,
        updatedAt: getFormattedDateTime(),
      };
    }
    return n;
  });
  await saveStoredNotes(updated);
  return updated;
}

export async function deleteNote(id: string): Promise<NoteItem[]> {
  const currentNotes = await getStoredNotes();
  const updated = currentNotes.filter((n) => n.id !== id);
  await saveStoredNotes(updated);
  return updated;
}

