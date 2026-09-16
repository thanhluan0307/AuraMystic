import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TuViChartData, TuViPalace } from '../services/tuViCalc';

interface TuViChartGridProps {
  chartData: TuViChartData;
  onAskAIAboutPalace?: (palace: TuViPalace) => void;
}

export const TuViChartGrid: React.FC<TuViChartGridProps> = ({
  chartData,
  onAskAIAboutPalace,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [selectedBranchId, setSelectedBranchId] = useState<number>(
    chartData.palaces[0]?.branchId ?? 2
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const safeWidth = windowWidth > 0 ? windowWidth : 360;
  const gridWidth = Math.min(safeWidth - 32, 450);
  const colWidth = (gridWidth - 6) / 4;
  const cellHeight = Math.max(colWidth * 1.25, 105);

  const selectedPalace =
    chartData.palaceByBranch[selectedBranchId] || chartData.palaces[0];

  const renderCell = (branchId: number) => {
    const palace = chartData.palaceByBranch[branchId];
    if (!palace) return <View style={[styles.cell, { width: colWidth, height: cellHeight }]} />;

    const isSelected = palace.branchId === selectedBranchId;
    const isMenh = palace.isMenh;
    const isThan = palace.isThan;
    const hasTuan = palace.hasTuan;
    const hasTriet = palace.hasTriet;

    return (
      <TouchableOpacity
        key={`cell-${branchId}`}
        style={[
          styles.cell,
          { width: colWidth, height: cellHeight },
          isSelected && styles.cellSelected,
          isMenh && !isSelected && styles.cellMenh,
          isThan && !isSelected && styles.cellThan,
        ]}
        onPress={() => setSelectedBranchId(branchId)}
        activeOpacity={0.75}
      >
        {/* Cell Top Header: Palace Function Name & Palace Can-Chi */}
        <View style={styles.cellHeader}>
          <Text
            style={[
              styles.cellPalaceName,
              isMenh && styles.goldText,
              isThan && styles.cyanText,
              isSelected && styles.activeText,
            ]}
            numberOfLines={1}
          >
            {palace.name}
          </Text>
          <Text style={styles.cellCanChiName} numberOfLines={1}>
            {palace.canChiName}
          </Text>
        </View>

        {/* Badges Row (Mệnh / Thân / Tuần / Triệt) */}
        <View style={styles.badgeRow}>
          {isMenh && <Text style={styles.menhBadge}>MỆNH</Text>}
          {isThan && <Text style={styles.thanBadge}>THÂN</Text>}
          {hasTuan && <Text style={styles.tuanBadge}>TUẦN</Text>}
          {hasTriet && <Text style={styles.trietBadge}>TRIỆT</Text>}
        </View>

        {/* Stars List */}
        <View style={styles.starsContainer}>
          {palace.majorStars.slice(0, 2).map((s, idx) => (
            <Text key={`maj-${idx}`} style={styles.majorStarText} numberOfLines={1}>
              {s.name}{s.status ? ` (${s.status})` : ''}
            </Text>
          ))}
          {palace.goodStars.slice(0, 2).map((s, idx) => (
            <Text key={`good-${idx}`} style={styles.goodStarText} numberOfLines={1}>
              {s.name}
            </Text>
          ))}
          {palace.badStars.slice(0, 1).map((s, idx) => (
            <Text key={`bad-${idx}`} style={styles.badStarText} numberOfLines={1}>
              {s.name}
            </Text>
          ))}
        </View>

        {/* Cell Footer: Tràng Sinh & Đại Hạn */}
        <View style={styles.cellFooter}>
          <Text style={styles.trangSinhText} numberOfLines={1}>
            {palace.trangSinhStar || palace.thaiTueStar || ''}
          </Text>
          <Text style={styles.daiHanText}>{palace.daiHan}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Switcher */}
      <View style={styles.modeSwitchRow}>
        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'grid' && styles.modeTabActive]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons
            name="grid-outline"
            size={14}
            color={viewMode === 'grid' ? theme.colors.background : theme.colors.accent}
          />
          <Text
            style={[
              styles.modeTabText,
              viewMode === 'grid' && styles.modeTabTextActive,
            ]}
          >
            Bản Đồ 12 Cung (4x4)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'list' && styles.modeTabActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons
            name="list-outline"
            size={14}
            color={viewMode === 'list' ? theme.colors.background : theme.colors.accent}
          />
          <Text
            style={[
              styles.modeTabText,
              viewMode === 'list' && styles.modeTabTextActive,
            ]}
          >
            Danh Sách 12 Cung
          </Text>
        </TouchableOpacity>
      </View>

      {/* VIEW MODE: 4x4 Grid Standard Tu Vi Matrix */}
      {viewMode === 'grid' ? (
        <View style={[styles.gridContainer, { width: gridWidth }]}>
          {/* Top Row: Tỵ (5), Ngọ (6), Mùi (7), Thân (8) */}
          <View style={styles.gridRow}>
            {renderCell(5)}
            {renderCell(6)}
            {renderCell(7)}
            {renderCell(8)}
          </View>

          {/* Middle Section: Rows 1 & 2 with Center Thiên Bàn */}
          <View style={styles.middleSection}>
            {/* Left Col: Thìn (4), Mão (3) */}
            <View style={styles.sideCol}>
              {renderCell(4)}
              {renderCell(3)}
            </View>

            {/* Center: Thiên Bàn */}
            <View
              style={[
                styles.thienBan,
                { width: colWidth * 2 + 2, height: cellHeight * 2 + 2 },
              ]}
            >
              <Text style={styles.thienBanTaiChi}>☯</Text>
              <Text style={styles.thienBanTitle}>LÁ SỐ TỬ VI ĐẨU SỐ</Text>
              <Text style={styles.thienBanOwner}>{chartData.name}</Text>
              <Text style={styles.thienBanYinYang}>
                {chartData.yinYangGender} • Năm {chartData.canChiYear}
              </Text>

              <View style={styles.thienBanDivider} />

              <Text style={styles.thienBanMeta}>
                Dương lịch: {chartData.solarDate}
              </Text>
              <Text style={styles.thienBanMeta}>
                Âm lịch: {chartData.lunarDateText} • Giờ {chartData.canChiHour}
              </Text>
              <Text style={styles.thienBanMeta}>
                Bản Mệnh: <Text style={styles.thienBanHighlight}>{chartData.napAm}</Text>
              </Text>
              <Text style={styles.thienBanMeta}>
                Cục: <Text style={styles.thienBanHighlight}>{chartData.cucName}</Text>
              </Text>
              <Text style={styles.thienBanMeta}>
                Mệnh Chủ: <Text style={styles.goldText}>{chartData.menhChu}</Text> • Thân Chủ: <Text style={styles.cyanText}>{chartData.thanChu}</Text>
              </Text>
              <Text style={styles.thienBanMeta}>
                Triệt tại: <Text style={styles.trietText}>{chartData.trietLocation}</Text> • Tuần tại: <Text style={styles.tuanText}>{chartData.tuanLocation}</Text>
              </Text>
              <Text style={styles.thienBanSmall}>
                Chạm vào các cung để xem giải đoán
              </Text>
            </View>

            {/* Right Col: Dậu (9), Tuất (10) */}
            <View style={styles.sideCol}>
              {renderCell(9)}
              {renderCell(10)}
            </View>
          </View>

          {/* Bottom Row: Dần (2), Sửu (1), Tý (0), Hợi (11) */}
          <View style={styles.gridRow}>
            {renderCell(2)}
            {renderCell(1)}
            {renderCell(0)}
            {renderCell(11)}
          </View>
        </View>
      ) : (
        /* VIEW MODE: List of 12 Palaces */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listPalaceScroll}
        >
          {chartData.palaces.map((p) => {
            const isSelected = p.branchId === selectedBranchId;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.listPalaceCard,
                  isSelected && styles.listPalaceCardActive,
                  p.isMenh && styles.cellMenh,
                ]}
                onPress={() => setSelectedBranchId(p.branchId)}
              >
                <View style={styles.listCardTop}>
                  <Text
                    style={[
                      styles.listPalaceName,
                      p.isMenh && styles.goldText,
                      isSelected && styles.activeText,
                    ]}
                  >
                    Cung {p.name}
                  </Text>
                  <Text style={styles.listBranchText}>{p.canChiName}</Text>
                </View>
                <View style={styles.badgeRow}>
                  {p.isMenh && <Text style={styles.menhBadge}>MỆNH</Text>}
                  {p.isThan && <Text style={styles.thanBadge}>THÂN</Text>}
                  {p.hasTuan && <Text style={styles.tuanBadge}>TUẦN</Text>}
                  {p.hasTriet && <Text style={styles.trietBadge}>TRIỆT</Text>}
                </View>

                <Text style={styles.listDaiHan}>Đại hạn: {p.daiHan} tuổi</Text>
                <Text style={styles.listSubText}>Tiểu hạn: {p.tieuHanChi}</Text>

                <View style={styles.listStarsWrap}>
                  {p.majorStars.map((s, idx) => (
                    <Text key={idx} style={styles.majorStarText}>
                      ★ {s.name}{s.status ? ` (${s.status})` : ''}
                    </Text>
                  ))}
                  {p.goodStars.slice(0, 3).map((s, idx) => (
                    <Text key={idx} style={styles.goodStarText}>
                      ✦ {s.name}
                    </Text>
                  ))}
                  {p.badStars.slice(0, 2).map((s, idx) => (
                    <Text key={idx} style={styles.badStarText}>
                      ▲ {s.name}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Selected Palace Detailed Card */}
      {selectedPalace && (
        <View style={styles.selectedPalaceCard}>
          <View style={styles.selectedHeaderRow}>
            <View style={styles.selectedTitleWrap}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.selectedTitle}>
                  CUNG {selectedPalace.name} • {selectedPalace.canChiName.toUpperCase()}
                </Text>
                {selectedPalace.isMenh && <Text style={styles.menhBadgeLarge}>MỆNH CHỦ</Text>}
                {selectedPalace.isThan && <Text style={styles.thanBadgeLarge}>THÂN CƯ</Text>}
                {selectedPalace.hasTuan && <Text style={styles.tuanBadgeLarge}>TUẦN TRUNG</Text>}
                {selectedPalace.hasTriet && <Text style={styles.trietBadgeLarge}>TRIỆT LỘ</Text>}
              </View>
              <Text style={styles.selectedDaiHan}>
                Đại Vận 10 Năm: {selectedPalace.daiHan} tuổi • Năm Tiểu Vận: Chi {selectedPalace.tieuHanChi}
              </Text>
              <Text style={styles.selectedVongSao}>
                Tràng Sinh: {selectedPalace.trangSinhStar || '—'} • Thái Tuế: {selectedPalace.thaiTueStar || '—'} • Bác Sĩ: {selectedPalace.bacSiStar || '—'}
              </Text>
            </View>

            {onAskAIAboutPalace && (
              <TouchableOpacity
                style={styles.askAiBtn}
                onPress={() => onAskAIAboutPalace(selectedPalace)}
              >
                <Ionicons name="sparkles" size={14} color={theme.colors.background} />
                <Text style={styles.askAiBtnText}>Hỏi AI</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.palaceDesc}>{selectedPalace.description}</Text>

          {/* Stars Placed in this Palace */}
          <View style={styles.starsSection}>
            <Text style={styles.starsSectionTitle}>CÁC SAO TỌA THỦ TẠI CUNG:</Text>

            {/* Major Stars */}
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subCategoryTitle}>14 Chính Tinh:</Text>
              {selectedPalace.majorStars.length > 0 ? (
                <View style={styles.starRowWrap}>
                  {selectedPalace.majorStars.map((s, idx) => (
                    <View key={`detail-maj-${idx}`} style={styles.majorStarBadge}>
                      <Text style={styles.starBadgeIcon}>★</Text>
                      <Text style={styles.majorStarBadgeText}>{s.name}</Text>
                      <Text style={styles.starBadgeStatus}>({s.status || 'Bình'})</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyStarsText}>Cung Vô Chính Diệu (Mượn chính tinh từ cung xung chiếu để luận).</Text>
              )}
            </View>

            {/* Auxiliary & Good Stars */}
            {selectedPalace.goodStars.length > 0 && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.subCategoryTitle}>Cát Tinh / Quý Tinh / Trợ Tinh ({selectedPalace.goodStars.length}):</Text>
                <View style={styles.starRowWrap}>
                  {selectedPalace.goodStars.map((s, idx) => (
                    <View key={`detail-good-${idx}`} style={styles.goodStarBadge}>
                      <Text style={styles.goodStarBadgeIcon}>✦</Text>
                      <Text style={styles.goodStarBadgeText}>{s.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bad / Sát Stars */}
            {selectedPalace.badStars.length > 0 && (
              <View>
                <Text style={styles.subCategoryTitle}>Sát Tinh / Bại Tinh / Hung Tinh ({selectedPalace.badStars.length}):</Text>
                <View style={styles.starRowWrap}>
                  {selectedPalace.badStars.map((s, idx) => (
                    <View key={`detail-bad-${idx}`} style={styles.badStarBadge}>
                      <Text style={styles.badStarBadgeIcon}>▲</Text>
                      <Text style={styles.badStarBadgeText}>{s.name}{s.status ? ` (${s.status})` : ''}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.2),
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: theme.colors.accent,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textBody,
  },
  modeTabTextActive: {
    color: theme.colors.background,
    fontWeight: '700',
  },
  gridContainer: {
    backgroundColor: theme.colors.palaceBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.accentBorder,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: theme.colors.accentBorder,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  middleSection: {
    flexDirection: 'row',
    width: '100%',
  },
  sideCol: {
    flexDirection: 'column',
  },
  cell: {
    backgroundColor: withOpacity(theme.colors.palaceSurface, 0.9),
    borderWidth: 0.5,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    padding: 3,
    justifyContent: 'space-between',
  },
  cellSelected: {
    backgroundColor: withOpacity(theme.colors.accent, 0.22),
    borderColor: theme.colors.accent,
    borderWidth: 1.5,
  },
  cellMenh: {
    backgroundColor: withOpacity(theme.colors.accentBorder, 0.12),
    borderColor: withOpacity(theme.colors.accent, 0.6),
  },
  cellThan: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  cellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellPalaceName: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  cellCanChiName: {
    fontSize: 8.5,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  goldText: {
    color: theme.colors.accentText,
  },
  cyanText: {
    color: '#38BDF8',
  },
  trietText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  tuanText: {
    color: '#A855F7',
    fontWeight: '700',
  },
  activeText: {
    color: theme.colors.accent,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 1,
  },
  menhBadge: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2.5,
  },
  thanBadge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2.5,
  },
  tuanBadge: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2.5,
  },
  trietBadge: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderRadius: 2.5,
  },
  starsContainer: {
    flex: 1,
    marginTop: 1,
    justifyContent: 'center',
  },
  majorStarText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F87171',
    lineHeight: 10.5,
  },
  goodStarText: {
    fontSize: 7.5,
    fontWeight: '600',
    color: '#34D399',
    lineHeight: 10,
  },
  badStarText: {
    fontSize: 7.5,
    fontWeight: '600',
    color: '#FB923C',
    lineHeight: 10,
  },
  cellFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  trangSinhText: {
    fontSize: 7,
    color: theme.colors.accentText,
    fontStyle: 'italic',
  },
  daiHanText: {
    fontSize: 7,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  thienBan: {
    backgroundColor: withOpacity(theme.colors.palaceDetail, 0.96),
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accentBorder, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  thienBanTaiChi: {
    fontSize: 18,
    color: theme.colors.accent,
    marginBottom: 1,
  },
  thienBanTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.accentBorder,
    letterSpacing: 0.8,
  },
  thienBanOwner: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 1,
  },
  thienBanYinYang: {
    fontSize: 8.5,
    color: theme.colors.textBody,
    marginTop: 1,
  },
  thienBanDivider: {
    width: '80%',
    height: 1,
    backgroundColor: withOpacity(theme.colors.accentBorder, 0.3),
    marginVertical: 3,
  },
  thienBanMeta: {
    fontSize: 8,
    color: theme.colors.textMuted,
    lineHeight: 11,
  },
  thienBanHighlight: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  thienBanSmall: {
    fontSize: 7,
    color: theme.colors.textSubtle,
    marginTop: 3,
    fontStyle: 'italic',
  },
  listPalaceScroll: {
    paddingHorizontal: 8,
    gap: 8,
  },
  listPalaceCard: {
    width: 140,
    backgroundColor: withOpacity(theme.colors.palaceSurface, 0.85),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderRadius: 12,
    padding: 10,
  },
  listPalaceCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: withOpacity(theme.colors.accent, 0.15),
  },
  listCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listPalaceName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  listBranchText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  listDaiHan: {
    fontSize: 9.5,
    color: theme.colors.textBody,
    marginTop: 4,
    fontWeight: '600',
  },
  listSubText: {
    fontSize: 8.5,
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  listStarsWrap: {
    gap: 2,
    marginTop: 4,
  },
  selectedPalaceCard: {
    width: '100%',
    marginTop: 12,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 14,
    padding: 14,
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectedTitleWrap: {
    flex: 1,
    marginRight: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 0.5,
  },
  menhBadgeLarge: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  thanBadgeLarge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  tuanBadgeLarge: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  trietBadgeLarge: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  selectedDaiHan: {
    fontSize: 10.5,
    color: theme.colors.textBody,
    marginTop: 3,
    fontWeight: '600',
  },
  selectedVongSao: {
    fontSize: 9.5,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  askAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  askAiBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.background,
  },
  palaceDesc: {
    fontSize: 11.5,
    color: theme.colors.textBody,
    lineHeight: 17,
    marginBottom: 10,
  },
  starsSection: {
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.text, 0.08),
    paddingTop: 8,
  },
  starsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subCategoryTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.accentText,
    marginBottom: 4,
  },
  starRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  majorStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 3,
  },
  starBadgeIcon: {
    color: '#EF4444',
    fontSize: 9,
  },
  majorStarBadgeText: {
    color: '#FCA5A5',
    fontSize: 10.5,
    fontWeight: '700',
  },
  starBadgeStatus: {
    color: '#F87171',
    fontSize: 8.5,
  },
  emptyStarsText: {
    fontSize: 10.5,
    color: theme.colors.textSubtle,
    fontStyle: 'italic',
  },
  goodStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 3,
  },
  goodStarBadgeIcon: {
    color: '#10B981',
    fontSize: 9,
  },
  goodStarBadgeText: {
    color: '#6EE7B7',
    fontSize: 10.5,
    fontWeight: '600',
  },
  badStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 3,
  },
  badStarBadgeIcon: {
    color: '#F97316',
    fontSize: 8.5,
  },
  badStarBadgeText: {
    color: '#FDBA74',
    fontSize: 10.5,
    fontWeight: '600',
  },
});
