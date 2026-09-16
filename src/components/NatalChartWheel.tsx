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
import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { ZODIAC_SIGNS } from '../data/zodiacSigns';
import { NatalChartData, CelestialBodyPosition, AspectInfo } from '../services/astrologyCalc';

export interface NatalChartWheelProps {
  chartData: NatalChartData;
}

// Element colors & styling
const ELEMENT_COLORS: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  Lửa: {
    bg: 'rgba(239, 68, 68, 0.22)',
    border: 'rgba(248, 113, 113, 0.65)',
    text: '#FCA5A5',
    glow: '#EF4444',
  },
  Đất: {
    bg: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(52, 211, 153, 0.65)',
    text: '#6EE7B7',
    glow: '#10B981',
  },
  Khí: {
    bg: 'rgba(56, 189, 248, 0.18)',
    border: 'rgba(56, 189, 248, 0.65)',
    text: '#BAE6FD',
    glow: '#38BDF8',
  },
  Nước: {
    bg: 'rgba(168, 85, 247, 0.22)',
    border: 'rgba(192, 132, 252, 0.65)',
    text: '#E9D5FF',
    glow: '#A855F7',
  },
};

/**
 * Calculates an SVG arc path for a sector band
 */
function getSectorPath(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startDeg: number,
  endDeg: number
) {
  const rad1 = (startDeg * Math.PI) / 180;
  const rad2 = (endDeg * Math.PI) / 180;

  const x1 = cx + rOut * Math.cos(rad1);
  const y1 = cy + rOut * Math.sin(rad1);
  const x2 = cx + rOut * Math.cos(rad2);
  const y2 = cy + rOut * Math.sin(rad2);

  const x3 = cx + rIn * Math.cos(rad2);
  const y3 = cy + rIn * Math.sin(rad2);
  const x4 = cx + rIn * Math.cos(rad1);
  const y4 = cy + rIn * Math.sin(rad1);

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOut} ${rOut} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rIn} ${rIn} 0 0 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

