import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { NatalChartWheel } from '../components/NatalChartWheel';
import { AIResponseCard } from '../components/AIResponseCard';
import { calculateAstrologyChart } from '../services/astrologyCalc';
import { getNatalChartReading } from '../services/geminiService';

export const NatalChartScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [name, setName] = useState('');
  const [day, setDay] = useState('15');
  const [month, setMonth] = useState('7');
  const [year, setYear] = useState('1999');
  const [hour, setHour] = useState('8');
  const [minute, setMinute] = useState('30');
  const [birthPlace, setBirthPlace] = useState('TP. Hồ Chí Minh, Việt Nam');
  const [showForm, setShowForm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [chartReading, setChartReading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute astronomical astrological placements
  const parsedDay = parseInt(day, 10) || 1;
  const parsedMonth = parseInt(month, 10) || 1;
  const parsedYear = parseInt(year, 10) || 2000;
  const parsedHour = parseInt(hour, 10) || 12;
  const parsedMinute = parseInt(minute, 10) || 0;

  const birthDate = React.useMemo(() => {
    return new Date(parsedYear, parsedMonth - 1, parsedDay, parsedHour, parsedMinute);
  }, [parsedYear, parsedMonth, parsedDay, parsedHour, parsedMinute]);

  const chartData = React.useMemo(() => {
    return calculateAstrologyChart(birthDate);
  }, [birthDate]);

  const handleDecodeNatalChart = async () => {
    setIsLoading(true);
    setError(null);
    setChartReading(''); // Show response card immediately

    try {
      await getNatalChartReading(
        {
          name: name.trim() || 'Lữ Khách Ngân Hà',
          sunSign: chartData.sun.sign,
          moonSign: chartData.moon.sign,
          ascendantSign: chartData.ascendant.sign,
          chartData,
          birthDate: `${parsedDay}/${parsedMonth}/${parsedYear}`,
          birthTime: `${parsedHour}:${parsedMinute < 10 ? '0' : ''}${parsedMinute}`,
          birthPlace,
        },
        (_chunk, accumulated) => {
          setChartReading(accumulated);
        }
      );
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến Gemini AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex1}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header
          title="Bản Đồ Sao Cá Nhân"
          subtitle="Khám phá bản thiết kế linh hồn & Sứ mệnh cùng Gemini AI"
          iconName="planet"
        />

        {/* Quick Birth Summary & Form Toggle */}
        <View style={styles.birthSummaryCard}>
          <View style={styles.birthSummaryLeft}>
            <View style={styles.nameRow}>
              <Ionicons name="sparkles" size={15} color={theme.colors.accent} style={{ marginRight: 6 }} />
              <Text style={styles.birthSummaryName}>{name.trim() || 'Lữ Khách Ngân Hà'}</Text>
            </View>
            <Text style={styles.birthSummaryMeta}>
              📅 {parsedDay < 10 ? '0' : ''}{parsedDay}/{parsedMonth < 10 ? '0' : ''}{parsedMonth}/{parsedYear} • ⏰ {parsedHour < 10 ? '0' : ''}{parsedHour}:{parsedMinute < 10 ? '0' : ''}{parsedMinute}
            </Text>
            <Text style={styles.birthSummaryPlace} numberOfLines={1}>
              📍 {birthPlace || 'Việt Nam'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleFormBtn, showForm && styles.toggleFormBtnActive]}
            onPress={() => setShowForm(!showForm)}
          >
            <Ionicons
              name={showForm ? 'chevron-up-circle' : 'create-outline'}
              size={16}
              color={showForm ? theme.colors.background : theme.colors.accent}
            />
            <Text style={[styles.toggleFormText, showForm && styles.toggleFormTextActive]}>
              {showForm ? 'Thu gọn' : 'Đổi dữ liệu'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Form Inputs */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>CHỈNH SỬA DỮ LIỆU SINH CHÍNH XÁC</Text>

            <Text style={styles.inputLabel}>Tên của bạn</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Họ và tên hoặc Biệt danh..."
              placeholderTextColor={theme.colors.textSubtle}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.rowGrid}>
              {/* Birth Date */}
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Ngày sinh</Text>
                <View style={styles.miniInputsRow}>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={day}
                    onChangeText={setDay}
                    placeholder="D"
                    placeholderTextColor={theme.colors.textSubtle}
                  />
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={month}
                    onChangeText={setMonth}
                    placeholder="M"
                    placeholderTextColor={theme.colors.textSubtle}
                  />
                  <TextInput
                    style={[styles.miniInput, { flex: 1.4 }]}
                    keyboardType="numeric"
                    maxLength={4}
                    value={year}
                    onChangeText={setYear}
                    placeholder="YYYY"
                    placeholderTextColor={theme.colors.textSubtle}
                  />
                </View>
              </View>

              {/* Birth Time */}
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Giờ sinh (24h)</Text>
                <View style={styles.miniInputsRow}>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={hour}
                    onChangeText={setHour}
                    placeholder="HH"
                    placeholderTextColor={theme.colors.textSubtle}
                  />
                  <Text style={styles.colonText}>:</Text>
                  <TextInput
                    style={styles.miniInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={minute}
                    onChangeText={setMinute}
                    placeholder="MM"
                    placeholderTextColor={theme.colors.textSubtle}
                  />
                </View>
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Nơi sinh (Thành phố, Tỉnh thành)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Ví dụ: Hà Nội, TP.HCM..."
              placeholderTextColor={theme.colors.textSubtle}
              value={birthPlace}
              onChangeText={setBirthPlace}
            />
          </View>
        )}

        {/* Hero Interactive Natal Chart Wheel SVG */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartTitleRow}>
            <Ionicons name="compass-outline" size={18} color={theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.sectionHeader}>VÒNG TRÒN HOÀNG ĐẠO & CÁC HÀNH TINH</Text>
          </View>
          <Text style={styles.chartSubHeader}>
            Chạm vào từng hành tinh bên dưới để xem góc hợp và ý nghĩa chiêm tinh
          </Text>
          <NatalChartWheel chartData={chartData} />
        </View>

        {/* The Big Three & Cardinal Points Overview */}
        <View style={styles.bigThreeCard}>
          <Text style={styles.bigThreeHeader}>BỐN TRỤ CỐT LÕI (THE BIG THREE & MIDHEAVEN)</Text>

          <View style={styles.bigThreeItem}>
            <Text style={styles.itemEmoji}>☀️</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>Mặt Trời (Sun) • {chartData.sun.sign.nameVi} ({chartData.sun.formattedDegree})</Text>
              <Text style={styles.itemDesc}>
                Tọa thủ Nhà {chartData.sun.houseNumber} ({chartData.sun.tuViPalaceEquivalent}). Bản ngã cốt lõi, nguồn sinh lực và ý chí hành động.
              </Text>
            </View>
          </View>

          <View style={styles.bigThreeItem}>
            <Text style={styles.itemEmoji}>🌙</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>Mặt Trăng (Moon) • {chartData.moon.sign.nameVi} ({chartData.moon.formattedDegree})</Text>
              <Text style={styles.itemDesc}>
                Tọa thủ Nhà {chartData.moon.houseNumber} ({chartData.moon.tuViPalaceEquivalent}). Cảm xúc thầm kín, trực giác và thế giới nội tâm an trú.
              </Text>
            </View>
          </View>

          <View style={styles.bigThreeItem}>
            <Text style={styles.itemEmoji}>🌅</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>Cung Mọc (Ascendant / AC) • {chartData.ascendant.sign.nameVi} ({chartData.ascendant.formattedDegree})</Text>
              <Text style={styles.itemDesc}>
                Đỉnh Nhà 1 (Tương ứng Cung MỆNH). Mặt nạ xã hội, phong thái ngoại hình và cách bạn tiếp cận thế giới.
              </Text>
            </View>
          </View>

          <View style={styles.bigThreeItem}>
            <Text style={styles.itemEmoji}>👑</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>Thiên Đỉnh (Midheaven / MC) • {chartData.midheaven.sign.nameVi} ({chartData.midheaven.formattedDegree})</Text>
              <Text style={styles.itemDesc}>
                Đỉnh Nhà 10 (Tương ứng Cung QUAN LỘC). Danh vọng, sự nghiệp đỉnh cao, uy tín và di sản muốn cống hiến.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.decodeBtn, isLoading && styles.btnDisabled]}
          onPress={handleDecodeNatalChart}
          disabled={isLoading}
        >
          <Ionicons name="sparkles" size={18} color={theme.colors.background} />
          <Text style={styles.decodeBtnText}>
            {isLoading ? 'Gemini AI Đang Soi Rọi Bản Đồ Sao...' : 'Giải Mã Bản Đồ Sao Với Gemini AI'}
          </Text>
        </TouchableOpacity>

        {/* AI Result Card */}
        <AIResponseCard
          isLoading={isLoading}
          content={chartReading}
          error={error}
          title={`Bản Thiết Kế Linh Hồn: ${name || 'Lữ Khách'} (${chartData.sun.sign.nameVi} Sun - ${chartData.moon.sign.nameVi} Moon - ${chartData.ascendant.sign.nameVi} Rising)`}
          onReset={() => setChartReading(null)}
        />
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
  birthSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  birthSummaryLeft: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  birthSummaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  birthSummaryMeta: {
    fontSize: 11,
    color: theme.colors.accentText,
    marginTop: 3,
  },
  birthSummaryPlace: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  toggleFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.accent, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.4),
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  toggleFormBtnActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  toggleFormText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  toggleFormTextActive: {
    color: theme.colors.background,
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: withOpacity(theme.colors.inputSurface, 0.85),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 14,
    padding: 16,
  },
  formTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: theme.colors.text,
    fontSize: 14,
  },
  rowGrid: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    marginRight: 8,
  },
  miniInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniInput: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 8,
    paddingVertical: 7,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 13,
    marginRight: 4,
  },
  colonText: {
    color: theme.colors.accentBorder,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  chartWrapper: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: withOpacity(theme.colors.text, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.25),
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  chartSubHeader: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 10,
    textAlign: 'center',
  },
  bigThreeCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    borderRadius: 14,
    padding: 16,
  },
  bigThreeHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1,
    marginBottom: 12,
  },
  bigThreeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 2,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentText,
  },
  itemDesc: {
    fontSize: 12,
    color: theme.colors.textBody,
    marginTop: 2,
    lineHeight: 17,
  },
  decodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  decodeBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});
