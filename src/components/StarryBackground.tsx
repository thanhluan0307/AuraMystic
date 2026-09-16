import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';



import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

interface StarryBackgroundProps {
  children?: React.ReactNode;
}

export const StarryBackground: React.FC<StarryBackgroundProps> = ({ children }) => {
  const { background } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      <Image
        source={background.source}
        style={styles.image}
        contentFit="cover"
        autoplay
      />
      <View pointerEvents="none" style={styles.overlay} />
      {children}
    </View>
  );
};




const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: theme.id === 'tiffany' ? 0.28 : 0.82,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: withOpacity(theme.colors.background, 0.2),
  },
});
