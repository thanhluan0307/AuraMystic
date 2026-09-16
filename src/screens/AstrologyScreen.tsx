import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';
import { ZODIAC_SIGNS, ZodiacSign } from '../data/zodiacSigns';
import { getHoroscopeDaily, getSynastryReading } from '../services/geminiService';

export const AstrologyScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [activeTab, setActiveTab] = useState<'horoscope' | 'synastry'>('horoscope');
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [partnerSign, setPartnerSign] = useState<ZodiacSign>(ZODIAC_SIGNS[1]);
  const [period, setPeriod] = useState<'ngày' | 'tuần' | 'tháng'>('ngày');

  const [isLoading, setIsLoading] = useState(false);
  const [readingContent, setReadingContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Horoscope generation
  const handleGetHoroscope = async () => {
    setIsLoading(true);
    setError(null);
    setReadingContent(''); // Show response card immediately

    try {
      await getHoroscopeDaily(selectedSign, period, (_chunk, accumulated) => {
        setReadingContent(accumulated);
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến Gemini AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Synastry generation
  const handleGetSynastry = async () => {
    setIsLoading(true);
    setError(null);
    setReadingContent(''); // Show response card immediately

    try {
      await getSynastryReading(selectedSign, partnerSign, (_chunk, accumulated) => {
        setReadingContent(accumulated);
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến Gemini AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick compatibility score based on element harmony
  const getQuickMatchScore = (s1: ZodiacSign, s2: ZodiacSign) => {
    if (s1.id === s2.id) return 85;
    if (s1.bestMatches.includes(s2.id)) return 95;
    if (s1.element === s2.element) return 90;
    // Harmony between Fire and Air, Earth and Water
    if (
      (s1.element === 'Lửa' && s2.element === 'Khí') ||
      (s1.element === 'Khí' && s2.element === 'Lửa') ||
      (s1.element === 'Đất' && s2.element === 'Nước') ||
      (s1.element === 'Nước' && s2.element === 'Đất')
    ) {
      return 88;
    }
    return 72;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Header
        title="Chiêm Tinh & 12 Cung Hoàng Đạo"
        subtitle="Dự báo vận mệnh & Độ hòa hợp tình yêu cùng Gemini AI"
        iconName="moon"
      />

      {/* Mode Tabs */}
      <View style={styles.modeTabsRow}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'horoscope' && styles.modeTabActive]}
          onPress={() => {
            setActiveTab('horoscope');
            setReadingContent(null);
          }}
        >
          <Ionicons
            name="sunny-outline"
            size={16}
            color={activeTab === 'horoscope' ? theme.colors.accent : theme.colors.textMuted}
          />
          <Text
            style={[styles.modeTabText, activeTab === 'horoscope' && styles.modeTabTextActive]}
          >
            Dự Báo Tinh Tú
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'synastry' && styles.modeTabActive]}
          onPress={() => {
            setActiveTab('synastry');
            setReadingContent(null);
          }}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={activeTab === 'synastry' ? theme.colors.accent : theme.colors.textMuted}
          />
          <Text style={[styles.modeTabText, activeTab === 'synastry' && styles.modeTabTextActive]}>
            Bói Tương Hợp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zodiac Sign Carousel Selector */}
      <View style={styles.carouselSection}>
        <Text style={styles.sectionLabel}>
          {activeTab === 'horoscope' ? 'CHỌN CUNG HOÀNG ĐẠO CỦA BẠN' : 'CUNG CỦA BẠN'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.signsScroll}>
          {ZODIAC_SIGNS.map((sign) => {
            const isSelected = selectedSign.id === sign.id;
            return (
              <TouchableOpacity
                key={sign.id}
                style={[styles.signCard, isSelected && styles.signCardSelected]}
                onPress={() => {
                  setSelectedSign(sign);
                  setReadingContent(null);
                }}
              >
                <Text style={styles.signSymbol}>{sign.symbol}</Text>
                <Text style={[styles.signName, isSelected && styles.signNameSelected]}>
                  {sign.nameVi}
                </Text>
                <Text style={styles.signDates}>{sign.dateRange}</Text>
                <View
                  style={[
                    styles.elementTag,
                    {
                      backgroundColor:
                        sign.element === 'Lửa'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : sign.element === 'Nước'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : sign.element === 'Khí'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : 'rgba(34, 197, 94, 0.2)',
                    },
                  ]}
                >
                  <Text style={styles.elementTagText}>{sign.element}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Sign Info Card */}
      <View style={styles.signDetailCard}>
        <View style={styles.signDetailHeader}>
          <Text style={styles.signDetailEmoji}>{selectedSign.symbol}</Text>
          <View style={styles.signDetailTitleWrap}>
            <Text style={styles.signDetailTitle}>
              {selectedSign.nameVi} ({selectedSign.nameEn})
            </Text>
            <Text style={styles.signDetailSub}>
              {selectedSign.dateRange} • {selectedSign.element} • {selectedSign.modality}
            </Text>
          </View>
        </View>
        <Text style={styles.signDetailDesc}>{selectedSign.description}</Text>

        <View style={styles.infoRowGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>🪐 Hành Tinh Chủ Quản</Text>
            <Text style={styles.infoValue}>{selectedSign.rulingPlanet}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>🎨 Màu May Mắn</Text>
            <Text style={styles.infoValue}>{selectedSign.luckyColor}</Text>
          </View>
        </View>
      </View>

      {/* Content depending on Active Tab */}
      {activeTab === 'horoscope' ? (
        <View style={styles.horoscopeSection}>
          <Text style={styles.sectionLabel}>CHỌN KỲ DỰ BÁO</Text>
          <View style={styles.periodRow}>
            {(['ngày', 'tuần', 'tháng'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => {
                  setPeriod(p);
                  setReadingContent(null);
                }}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                  {p === 'ngày' ? 'Hôm Nay' : p === 'tuần' ? 'Tuần Này' : 'Tháng Này'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, isLoading && styles.btnDisabled]}
            onPress={handleGetHoroscope}
            disabled={isLoading}
          >
            <Ionicons name="telescope-outline" size={18} color={theme.colors.background} />
            <Text style={styles.actionBtnText}>
              {isLoading ? 'Gemini AI Đang Soi Chiếu...' : `Xem Tử Vi ${period.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Synastry Section */
        <View style={styles.synastrySection}>
          <Text style={styles.sectionLabel}>CHỌN CUNG CỦA ĐỐI PHƯƠNG</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.signsScroll}>
            {ZODIAC_SIGNS.map((sign) => {
              const isPartner = partnerSign.id === sign.id;
              return (
                <TouchableOpacity
                  key={sign.id}
                  style={[styles.signCard, isPartner && styles.signCardPartner]}
                  onPress={() => {
                    setPartnerSign(sign);
                    setReadingContent(null);
                  }}
                >
                  <Text style={styles.signSymbol}>{sign.symbol}</Text>
                  <Text style={[styles.signName, isPartner && styles.signNameSelected]}>
                    {sign.nameVi}
                  </Text>
                  <Text style={styles.signDates}>{sign.dateRange}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Match Score Meter */}
          <View style={styles.matchMeterBox}>
            <View style={styles.matchSignsRow}>
              <Text style={styles.matchSignTitle}>
                {selectedSign.symbol} {selectedSign.nameVi}
              </Text>
              <Text style={styles.matchHeart}>💞</Text>
              <Text style={styles.matchSignTitle}>
                {partnerSign.symbol} {partnerSign.nameVi}
              </Text>
            </View>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>
                {getQuickMatchScore(selectedSign, partnerSign)}%
              </Text>
              <Text style={styles.scoreLabel}>Độ Hòa Hợp</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, isLoading && styles.btnDisabled]}
            onPress={handleGetSynastry}
            disabled={isLoading}
          >
            <Ionicons name="heart" size={18} color={theme.colors.background} />
            <Text style={styles.actionBtnText}>
              {isLoading ? 'Gemini AI Đang Soi Xét...' : 'Luận Giải Tương Hợp Cùng Gemini AI'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gemini AI Result Card */}
      <AIResponseCard
        isLoading={isLoading}
        content={readingContent}
        error={error}
        title={
          activeTab === 'horoscope'
            ? `Dự Báo Tinh Tú: ${selectedSign.nameVi}`
            : `Luận Giải Tình Yêu: ${selectedSign.nameVi} & ${partnerSign.nameVi}`
        }
        onReset={() => setReadingContent(null)}
      />
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  modeTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderRadius: 12,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  modeTabActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.4),
  },
  modeTabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modeTabTextActive: {
    color: theme.colors.accentText,
  },
  carouselSection: {
    marginTop: 18,
    paddingLeft: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    letterSpacing: 1,
    marginBottom: 10,
  },
  signsScroll: {
    paddingRight: 20,
  },
  signCard: {
    width: 86,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  signCardSelected: {
    backgroundColor: withOpacity(theme.colors.accent, 0.2),
    borderColor: theme.colors.accent,
  },
  signCardPartner: {
    backgroundColor: 'rgba(237, 100, 166, 0.2)',
    borderColor: '#ED64A6',
  },
  signSymbol: {
    fontSize: 24,
    marginBottom: 4,
    color: theme.colors.accentVivid,
  },
  signName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textBody,
    textAlign: 'center',
  },
  signNameSelected: {
    color: theme.colors.text,
  },
  signDates: {
    fontSize: 9,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  elementTag: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  elementTagText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  signDetailCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.25),
    borderRadius: 14,
    padding: 14,
  },
  signDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signDetailEmoji: {
    fontSize: 32,
    marginRight: 12,
    color: theme.colors.accent,
  },
  signDetailTitleWrap: {
    flex: 1,
  },
  signDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  signDetailSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  signDetailDesc: {
    fontSize: 13,
    color: theme.colors.textBody,
    lineHeight: 19,
    marginTop: 4,
  },
  infoRowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.text, 0.08),
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentText,
    marginTop: 2,
  },
  horoscopeSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  periodBtnActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.2),
    borderColor: theme.colors.accent,
  },
  periodBtnText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: theme.colors.accentText,
  },
  synastrySection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  matchMeterBox: {
    backgroundColor: withOpacity(theme.colors.text, 0.03),
    borderWidth: 1,
    borderColor: 'rgba(237, 100, 166, 0.3)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginVertical: 14,
  },
  matchSignsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchSignTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  matchHeart: {
    fontSize: 20,
    marginHorizontal: 12,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(237, 100, 166, 0.15)',
    borderWidth: 2,
    borderColor: '#ED64A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F687B3',
  },
  scoreLabel: {
    fontSize: 10,
    color: theme.colors.textBody,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});

