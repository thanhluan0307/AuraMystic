import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TAROT_DECK, TarotCard } from '../data/tarotCards';
import { getTarotImage } from '../data/tarotImages';
import { generateAIText } from '../config/gemini';
import { AIResponseCard } from './AIResponseCard';

type FilterType = 'all' | 'major' | 'cups' | 'pentacles' | 'swords' | 'wands';

export const TarotLibraryView: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [viewState, setViewState] = useState<'upright' | 'reversed'>('upright');

  // AI Card Consultation State
  const [userQuery, setUserQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const filterOptions: { id: FilterType; label: string; count: number; icon: string }[] = [
    { id: 'all', label: 'Tất Cả', count: 78, icon: '🌟' },
    { id: 'major', label: 'Ẩn Chính', count: 22, icon: '👑' },
    { id: 'cups', label: 'Bộ Cốc', count: 14, icon: '🏆' },
    { id: 'pentacles', label: 'Bộ Tiền', count: 14, icon: '🪙' },
    { id: 'swords', label: 'Bộ Kiếm', count: 14, icon: '⚔️' },
    { id: 'wands', label: 'Bộ Gậy', count: 14, icon: '🔥' },
  ];

  // Filter and search logic
  const filteredCards = useMemo(() => {
    return TAROT_DECK.filter((card) => {
      // Category filter
      let matchesCategory = true;
      if (activeFilter === 'major') matchesCategory = card.arcana === 'Major';
      else if (activeFilter === 'cups') matchesCategory = card.suit === 'Cups';
      else if (activeFilter === 'pentacles') matchesCategory = card.suit === 'Pentacles';
      else if (activeFilter === 'swords') matchesCategory = card.suit === 'Swords';
      else if (activeFilter === 'wands') matchesCategory = card.suit === 'Wands';

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery =
        card.nameVi.toLowerCase().includes(query) ||
        card.nameEn.toLowerCase().includes(query) ||
        card.element.toLowerCase().includes(query) ||
        card.astrology.toLowerCase().includes(query) ||
        card.uprightKeywords.some((k) => k.toLowerCase().includes(query)) ||
        card.reversedKeywords.some((k) => k.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeFilter]);

  const handleOpenDetail = (card: TarotCard) => {
    setSelectedCard(card);
    setViewState('upright');
    setUserQuery('');
    setAiAnalysis(null);
  };

  const handleAskAIAboutCard = async () => {
    if (!selectedCard) return;
    setIsLoadingAI(true);
    setAiAnalysis('');

    try {
      const prompt = `Bạn là bậc thầy Tarot thấu cảm và sâu sắc. Người tìm kiếm muốn hiểu sâu về lá bài Tarot sau:
- Tên lá bài: ${selectedCard.nameVi} (${selectedCard.nameEn})
- Bộ bài: ${selectedCard.arcana === 'Major' ? 'Bộ Ẩn Chính' : `Bộ ${selectedCard.suit}`}
- Trạng thái muốn hỏi: ${viewState === 'upright' ? 'Lá Xuôi (Upright)' : 'Lá Ngược (Reversed)'}
- Ý nghĩa: ${viewState === 'upright' ? selectedCard.uprightMeaning : selectedCard.reversedMeaning}
- Từ khóa: ${(viewState === 'upright' ? selectedCard.uprightKeywords : selectedCard.reversedKeywords).join(', ')}
${userQuery.trim() ? `\nCâu hỏi hoặc tình huống cụ thể của người hỏi:\n"${userQuery.trim()}"` : ''}

Hãy phân tích chi tiết:
1. Bản chất năng lượng và thông điệp tinh thần cốt lõi của lá bài này.
2. Ứng dụng trong Tình Cảm, Sự Nghiệp và Tài Chính.
3. Lời khuyên hành động cụ thể để chuyển hóa năng lượng tốt nhất.`;

      await generateAIText(
        prompt,
        'Bạn là Tarot Reader bậc thầy uyên bác, văn phong ấm áp, huyền bí và mang tính định hướng chữa lành.',
        (_chunk, accumulated) => {
          setAiAnalysis(accumulated);
        }
      );
    } catch (err: any) {
      setAiAnalysis('Không thể kết nối đến Gemini AI lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <Ionicons name="search" size={18} color={theme.colors.accentBorder} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên lá bài, từ khóa (tình yêu, tiền, v.v.)..."
          placeholderTextColor={theme.colors.textSubtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(opt.id)}
              >
                <Text style={styles.filterChipIcon}>{opt.icon}</Text>
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {opt.label} ({opt.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Result Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          Hiển thị <Text style={styles.countHighlight}>{filteredCards.length}</Text> / 78 lá bài
        </Text>
        <Text style={styles.hintClickText}>💡 Chạm vào lá bài để xem giải nghĩa chi tiết</Text>
      </View>

      {/* 78 Cards Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredCards.map((card) => {
          const imageSrc = getTarotImage(card.imageKey);
          return (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.8}
              style={styles.cardItem}
              onPress={() => handleOpenDetail(card)}
            >
              <View style={styles.cardImageWrapper}>
                {imageSrc ? (
                  <Image source={imageSrc} style={styles.cardImageThumb} resizeMode="cover" />
                ) : (
                  <View style={styles.cardPlaceholder}>
                    <Text style={styles.placeholderEmoji}>{card.symbol}</Text>
                  </View>
                )}
                {/* Arcana or Suit badge */}
                <View style={styles.suitBadge}>
                  <Text style={styles.suitBadgeText}>
                    {card.arcana === 'Major' ? 'Ẩn Chính' : card.suit}
                  </Text>
                </View>
              </View>

              <View style={styles.cardCaption}>
                <Text numberOfLines={1} style={styles.cardCaptionTitle}>
                  {card.nameVi.split('(')[0].trim()}
                </Text>
                <Text numberOfLines={1} style={styles.cardCaptionEn}>
                  {card.nameEn}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredCards.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔮</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy lá bài phù hợp</Text>
            <Text style={styles.emptySub}>Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</Text>
          </View>
        )}
      </ScrollView>

      {/* Full Detail & AI Consultation Modal */}
      {selectedCard && (
        <Modal
          visible={!!selectedCard}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCard(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setSelectedCard(null)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                {/* Image Showcase */}
                <View
                  style={[
                    styles.modalImageWrapper,
                    viewState === 'reversed' && styles.reversedTransform,
                  ]}
                >
                  {getTarotImage(selectedCard.imageKey) && (
                    <Image
                      source={getTarotImage(selectedCard.imageKey)!}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Card Title & General Specs */}
                <Text style={styles.modalTitleText}>{selectedCard.nameVi}</Text>
                <Text style={styles.modalSubText}>
                  {selectedCard.nameEn} • {selectedCard.arcana === 'Major' ? 'Bộ Ẩn Chính' : `Bộ ${selectedCard.suit}`} • {selectedCard.element} ({selectedCard.astrology})
                </Text>

                {/* Toggle Upright / Reversed View */}
                <View style={styles.viewStateSwitch}>
                  <TouchableOpacity
                    style={[
                      styles.viewStateBtn,
                      viewState === 'upright' && styles.viewStateBtnUpright,
                    ]}
                    onPress={() => setViewState('upright')}
                  >
                    <Text
                      style={[
                        styles.viewStateText,
                        viewState === 'upright' && styles.viewStateTextActive,
                      ]}
                    >
                      ✓ Lá Xuôi (Upright)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.viewStateBtn,
                      viewState === 'reversed' && styles.viewStateBtnReversed,
                    ]}
                    onPress={() => setViewState('reversed')}
                  >
                    <Text
                      style={[
                        styles.viewStateText,
                        viewState === 'reversed' && styles.viewStateTextActive,
                      ]}
                    >
                      ↺ Lá Ngược (Reversed)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Keywords */}
                <View style={styles.keywordsContainer}>
                  {(viewState === 'upright'
                    ? selectedCard.uprightKeywords
                    : selectedCard.reversedKeywords
                  ).map((kw, i) => (
                    <View key={i} style={styles.keywordBadge}>
                      <Text style={styles.keywordBadgeText}>{kw}</Text>
                    </View>
                  ))}
                </View>

                {/* Meaning Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>🔮 Ý Nghĩa Luận Giải:</Text>
                  <Text style={styles.sectionContent}>
                    {viewState === 'upright'
                      ? selectedCard.uprightMeaning
                      : selectedCard.reversedMeaning}
                  </Text>
                </View>

                {/* Advice Section */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>🕊️ Lời Khuyên Vũ Trụ:</Text>
                  <Text style={styles.adviceContent}>{selectedCard.advice}</Text>
                </View>

                {/* Ask Gemini AI About This Card */}
                <View style={styles.aiConsultSection}>
                  <View style={styles.aiConsultHeader}>
                    <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
                    <Text style={styles.aiConsultTitle}>Hỏi Gemini AI Về Lá Bài Này</Text>
                  </View>
                  <Text style={styles.aiConsultDesc}>
                    Nhập câu hỏi hoặc hoàn cảnh của bạn để Gemini AI giải nghĩa chuyên sâu:
                  </Text>
                  <TextInput
                    style={styles.aiInput}
                    placeholder="Ví dụ: Lá này có ý nghĩa gì đối với công việc mới của tôi?"
                    placeholderTextColor={theme.colors.textSubtle}
                    value={userQuery}
                    onChangeText={setUserQuery}
                    multiline
                  />

                  <TouchableOpacity
                    style={[styles.aiBtn, isLoadingAI && styles.aiBtnDisabled]}
                    onPress={handleAskAIAboutCard}
                    disabled={isLoadingAI}
                  >
                    {isLoadingAI ? (
                      <ActivityIndicator size="small" color={theme.colors.background} />
                    ) : (
                      <>
                        <Ionicons name="planet" size={16} color={theme.colors.background} />
                        <Text style={styles.aiBtnText}>Luận Giải Chuyên Sâu Với Gemini AI</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* AI Response Display */}
                  <AIResponseCard
                    isLoading={isLoadingAI}
                    content={aiAnalysis}
                    title="Phân Tích Chuyên Sâu Từ Gemini AI"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: withOpacity(theme.colors.text, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  filterBar: {
    marginTop: 12,
  },
  chipsScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.2),
    borderColor: theme.colors.accent,
  },
  filterChipIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.accentText,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  countText: {
    fontSize: 12,
    color: theme.colors.textBody,
  },
  countHighlight: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  hintClickText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  cardItem: {
    width: '31.5%',
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  cardImageThumb: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  suitBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: withOpacity(theme.colors.navigation, 0.75),
    borderWidth: 0.6,
    borderColor: theme.colors.accentBorder,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  suitBadgeText: {
    fontSize: 8,
    color: theme.colors.accentText,
    fontWeight: '700',
  },
  cardCaption: {
    padding: 6,
    backgroundColor: theme.colors.librarySurface,
    alignItems: 'center',
  },
  cardCaptionTitle: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  cardCaptionEn: {
    color: theme.colors.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.backdrop, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '92%',
    backgroundColor: theme.colors.libraryDetailSurface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
    overflow: 'hidden',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: withOpacity(theme.colors.text, 0.1),
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalImageWrapper: {
    width: 190,
    height: 310,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.accentBorder,
    marginBottom: 14,
    shadowColor: theme.colors.accentBorder,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  reversedTransform: {
    transform: [{ rotate: '180deg' }],
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitleText: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalSubText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  viewStateSwitch: {
    flexDirection: 'row',
    backgroundColor: withOpacity(theme.colors.text, 0.06),
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    width: '100%',
  },
  viewStateBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewStateBtnUpright: {
    backgroundColor: 'rgba(49, 151, 149, 0.8)',
  },
  viewStateBtnReversed: {
    backgroundColor: 'rgba(229, 62, 62, 0.8)',
  },
  viewStateText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  viewStateTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  keywordBadge: {
    backgroundColor: withOpacity(theme.colors.accent, 0.12),
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.35),
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    margin: 3,
  },
  keywordBadgeText: {
    color: theme.colors.accentText,
    fontSize: 11,
    fontWeight: '600',
  },
  infoSection: {
    width: '100%',
    backgroundColor: withOpacity(theme.colors.text, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.text, 0.08),
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  adviceContent: {
    fontSize: 13,
    color: theme.colors.textBody,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // AI consultation section
  aiConsultSection: {
    width: '100%',
    backgroundColor: withOpacity(theme.colors.surfaceHighlight, 0.7),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.4),
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  aiConsultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiConsultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accent,
    marginLeft: 6,
  },
  aiConsultDesc: {
    fontSize: 11,
    color: theme.colors.textBody,
    marginBottom: 8,
  },
  aiInput: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.7),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 10,
    padding: 10,
    color: theme.colors.text,
    fontSize: 13,
    minHeight: 48,
    marginBottom: 10,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
  },
  aiBtnDisabled: {
    opacity: 0.6,
  },
  aiBtnText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  aiResultBox: {
    marginTop: 12,
    backgroundColor: withOpacity(theme.colors.navigation, 0.8),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.3),
    borderRadius: 10,
    padding: 12,
  },
  aiResultHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentText,
    marginBottom: 6,
  },
  aiResultBody: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

