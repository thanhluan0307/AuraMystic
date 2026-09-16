import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  NoteItem,
  NoteCategory,
  CATEGORY_MAP,
  getStoredNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../services/storageService';

interface NotesModalProps {
  visible: boolean;
  onClose: () => void;
  onNotesCountChange?: (count: number) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  visible,
  onClose,
  onNotesCountChange,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<NoteCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State (for adding / editing)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<NoteCategory>('general');

  // Load notes on mount and when modal opens
  useEffect(() => {
    if (visible) {
      loadNotes();
    }
  }, [visible]);

  const loadNotes = async () => {
    const list = await getStoredNotes();
    setNotes(list);
    if (onNotesCountChange) {
      onNotesCountChange(list.length);
    }
  };

  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory(activeCategory === 'all' ? 'general' : activeCategory);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setIsFormOpen(true);
  };

  const handleSaveNote = async () => {
    if (!formContent.trim() && !formTitle.trim()) {
      return;
    }

    let updated: NoteItem[];
    if (editingNoteId) {
      updated = await updateNote(editingNoteId, formTitle, formContent, formCategory);
    } else {
      updated = await addNote(formTitle, formContent, formCategory);
    }

    setNotes(updated);
    if (onNotesCountChange) {
      onNotesCountChange(updated.length);
    }
    setIsFormOpen(false);
    setEditingNoteId(null);
  };

  const handleDeleteNote = async (id: string) => {
    const updated = await deleteNote(id);
    setNotes(updated);
    if (onNotesCountChange) {
      onNotesCountChange(updated.length);
    }
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchCat = activeCategory === 'all' || n.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [notes, activeCategory, searchQuery]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Ionicons name="book" size={20} color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>SỔ GHI CHÚ HUYỀN BÍ</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.textBody} />
            </TouchableOpacity>
          </View>

          {/* Editor Form View */}
          {isFormOpen ? (
            <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
              <Text style={styles.formSectionTitle}>
                {editingNoteId ? 'CHỈNH SỬA GHI CHÚ' : 'TẠO GHI CHÚ MỚI'}
              </Text>

              {/* Category Picker */}
              <Text style={styles.fieldLabel}>Chọn Danh Mục</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {(Object.keys(CATEGORY_MAP) as NoteCategory[]).map((catKey) => {
                  const cat = CATEGORY_MAP[catKey];
                  const isSelected = formCategory === catKey;
                  return (
                    <TouchableOpacity
                      key={catKey}
                      style={[
                        styles.catOption,
                        isSelected && {
                          borderColor: cat.color,
                          backgroundColor: withOpacity(theme.colors.text, 0.08),
                        },
                      ]}
                      onPress={() => setFormCategory(catKey)}
                    >
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.catText,
                          isSelected && { color: cat.color, fontWeight: '700' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Title Input */}
              <Text style={styles.fieldLabel}>Tiêu Đề</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Ví dụ: Trải bài 3 lá sáng nay, Lời khuyên lá The Sun..."
                placeholderTextColor={theme.colors.textSubtle}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Content Input */}
              <Text style={styles.fieldLabel}>Nội Dung Chiêm Nghiệm</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Ghi lại cảm nhận, lời khuyên của quẻ hoặc điều bạn cần ghi nhớ..."
                placeholderTextColor={theme.colors.textSubtle}
                value={formContent}
                onChangeText={setFormContent}
                multiline
                textAlignVertical="top"
              />

              {/* Form Buttons */}
              <View style={styles.formButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsFormOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Hủy Bỏ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNote}>
                  <Ionicons name="checkmark" size={16} color={theme.colors.background} />
                  <Text style={styles.saveBtnText}>Lưu Ghi Chú</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Main Notes List View */
            <View style={styles.listContainer}>
              {/* Search & Add Row */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={16} color={theme.colors.textSubtle} style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm ghi chú..."
                    placeholderTextColor={theme.colors.textSubtle}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.textSubtle} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={handleOpenNewNote}>
                  <Ionicons name="add" size={18} color={theme.colors.background} />
                  <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeCategory === 'all' && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveCategory('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeCategory === 'all' && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả ({notes.length})
                  </Text>
                </TouchableOpacity>

                {(Object.keys(CATEGORY_MAP) as NoteCategory[]).map((catKey) => {
                  const cat = CATEGORY_MAP[catKey];
                  const isSelected = activeCategory === catKey;
                  const count = notes.filter((n) => n.category === catKey).length;
                  return (
                    <TouchableOpacity
                      key={catKey}
                      style={[
                        styles.filterChip,
                        isSelected && {
                          borderColor: cat.color,
                          backgroundColor: withOpacity(theme.colors.text, 0.08),
                        },
                      ]}
                      onPress={() => setActiveCategory(catKey)}
                    >
                      <Text style={styles.filterChipEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && { color: cat.color, fontWeight: '700' },
                        ]}
                      >
                        {cat.name} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Notes Scroll List */}
              <ScrollView
                style={styles.notesScroll}
                contentContainerStyle={styles.notesScrollContent}
              >
                {filteredNotes.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="document-text-outline" size={44} color={theme.colors.textSubtle} />
                    <Text style={styles.emptyTitle}>Chưa có ghi chú nào</Text>
                    <Text style={styles.emptySub}>
                      {searchQuery
                        ? 'Không tìm thấy ghi chú khớp với từ khóa.'
                        : 'Hãy ghi lại những thông điệp vũ trụ và chiêm nghiệm tâm linh của bạn!'}
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={handleOpenNewNote}
                    >
                      <Ionicons name="pencil" size={15} color={theme.colors.background} />
                      <Text style={styles.emptyAddBtnText}>Tạo Ghi Chú Đầu Tiên</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  filteredNotes.map((note) => {
                    const cat = CATEGORY_MAP[note.category] || CATEGORY_MAP.general;
                    return (
                      <View key={note.id} style={styles.noteCard}>
                        {/* Note Top Bar */}
                        <View style={styles.noteTopBar}>
                          <View
                            style={[
                              styles.noteCatBadge,
                              { backgroundColor: `${cat.color}22`, borderColor: `${cat.color}66` },
                            ]}
                          >
                            <Text style={styles.noteCatEmoji}>{cat.emoji}</Text>
                            <Text style={[styles.noteCatText, { color: cat.color }]}>
                              {cat.name}
                            </Text>
                          </View>
                          <Text style={styles.noteDate}>{note.createdAt}</Text>
                        </View>

                        {/* Note Content */}
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <Text style={styles.noteBody}>{note.content}</Text>

                        {/* Note Action Buttons */}
                        <View style={styles.noteActions}>
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => handleEditNote(note)}
                          >
                            <Ionicons name="pencil-outline" size={14} color={theme.colors.accentText} />
                            <Text style={styles.editBtnText}>Sửa</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteNote(note.id)}
                          >
                            <Ionicons name="trash-outline" size={14} color="#FC8181" />
                            <Text style={styles.deleteBtnText}>Xóa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.backdrop, 0.85),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    height: '88%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
    overflow: 'hidden',
    shadowColor: theme.colors.accentBorder,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(theme.colors.accentBorder, 0.25),
    backgroundColor: withOpacity(theme.colors.text, 0.02),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: withOpacity(theme.colors.text, 0.08),
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  filterScroll: {
    maxHeight: 38,
    marginBottom: 12,
  },
  filterContent: {
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterChipEmoji: {
    fontSize: 12,
  },
  filterChipText: {
    fontSize: 11,
    color: theme.colors.textBody,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.background,
    fontWeight: '700',
  },
  notesScroll: {
    flex: 1,
  },
  notesScrollContent: {
    paddingBottom: 20,
    gap: 10,
  },
  noteCard: {
    backgroundColor: withOpacity(theme.colors.text, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    borderRadius: 12,
    padding: 12,
  },
  noteTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  noteCatEmoji: {
    fontSize: 11,
  },
  noteCatText: {
    fontSize: 10,
    fontWeight: '700',
  },
  noteDate: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 12,
    color: theme.colors.textBody,
    lineHeight: 18,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.text, 0.05),
    paddingTop: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#FC8181',
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textBody,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 16,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.background,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 6,
    fontWeight: '600',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    gap: 5,
  },
  catEmoji: {
    fontSize: 13,
  },
  catText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  titleInput: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: theme.colors.text,
    fontSize: 13,
    marginBottom: 14,
  },
  contentInput: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 13,
    minHeight: 140,
    marginBottom: 16,
    lineHeight: 19,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.text, 0.15),
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
});

