import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TarotCard } from '../data/tarotCards';

interface TarotDeckPickerProps {
  deckPool: TarotCard[];
  pickedCardIds: number[];
  onPickCard: (cardId: number) => void;
  onReshuffle: () => void;
}

export const TarotDeckPicker: React.FC<TarotDeckPickerProps> = React.memo(({
  deckPool,
  pickedCardIds,
  onPickCard,
  onReshuffle,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.deckPoolContainer}>
      <Text style={styles.deckPoolTitle}>
        Lắng đọng tâm trí và chọn 3 lá bài ({pickedCardIds.length}/3)
      </Text>

      {/* Fan Cards Scroll Area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.deckPoolScroll}
        contentContainerStyle={styles.deckPoolContent}
      >
        {deckPool.map((card) => {
          const isPicked = pickedCardIds.includes(card.id);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.deckPoolCard, isPicked && styles.deckPoolCardPicked]}
              onPress={() => onPickCard(card.id)}
              disabled={isPicked}
              activeOpacity={0.7}
            >
              <View style={styles.deckPoolCardBackPattern} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reshuffle Fan Button */}
      <TouchableOpacity style={styles.reshuffleBtn} onPress={onReshuffle}>
        <Ionicons name="refresh-outline" size={16} color={theme.colors.textMuted} />
        <Text style={styles.reshuffleBtnText}>Đảo bài lại</Text>
      </TouchableOpacity>
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  deckPoolContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  deckPoolTitle: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: 12,
  },
  deckPoolScroll: {
    flexGrow: 0,
    height: 120,
  },
  deckPoolContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deckPoolCard: {
    width: 60,
    height: 100,
    backgroundColor: theme.colors.deckSurface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginRight: -30, // Fan effect
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  deckPoolCardPicked: {
    transform: [{ translateY: -15 }],
    borderColor: theme.colors.secondaryBorder,
    backgroundColor: theme.colors.secondarySurface,
  },
  deckPoolCardBackPattern: {
    flex: 1,
    backgroundColor: theme.colors.deckBadge,
    margin: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.3),
  },
  reshuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: withOpacity(theme.colors.text, 0.05),
  },
  reshuffleBtnText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 6,
  },
});

