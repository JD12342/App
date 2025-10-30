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
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  primarySoft: '#E8F5E8',
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',
  secondarySoft: '#FFF3E0',
  accent: '#2196F3',
  accentLight: '#64B5F6',
  accentDark: '#1976D2',
  accentSoft: '#E3F2FD',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#9E9E9E',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundSoft: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  error: '#F44336',
  errorLight: '#FFEBEE',
  success: '#4CAF50',
  successLight: '#E8F5E8',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  white: '#FFFFFF',
  black: '#000000',
  // Gradient colors
  gradientStart: '#4CAF50', 
  gradientMiddle: '#E8F5E8',
  gradientEnd: '#F9FBE7',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography
const typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  fontSize: {
    xs: isSmallDevice ? 10 : 12,
    sm: isSmallDevice ? 12 : 14,
    md: isSmallDevice ? 14 : 16,
    lg: isSmallDevice ? 16 : 18,
    xl: isSmallDevice ? 18 : 20,
    xxl: isSmallDevice ? 22 : 24,
    xxxl: isSmallDevice ? 28 : 32,
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
  xs: isSmallDevice ? 2 : 4,
  sm: isSmallDevice ? 6 : 8,
  md: isSmallDevice ? 12 : 16,
  lg: isSmallDevice ? 18 : 24,
  xl: isSmallDevice ? 24 : 32,
  xxl: isSmallDevice ? 36 : 48,
  xxxl: isSmallDevice ? 48 : 64,
};

// Border Radius
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
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
