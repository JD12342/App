import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../lib/theme';
import Typography from './Typography';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A reusable form section component with a title
 */
const FormSection: React.FC<FormSectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <Typography variant="h3" style={styles.title}>
          {title}
        </Typography>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    gap: theme.spacing.md,
  },
});

export default FormSection;
