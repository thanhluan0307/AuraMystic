import { useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface AppSplashScreenProps {
  onFinish: () => void;
}

const DISPLAY_DURATION_MS = 1350;
const FADE_DURATION_MS = 450;

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  const styles = useThemeStyles(createStyles);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, DISPLAY_DURATION_MS);

    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [onFinish, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/splash.jpg')}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.brand}>
          <Text style={styles.title}>AuraMystic</Text>
          <Text style={styles.subtitle}>TAROT · CHIÊM TINH · TỬ VI</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    backgroundColor: theme.colors.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: withOpacity(theme.colors.background, 0.12),
  },
  brand: {
    alignItems: 'center',
    paddingBottom: 72,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 31,
    fontWeight: '700',
    letterSpacing: 1.6,
    textShadowColor: 'rgba(174, 92, 255, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: '#F5D7FF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.1,
    marginTop: 8,
    textShadowColor: withOpacity(theme.colors.background, 0.9),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
