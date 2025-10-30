import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import theme from '../lib/theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button';
  style?: StyleProp<TextStyle>;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

/**
 * A reusable Typography component for consistent text styling
 */
const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  style,
  color = theme.colors.text,
  align = 'left',
  numberOfLines,
}) => {
  const textStyle = [
    styles[variant],
    { color, textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.responsive.isSmallDevice ? 36 : 40,
    marginBottom: theme.spacing.sm,
  },
  h2: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.responsive.isSmallDevice ? 28 : 32,
    marginBottom: theme.spacing.sm,
  },
  h3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    lineHeight: theme.responsive.isSmallDevice ? 24 : 28,
    marginBottom: theme.spacing.xs,
  },
  h4: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    lineHeight: theme.responsive.isSmallDevice ? 22 : 24,
    marginBottom: theme.spacing.xs,
  },
  body1: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.normal,
    lineHeight: theme.responsive.isSmallDevice ? 22 : 24,
  },
  body2: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    lineHeight: theme.responsive.isSmallDevice ? 18 : 20,
  },
  caption: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
    lineHeight: theme.responsive.isSmallDevice ? 14 : 16,
    color: theme.colors.textSecondary,
  },
  button: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.responsive.isSmallDevice ? 22 : 24,
  },
});

export default Typography;
