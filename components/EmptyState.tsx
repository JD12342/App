import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import theme from '../lib/theme';
import Button from './Button';
import Typography from './Typography';

interface EmptyStateProps {
  title: string;
  message?: string;
  image?: ImageSourcePropType;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * A reusable empty state component with optional image and action button
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  image,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {image && <Image source={image} style={styles.image} />}
      <Typography variant="h3" style={styles.title}>
        {title}
      </Typography>
      {message && (
        <Typography
          variant="body1"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.message}
        >
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md,
    resizeMode: 'contain',
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  message: {
    marginBottom: theme.spacing.lg,
    maxWidth: 300,
  },
  button: {
    minWidth: 150,
  },
});

export default EmptyState;