export const NatalChartWheel: React.FC<NatalChartWheelProps> = ({ chartData }) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [selectedBodyId, setSelectedBodyId] = useState<string>('sun');

  const safeWidth = windowWidth > 0 ? windowWidth : 360;
  const WHEEL_SIZE = Math.min(Math.max(safeWidth - 32, 300), 400);
  const CENTER = WHEEL_SIZE / 2;
  const R_OUTER = CENTER - 6;
  const R_SIGNS_INNER = R_OUTER - 36;
  const R_HOUSE_INNER = R_SIGNS_INNER - 42;
  const R_CORE = 24;
  const R_PLANETS_BASE = (R_SIGNS_INNER + R_HOUSE_INNER) / 2;

  const ascLon = chartData.ascendant.longitude;

  /**
   * Chuyển đổi kinh độ hoàng đạo (0..360) sang góc SVG (độ):
   * Theo chuẩn Chiêm Tinh Quốc Tế (Astro.com, CafeAstrology):
   * - Cung Mọc (Ascendant) luôn nằm ở vị trí 9h (180° từ tâm sang bên trái)
   * - Thứ tự các nhà đi ngược chiều kim đồng hồ: Nhà 1, 2, 3...
   */
  const toDisplayAngle = (lon: number) => {
    // 180° là góc 9h. Di chuyển ngược chiều kim đồng hồ:
    return ((180 + (lon - ascLon)) % 360 + 360) % 360;
  };

  // Tính tọa độ các hành tinh kèm chống trùng lặp vị trí (anti-collision)
  // Sắp xếp các hành tinh theo kinh độ hoàng đạo
  const sortedBodies = [...chartData.allBodies].sort((a, b) => a.longitude - b.longitude);

  interface PlacedBody extends CelestialBodyPosition {
    displayAngle: number;
    x: number;
    y: number;
  }

  const placedBodies: PlacedBody[] = [];
  const minAngleDist = 7.5; // Độ cách nhau tối thiểu giữa các icon hành tinh

  // Phân bổ bán kính (radial offset) nếu các hành tinh quá gần nhau
  for (let i = 0; i < sortedBodies.length; i++) {
    const body = sortedBodies[i];
    let dispAngle = toDisplayAngle(body.longitude);

    // Kiểm tra xem có thiên thể nào trước đó nằm quá sát không
    let radialOffset = 0;
    for (let j = 0; j < placedBodies.length; j++) {
      const prev = placedBodies[j];
      const diff = Math.abs(dispAngle - prev.displayAngle);
      const angleDist = Math.min(diff, 360 - diff);
      if (angleDist < minAngleDist) {
        // Đẩy so le bán kính trong / ngoài
        radialOffset = (j % 2 === 0 ? 1 : -1) * 11;
        break;
      }
    }

    const rPlanet = R_PLANETS_BASE + radialOffset;
    const angleRad = (dispAngle * Math.PI) / 180;
    const x = CENTER + rPlanet * Math.cos(angleRad);
    const y = CENTER + rPlanet * Math.sin(angleRad);

    placedBodies.push({
      ...body,
      displayAngle: dispAngle,
      x,
      y,
    });
  }

  // Lấy danh sách thiên thể được chọn
  const activeBody =
    placedBodies.find((b) => b.id === selectedBodyId) || placedBodies[0];

  // Lọc các góc hợp của thiên thể đang chọn
  const activeAspects = chartData.aspects.filter(
    (asp) => asp.p1.id === activeBody.id || asp.p2.id === activeBody.id
  );

  return (
    <View style={styles.container}>
      {/* SVG Zodiac Wheel */}
      <View style={styles.svgWrapper}>
        <Svg
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        >
          <Defs>
            <RadialGradient id="coreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={theme.colors.accentBorder} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={theme.colors.chartGradientEnd} stopOpacity="0.9" />
            </RadialGradient>
            <LinearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#F5D061" stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.colors.accentBorder} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Deep celestial backdrop circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_OUTER}
            fill={theme.colors.chartBackground}
            stroke={theme.colors.accentBorder}
            strokeWidth="1.8"
          />

          {/* 12 Vành Cung Hoàng Đạo (Xoay theo Cung Mọc) */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const signStartLon = index * 30;
            const signEndLon = (index + 1) * 30;

            const startAngle = toDisplayAngle(signStartLon);
            const endAngle = toDisplayAngle(signEndLon);

            const elementStyle = ELEMENT_COLORS[sign.element] || ELEMENT_COLORS.Lửa;
            const pathD = getSectorPath(
              CENTER,
              CENTER,
              R_SIGNS_INNER,
              R_OUTER,
              startAngle,
              endAngle
            );

            // Vị trí ký hiệu cung
            const midAngle = toDisplayAngle(signStartLon + 15);
            const midRad = (midAngle * Math.PI) / 180;
            const rSymbol = (R_OUTER + R_SIGNS_INNER) / 2;
            const symX = CENTER + rSymbol * Math.cos(midRad);
            const symY = CENTER + rSymbol * Math.sin(midRad);

            const isSunSign = sign.id === chartData.sun.sign.id;
            const isAscSign = sign.id === chartData.ascendant.sign.id;
            const isMoonSign = sign.id === chartData.moon.sign.id;
            const isHighlight = isSunSign || isAscSign || isMoonSign;

            return (
              <G key={`sign-${sign.id}`}>
                <Path
                  d={pathD}
                  fill={elementStyle.bg}
                  stroke={isHighlight ? theme.colors.accentBorder : withOpacity(theme.colors.accentBorder, 0.35)}
                  strokeWidth={isHighlight ? '1.5' : '0.6'}
                />
                <SvgText
                  x={symX}
                  y={symY + 5}
                  fill={isSunSign ? '#FBBF24' : isAscSign ? '#34D399' : isMoonSign ? '#E2E8F0' : elementStyle.text}
                  fontSize={isHighlight ? '16' : '14'}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {sign.symbol}
                </SvgText>
              </G>
            );
          })}

          {/* Inner house ring backdrop */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_SIGNS_INNER}
            fill={withOpacity(theme.colors.chartHouse, 0.9)}
            stroke={withOpacity(theme.colors.accentBorder, 0.45)}
            strokeWidth="1"
          />

          {/* House inner boundary */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_HOUSE_INNER}
            fill={withOpacity(theme.colors.chartCenter, 0.75)}
            stroke={withOpacity(theme.colors.accentBorder, 0.3)}
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* 12 Cung Nhà (House Cusps & Spokes) */}
          {Array.from({ length: 12 }).map((_, hIdx) => {
            // Mỗi nhà 30 độ tính từ Cung Mọc (180°)
            const houseAngle = (180 + hIdx * 30) % 360;
            const angleRad = (houseAngle * Math.PI) / 180;
            const x1 = CENTER + R_CORE * Math.cos(angleRad);
            const y1 = CENTER + R_CORE * Math.sin(angleRad);
            const x2 = CENTER + R_SIGNS_INNER * Math.cos(angleRad);
            const y2 = CENTER + R_SIGNS_INNER * Math.sin(angleRad);

            // Số nhà (House number) đặt ở góc 15 độ của cung nhà
            const labelAngle = (houseAngle + 15) % 360;
            const labelRad = (labelAngle * Math.PI) / 180;
            const rHouseLabel = (R_HOUSE_INNER + R_CORE) / 2;
            const numX = CENTER + rHouseLabel * Math.cos(labelRad);
            const numY = CENTER + rHouseLabel * Math.sin(labelRad);

            const isCardinal = hIdx === 0 || hIdx === 3 || hIdx === 6 || hIdx === 9;

            return (
              <G key={`house-${hIdx}`}>
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCardinal ? theme.colors.accent : withOpacity(theme.colors.accentBorder, 0.22)}
                  strokeWidth={isCardinal ? '1.4' : '0.7'}
                />
                <SvgText
                  x={numX}
                  y={numY + 3.5}
                  fill={theme.colors.textMuted}
                  fontSize="8.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {hIdx + 1}
                </SvgText>
              </G>
            );
          })}

          {/* Đường Góc Hợp (Aspect Lines trong lòng bánh xe) */}
          {chartData.aspects.map((asp, idx) => {
            const body1 = placedBodies.find((b) => b.id === asp.p1.id);
            const body2 = placedBodies.find((b) => b.id === asp.p2.id);
            if (!body1 || !body2) return null;

            const isRelated = body1.id === activeBody.id || body2.id === activeBody.id;

            return (
              <Line
                key={`asp-${idx}`}
                x1={body1.x}
                y1={body1.y}
                x2={body2.x}
                y2={body2.y}
                stroke={asp.color}
                strokeWidth={isRelated ? '1.8' : '0.7'}
                strokeDasharray={asp.dash}
                opacity={isRelated ? 0.9 : 0.3}
              />
            );
          })}

          {/* Trục Cung Mọc (AC - 9 giờ) & Cung Lặn (DC - 3 giờ) */}
          <Line
            x1={CENTER - R_OUTER}
            y1={CENTER}
            x2={CENTER + R_OUTER}
            y2={CENTER}
            stroke="#10B981"
            strokeWidth="1.8"
          />
          <SvgText
            x={CENTER - R_OUTER + 12}
            y={CENTER - 5}
            fill="#10B981"
            fontSize="9"
            fontWeight="bold"
          >
            AC
          </SvgText>
          <SvgText
            x={CENTER + R_OUTER - 22}
            y={CENTER - 5}
            fill="#38BDF8"
            fontSize="9"
            fontWeight="bold"
          >
            DC
          </SvgText>

          {/* Tọa độ các hành tinh (Nodes & Glyphs) */}
          {placedBodies.map((body) => {
            const isSelected = body.id === activeBody.id;
            const isMultiChar = body.symbol.length > 1;

            return (
              <G key={`node-${body.id}`} onPress={() => setSelectedBodyId(body.id)}>
                {/* Đường dóng nối ra vành cung hoàng đạo */}
                <Line
                  x1={body.x}
                  y1={body.y}
                  x2={CENTER + R_SIGNS_INNER * Math.cos((body.displayAngle * Math.PI) / 180)}
                  y2={CENTER + R_SIGNS_INNER * Math.sin((body.displayAngle * Math.PI) / 180)}
                  stroke={body.color}
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  opacity={0.6}
                />

                {/* Vòng sáng viền khi chọn */}
                {isSelected && (
                  <Circle
                    cx={body.x}
                    cy={body.y}
                    r={18}
                    fill="none"
                    stroke={body.color}
                    strokeWidth="1.8"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Nút tròn hành tinh */}
                <Circle
                  cx={body.x}
                  cy={body.y}
                  r={13}
                  fill={theme.colors.chartPlanet}
                  stroke={isSelected ? theme.colors.text : body.color}
                  strokeWidth={isSelected ? '2.2' : '1.4'}
                />

                {/* Ký hiệu hành tinh */}
                <SvgText
                  x={body.x}
                  y={body.y + (isMultiChar ? 3.5 : 4.5)}
                  fill={body.color}
                  fontSize={isMultiChar ? '10' : '13'}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {body.symbol}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Quick Horizontal Selector for Planets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.planetSelectorScroll}
        contentContainerStyle={styles.planetSelectorContent}
      >
        {placedBodies.map((b) => {
          const isSelected = b.id === activeBody.id;
          return (
            <TouchableOpacity
              key={`chip-${b.id}`}
              style={[
                styles.planetChip,
                isSelected && styles.planetChipActive,
                { borderColor: isSelected ? b.color : withOpacity(theme.colors.accentBorder, 0.25) },
              ]}
              onPress={() => setSelectedBodyId(b.id)}
            >
              <Text style={[styles.planetChipSymbol, { color: b.color }]}>{b.symbol}</Text>
              <Text
                style={[
                  styles.planetChipText,
                  isSelected && { color: theme.colors.text, fontWeight: '700' },
                ]}
              >
                {b.nameEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Planet Detailed Card */}
      {activeBody && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeaderRow}>
            <View style={styles.detailTitleWrap}>
              <View style={styles.nameWithBadge}>
                <Text style={styles.detailEmoji}>{activeBody.emoji}</Text>
                <Text style={styles.detailTitle}>{activeBody.nameVi}</Text>
              </View>
              <Text style={styles.detailDegreeText}>
                {activeBody.formattedDegree} • {activeBody.sign.nameVi} ({activeBody.sign.element})
              </Text>
              <Text style={styles.detailHouseText}>
                Tọa thủ: <Text style={styles.goldText}>Nhà số {activeBody.houseNumber} (House {activeBody.houseNumber})</Text>
              </Text>
            </View>
          </View>

          {/* Tương quan với Tử Vi Phương Đông */}
          <View style={styles.tuViEquivalentBox}>
            <Text style={styles.tuViEquivalentTitle}>☯ TƯƠNG QUAN VỚI TỬ VI PHƯƠNG ĐÔNG:</Text>
            <Text style={styles.tuViEquivalentText}>{activeBody.tuViPalaceEquivalent}</Text>
          </View>

          {/* Ý nghĩa chiêm tinh học */}
          <Text style={styles.detailDesc}>{activeBody.description}</Text>

          {/* Các góc hợp (Aspects) của hành tinh này */}
          <View style={styles.aspectSection}>
            <Text style={styles.aspectSectionTitle}>
              CÁC GÓC HỢP LIÊN KẾT ({activeAspects.length}):
            </Text>
            {activeAspects.length > 0 ? (
              <View style={styles.aspectList}>
                {activeAspects.map((asp, idx) => {
                  const otherBody = asp.p1.id === activeBody.id ? asp.p2 : asp.p1;
                  return (
                    <View key={`asp-item-${idx}`} style={styles.aspectItem}>
                      <View style={[styles.aspectDot, { backgroundColor: asp.color }]} />
                      <Text style={styles.aspectText}>
                        <Text style={styles.aspectPartner}>{asp.nameVi}</Text> với{' '}
                        <Text style={{ color: otherBody.color, fontWeight: '700' }}>
                          {otherBody.nameVi}
                        </Text>{' '}
                        (lệch {asp.orb}°)
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noAspectText}>Hành tinh đơn độc, không tạo góc chiếu chính.</Text>
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
    marginVertical: 4,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetSelectorScroll: {
    marginTop: 10,
    width: '100%',
  },
  planetSelectorContent: {
    paddingHorizontal: 4,
    gap: 6,
  },
  planetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  planetChipActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.2),
  },
  planetChipSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planetChipText: {
    fontSize: 10.5,
    color: theme.colors.textMuted,
  },
  detailCard: {
    width: '100%',
    marginTop: 12,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 14,
    padding: 14,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailTitleWrap: {
    flex: 1,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailEmoji: {
    fontSize: 20,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  detailDegreeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentText,
    marginTop: 3,
  },
  detailHouseText: {
    fontSize: 11.5,
    color: theme.colors.textBody,
    marginTop: 2,
  },
  goldText: {
    color: theme.colors.accentText,
    fontWeight: '700',
  },
  tuViEquivalentBox: {
    backgroundColor: withOpacity(theme.colors.accent, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.3),
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  tuViEquivalentTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.accentText,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tuViEquivalentText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: theme.colors.text,
  },
  detailDesc: {
    fontSize: 12,
    color: theme.colors.textBody,
    lineHeight: 18,
    marginBottom: 8,
  },
  aspectSection: {
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.text, 0.08),
    paddingTop: 8,
  },
  aspectSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  aspectList: {
    gap: 4,
  },
  aspectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aspectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aspectText: {
    fontSize: 11,
    color: theme.colors.textBody,
  },
  aspectPartner: {
    fontWeight: '700',
    color: theme.colors.accentText,
  },
  noAspectText: {
    fontSize: 10.5,
    color: theme.colors.textSubtle,
    fontStyle: 'italic',
  },
});
