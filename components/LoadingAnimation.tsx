import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 40,
  color = '#4CAF50',
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle bounce animation (like a pin bobbing)
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle scale pulse
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Gentle glow effect
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();
    scaleAnimation.start();
    glowAnimation.start();

    return () => {
      bounceAnimation.stop();
      scaleAnimation.stop();
      glowAnimation.stop();
    };
  }, [bounceAnim, glowAnim, scaleAnim]);

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect background */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            width: size + 10,
            height: size + 10,
            borderRadius: (size + 10) / 4,
            opacity: glowOpacity,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateY: bounceTranslate },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image 
          source={require('../assets/images/icon.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    backgroundColor: '#E6B800',
    opacity: 0.3,
  },
});

export default LoadingAnimation;
