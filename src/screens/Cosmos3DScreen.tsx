import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CosmosGalaxyView } from '../components/CosmosGalaxyView';
import { CosmosCelestialView } from '../components/CosmosCelestialView';
import { PlanetDetailModal } from '../components/PlanetDetailModal';
import { CELESTIAL_BODIES, NEBULA_THEMES } from '../data/celestialBodies';
import { CelestialBody, CosmosMode, NebulaThemeKey } from '../types/cosmos3DTypes';

export function Cosmos3DScreen() {
  const [mode, setMode] = useState<CosmosMode>('galaxy');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [warpSpeed, setWarpSpeed] = useState<boolean>(false);
  const [themeKey, setThemeKey] = useState<NebulaThemeKey>('purple');
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleSelectPlanet = (planet: CelestialBody) => {
    setSelectedPlanet(planet);
    setModalVisible(true);
  };

  const activeTheme = NEBULA_THEMES[themeKey] || NEBULA_THEMES.purple;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {mode === 'galaxy' ? (
          <CosmosGalaxyView
            themeKey={themeKey}
            warpSpeed={warpSpeed}
            autoRotate={autoRotate}
          />
        ) : (
          <CosmosCelestialView
            autoRotate={autoRotate}
            selectedPlanetId={selectedPlanet?.id || null}
            onSelectPlanet={handleSelectPlanet}
          />
        )}
      </View>

      <View style={styles.topHud}>
        <View style={styles.titleRow}>
          <Ionicons name="telescope" size={20} color={activeTheme.cssGlow} />
          <Text style={styles.screenTitle}>VŨ TRỤ 3D</Text>
          <View style={[styles.onlineDot, { backgroundColor: activeTheme.cssGlow }]} />
        </View>

        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'galaxy' && [styles.modeTabActive, { borderColor: activeTheme.cssGlow }]]}
            onPress={() => setMode('galaxy')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={mode === 'galaxy' ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.modeTabText, mode === 'galaxy' && styles.modeTabTextActive]}>
              Ngân Hà Hạt Sao
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'celestial' && [styles.modeTabActive, { borderColor: '#38bdf8' }]]}
            onPress={() => setMode('celestial')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="planet"
              size={15}
              color={mode === 'celestial' ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.modeTabText, mode === 'celestial' && styles.modeTabTextActive]}>
              Thiên Cầu Hoàng Đạo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.hintContainer} pointerEvents="none">
        <Text style={styles.hintText}>👆 Vuốt màn hình để xoay vũ trụ 360°</Text>
      </View>

      <View style={styles.sideControls}>
        <TouchableOpacity
          style={[styles.hudIconBtn, autoRotate && styles.hudIconBtnActive]}
          onPress={() => setAutoRotate(!autoRotate)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={autoRotate ? 'sync' : 'pause'}
            size={18}
            color={autoRotate ? '#c084fc' : '#94a3b8'}
          />
        </TouchableOpacity>

        {mode === 'galaxy' && (
          <TouchableOpacity
            style={[styles.hudIconBtn, warpSpeed && styles.warpBtnActive]}
            onPress={() => setWarpSpeed(!warpSpeed)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="rocket"
              size={18}
              color={warpSpeed ? '#fbbf24' : '#94a3b8'}
            />
          </TouchableOpacity>
        )}
      </View>

      {mode === 'galaxy' ? (
        <View style={styles.bottomHudGalaxy}>
          <Text style={styles.hudLabel}>SẮC MÀU TINH VÂN</Text>
          <View style={styles.themePaletteRow}>
            {Object.values(NEBULA_THEMES).map((th) => {
              const isSelected = themeKey === th.id;
              return (
                <TouchableOpacity
                  key={th.id}
                  style={[
                    styles.themeColorBtn,
                    { backgroundColor: th.cssGlow },
                    isSelected && styles.themeColorBtnActive,
                  ]}
                  onPress={() => setThemeKey(th.id)}
                  activeOpacity={0.8}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.bottomHudCelestial}>
          <View style={styles.celestialHeader}>
            <Text style={styles.hudLabel}>HỆ HÀNH TINH CHIÊM TINH (CHẠM ĐỂ XEM)</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.planetScrollContent}
          >
            {CELESTIAL_BODIES.map((planet) => {
              const isSelected = selectedPlanet?.id === planet.id;
              return (
                <TouchableOpacity
                  key={planet.id}
                  style={[
                    styles.planetChip,
                    isSelected && [styles.planetChipActive, { borderColor: planet.colorCss }],
                  ]}
                  onPress={() => handleSelectPlanet(planet)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.planetChipIcon, { backgroundColor: `${planet.colorCss}22` }]}>
                    <Text style={[styles.planetChipSymbol, { color: planet.colorCss }]}>
                      {planet.symbol}
                    </Text>
                  </View>
                  <Text style={[styles.planetChipName, isSelected && { color: planet.colorCss }]}>
                    {planet.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <PlanetDetailModal
        planet={selectedPlanet}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020008',
  },
  topHud: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  modeTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modeTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  hintContainer: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 5,
  },
  hintText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  sideControls: {
    position: 'absolute',
    right: 14,
    top: 130,
    gap: 12,
    zIndex: 10,
  },
  hudIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  hudIconBtnActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
  },
  warpBtnActive: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
  },
  bottomHudGalaxy: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  bottomHudCelestial: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  celestialHeader: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  hudLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  themePaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  themeColorBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeColorBtnActive: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  planetScrollContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  planetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  planetChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
  },
  planetChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetChipSymbol: {
    fontSize: 13,
    fontWeight: '700',
  },
  planetChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
  },
});
