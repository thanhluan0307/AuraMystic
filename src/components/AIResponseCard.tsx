import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AIResponseCardProps {
  isLoading: boolean;
  content: string | null;
  error?: string | null;
  title?: string;
  onReset?: () => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = React.memo(({
  isLoading,
  content,
  error,
  title = 'Lời Luận Giải Từ Vũ Trụ (Gemini AI)',
  onReset,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [copied, setCopied] = useState(false);
  // Quick view mode: skip typing animation and display immediately
  const [quickView, setQuickView] = useState(false);
  // The actual text displayed to the user
  const [displayedText, setDisplayedText] = useState('');
  // Whether typewriter is currently actively revealing characters
  const [isTyping, setIsTyping] = useState(false);

  // Blinking cursor animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Typing timer reference
  const timerRef = useRef<any>(null);

  // Blinking animation for cursor (GPU accelerated)
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0.2,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [cursorOpacity]);

  // Pulse animation for loading shimmer (GPU accelerated)
  useEffect(() => {
    if (isLoading && !displayedText) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLoading, displayedText, pulseAnim]);

  // Handle incoming content with zero-lag stream synchronization
  useEffect(() => {
    const target = content || '';

    // If quickView is enabled or there's nothing to type, show target immediately
    if (quickView || !target) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(target);
      setIsTyping(false);
      return;
    }

    const currentLen = displayedText.length;
    const diff = target.length - currentLen;

    if (diff <= 0) {
      setIsTyping(false);
      return;
    }

    // Direct stream sync: If diff is small (incoming streaming tokens/phrases),
    // update displayedText immediately without running a competing 16ms timer.
    // This prevents React state update storms and eliminates all stutter!
    if (diff < 60) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(target);
      setIsTyping(isLoading);
      return;
    }

    // If a large block arrived all at once, smoothly roll it in using a 40ms interval
    setIsTyping(true);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length >= target.length) {
          clearInterval(timerRef.current);
          setIsTyping(false);
          return target;
        }

        // Advance in comfortable words/chunks (12-20 chars per 40ms tick = ~25fps fluid animation)
        const step = Math.max(14, Math.floor((target.length - prev.length) / 6));
        const nextLen = Math.min(prev.length + step, target.length);

        if (nextLen >= target.length) {
          clearInterval(timerRef.current);
          setIsTyping(false);
        }

        return target.slice(0, nextLen);
      });
    }, 40);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [content, quickView]);

  // Skip typing animation immediately and show all
  const handleSkipToEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuickView(true);
    setDisplayedText(content || '');
    setIsTyping(false);
  };

  // Toggle quick view mode
  const handleToggleQuickView = () => {
    if (!quickView) {
      handleSkipToEnd();
    } else {
      setQuickView(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = content || displayedText;
    if (!textToCopy) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      Alert.alert('Đã sao chép', 'Nội dung giải đáp đã được lưu vào bộ nhớ tạm.');
    }
  };

  // Memoize markdown paragraph parsing
  const paragraphs = useMemo(() => {
    if (!displayedText) return [];
    return displayedText.split('\n\n').filter((p) => p.trim());
  }, [displayedText]);

  if (!isLoading && !content && !error) {
    return null;
  }

  const showCursor = isTyping || isLoading;

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[withOpacity(theme.colors.gradientStart, 0.95), withOpacity(theme.colors.surface, 0.98)]}
        style={styles.gradientBg}
      >
        {/* Header bar of response */}
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
            <Text style={styles.badgeText}>Gemini AI 3.6 Flash</Text>
          </View>

          <View style={styles.actions}>
            {/* Quick View Toggle Option */}
            <TouchableOpacity
              onPress={handleToggleQuickView}
              style={[styles.iconBtn, quickView && styles.iconBtnActive]}
            >
              <Ionicons
                name="flash"
                size={13}
                color={quickView ? theme.colors.accent : theme.colors.textBody}
              />
              <Text style={[styles.btnLabel, quickView && styles.btnLabelActive]}>
                {quickView ? 'Xem nhanh: BẬT' : 'Xem nhanh'}
              </Text>
            </TouchableOpacity>

            {/* Copy button */}
            {displayedText.length > 0 && (
              <TouchableOpacity onPress={handleCopy} style={styles.iconBtn}>
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={14}
                  color={copied ? '#48BB78' : theme.colors.textBody}
                />
                <Text style={[styles.btnLabel, copied && { color: '#48BB78' }]}>
                  {copied ? 'Đã chép' : 'Chép'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Reset button */}
            {onReset && (
              <TouchableOpacity onPress={onReset} style={styles.iconBtn}>
                <Ionicons name="refresh-outline" size={14} color={theme.colors.textBody} />
                <Text style={styles.btnLabel}>Làm mới</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.cardTitle}>{title}</Text>

        {/* Minimal mystical transmission bar instead of heavy loading spinner */}
        {isLoading && !displayedText && (
          <View style={styles.streamingHeaderBox}>
            <Animated.View style={[styles.shimmerDot, { opacity: pulseAnim }]} />
            <Text style={styles.streamingStatusText}>
              Vũ trụ đang truyền tải lời tiên tri...
            </Text>
          </View>
        )}

        {/* Error state */}
        {error && !isLoading && !displayedText && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={22} color="#FC8181" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Streaming & Typewriter Content */}
        {paragraphs.length > 0 && (
          <View style={styles.textContainer}>
            {paragraphs.map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              const isLast = pIdx === paragraphs.length - 1;

              // Headings: ### or **Heading**
              if (
                trimmed.startsWith('#') ||
                (trimmed.startsWith('**') && trimmed.endsWith('**'))
              ) {
                return (
                  <View key={pIdx} style={styles.headingWrap}>
                    <Text style={styles.headingText}>
                      {trimmed.replace(/^[#*]+\s*|\s*[*#]+$/g, '')}
                    </Text>
                    {isLast && showCursor && (
                      <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                        {' ✦'}
                      </Animated.Text>
                    )}
                  </View>
                );
              }

              // Bullet points
              if (
                trimmed.startsWith('- ') ||
                trimmed.startsWith('* ') ||
                trimmed.startsWith('• ')
              ) {
                return (
                  <View key={pIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletStar}>✧</Text>
                    <Text style={styles.bulletBody}>
                      {trimmed.replace(/^[-*•]\s*/, '')}
                      {isLast && showCursor && (
                        <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                          {' ✦'}
                        </Animated.Text>
                      )}
                    </Text>
                  </View>
                );
              }

              // Normal body paragraph
              return (
                <Text key={pIdx} style={styles.bodyText}>
                  {trimmed}
                  {isLast && showCursor && (
                    <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                      {' ✦'}
                    </Animated.Text>
                  )}
                </Text>
              );
            })}

            {/* Quick View Skip Button while text is actively typing */}
            {isTyping && !quickView && (
              <TouchableOpacity
                style={styles.floatingSkipBtn}
                onPress={handleSkipToEnd}
                activeOpacity={0.8}
              >
                <Ionicons name="flash-outline" size={14} color={theme.colors.accentText} />
                <Text style={styles.floatingSkipText}>
                  ⚡ Xem nhanh (Hiện toàn bộ ngay)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

const createStyles = (theme: AppTheme) => StyleSheet.create({
  cardContainer: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.35),
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientBg: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.accent, 0.15),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.4),
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.text, 0.08),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 0.6,
    borderColor: withOpacity(theme.colors.text, 0.1),
  },
  iconBtnActive: {
    backgroundColor: withOpacity(theme.colors.accent, 0.22),
    borderColor: theme.colors.accent,
  },
  btnLabel: {
    color: theme.colors.textBody,
    fontSize: 11,
    marginLeft: 4,
  },
  btnLabelActive: {
    color: theme.colors.accentText,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accentText,
    marginBottom: 10,
  },
  streamingHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(theme.colors.accent, 0.08),
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accent, 0.2),
  },
  shimmerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 8,
  },
  streamingStatusText: {
    color: theme.colors.accentText,
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 62, 62, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  errorText: {
    color: '#FEB2B2',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  textContainer: {
    marginTop: 4,
  },
  headingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 6,
  },
  headingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FEFCBF',
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletStar: {
    color: theme.colors.accent,
    fontSize: 13,
    marginRight: 6,
    marginTop: 2,
  },
  bulletBody: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  cursor: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  floatingSkipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(theme.colors.accent, 0.18),
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  floatingSkipText: {
    color: theme.colors.accentText,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
