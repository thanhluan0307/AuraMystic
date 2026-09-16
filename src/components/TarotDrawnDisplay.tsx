import { useTheme, useThemeStyles, type AppTheme } from '../theme/ThemeProvider';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TarotCardView } from './TarotCardView';
import { DrawnCardItem, SpreadType } from '../types/tarotTypes';

interface TarotDrawnDisplayProps {
  drawnCards: DrawnCardItem[];
  spread: SpreadType;
  isLoadingAI: boolean;
  onConsultAI: () => void;
}

export const TarotDrawnDisplay: React.FC<TarotDrawnDisplayProps> = React.memo(({
  drawnCards,
  spread,
  isLoadingAI,
  onConsultAI,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  if (drawnCards.length === 0) return null;

  return (
    <View style={styles.cardsDisplayArea}>
      <Text style={styles.cardHintText}>
        ✨ Chạm vào lá bài để xem tranh Tarot nghệ thuật & ý nghĩa chi tiết
      </Text>

      {/* Drawn Cards Row */}
      <View style={styles.cardsRow}>
        {drawnCards.map((item, idx) => (
          <TarotCardView
            key={idx}
            card={item.card}
            isReversed={item.isReversed}
            isFaceUp={item.isFaceUp}
            positionName={item.positionName}
            size={spread === 'single' ? 'large' : 'medium'}
          />
        ))}
      </View>

      {/* Consult Gemini Button */}
      <TouchableOpacity
        style={[styles.consultBtn, isLoadingAI && styles.consultBtnDisabled]}
        onPress={onConsultAI}
        disabled={isLoadingAI}
        activeOpacity={0.8}
      >
        <Ionicons name="planet-outline" size={20} color={theme.colors.text} />
        <Text style={styles.consultBtnText}>
          {isLoadingAI ? 'Gemini AI Đang Luận Giải...' : 'Thỉnh Lời Tiên Tri Từ Gemini AI'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  cardsDisplayArea: {
    marginTop: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardHintText: {
    fontSize: 11,
    color: theme.colors.accent,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondaryAccent,
    width: '95%',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.secondaryBorder,
  },
  consultBtnDisabled: {
    opacity: 0.6,
  },
  consultBtnText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});

