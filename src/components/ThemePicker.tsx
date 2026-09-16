import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BACKGROUNDS } from '../theme/backgrounds';
import { Ionicons } from '@expo/vector-icons';
import { THEMES, useTheme, type ThemeId } from '../theme/ThemeProvider';

export function ThemePicker() {
  const { theme, selectTheme, background, selectBackground } = useTheme();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const colors = theme.colors;
  const choose = async (id: ThemeId) => {
    setError('');
    try {
      await selectTheme(id);
    } catch {
      setError('Chưa lưu được màu. Bạn có thể chọn lại để thử lưu.');
    }
  };
  const chooseBackground = async (id: string) => {
    setError('');
    try {
      await selectBackground(theme.id, id);
    } catch {
      setError('Chưa lưu được ảnh nền. Bạn có thể chọn lại để thử lưu.');
    }
  };
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Đổi màu và ảnh nền"
        onPress={() => { setError(''); setVisible(true); }}
        style={[styles.trigger, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="color-palette-outline" size={22} color={colors.accent} />
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Đóng bảng chọn màu" />
          <View accessibilityViewIsModal style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.accentBorder }]}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>Giao diện</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={() => setVisible(false)} style={styles.close}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.description, { color: colors.textMuted }]}>Chọn tông màu bạn yêu thích</Text>
              {Object.values(THEMES).map((option) => (
                <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: theme.id === option.id }} accessibilityLabel={option.name}
                  onPress={() => void choose(option.id)}
                  style={[styles.option, { backgroundColor: option.colors.background, borderColor: theme.id === option.id ? colors.accent : colors.textSubtle }]}>
                  <View style={[styles.swatch, { backgroundColor: option.colors.accent }]} />
                  <Text style={[styles.optionName, { color: option.colors.text }]}>{option.name}</Text>
                  {theme.id === option.id && <Ionicons name="checkmark-circle" size={24} color={option.colors.accent} />}
                </Pressable>
              ))}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ảnh nền · {theme.name}</Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>Chạm để đổi nền. Mỗi tông màu sẽ nhớ ảnh bạn đã chọn.</Text>
              <View style={styles.grid}>
                {BACKGROUNDS[theme.id].map((option) => {
                  const selected = background.id === option.id;
                  return (
                    <Pressable key={option.id} accessibilityRole="radio"
                      accessibilityLabel={`${option.label}, ${theme.name}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => void chooseBackground(option.id)}
                      style={[styles.thumbnail, { borderColor: selected ? colors.accent : colors.textSubtle, backgroundColor: colors.background }]}>
                      <Image source={option.source} style={styles.preview} contentFit="cover" />
                      <View style={styles.caption}>
                        <Text style={styles.captionText}>{option.label}</Text>
                        {selected && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            {!!error && <Text accessibilityLiveRegion="polite" style={[styles.description, { color: colors.text }]}>{error}</Text>}
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 400, maxHeight: '90%', borderWidth: 1, borderRadius: 20, padding: 20 },
  scroll: { flexShrink: 1 },
  scrollContent: { paddingBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  thumbnail: { width: '48%', aspectRatio: 0.85, borderWidth: 2, borderRadius: 12, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  caption: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.65)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  captionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 14, marginBottom: 16, lineHeight: 21 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  swatch: { width: 28, height: 28, borderRadius: 14, marginRight: 12 },
  optionName: { flex: 1, fontWeight: '600', fontSize: 16 },
});
