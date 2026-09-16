import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CelestialBody } from '../types/cosmos3DTypes';

interface PlanetDetailModalProps {
  planet: CelestialBody | null;
  visible: boolean;
  onClose: () => void;
}

export function PlanetDetailModal({ planet, visible, onClose }: PlanetDetailModalProps) {
  if (!planet) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.symbolBadge, { borderColor: planet.colorCss, shadowColor: planet.colorCss }]}>
                <Text style={[styles.symbolText, { color: planet.colorCss }]}>{planet.symbol}</Text>
              </View>
              <View>
                <Text style={styles.planetName}>{planet.name}</Text>
                <Text style={styles.englishName}>{planet.englishName} • {planet.archetype}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tagRow}>
              <View style={styles.tagItem}>
                <Text style={styles.tagLabel}>Nguyên Tố</Text>
                <Text style={[styles.tagValue, { color: planet.colorCss }]}>{planet.element}</Text>
              </View>

              <View style={styles.tagItem}>
                <Text style={styles.tagLabel}>Cung Chủ Quản</Text>
                <Text style={styles.tagValueWhite}>{planet.rulerOf}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={16} color="#c084fc" />
                <Text style={styles.sectionTitle}>Ý Nghĩa Tâm Linh & Năng Lượng</Text>
              </View>
              <Text style={styles.bodyText}>{planet.spiritualMeaning}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionSubTitle}>TỪ KHÓA CHIÊM TINH</Text>
              <View style={styles.keywordWrap}>
                {planet.astrologicalKeywords.map((kw, i) => (
                  <View key={i} style={[styles.keywordChip, { borderColor: `${planet.colorCss}66` }]}>
                    <Text style={[styles.keywordText, { color: planet.colorCss }]}>#{kw}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.guidanceBox, { borderColor: `${planet.colorCss}55` }]}>
              <View style={styles.guidanceHeader}>
                <Ionicons name="infinite" size={18} color={planet.colorCss} />
                <Text style={[styles.guidanceTitle, { color: planet.colorCss }]}>Thông Điệp Vũ Trụ Gửi Bạn</Text>
              </View>
              <Text style={styles.guidanceText}>"{planet.guidance}"</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: planet.colorCss }]} onPress={onClose}>
            <Text style={styles.confirmBtnText}>Hấp Thu Năng Lượng</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'flex-end',
  },
  cardContainer: {
    backgroundColor: '#0f0a21',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  symbolBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  symbolText: {
    fontSize: 26,
    fontWeight: '700',
  },
  planetName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  englishName: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    marginVertical: 14,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tagItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 3,
  },
  tagValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  tagValueWhite: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  sectionSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#cbd5e1',
  },
  keywordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guidanceBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  guidanceText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    color: '#f8fafc',
  },
  confirmBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnText: {
    color: '#090514',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
