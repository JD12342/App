import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface LinearGradientProps {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * A simple linear gradient implementation using View components
 * This is a fallback since we're not installing new dependencies
 */
const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  style,
  children,
}) => {
  return (
    <View style={[styles.container, style]}>
      {colors.map((color, index) => (
        <View
          key={index}
          style={[
            styles.gradientLayer,
            {
              backgroundColor: color,
              opacity: 1 - index * (1 / colors.length),
              zIndex: -index,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default LinearGradient;
