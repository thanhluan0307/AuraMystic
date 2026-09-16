import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TarotCard } from '../data/tarotCards';
import { getTarotImage } from '../data/tarotImages';

interface TarotCardViewProps {
  card?: TarotCard | null;
  isReversed?: boolean;
  isFaceUp?: boolean;
  positionName?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  allowInspection?: boolean;
}

export const TarotCardView: React.FC<TarotCardViewProps> = ({
  card,
  isReversed = false,
  isFaceUp = true,
  positionName,
  onPress,
  size = 'medium',
  allowInspection = true,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [modalVisible, setModalVisible] = useState(false);

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const cardWidth = isSmall ? 84 : isLarge ? 170 : 112;
  const cardHeight = isSmall ? 134 : isLarge ? 260 : 176;

  const cardImage = card ? getTarotImage(card.imageKey) : undefined;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (allowInspection && card && isFaceUp) {
      setModalVisible(true);
    }
  };

  return (
    <>
      <View style={styles.outerWrapper}>
        {positionName && <Text style={styles.positionLabel}>{positionName}</Text>}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[
            styles.cardContainer,
            { width: cardWidth, height: cardHeight },
            isReversed && isFaceUp && styles.reversedTransform,
          ]}
        >
          {isFaceUp && card ? (
            // Card Front
            <View style={styles.cardSurface}>
              {cardImage ? (
                // Authentic Tarot Image from user's assets
                <View style={styles.imageContainer}>
                  <Image source={cardImage} style={styles.cardImage} resizeMode="cover" />
                  {/* Subtle dark gradient overlay at bottom for text readability */}
                  <LinearGradient
                    colors={['transparent', withOpacity(theme.colors.navigation, 0.85), theme.colors.background]}
                    locations={[0.5, 0.8, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Card Title Bar */}
                  <View style={styles.imageOverlayFooter}>
                    <Text
                      numberOfLines={1}
                      style={[styles.imageCardTitle, { fontSize: isSmall ? 9 : isLarge ? 14 : 11 }]}
                    >
                      {card.nameVi.split('(')[0].trim()}
                    </Text>
                  </View>
                </View>
              ) : (
                // Fallback Sacred Symbol Art
                <LinearGradient
                  colors={[theme.colors.cardGradientStart, theme.colors.cardGradientMiddle, theme.colors.cardGradientEnd]}
                  style={[StyleSheet.absoluteFill, styles.fallbackSurface]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardNumText}>{card.number}</Text>
                    <Text style={styles.cardElementTag}>{card.element}</Text>
                  </View>
                  <Text style={{ fontSize: isSmall ? 28 : isLarge ? 64 : 40 }}>{card.symbol}</Text>
                  <View style={styles.cardFooter}>
                    <Text numberOfLines={1} style={styles.cardTitleText}>
                      {card.nameVi.split('(')[0].trim()}
                    </Text>
                  </View>
                </LinearGradient>
              )}

              {/* Upright / Reversed Badge */}
              <View
                style={[
                  styles.stateBadge,
                  isReversed ? styles.stateBadgeReversed : styles.stateBadgeUpright,
                ]}
              >
                <Text style={styles.stateBadgeText}>{isReversed ? 'Ngược' : 'Xuôi'}</Text>
              </View>
            </View>
          ) : (
            // Card Back (Sacred Geometric Backing)
            <LinearGradient
              colors={[theme.colors.cardBackStart, theme.colors.cardBackMiddle, theme.colors.cardBackEnd]}
              style={[styles.cardSurface, styles.cardBackBorder]}
            >
              <View style={styles.cardBackInnerPattern}>
                <Text style={{ fontSize: isSmall ? 20 : isLarge ? 48 : 30 }}>🔮</Text>
                <View style={styles.sacredRings}>
                  <View style={styles.ring1} />
                  <View style={styles.ring2} />
                </View>
                <Text style={styles.cardBackHint}>Aura</Text>
              </View>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* Full Resolution Card Inspection Modal */}
      {card && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textBody} />
              </TouchableOpacity>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {cardImage && (
                  <View
                    style={[
                      styles.modalImageWrapper,
                      isReversed && styles.reversedTransform,
                    ]}
                  >
                    <Image source={cardImage} style={styles.modalCardImage} resizeMode="contain" />
                  </View>
                )}

                <View style={styles.modalMetaBox}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalCardTitle}>{card.nameVi}</Text>
                    <View
                      style={[
                        styles.modalBadge,
                        isReversed ? styles.stateBadgeReversed : styles.stateBadgeUpright,
                      ]}
                    >
                      <Text style={styles.stateBadgeText}>
                        {isReversed ? 'Lá Ngược (Reversed)' : 'Lá Xuôi (Upright)'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalCardEn}>
                    {card.nameEn} • Số {card.number} • {card.element} ({card.astrology})
                  </Text>

                  {/* Keywords */}
                  <View style={styles.keywordRow}>
                    {(isReversed ? card.reversedKeywords : card.uprightKeywords).map((kw, i) => (
                      <View key={i} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{kw}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Meaning */}
                  <Text style={styles.sectionTitle}>🔮 Ý Nghĩa Lá Bài:</Text>
                  <Text style={styles.meaningText}>
                    {isReversed ? card.reversedMeaning : card.uprightMeaning}
                  </Text>

                  {/* Advice */}
                  <Text style={styles.sectionTitle}>🕊️ Lời Khuyên Vũ Trụ:</Text>
                  <Text style={styles.adviceText}>{card.advice}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    margin: 6,
  },
  positionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContainer: {
    borderRadius: 14,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
    overflow: 'hidden',
  },
  reversedTransform: {
    transform: [{ rotate: '180deg' }],
  },
  cardSurface: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayFooter: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    alignItems: 'center',
  },
  imageCardTitle: {
    color: theme.colors.accentVivid,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fallbackSurface: {
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  cardElementTag: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  cardFooter: {
    width: '100%',
    alignItems: 'center',
  },
  cardTitleText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  cardBackBorder: {
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.4),
    padding: 8,
  },
  cardBackInnerPattern: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.25),
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  sacredRings: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring1: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.3),
  },
  ring2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 0.5,
    borderColor: withOpacity(theme.colors.accent, 0.15),
  },
  cardBackHint: {
    color: theme.colors.accentBorder,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.7,
  },
  stateBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  stateBadgeUpright: {
    backgroundColor: 'rgba(49, 151, 149, 0.9)',
    borderColor: '#4FD1C5',
  },
  stateBadgeReversed: {
    backgroundColor: 'rgba(229, 62, 62, 0.9)',
    borderColor: '#FEB2B2',
  },
  stateBadgeText: {
    color: theme.colors.text,
    fontSize: 8,
    fontWeight: '700',
  },
  // Inspection Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.modalBackdrop, 0.88),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: theme.colors.modalSurface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: withOpacity(theme.colors.text, 0.1),
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 20,
    alignItems: 'center',
  },
  modalImageWrapper: {
    width: 200,
    height: 330,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.accentBorder,
    marginBottom: 16,
    shadowColor: theme.colors.accentBorder,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCardImage: {
    width: '100%',
    height: '100%',
  },
  modalMetaBox: {
    width: '100%',
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  modalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalCardEn: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 12,
  },
  keywordChip: {
    backgroundColor: withOpacity(theme.colors.accent, 0.15),
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.4),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  keywordText: {
    color: theme.colors.accentText,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    marginTop: 8,
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  adviceText: {
    fontSize: 13,
    color: theme.colors.textBody,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
