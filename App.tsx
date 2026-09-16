import { ThemeProvider, useTheme, useThemeStyles, withOpacity, type AppTheme } from './src/theme/ThemeProvider';
import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StarryBackground } from './src/components/StarryBackground';
import { TarotScreen } from './src/screens/TarotScreen';
import { AstrologyScreen } from './src/screens/AstrologyScreen';
import { TuViScreen } from './src/screens/TuViScreen';
import { NatalChartScreen } from './src/screens/NatalChartScreen';
import { MysticChatScreen } from './src/screens/MysticChatScreen';
import { Cosmos3DScreen } from './src/screens/Cosmos3DScreen';
import { NotesModal } from './src/components/NotesModal';
import { DraggableNotesFab } from './src/components/DraggableNotesFab';
import { AppSplashScreen } from './src/components/AppSplashScreen';
import { getStoredNotes } from './src/services/storageService';

type TabKey = 'tarot' | 'astrology' | 'tuvi' | 'natal' | 'cosmos' | 'oracle';

interface TabItem {
  key: TabKey;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameFocused: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: 'tarot', label: 'Bài Tarot', iconName: 'card-outline', iconNameFocused: 'card' },
  { key: 'astrology', label: 'Chiêm Tinh', iconName: 'moon-outline', iconNameFocused: 'moon' },
  { key: 'tuvi', label: 'Tử Vi', iconName: 'compass-outline', iconNameFocused: 'compass' },
  { key: 'natal', label: 'Bản Đồ Sao', iconName: 'planet-outline', iconNameFocused: 'planet' },
  { key: 'cosmos', label: 'Vũ Trụ 3D', iconName: 'telescope-outline', iconNameFocused: 'telescope' },
  { key: 'oracle', label: 'Tiên Tri AI', iconName: 'chatbubbles-outline', iconNameFocused: 'chatbubbles' },
];

export default function App() {
  return <ThemeProvider><ThemedApp /></ThemeProvider>;
}

function ThemedApp() {
  const { theme, ready } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('tarot');
  const [notesVisible, setNotesVisible] = useState(false);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    getStoredNotes().then((list) => {
      if (Array.isArray(list)) {
        setNotesCount(list.length);
      }
    });
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!ready) return null;

  if (showSplash) {
    return <AppSplashScreen onFinish={handleSplashFinish} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'tarot':
        return <TarotScreen />;
      case 'astrology':
        return <AstrologyScreen />;
      case 'tuvi':
        return <TuViScreen />;
      case 'natal':
        return <NatalChartScreen />;
      case 'cosmos':
        return <Cosmos3DScreen />;
      case 'oracle':
        return <MysticChatScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StarryBackground>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />

          {/* Screen Content */}
          <View style={styles.screenContainer}>{renderActiveScreen()}</View>

          {/* Draggable Floating Notes Button (Animation di chuyển toàn màn hình) */}
          <DraggableNotesFab
            notesCount={notesCount}
            onPress={() => setNotesVisible(true)}
          />

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            {TABS.map((tab) => {
              const isFocused = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, isFocused && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.7}
                >
                  {isFocused && <View style={styles.activeIndicator} />}
                  <Ionicons
                    name={isFocused ? tab.iconNameFocused : tab.iconName}
                    size={20}
                    color={isFocused ? theme.colors.accent : theme.colors.textSubtle}
                  />
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mystic Journal & Notes Modal */}
          <NotesModal
            visible={notesVisible}
            onClose={() => setNotesVisible(false)}
            onNotesCountChange={setNotesCount}
          />
        </SafeAreaView>
      </StarryBackground>
    </SafeAreaProvider>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: withOpacity(theme.colors.navigation, 0.95),
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.accent, 0.25),
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabBtnActive: {},
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: theme.colors.accentText,
    fontWeight: '700',
  },
});
