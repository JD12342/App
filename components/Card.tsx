import React from 'react';
import {
    Platform,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import theme from '../lib/theme';
import LinearGradient from './LinearGradient';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'glass' | 'tile' | 'hero';
type CardTone = 'surface' | 'primary' | 'accent' | 'neutral';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large' | 'floating';
  variant?: CardVariant;
  tone?: CardTone;
}

/**
 * A reusable card component with consistent styling and enhanced aesthetics
 */
const gradientColors = [
  theme.colors.gradientStart,
  theme.colors.gradientMiddle,
  theme.colors.gradientEnd,
];

const Card: React.FC<CardProps> = ({
  children,
  style, 
  onPress,
  elevation = 'medium',
  variant = 'default',
  tone = 'surface'
}) => {
  const toneStyleMap: Record<CardTone, ToneStyleKey> = {
    surface: 'toneSurface',
    primary: 'tonePrimary',
    accent: 'toneAccent',
    neutral: 'toneNeutral',
  };

  const toneStyle = styles[toneStyleMap[tone]];

  if (variant === 'hero') {
    const heroContent = (
      <LinearGradient
        colors={gradientColors}
        style={[styles.card, styles.hero, theme.shadows[elevation], style]}
      >
        <View pointerEvents="none" style={styles.heroOverlay} />
        <View style={styles.heroContent}>{children}</View>
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={styles.heroTouchable}
          onPress={onPress}
          activeOpacity={0.92}
        >
          {heroContent}
        </TouchableOpacity>
      );
    }

    return heroContent;
  }

  const baseStyles: StyleProp<ViewStyle>[] = [styles.card, theme.shadows[elevation]];

  if (styles[variant]) {
    baseStyles.push(styles[variant]);
  }

  const allowToneStyles = variant !== 'glass';

  if (allowToneStyles && toneStyle) {
    baseStyles.push(toneStyle);
  }

  if (style) {
    baseStyles.push(style);
  }

  if (onPress) {
    return (
      <TouchableOpacity 
        style={baseStyles} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={baseStyles}>{children}</View>;
};

type ToneStyleKey = 'toneSurface' | 'tonePrimary' | 'toneAccent' | 'toneNeutral';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    marginHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
  },
  default: {
    backgroundColor: theme.colors.surface,
  },
  outlined: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tile: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xxl,
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.overlayLight,
  },
  heroContent: {
    position: 'relative',
  },
  heroTouchable: {
    width: '100%',
  },
  toneSurface: {
    backgroundColor: theme.colors.surface,
  },
  tonePrimary: {
    backgroundColor: theme.colors.primary,
  },
  toneAccent: {
    backgroundColor: theme.colors.accent,
  },
  toneNeutral: {
    backgroundColor: theme.colors.background,
  },
});

export default React.memo(Card);
