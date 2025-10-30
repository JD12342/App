import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

interface SplashLogoProps {
  animated?: boolean;
}

export const SplashLogo: React.FC<SplashLogoProps> = ({ animated = false }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (animated) {
      const logoAnimation = Animated.sequence([
        // Logo appears with scale and fade (pin dropping effect)
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.elastic(1.2),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Gentle bounce (like pin settling)
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]);

      // Gentle glow animation (garden growth feeling)
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      // Text animation - delayed entrance
      const textAnimation = Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 800,
          delay: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]);

      logoAnimation.start();
      glowAnimation.start();
      textAnimation.start();

      return () => {
        logoAnimation.stop();
        glowAnimation.stop();
        textAnimation.stop();
      };
    }

    // Reset animations for non-animated mode
    scaleAnim.setValue(1);
    fadeAnim.setValue(1);
    bounceAnim.setValue(0);
    glowAnim.setValue(0);
    textFadeAnim.setValue(1);
    textSlideAnim.setValue(0);

    return undefined;
  }, [animated, bounceAnim, fadeAnim, glowAnim, scaleAnim, textFadeAnim, textSlideAnim]);

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounceTranslate },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Glow effect background */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: textSlideAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>Garden Tracker</Text>
        <Text style={styles.tagline}>Grow • Track • Thrive</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E6B800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    backgroundColor: 'transparent',
  },
  glowContainer: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 35,
    backgroundColor: '#E6B800',
    opacity: 0.2,
  },
  iconImage: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#B8860B',
    letterSpacing: 1.2,
    marginBottom: 8,
    textShadowColor: 'rgba(184, 134, 11, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#5D8A3A',
    letterSpacing: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SplashLogo;
