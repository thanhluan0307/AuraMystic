import { useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DeckMode, SpreadType } from '../types/tarotTypes';

interface TarotSpreadSelectorProps {
  deckMode: DeckMode;
  onChangeDeckMode: (mode: DeckMode) => void;
  spread: SpreadType;
  onChangeSpread: (spread: SpreadType) => void;
}

interface SpreadOption {
  id: SpreadType;
  title: string;
  icon: string;
}

const SPREAD_OPTIONS: SpreadOption[] = [
  { id: 'single', title: '1 Lá', icon: '🃏' },
  { id: 'three_choose', title: '3 Lá (Tự Bốc)', icon: '✨' },
  { id: 'three_timeline', title: 'Thời Gian', icon: '⏳' },
  { id: 'three_love', title: 'Tình Duyên', icon: '❤️' },
  { id: 'three_career', title: 'Sự Nghiệp', icon: '💼' },
];

export const TarotSpreadSelector: React.FC<TarotSpreadSelectorProps> = React.memo(({
  deckMode,
  onChangeDeckMode,
  spread,
  onChangeSpread,
}) => {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      {/* Deck Mode: 22 Major Arcana vs 78 Full Deck */}
      <View style={styles.deckModeRow}>
        <TouchableOpacity
          style={[styles.deckModeBtn, deckMode === 'major' && styles.deckModeBtnActive]}
          onPress={() => onChangeDeckMode('major')}
        >
          <Text style={[styles.deckModeText, deckMode === 'major' && styles.deckModeTextActive]}>
            ✨ 22 Lá Ẩn Chính
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deckModeBtn, deckMode === 'full' && styles.deckModeBtnActive]}
          onPress={() => onChangeDeckMode('full')}
        >
          <Text style={[styles.deckModeText, deckMode === 'full' && styles.deckModeTextActive]}>
            🌌 78 Lá Đầy Đủ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spread Type Title */}
      <Text style={styles.sectionLabel}>CHỌN KIỂU TRẢI BÀI</Text>

      {/* Horizontal Scroll of Spread Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.spreadButtonsScroll}
        contentContainerStyle={styles.spreadButtonsRow}
      >
        {SPREAD_OPTIONS.map((item) => {
          const isActive = spread === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.spreadBtn, isActive && styles.spreadBtnActive]}
              onPress={() => onChangeSpread(item.id)}
            >
              <Text style={styles.spreadBtnIcon}>{item.icon}</Text>
              <Text style={[styles.spreadBtnText, isActive && styles.spreadBtnTextActive]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  deckModeRow: {
    flexDirection: 'row',
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  deckModeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  deckModeBtnActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.22),
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  deckModeText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  deckModeTextActive: {
    color: theme.colors.accentText,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    letterSpacing: 1,
    marginBottom: 8,
  },
  spreadButtonsScroll: {
    flexGrow: 0,
  },
  spreadButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  spreadBtn: {
    width: 95,
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  spreadBtnActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.18),
    borderColor: theme.colors.accent,
  },
  spreadBtnIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  spreadBtnText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  spreadBtnTextActive: {
    color: theme.colors.accentText,
  },
});

