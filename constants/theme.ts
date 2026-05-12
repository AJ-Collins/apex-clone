import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fcd535';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    surface: '#f5f5f5',
    surfaceHighlight: '#e5e5e5',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    green: '#0ecb81',
    red: '#f6465d',
    yellow: '#fcd535',
  },
  dark: {
    text: '#eaecef',
    textSecondary: '#848e9c',
    background: '#181a20',
    surface: '#2b3139',
    surfaceHighlight: '#333a43',
    tint: tintColorDark,
    icon: '#848e9c',
    tabIconDefault: '#848e9c',
    tabIconSelected: tintColorDark,
    green: '#0ecb81',
    red: '#f6465d',
    yellow: '#fcd535',
  },
};

export const Fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  serif: 'serif',
  rounded: 'Inter_400Regular',
  mono: 'monospace',
};
