export type CosmosMode = 'galaxy' | 'celestial';

export type NebulaThemeKey = 'purple' | 'cyan' | 'golden' | 'rose';

export interface NebulaTheme {
  id: NebulaThemeKey;
  name: string;
  coreHex: number;
  armHex: number;
  dustHex: number;
  accentHex: number;
  cssGlow: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  englishName: string;
  symbol: string;
  colorHex: number;
  colorCss: string;
  size: number;
  distance: number; // orbital radius
  orbitSpeed: number; // radians per second
  rotationSpeed: number;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColorHex?: number;
  element: 'Lửa' | 'Nước' | 'Khí' | 'Đất' | 'Hào Quang' | 'Tâm Thức';
  rulerOf: string; // Zodiac signs ruled
  archetype: string; // Bản ngã đại diện
  spiritualMeaning: string;
  astrologicalKeywords: string[];
  guidance: string;
}

export interface ZodiacSign3D {
  name: string;
  symbol: string;
  element: string;
  angle: number; // 0 to 2*PI
  colorHex: number;
}
