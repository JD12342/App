import { DimensionValue, Dimensions, Platform, ScaledSize } from 'react-native';

// Get device dimensions once at import time
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Memoize responsive size calculations to avoid recalculating
const memoizedSizes = new Map<number, number>();
const responsiveSize = (size: number): number => {
  if (memoizedSizes.has(size)) {
    return memoizedSizes.get(size)!;
  }
  const scale = width / 375; // Using iPhone 8 as base size
  const newSize = Math.round(size * scale);
  memoizedSizes.set(size, newSize);
  return newSize;
};

// Colors - Enhanced palette for better aesthetics
const colors = {
  primary: '#008E3B',
  primaryLight: '#35B452',
  primaryDark: '#006328',
  primarySoft: '#E5F5EB',
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',
  secondarySoft: '#FFF3E0',
  accent: '#E6B800',
  accentLight: '#FFD54F',
  accentDark: '#B8860B',
  accentSoft: '#FFF9E6',
  // Logo brand colors
  logo: {
    gold: '#E6B800',
    darkGold: '#B8860B',
    green: '#5D8A3A',
    lightGreen: '#8BC34A',
    beige: '#F5F5DC',
  },
  text: '#1F2933',
  textSecondary: '#5B6B7C',
  textLight: '#9AA5B1',
  background: '#F7F9FC',
  backgroundSecondary: '#EEF3F8',
  backgroundSoft: '#E6EDF5',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F7FB',
  border: '#D6DEE6',
  borderLight: '#E9F0F7',
  error: '#F44336',
  errorLight: '#FFEBEE',
  success: '#00C853',
  successLight: '#C8F7DC',
  warning: '#FFB300',
  warningLight: '#FFF3CD',
  info: '#00ACC1',
  infoLight: '#D3F6FF',
  white: '#FFFFFF',
  black: '#000000',
  // Gradient colors
  gradientStart: '#008E3B',
  gradientMiddle: '#00B54D',
  gradientEnd: '#4CE072',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.45)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  heroHighlight: '#35B452',
  heroAccent: '#E6B800',
};

// Typography
const typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  fontSize: {
    xs: isSmallDevice ? 11 : 12,
    sm: isSmallDevice ? 13 : 14,
    md: isSmallDevice ? 15 : 16,
    lg: isSmallDevice ? 18 : 19,
    xl: isSmallDevice ? 20 : 22,
    xxl: isSmallDevice ? 24 : 26,
    xxxl: isSmallDevice ? 30 : 34,
    display: isSmallDevice ? 34 : 40,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  }
};

// Spacing
const spacing = {
  xs: isSmallDevice ? 4 : 6,
  sm: isSmallDevice ? 8 : 10,
  md: isSmallDevice ? 14 : 18,
  lg: isSmallDevice ? 20 : 26,
  xl: isSmallDevice ? 28 : 36,
  xxl: isSmallDevice ? 40 : 56,
  xxxl: isSmallDevice ? 52 : 72,
};

// Border Radius
const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
  round: 999,
};

// Shadows - Enhanced for better visual depth
const shadows = Platform.select({
  ios: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
  },
  android: {
    small: {
      elevation: 2,
    },
    medium: {
      elevation: 4,
    },
    large: {
      elevation: 8,
    },
    floating: {
      elevation: 12,
    },
  },
  default: {
    small: {},
    medium: {},
    large: {},
    floating: {},
  },
});

// Layout
const layout = {
  fullWidth: '100%' as DimensionValue,
  contentWidth: isSmallDevice ? '95%' : '90%' as DimensionValue,
  maxContentWidth: 800 as DimensionValue,
  maxFormWidth: 600 as DimensionValue,
  maxCardWidth: 500 as DimensionValue,
};

// Responsive utilities
const responsive = {
  isSmallDevice,
  isTablet: width >= 600,
  isDesktop: width >= 1024,
  screenWidth: width,
  screenHeight: height,
  responsiveSize,
  // Screen size breakpoints
  breakpoints: {
    small: 375,
    medium: 600,
    large: 1024,
  },
  // Scale a value based on screen width
  scaleWidth: (size: number): number => {
    return Math.round(size * width / 375);
  },
  // Scale a value based on screen height
  scaleHeight: (size: number): number => {
    return Math.round(size * height / 812);
  },
  // Responsive padding function
  padding: (multiplier: number = 1): number => {
    return isSmallDevice ? 8 * multiplier : 16 * multiplier;
  },
  // Responsive grid columns
  getGridColumns: (): number => {
    if (width >= 1024) return 4;
    if (width >= 600) return 3;
    if (width >= 480) return 2;
    return 1;
  }
};

// Listen for dimension changes
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  // This will update when orientation changes
  const newWidth = window.width;
  const newHeight = window.height;
  // You could potentially update a state here to trigger re-renders
  console.log(`Screen dimensions changed: ${newWidth}x${newHeight}`);
});

// Combine all theme elements
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  responsive,
};

export const themeColors = colors;
export const themeTypography = typography;
export const themeSpacing = spacing;
export const themeBorderRadius = borderRadius;
export const themeShadows = shadows;
export const themeLayout = layout;
export const themeResponsive = responsive;

export default theme;
