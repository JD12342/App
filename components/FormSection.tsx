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
  },
  title: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  content: {
    width: '100%',
    gap: theme.spacing.sm,
  },
});

export default FormSection;
