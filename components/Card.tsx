import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import theme from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'elevated';
}

/**
 * A reusable card component with consistent styling and enhanced aesthetics
 */
const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress,
  elevation = 'medium',
  variant = 'default'
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
  theme.shadows[elevation],
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
  backgroundColor: theme.colors.background,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing.lg,
  marginVertical: theme.spacing.sm,
    marginHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
  },
  default: {
    backgroundColor: theme.colors.background,
  },
  outlined: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    backgroundColor: theme.colors.background,
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
});

export default React.memo(Card);
