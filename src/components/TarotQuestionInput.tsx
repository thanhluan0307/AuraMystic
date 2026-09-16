import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SAMPLE_TAROT_QUESTIONS } from '../types/tarotTypes';

interface TarotQuestionInputProps {
  question: string;
  onChangeQuestion: (text: string) => void;
}

export const TarotQuestionInput: React.FC<TarotQuestionInputProps> = React.memo(({
  question,
  onChangeQuestion,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.inputCard}>
      <Text style={styles.sectionLabel}>CÂU HỎI HOẶC VẤN ĐỀ CỦA BẠN (TÙY CHỌN)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Nhập điều bạn đang trăn trở để nhận lời khuyên sâu sắc..."
        placeholderTextColor={theme.colors.textSubtle}
        value={question}
        onChangeText={onChangeQuestion}
        multiline
      />

      {/* Sample questions chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {SAMPLE_TAROT_QUESTIONS.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => onChangeQuestion(q)}
          >
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  inputCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: withOpacity(theme.colors.text, 0.04),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.text, 0.08),
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentBorder,
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: withOpacity(theme.colors.navigation, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 10,
    padding: 12,
    color: theme.colors.text,
    fontSize: 14,
    minHeight: 50,
  },
  chipsScroll: {
    marginTop: 10,
  },
  chip: {
    backgroundColor: withOpacity(theme.colors.accent, 0.08),
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.25),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    color: theme.colors.textBody,
    fontSize: 12,
  },
});

