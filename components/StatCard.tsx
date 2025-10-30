import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../lib/theme';
import Typography from './Typography';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A card component to display a statistic with an icon, title and value
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = theme.colors.primary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="body2" color={theme.colors.textSecondary}>
          {title}
        </Typography>
        <Typography variant="h3" style={styles.valueText}>
          {value}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    minHeight: 100,
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  textContainer: {
    marginTop: theme.spacing.xs,
  },
  valueText: {
    marginTop: theme.spacing.xs,
  },
});

export default StatCard;
