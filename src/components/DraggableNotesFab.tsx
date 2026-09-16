import { useTheme, useThemeStyles, type AppTheme } from '../theme/ThemeProvider';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DraggableNotesFabProps {
  notesCount: number;
  onPress: () => void;
}

const FAB_SIZE = 54;

export const DraggableNotesFab: React.FC<DraggableNotesFabProps> = ({
  notesCount,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const safeW = screenWidth > 0 ? screenWidth : 360;
  const safeH = screenHeight > 0 ? screenHeight : 700;

  // Initial position: Bottom-right corner just above bottom nav
  const initialX = safeW - FAB_SIZE - 16;
  const initialY = safeH - FAB_SIZE - 75;

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Subtle breathing glow animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  // Handle window resizing (orientation change or web window resize)
  useEffect(() => {
    // If outside screen bounds, clamp smoothly
    const currentX = (pan.x as any)._value;
    const currentY = (pan.y as any)._value;
    const maxX = safeW - FAB_SIZE - 14;
    const maxY = safeH - FAB_SIZE - 75;

    if (currentX > maxX || currentY > maxY) {
      Animated.spring(pan, {
        toValue: {
          x: Math.min(currentX, maxX),
          y: Math.min(currentY, maxY),
        },
        friction: 6,
        useNativeDriver: false,
      }).start();
    }
  }, [safeW, safeH]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });

        // Enlarge slightly while dragging for tactile feedback
        Animated.spring(scale, {
          toValue: 1.18,
          friction: 4,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Shrink back to normal size
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: false,
        }).start();

        // Check if movement is within tap threshold
        const distance = Math.hypot(gestureState.dx, gestureState.dy);
        if (distance < 7) {
          onPress();
          return;
        }

        // Clamp to full screen boundaries and snap smoothly to nearest edge (left or right)
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        const minX = 14;
        const maxX = safeW - FAB_SIZE - 14;
        const minY = 50; // below top notch/status bar
        const maxY = safeH - FAB_SIZE - 75; // above bottom navigation bar

        const boundedY = Math.max(minY, Math.min(currentY, maxY));
        // Snap to closest edge (left or right) like iOS AssistiveTouch
        const snapX = currentX < safeW / 2 ? minX : maxX;

        Animated.spring(pan, {
          toValue: { x: snapX, y: boundedY },
          friction: 6,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.draggableWrapper,
        {
          transform: [
            ...pan.getTranslateTransform(),
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Outer subtle glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            opacity: glowAnim,
          },
        ]}
      />

      {/* Main button ball */}
      <View style={styles.fabBall}>
        <Ionicons name="journal" size={23} color={theme.colors.background} />
      </View>

      {/* Note count badge */}
      {notesCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {notesCount > 99 ? '99+' : notesCount}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  draggableWrapper: {
    position: 'absolute',
    top: -40,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: FAB_SIZE + 10,
    height: FAB_SIZE + 10,
    borderRadius: (FAB_SIZE + 10) / 2,
    backgroundColor: theme.colors.accent,
  },
  fabBall: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
});

