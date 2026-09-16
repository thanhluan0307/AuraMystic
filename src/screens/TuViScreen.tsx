import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useMemo, useEffect } from 'react';
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
import { TuViChartGrid } from '../components/TuViChartGrid';
import { AIResponseCard } from '../components/AIResponseCard';
import { EARTHLY_BRANCHES } from '../data/easternZodiac';
import { calculateEasternHoroscope } from '../services/astrologyCalc';
import { calculateTuViChart, TuViPalace } from '../services/tuViCalc';
import { getTuViReading, getTuViPalaceReading } from '../services/geminiService';

export const TuViScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('1998');
  const [birthMonth, setBirthMonth] = useState('8');
  const [birthDay, setBirthDay] = useState('18');
  const [selectedBranchId, setSelectedBranchId] = useState(6); // Ngọ (11h - 13h)
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [showForm, setShowForm] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [tuViReading, setTuViReading] = useState<string | null>(null);
  const [readingTitle, setReadingTitle] = useState<string>('Bình Giải Tử Vi Mệnh Số');
  const [error, setError] = useState<string | null>(null);

  const parsedYear = /^\d+$/.test(birthYear) ? Number(birthYear) : NaN;
  const parsedMonth = /^\d+$/.test(birthMonth) ? Number(birthMonth) : NaN;
  const parsedDay = /^\d+$/.test(birthDay) ? Number(birthDay) : NaN;
  const selectedBranch = EARTHLY_BRANCHES[selectedBranchId];
  const { chart: tuViChart, inputError } = useMemo(() => {
    try {
      return { chart: calculateTuViChart(name, parsedDay, parsedMonth, parsedYear, selectedBranchId, gender), inputError: null };
    } catch (err) {
      return { chart: null, inputError: err instanceof Error ? err.message : 'Dữ liệu sinh không hợp lệ.' };
    }
  }, [name, parsedDay, parsedMonth, parsedYear, selectedBranchId, gender]);
  const horoscope = tuViChart ? calculateEasternHoroscope(tuViChart.lunarDate.year, selectedBranchId * 2) : null;
  useEffect(() => {
    setTuViReading(null);
    setError(null);
  }, [name, birthDay, birthMonth, birthYear, selectedBranchId, gender]);

  // Consult full Tử Vi horoscope reading with Gemini
  const handleConsultTuVi = async () => {
    if (!tuViChart || !horoscope || isLoading) return;
    setIsLoading(true);
    setError(null);
    setReadingTitle(`Bình Giải Tử Vi Toàn Mệnh: ${name.trim() || 'Đương Số'} (${tuViChart.canChiYear} - ${tuViChart.napAm})`);
    setTuViReading(''); // Trigger immediate streaming response

    try {
      await getTuViReading(
        {
          chart: tuViChart,
          name: name.trim() || 'Đương Số',
          birthDate: `${parsedDay < 10 ? '0' : ''}${parsedDay}/${parsedMonth < 10 ? '0' : ''}${parsedMonth}/${parsedYear}`,
          birthHour: `${selectedBranch.name} (${selectedBranch.hours})`,
          gender: tuViChart.yinYangGender,
          canChiYear: tuViChart.canChiYear,
          napAm: tuViChart.napAm,
          animalName: horoscope.animal.nameVi,
          cucName: tuViChart.cucName,
          menhLocation: tuViChart.menhLocation,
          thanLocation: tuViChart.thanLocation,
        },
        (_chunk, accumulated) => {
          setTuViReading(accumulated);
        }
      );
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến Gemini AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Consult AI regarding a specific palace
  const handleAskAboutPalace = async (palace: TuViPalace) => {
    if (!tuViChart || isLoading) return;
    setIsLoading(true);
    setError(null);
    setReadingTitle(`Luận Giải Cung ${palace.name} (${palace.branchName}): ${name.trim() || 'Đương Số'}`);
    setTuViReading(''); // Trigger immediate streaming response

    try {
      await getTuViPalaceReading(tuViChart, palace, (_chunk, accumulated) => {
        setTuViReading(accumulated);
      });
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
          title="Tử Vi Phương Đông & Bát Tự"
          subtitle="Lập Bản Đồ Lá Số 12 Cung & Luận Giải Mệnh Thân Cùng Gemini AI"
          iconName="compass-outline"
        />

        {/* Quick Summary Card & Form Toggle */}
        {tuViChart && horoscope && <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.nameRow}>
              <Text style={styles.animalSymbol}>{horoscope.animal.symbol}</Text>
              <View>
                <Text style={styles.summaryName}>
                  {name.trim() || 'Đương Số'} • {tuViChart.yinYangGender}
                </Text>
                <Text style={styles.summaryYear}>
                  Năm {tuViChart.canChiYear} ({horoscope.animal.nameVi})
                </Text>
              </View>
            </View>
            <Text style={styles.summaryMeta}>
              📅 {tuViChart.solarDate} • ⏰ Giờ {selectedBranch.name} ({selectedBranch.hours})
            </Text>
            <Text style={styles.summaryCuc}>
              Mệnh: <Text style={styles.goldText}>{tuViChart.napAm}</Text> • Cục:{' '}
              <Text style={styles.goldText}>{tuViChart.cucName}</Text>
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
        </View>}

        {inputError && <Text accessibilityRole="alert" style={{ color: '#FC8181', margin: 16 }}>{inputError}</Text>}
        {/* Collapsible Input Form */}
        {(showForm || !!inputError) && (
          <View style={styles.formCard} pointerEvents={isLoading ? 'none' : 'auto'}>
            <Text style={styles.formTitle}>CHỈNH SỬA DỮ LIỆU LẬP LÁ SỐ TỬ VI</Text>

            {/* Name & Gender */}
            <View style={styles.rowInputs}>
              <View style={styles.flex2}>
                <Text style={styles.inputLabel}>Họ và Tên</Text>
                <TextInput
                  editable={!isLoading}
                  style={styles.inputField}
                  placeholder="Nhập họ tên của bạn..."
                  placeholderTextColor={theme.colors.textSubtle}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.genderBox}>
                <Text style={styles.inputLabel}>Giới Tính</Text>
                <View style={styles.genderBtnRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'Nam' && styles.genderBtnActive]}
                    onPress={() => setGender('Nam')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'Nam' && styles.genderTextActive,
                      ]}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'Nữ' && styles.genderBtnActive]}
                    onPress={() => setGender('Nữ')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === 'Nữ' && styles.genderTextActive,
                      ]}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Date of Birth */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Ngày / Tháng / Năm Sinh (Dương Lịch)
            </Text>
            <View style={styles.dateInputsRow}>
              <View style={styles.dateCol}>
                <TextInput
                  editable={!isLoading}
                  style={styles.dateInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  placeholder="Ngày"
                  placeholderTextColor={theme.colors.textSubtle}
                />
                <Text style={styles.dateSub}>Ngày</Text>
              </View>
              <View style={styles.dateCol}>
                <TextInput
                  editable={!isLoading}
                  style={styles.dateInput}
                  keyboardType="numeric"
                  maxLength={2}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  placeholder="Tháng"
                  placeholderTextColor={theme.colors.textSubtle}
                />
                <Text style={styles.dateSub}>Tháng</Text>
              </View>
              <View style={[styles.dateCol, { flex: 1.5 }]}>
                <TextInput
                  editable={!isLoading}
                  style={styles.dateInput}
                  keyboardType="numeric"
                  maxLength={4}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  placeholder="Năm"
                  placeholderTextColor={theme.colors.textSubtle}
                />
                <Text style={styles.dateSub}>Năm</Text>
              </View>
            </View>

            {/* Hour of Birth (12 Canh Giờ) */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              Giờ Sinh (12 Canh Giờ Địa Chi)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hourScroll}
            >
              {EARTHLY_BRANCHES.map((b) => {
                const isSelected = selectedBranchId === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.hourChip, isSelected && styles.hourChipActive]}
                    onPress={() => setSelectedBranchId(b.id)}
                  >
                    <Text
                      style={[
                        styles.hourTitle,
                        isSelected && styles.hourTitleActive,
                      ]}
                    >
                      Giờ {b.name}
                    </Text>
                    <Text style={styles.hourSub}>{b.hours}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {tuViChart && horoscope && <>
        {/* HERO: Interactive 12-Palace Tử Vi Horoscope Chart */}
        <View style={styles.chartSectionCard}>
          <View style={styles.chartTitleRow}>
            <Ionicons name="map-outline" size={18} color={theme.colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.chartSectionHeader}>BẢN ĐỒ LÁ SỐ TỬ VI ĐẨU SỐ</Text>
          </View>
          <Text style={styles.chartSectionSub}>
            12 Cung chức • 14 Chính tinh • Tuần Triệt • Vòng Thái Tuế, Tràng Sinh & Bác Sĩ
          </Text>
          <Text style={styles.chartSectionSub}>
            Âm lịch: {tuViChart.lunarDateText} • Triệt: {tuViChart.trietLocation} • Tuần: {tuViChart.tuanLocation}
          </Text>
          <TuViChartGrid
            key={`${tuViChart.solarDate}-${selectedBranchId}-${gender}`}
            chartData={tuViChart}
            onAskAIAboutPalace={isLoading ? undefined : handleAskAboutPalace}
          />
        </View>

        {/* Eastern Astrological Compatibility Overview Card */}
        <View style={styles.calcPreviewCard}>
          <View style={styles.calcHeader}>
            <Text style={styles.calcAnimalEmoji}>{horoscope.animal.symbol}</Text>
            <View style={styles.calcTitleWrap}>
              <Text style={styles.calcYearCanChi}>
                Tuổi {horoscope.animal.nameVi} ({horoscope.animal.animal})
              </Text>
              <Text style={styles.calcAnimalName}>
                Mệnh: {tuViChart.napAm} • {tuViChart.cucName}
              </Text>
            </View>
          </View>

          <View style={styles.gridInfoBox}>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>🏛️ Cung Mệnh:</Text>
              <Text style={styles.gridValHighlight}>{tuViChart.menhLocation}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>🌟 Cung Thân:</Text>
              <Text style={styles.gridValHighlight}>{tuViChart.thanLocation}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>👑 Mệnh Chủ / Thân Chủ:</Text>
              <Text style={styles.gridValHighlight}>{tuViChart.menhChu} / {tuViChart.thanChu}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>🛡️ Tuần / Triệt:</Text>
              <Text style={styles.gridValHighlight}>Tuần: {tuViChart.tuanLocation} | Triệt: {tuViChart.trietLocation}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>✨ Tam Hợp Chi:</Text>
              <Text style={styles.gridValSuccess}>{horoscope.animal.triad.join(' - ')}</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridKey}>⚡ Tứ Hành Xung:</Text>
              <Text style={styles.gridValWarning}>{horoscope.animal.conflict.join(' - ')}</Text>
            </View>
          </View>
        </View>

        {/* Action Button: Consult Full Chart */}
        <TouchableOpacity
          style={[styles.consultBtn, isLoading && styles.btnDisabled]}
          onPress={handleConsultTuVi}
          disabled={isLoading}
        >
          <Ionicons name="sparkles" size={18} color={theme.colors.background} />
          <Text style={styles.consultBtnText}>
            {isLoading
              ? 'Gemini AI Đang Soi Rọi Lá Số...'
              : 'Luận Giải Toàn Bộ Lá Số Với Gemini AI'}
          </Text>
        </TouchableOpacity>

        {/* AI Result Card */}
        <AIResponseCard
          isLoading={isLoading}
          content={tuViReading}
          error={error}
          title={readingTitle}
          onReset={() => setTuViReading(null)}
        />
        </>}
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
  summaryCard: {
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
  summaryLeft: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalSymbol: {
    fontSize: 24,
    marginRight: 8,
  },
  summaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryYear: {
    fontSize: 11,
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  summaryMeta: {
    fontSize: 11,
    color: theme.colors.textBody,
    marginTop: 4,
  },
  summaryCuc: {
    fontSize: 10.5,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  goldText: {
    color: theme.colors.accentText,
    fontWeight: '600',
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
    backgroundColor: withOpacity(theme.colors.inputSurface, 0.9),
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
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex2: {
    flex: 2,
    marginRight: 10,
  },
  genderBox: {
    flex: 1.2,
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
  genderBtnRow: {
    flexDirection: 'row',
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    overflow: 'hidden',
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.3),
  },
  genderText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  genderTextActive: {
    color: theme.colors.accentText,
  },
  dateInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
    marginRight: 8,
  },
  dateInput: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 10,
    paddingVertical: 8,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  dateSub: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.colors.textSubtle,
    marginTop: 3,
  },
  hourScroll: {
    marginTop: 6,
  },
  hourChip: {
    backgroundColor: withOpacity(theme.colors.text, 0.05),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  hourChipActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.22),
    borderColor: theme.colors.accent,
  },
  hourTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textBody,
  },
  hourTitleActive: {
    color: theme.colors.accentText,
  },
  hourSub: {
    fontSize: 9,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  chartSectionCard: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: withOpacity(theme.colors.text, 0.03),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.25),
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  chartSectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1,
  },
  chartSectionSub: {
    fontSize: 10.5,
    color: theme.colors.textMuted,
    marginBottom: 10,
    textAlign: 'center',
  },
  calcPreviewCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: withOpacity(theme.colors.surfaceHighlight, 0.5),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.35),
    borderRadius: 14,
    padding: 14,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(theme.colors.text, 0.08),
    paddingBottom: 10,
    marginBottom: 10,
  },
  calcAnimalEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  calcTitleWrap: {
    flex: 1,
  },
  calcYearCanChi: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentText,
  },
  calcAnimalName: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  gridInfoBox: {
    gap: 7,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridKey: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  gridValHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentText,
  },
  gridValSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68D391',
  },
  gridValWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FC8181',
  },
  consultBtn: {
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
  consultBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});
