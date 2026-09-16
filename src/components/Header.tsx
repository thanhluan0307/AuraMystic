import { ThemePicker } from './ThemePicker';
import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightAction?: () => void;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  title,
  subtitle,
  iconName = 'sparkles',
  rightAction,
  rightActionIcon,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction && rightActionIcon && (
          <TouchableOpacity style={styles.actionBtn} onPress={rightAction}>
            <Ionicons name={rightActionIcon} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        <ThemePicker />
      </View>
      <View style={styles.divider} />
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withOpacity(theme.colors.accent, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.3),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: withOpacity(theme.colors.text, 0.08),
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(theme.colors.accent, 0.2),
    marginTop: 14,
  },
});

