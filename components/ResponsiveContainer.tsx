import React from 'react';
import { Dimensions, StyleSheet, View, ViewProps } from 'react-native';
import theme from '../lib/theme';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  centered?: boolean;
  maxWidth?: number;
  style?: any;
}

/**
 * A responsive container that manages width constraints based on device size
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  centered = true,
  maxWidth = 800,
  style,
  ...props
}) => {
  const windowWidth = Dimensions.get('window').width;
  const isLargeScreen = windowWidth > maxWidth;

  return (
    <View
      style={[
        styles.container,
        centered && styles.centered,
        isLargeScreen && { maxWidth },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  centered: {
    alignSelf: 'center',
  }
});

export default ResponsiveContainer;
