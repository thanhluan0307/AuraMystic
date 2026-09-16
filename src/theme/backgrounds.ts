import type { ThemeId } from './ThemeProvider';

export interface BackgroundOption {
  id: string;
  label: string;
  source: number;
}

// Static requires let Metro include every selectable image in native and web builds.
export const BACKGROUNDS: Record<ThemeId, BackgroundOption[]> = {
  gold: [
    { id: 'bg1', label: 'Nền 1', source: require('../../assets/bg/purple/bg1.jpg') },
    { id: 'bg2', label: 'Nền 2', source: require('../../assets/bg/purple/bg2.jpg') },
    { id: 'bg3', label: 'Nền 3', source: require('../../assets/bg/purple/bg3.jpg') },
    { id: 'bg4', label: 'Nền 4', source: require('../../assets/bg/purple/bg4.jpg') },
    { id: 'bg5', label: 'Nền 5', source: require('../../assets/bg/purple/bg5.jpg') },
    { id: 'bg6', label: 'Nền 6', source: require('../../assets/bg/purple/bg6.jpg') },
    { id: 'bg7', label: 'Nền 7', source: require('../../assets/bg/purple/bg7.jpg') },
    { id: 'bg8', label: 'Nền 8', source: require('../../assets/bg/purple/bg8.jpg') },
  ],
  tiffany: [
    { id: 'bg11', label: 'Nền 11', source: require('../../assets/bg/tiffany/bg11.jpg') },
    { id: 'bg12', label: 'Nền 12', source: require('../../assets/bg/tiffany/bg12.jpg') },
    { id: 'bg13', label: 'Nền 13', source: require('../../assets/bg/tiffany/bg13.png') },
    { id: 'bg14', label: 'Nền 14', source: require('../../assets/bg/tiffany/bg14.png') },
    { id: 'bg15', label: 'Nền 15', source: require('../../assets/bg/tiffany/bg15.jpg') },
    { id: 'bg16', label: 'Nền 16', source: require('../../assets/bg/tiffany/bg16.jpg') },
  ],
};

export const DEFAULT_BACKGROUNDS: Record<ThemeId, string> = { gold: 'bg4', tiffany: 'bg11' };

export function resolveBackground(themeId: ThemeId, id: unknown): BackgroundOption {
  return BACKGROUNDS[themeId].find((option) => option.id === id)
    ?? BACKGROUNDS[themeId].find((option) => option.id === DEFAULT_BACKGROUNDS[themeId])!;
}
