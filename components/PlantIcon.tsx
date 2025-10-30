import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import theme from '../lib/theme';

interface PlantIconProps {
  size?: number;
  style?: any;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

/**
 * A simple plant icon placeholder for garden images
 */
const PlantIcon: React.FC<PlantIconProps> = ({
  size = 60,
  style,
  iconName = 'sprout',
}) => {
  // Animation values
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Subtle animation loop
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotate, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rotate, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [rotate, scale]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { rotate: rotateInterpolate },
              { scale: scale },
            ],
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={size * 0.6}
          color={theme.colors.primary}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: `${theme.colors.primary}15`,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlantIcon;
