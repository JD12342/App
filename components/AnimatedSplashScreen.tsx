import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import { SplashLogo } from './SplashLogo';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const onCompleteRef = useRef(onAnimationComplete);

  // Floating particles animation
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    // Particle animations
    const createParticleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000 + delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start particle animations
    createParticleAnimation(particle1, 0).start();
    createParticleAnimation(particle2, 1000).start();
    createParticleAnimation(particle3, 2000).start();

    // Main exit animation after logo animation completes
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onCompleteRef.current?.();
      });
    }, 2500); // Wait for logo animation to complete

    return () => clearTimeout(timer);
  }, [backgroundOpacity, fadeAnim, particle1, particle2, particle3, scaleAnim]);

  const getParticleStyle = (animValue: Animated.Value, initialPosition: { x: number; y: number }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -100],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.3],
    });

    return {
      position: 'absolute' as const,
      left: initialPosition.x,
      top: initialPosition.y,
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  return (
    <Animated.View style={[styles.container, { opacity: backgroundOpacity }]}>
      <LinearGradient
        colors={['#E8F5E8', '#F1F8E9', '#E8F5E8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles */}
        <Animated.View style={[styles.particle, getParticleStyle(particle1, { x: width * 0.2, y: height * 0.3 })]}>
          <View style={[styles.particleCircle, { backgroundColor: '#4CAF50' }]} />
        </Animated.View>
        
        <Animated.View style={[styles.particle, getParticleStyle(particle2, { x: width * 0.8, y: height * 0.2 })]}>
          <View style={[styles.particleCircle, { backgroundColor: '#66BB6A' }]} />
        </Animated.View>
        
        <Animated.View style={[styles.particle, getParticleStyle(particle3, { x: width * 0.7, y: height * 0.7 })]}>
          <View style={[styles.particleCircle, { backgroundColor: '#81C784' }]} />
        </Animated.View>

        {/* Additional decorative elements */}
        <View style={styles.decorativeElements}>
          <Animated.View style={[styles.decorativeCircle, styles.circle1, { opacity: particle1 }]} />
          <Animated.View style={[styles.decorativeCircle, styles.circle2, { opacity: particle2 }]} />
          <Animated.View style={[styles.decorativeCircle, styles.circle3, { opacity: particle3 }]} />
        </View>

        {/* Main logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <SplashLogo animated={true} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  particle: {
    zIndex: 1,
  },
  particleCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: height * 0.1,
    left: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: height * 0.2,
    right: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.6,
    left: width * 0.1,
  },
});

export default AnimatedSplashScreen;
