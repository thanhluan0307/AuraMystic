import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';
import { TAROT_DECK, TarotCard } from '../data/tarotCards';
import { interpretTarotReading } from '../services/geminiService';
import { TarotLibraryView } from '../components/TarotLibraryView';
import { TarotSpreadSelector } from '../components/TarotSpreadSelector';
import { TarotQuestionInput } from '../components/TarotQuestionInput';
import { TarotDeckPicker } from '../components/TarotDeckPicker';
import { TarotDrawnDisplay } from '../components/TarotDrawnDisplay';
import {
  SpreadType,
  DeckMode,
  SectionType,
  DrawnCardItem,
  getSpreadConfig,
} from '../types/tarotTypes';

export const TarotScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [activeSection, setActiveSection] = useState<SectionType>('reading');
  const [spread, setSpread] = useState<SpreadType>('three_choose');
  const [deckMode, setDeckMode] = useState<DeckMode>('major');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCardItem[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pool of shuffled cards available for interactive manual selection
  const [deckPool, setDeckPool] = useState<TarotCard[]>([]);
  const [pickedCardIds, setPickedCardIds] = useState<number[]>([]);

  // Initialize and shuffle deck pool
  const shuffleDeckPool = () => {
    const pool =
      deckMode === 'major'
        ? TAROT_DECK.filter((c) => c.arcana === 'Major')
        : TAROT_DECK;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setDeckPool(shuffled.slice(0, 24)); // 24 cards for fan spread
    setPickedCardIds([]);
  };

  useEffect(() => {
    shuffleDeckPool();
  }, [deckMode]);

  // Handle manual card picking (for three_choose spread)
  const handlePickCard = (cardId: number) => {
    if (pickedCardIds.includes(cardId) || pickedCardIds.length >= 3) return;

    const newPickedIds = [...pickedCardIds, cardId];
    setPickedCardIds(newPickedIds);

    if (newPickedIds.length === 3) {
      setIsShuffling(true);
      setAiReading(null);
      setError(null);

      const config = getSpreadConfig('three_choose');
      const selectedCards = newPickedIds.map((id) => deckPool.find((c) => c.id === id)!);

      const items: DrawnCardItem[] = selectedCards.map((card, idx) => ({
        card,
        isReversed: Math.random() < 0.35,
        positionName: config.positions[idx],
        isFaceUp: false,
      }));

      setDrawnCards(items);
      setIsShuffling(false);

      // Auto flip with staggered delays
      items.forEach((_, i) => {
        setTimeout(() => {
          setDrawnCards((prev) =>
            prev.map((c, idx) => (idx === i ? { ...c, isFaceUp: true } : c))
          );
        }, (i + 1) * 350);
      });
    }
  };

  // Handle automatic drawing (for single, timeline, love, career)
  const handleDrawCards = () => {
    setIsShuffling(true);
    setAiReading(null);
    setError(null);

    setTimeout(() => {
      const config = getSpreadConfig(spread);
      const pool =
        deckMode === 'major'
          ? TAROT_DECK.filter((c) => c.arcana === 'Major')
          : TAROT_DECK;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, config.count);

      const items: DrawnCardItem[] = selected.map((card, idx) => ({
        card,
        isReversed: Math.random() < 0.35, // 35% chance reversed
        positionName: config.positions[idx],
        isFaceUp: false,
      }));

      setDrawnCards(items);
      setIsShuffling(false);

      // Auto flip with staggered delays
      items.forEach((_, i) => {
        setTimeout(() => {
          setDrawnCards((prev) =>
            prev.map((c, idx) => (idx === i ? { ...c, isFaceUp: true } : c))
          );
        }, (i + 1) * 350);
      });
    }, 600);
  };

  // Consult Gemini AI with real-time streaming
  const handleConsultAI = async () => {
    if (drawnCards.length === 0) {
      setError('Vui lòng xáo bài và rút bài trước khi thỉnh lời tiên tri.');
      return;
    }

    setIsLoadingAI(true);
    setAiReading(''); // Immediately activate the response card to receive streamed text
    setError(null);

    try {
      await interpretTarotReading(question, drawnCards, (_chunk, accumulated) => {
        setAiReading(accumulated);
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến Gemini AI. Vui lòng thử lại.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleReset = () => {
    setAiReading(null);
    setDrawnCards([]);
    setPickedCardIds([]);
    setQuestion('');
    shuffleDeckPool();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex1}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Screen Header */}
        <Header
          title={activeSection === 'reading' ? 'Bói Bài Tarot Huyền Bí' : 'Thư Viện 78 Lá Bài Tarot'}
          subtitle={
            activeSection === 'reading'
              ? 'Trực giác thức tỉnh & Lời chỉ dẫn từ Gemini AI'
              : 'Khám phá ý nghĩa, biểu tượng & hỏi Gemini AI về từng lá bài'
          }
          iconName={activeSection === 'reading' ? 'sparkles' : 'book-outline'}
        />

        {/* Section Tabs: Reading vs Library */}
        <View style={styles.topModeTabsRow}>
          <TouchableOpacity
            style={[styles.topModeTab, activeSection === 'reading' && styles.topModeTabActive]}
            onPress={() => setActiveSection('reading')}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={activeSection === 'reading' ? theme.colors.accent : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.topModeTabText,
                activeSection === 'reading' && styles.topModeTabTextActive,
              ]}
            >
              Trải Bài & Giải Quẻ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topModeTab, activeSection === 'library' && styles.topModeTabActive]}
            onPress={() => setActiveSection('library')}
          >
            <Ionicons
              name="library-outline"
              size={15}
              color={activeSection === 'library' ? theme.colors.accent : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.topModeTabText,
                activeSection === 'library' && styles.topModeTabTextActive,
              ]}
            >
              Thư Viện 78 Lá Bài
            </Text>
          </TouchableOpacity>
        </View>

        {activeSection === 'library' ? (
          <TarotLibraryView />
        ) : (
          <>
            {/* Spread & Deck Mode Selector */}
            <TarotSpreadSelector
              deckMode={deckMode}
              onChangeDeckMode={setDeckMode}
              spread={spread}
              onChangeSpread={setSpread}
            />

            {/* Question Input & Chips */}
            <TarotQuestionInput question={question} onChangeQuestion={setQuestion} />

            {/* Action Area: Interactive Deck Picker vs Draw Button */}
            {spread === 'three_choose' && drawnCards.length === 0 ? (
              <TarotDeckPicker
                deckPool={deckPool}
                pickedCardIds={pickedCardIds}
                onPickCard={handlePickCard}
                onReshuffle={shuffleDeckPool}
              />
            ) : (
              <TouchableOpacity
                style={[styles.drawBtn, isShuffling && styles.drawBtnDisabled]}
                onPress={() => {
                  if (spread === 'three_choose') {
                    setDrawnCards([]);
                    shuffleDeckPool();
                  } else {
                    handleDrawCards();
                  }
                }}
                disabled={isShuffling}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={18} color={theme.colors.background} />
                <Text style={styles.drawBtnText}>
                  {isShuffling
                    ? 'Đang Xáo Bài Vũ Trụ...'
                    : drawnCards.length > 0
                    ? 'Xáo & Rút Lại Bài'
                    : 'Xáo Bài & Rút Bài'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Drawn Cards Display */}
            <TarotDrawnDisplay
              drawnCards={drawnCards}
              spread={spread}
              isLoadingAI={isLoadingAI}
              onConsultAI={handleConsultAI}
            />

            {/* AI Reading Response Card */}
            <AIResponseCard
              isLoading={isLoadingAI}
              content={aiReading}
              error={error}
              title="Thông Điệp Vũ Trụ & Lời Khuyên Tarot"
              onReset={handleReset}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  topModeTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
  },
  topModeTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  topModeTabActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.22),
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  topModeTabText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginLeft: 6,
  },
  topModeTabTextActive: {
    color: theme.colors.accentText,
    fontWeight: '700',
  },
  drawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  drawBtnDisabled: {
    opacity: 0.6,
  },
  drawBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
